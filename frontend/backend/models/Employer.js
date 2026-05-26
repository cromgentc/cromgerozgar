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
    logo: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Suspended', 'Blocked'], default: 'Pending' },
    verified: { type: Boolean, default: false },
    accountAuthorizedByName: { type: String, default: '' },
    accountAuthorizedByEmail: { type: String, default: '', lowercase: true },
    accountAuthorizedAction: { type: String, default: '' },
    accountAuthorizedRemark: { type: String, default: '' },
    accountAuthorizedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Employer', employerSchema)
