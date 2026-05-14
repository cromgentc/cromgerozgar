const accentClasses = [
  'from-blue-600 to-sky-400',
  'from-teal-500 to-blue-500',
  'from-violet-500 to-blue-500',
  'from-sky-500 to-teal-400',
  'from-blue-500 to-violet-500',
  'from-teal-500 to-violet-500',
]

export function slugifyCompany(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export function getCompanyBySlug(companies, slug) {
  return companies.find((company) => slugifyCompany(company.name) === slug)
}

export function getCompanyInitials(name) {
  return String(name || 'Company')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'CO'
}

export function buildCompanyProfiles(jobs = [], companies = []) {
  const companyMap = new Map()

  companies.forEach((company, index) => {
    if (!company?.name) return

    companyMap.set(company.name.toLowerCase(), {
      ...company,
      badge: company.badge || getCompanyInitials(company.name),
      accent: company.accent || accentClasses[index % accentClasses.length],
      openJobs: 0,
      jobs: [],
    })
  })

  jobs.forEach((job, index) => {
    if (!job?.company) return

    const key = job.company.toLowerCase()
    const current = companyMap.get(key) || {
      name: job.company,
      industry: job.industry || job.department || 'Hiring company',
      location: job.location || [job.city, job.state, job.country].filter(Boolean).join(', '),
      rating: '4.5',
      badge: job.companyLogo || getCompanyInitials(job.company),
      accent: accentClasses[index % accentClasses.length],
      website: '',
      status: 'Active',
      openJobs: 0,
      jobs: [],
    }

    current.industry = current.industry || job.industry || job.department || 'Hiring company'
    current.location = current.location || job.location || [job.city, job.state, job.country].filter(Boolean).join(', ')
    current.openJobs += 1
    current.jobs.push(job)
    companyMap.set(key, current)
  })

  return Array.from(companyMap.values())
    .filter((company) => company.openJobs > 0 || Number(company.jobs || 0) > 0)
    .map((company) => ({
      ...company,
      openJobs: company.openJobs || Number(company.jobs || 0),
    }))
    .sort((a, b) => b.openJobs - a.openJobs)
}
