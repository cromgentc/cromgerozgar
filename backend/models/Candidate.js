const mongoose = require('mongoose')

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    role: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    location: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    profileStrength: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Shortlisted', 'Blocked'], default: 'Active' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Candidate', candidateSchema)
