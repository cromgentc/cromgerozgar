const mongoose = require('mongoose')

const employerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    businessEmail: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Blocked'], default: 'Pending' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Employer', employerSchema)
