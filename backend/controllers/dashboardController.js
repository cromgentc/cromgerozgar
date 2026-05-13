const asyncHandler = require('../middleware/asyncHandler')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const Payment = require('../models/Payment')

const getEmployerDashboard = asyncHandler(async (req, res) => {
  const [totalJobs, activeApplications, shortlisted, employers, candidates, jobs] = await Promise.all([
    Job.countDocuments(),
    Application.countDocuments({ status: { $in: ['New', 'Reviewed', 'Interview'] } }),
    Application.countDocuments({ status: 'Shortlisted' }),
    Employer.countDocuments(),
    Candidate.countDocuments(),
    Job.find().sort('-createdAt').limit(6),
  ])

  res.json({
    success: true,
    data: {
      metrics: {
        totalJobs,
        activeApplications,
        shortlistedCandidates: shortlisted,
        interviewSchedule: await Application.countDocuments({ status: 'Interview' }),
        employers,
        candidates,
      },
      jobs,
      activity: ['12 new applications', '4 interviews scheduled', '2 offers pending'],
    },
  })
})

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalJobs, activeJobs, pendingJobs, totalEmployers, totalCandidates, totalApplications, shortlisted, companies, payments] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: { $in: ['Open', 'Active'] } }),
    Job.countDocuments({ approval: 'Pending' }),
    Employer.countDocuments(),
    Candidate.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ status: 'Shortlisted' }),
    Company.countDocuments(),
    Payment.find(),
  ])

  res.json({
    success: true,
    data: {
      totalJobs,
      activeJobs,
      pendingJobs,
      totalEmployers,
      totalCandidates,
      totalApplications,
      shortlistedCandidates: shortlisted,
      totalCompanies: companies,
      revenue: payments.filter((payment) => payment.status === 'Paid').length,
    },
  })
})

module.exports = { getAdminDashboard, getEmployerDashboard }
