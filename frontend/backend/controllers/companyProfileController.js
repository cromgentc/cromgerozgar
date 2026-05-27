const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const asyncHandler = require('../middleware/asyncHandler')

const accentClasses = [
  'from-blue-600 to-sky-400',
  'from-teal-500 to-blue-500',
  'from-violet-500 to-blue-500',
  'from-sky-500 to-teal-400',
  'from-blue-500 to-violet-500',
  'from-teal-500 to-violet-500',
]

function initials(name) {
  return String(name || 'Company')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'CO'
}

function normalizeKey(name) {
  return String(name || '').trim().toLowerCase()
}

function normalizeLocation(item = {}) {
  return item.location || [item.city, item.state, item.country].filter(Boolean).join(', ') || 'India'
}

function upsertCompany(map, name, data = {}) {
  const key = normalizeKey(name)
  if (!key) return null

  const current = map.get(key) || {
    name,
    industry: 'Hiring company',
    location: 'India',
    rating: '4.5',
    badge: initials(name),
    accent: accentClasses[map.size % accentClasses.length],
    website: '',
    status: 'Active',
    openJobs: 0,
    jobs: [],
  }

  map.set(key, {
    ...current,
    ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== '')),
    name: data.name || current.name || name,
    industry: data.industry || current.industry || 'Hiring company',
    location: data.location || current.location || 'India',
    badge: data.badge || current.badge || initials(name),
    rating: data.rating || current.rating || '4.5',
    status: data.status || current.status || 'Active',
    openJobs: Number(data.openJobs ?? current.openJobs ?? 0),
    jobs: data.jobs || current.jobs || [],
  })

  return map.get(key)
}

const getCompanyProfiles = asyncHandler(async (req, res) => {
  const [companies, employers, jobs] = await Promise.all([
    Company.find({ status: { $ne: 'Blocked' } }).sort('-updatedAt').lean(),
    Employer.find({ status: { $in: ['Approved', 'Pending'] } }).sort('-updatedAt').lean(),
    Job.find({ status: { $in: ['Active', 'Open'] }, approval: 'Approved', accountDepartmentStatus: 'Active' }).sort('-createdAt').lean(),
  ])

  const map = new Map()

  companies.forEach((company) => {
    upsertCompany(map, company.name, {
      ...company,
      location: normalizeLocation(company),
      openJobs: Number(company.jobs || 0),
      status: company.status === 'Pending' ? 'Pending' : 'Active',
    })
  })

  employers.forEach((employer) => {
    upsertCompany(map, employer.companyName, {
      name: employer.companyName,
      industry: employer.industry || 'Hiring company',
      location: employer.location || 'India',
      badge: initials(employer.companyName),
      website: employer.website,
      status: employer.status === 'Approved' ? 'Active' : 'Pending',
      logoUrl: employer.logoUrl || employer.logo,
    })
  })

  jobs.forEach((job) => {
    const company = upsertCompany(map, job.company, {
      name: job.company,
      industry: job.industry || job.department || 'Hiring company',
      location: normalizeLocation(job),
      badge: job.companyLogo || initials(job.company),
      status: 'Active',
    })

    if (!company) return
    company.openJobs += 1
    company.jobs.push(job)
  })

  const profiles = Array.from(map.values())
    .map((company) => ({
      ...company,
      openJobs: Number(company.openJobs || 0),
      jobs: company.jobs || [],
    }))
    .sort((a, b) => {
      const activeDiff = Number(String(b.status).toLowerCase() === 'active') - Number(String(a.status).toLowerCase() === 'active')
      if (activeDiff) return activeDiff
      return b.openJobs - a.openJobs
    })

  res.json({ success: true, data: profiles })
})

module.exports = { getCompanyProfiles }
