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
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'New',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Application', applicationSchema)
