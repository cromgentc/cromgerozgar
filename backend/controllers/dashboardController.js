const asyncHandler = require('../middleware/asyncHandler')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const Payment = require('../models/Payment')
const RecruiterDocument = require('../models/RecruiterDocument')
const RecruiterPackageSubscription = require('../models/RecruiterPackageSubscription')
const SupportMessage = require('../models/SupportMessage')

function getAmountValue(value = '') {
  return Number(String(value).replace(/[^\d.]/g, '')) || 0
}

function getMonthBuckets() {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('en-US', { month: 'short' }),
    }
  })
}

function addToMonthlySeries(series, rows, field, valueGetter = () => 1) {
  rows.forEach((row) => {
    const date = new Date(row.createdAt || Date.now())
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!series[key]) return
    series[key][field] += valueGetter(row)
  })
}

const getEmployerDashboard = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.query.recruiterEmail || '').trim().toLowerCase()
  const jobFilter = recruiterEmail ? { recruiterEmail } : { _id: null }
  const applicationFilter = recruiterEmail ? { recruiterEmail } : { _id: null }
  const [totalJobs, activeApplications, shortlisted, employers, candidateEmails, jobs, recentApplications, shortlistedApplications] = await Promise.all([
    Job.countDocuments(jobFilter),
    Application.countDocuments({ ...applicationFilter, status: { $in: ['New', 'Reviewed', 'Interview'] } }),
    Application.countDocuments({ ...applicationFilter, status: 'Shortlisted' }),
    recruiterEmail ? Employer.countDocuments({ businessEmail: recruiterEmail }) : 0,
    recruiterEmail ? Application.distinct('candidateEmail', applicationFilter) : [],
    Job.find(jobFilter).sort('-createdAt').limit(6),
    Application.find(applicationFilter).sort('-createdAt').limit(6),
    Application.find({ ...applicationFilter, status: 'Shortlisted' }).sort('-updatedAt').limit(6),
  ])
  const interviewSchedule = await Application.countDocuments({ ...applicationFilter, status: 'Interview' })

  res.json({
    success: true,
    data: {
      metrics: {
        totalJobs,
        activeApplications,
        shortlistedCandidates: shortlisted,
        interviewSchedule,
        employers,
        candidates: candidateEmails.length,
      },
      jobs,
      applications: recentApplications,
      shortlistedApplications,
      activity: [
        `${activeApplications} active applications`,
        `${interviewSchedule} interviews scheduled`,
        `${shortlisted} shortlisted candidates`,
      ],
    },
  })
})

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalJobs,
    activeJobs,
    pendingJobs,
    rejectedJobs,
    totalEmployers,
    approvedEmployers,
    pendingEmployers,
    totalCandidates,
    totalApplications,
    shortlisted,
    companies,
    pendingDocuments,
    openSupportMessages,
    activeSubscriptions,
    payments,
    jobs,
    applications,
    candidates,
    recentJobs,
    recentApplications,
    recentDocuments,
    recentSupportMessages,
  ] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: { $in: ['Open', 'Active'] } }),
    Job.countDocuments({ $or: [{ approval: 'Pending' }, { accountDepartmentStatus: 'Pending' }] }),
    Job.countDocuments({ $or: [{ approval: 'Rejected' }, { accountDepartmentStatus: 'Rejected' }] }),
    Employer.countDocuments(),
    Employer.countDocuments({ status: 'Approved' }),
    Employer.countDocuments({ status: 'Pending' }),
    Candidate.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: 'Shortlisted' }),
    Company.countDocuments(),
    RecruiterDocument.countDocuments({ status: { $in: ['Submitted', 'Pending', 'Account Reviews', 'account_review'] } }),
    SupportMessage.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
    RecruiterPackageSubscription.countDocuments({ status: 'Active' }),
    Payment.find().sort('-createdAt').limit(500),
    Job.find().sort('-createdAt').limit(500),
    Application.find().sort('-createdAt').limit(500),
    Candidate.find().sort('-createdAt').limit(500),
    Job.find().sort('-createdAt').limit(6),
    Application.find().sort('-createdAt').limit(6),
    RecruiterDocument.find({ status: { $nin: ['Approved'] } }).sort('-updatedAt').limit(6),
    SupportMessage.find({ status: { $in: ['Open', 'In Progress'] } }).sort('-createdAt').limit(6),
  ])

  const paidPayments = payments.filter((payment) => payment.status === 'Paid')
  const revenueAmount = paidPayments.reduce((total, payment) => total + getAmountValue(payment.amount), 0)
  const buckets = getMonthBuckets()
  const monthlyIndex = Object.fromEntries(
    buckets.map((bucket) => [bucket.key, { month: bucket.label, jobs: 0, applications: 0, revenue: 0, candidates: 0 }]),
  )

  addToMonthlySeries(monthlyIndex, jobs, 'jobs')
  addToMonthlySeries(monthlyIndex, applications, 'applications')
  addToMonthlySeries(monthlyIndex, candidates, 'candidates')
  addToMonthlySeries(monthlyIndex, paidPayments, 'revenue', (payment) => getAmountValue(payment.amount))

  const categoryMap = new Map()
  jobs.forEach((job) => {
    const key = job.department || job.industry || 'General'
    categoryMap.set(key, (categoryMap.get(key) || 0) + 1)
  })

  const recruiterMap = new Map()
  jobs.forEach((job) => {
    const key = job.recruiterEmail || job.company || 'Unassigned'
    const current = recruiterMap.get(key) || {
      company: job.recruiterName || job.company || 'Recruiter',
      hires: 0,
      views: 0,
      jobs: 0,
    }
    current.jobs += 1
    current.views += Number(job.views || 0)
    current.hires += Number(job.applicationsCount || 0)
    recruiterMap.set(key, current)
  })

  const recentActivity = [
    `${pendingJobs} jobs awaiting account approval`,
    `${pendingDocuments} recruiter document requests need review`,
    `${openSupportMessages} open support messages`,
    `${shortlisted} candidates shortlisted`,
  ]

  res.json({
    success: true,
    data: {
      metrics: {
        totalJobs,
        activeJobs,
        pendingJobs,
        rejectedJobs,
        totalEmployers,
        approvedEmployers,
        pendingEmployers,
        totalCandidates,
        totalApplications,
        shortlistedCandidates: shortlisted,
        totalCompanies: companies,
        pendingDocuments,
        openSupportMessages,
        activeSubscriptions,
        paidPayments: paidPayments.length,
        revenueAmount,
      },
      charts: {
        monthly: Object.values(monthlyIndex),
        categories: Array.from(categoryMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
        recruiterPerformance: Array.from(recruiterMap.values())
          .sort((a, b) => b.jobs - a.jobs)
          .slice(0, 6),
      },
      recentJobs,
      recentApplications,
      pendingReviews: recentDocuments,
      supportMessages: recentSupportMessages,
      recentActivity,
    },
  })
})

module.exports = { getAdminDashboard, getEmployerDashboard }
