const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    role: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    source: { type: String, enum: ['Admin Upload', 'Lead Resume'], default: 'Admin Upload' },
    status: { type: String, enum: ['Active', 'Shortlisted', 'Blocked'], default: 'Active' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Resume', resumeSchema)
