const asyncHandler = require('../middleware/asyncHandler')
const Candidate = require('../models/Candidate')
const Company = require('../models/Company')
const Job = require('../models/Job')
const User = require('../models/User')

function compactCount(value) {
  const number = Number(value || 0)
  if (number >= 1000000) return `${Math.floor(number / 100000) / 10}M+`
  if (number >= 1000) return `${Math.floor(number / 100) / 10}k+`
  return String(number)
}

const getPortalSummary = asyncHandler(async (req, res) => {
  const [jobs, candidates, companies, recruiters] = await Promise.all([
    Job.countDocuments({ status: 'Active', approval: 'Approved', accountDepartmentStatus: 'Active' }),
    Candidate.countDocuments({}),
    Company.countDocuments({ status: { $ne: 'Inactive' } }),
    User.countDocuments({ role: 'recruiter' }),
  ])

  res.json({
    success: true,
    data: {
      stats: [
        { label: 'Jobs', value: compactCount(jobs) },
        { label: 'Candidates', value: compactCount(candidates) },
        { label: 'Companies', value: compactCount(companies) },
        { label: 'Recruiters', value: compactCount(recruiters) },
      ],
      counts: { jobs, candidates, companies, recruiters },
    },
  })
})

module.exports = { getPortalSummary }
