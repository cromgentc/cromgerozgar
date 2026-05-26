const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    recruiterEmail: { type: String, default: '', lowercase: true, index: true },
    recruiterName: { type: String, default: '' },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String, default: '' },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    resumeUrl: { type: String, default: '' },
    coverNote: { type: String, default: '' },
    applicationType: { type: String, enum: ['Job', 'Freelancer Project'], default: 'Job', index: true },
    projectSlug: { type: String, default: '', index: true },
    projectCategory: { type: String, default: '' },
    projectBudget: { type: String, default: '' },
    projectDuration: { type: String, default: '' },
    projectExperience: { type: String, default: '' },
    projectWorkMode: { type: String, default: '' },
    projectSkills: [{ type: String }],
    reviewRemark: { type: String, default: '' },
    reviewedByName: { type: String, default: '' },
    reviewedByEmail: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'New',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Application', applicationSchema)
