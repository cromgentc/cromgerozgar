const asyncHandler = require('../middleware/asyncHandler')
const Application = require('../models/Application')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const RecruiterDocument = require('../models/RecruiterDocument')
const Testimonial = require('../models/Testimonial')

const getRecruiterPage = asyncHandler(async (req, res) => {
  const [recruiters, jobs, documents, applicationsCount, testimonials] = await Promise.all([
    Employer.find().sort('-createdAt').limit(100),
    Job.find().sort('-createdAt').limit(100),
    RecruiterDocument.find().sort('-updatedAt').limit(100),
    Application.countDocuments(),
    Testimonial.find({
      status: 'Active',
      type: { $in: ['Recruiter', 'Company'] },
    }).sort('-featured -createdAt').limit(20),
  ])

  const activeJobs = jobs.filter((job) => job.accountDepartmentStatus === 'Active' || job.approval === 'Approved')
  const verifiedDocuments = documents.filter((document) => document.status === 'Approved')
  const jobApplications = jobs.reduce((total, job) => total + Number(job.applicationsCount || 0), 0)

  res.json({
    success: true,
    data: {
      stats: {
        recruiters: recruiters.length,
        activeJobs: activeJobs.length,
        applications: Math.max(applicationsCount, jobApplications),
        verifiedDocuments: verifiedDocuments.length,
      },
      recruiters,
      jobs,
      documents,
      testimonials,
    },
  })
})

module.exports = { getRecruiterPage }
