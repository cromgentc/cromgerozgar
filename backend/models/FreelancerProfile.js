const mongoose = require('mongoose')

const freelancerProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    rate: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    experience: { type: String, default: '' },
    availability: { type: String, default: 'Available' },
    skills: [{ type: String }],
    summary: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Review', 'Inactive', 'Blocked'], default: 'Review' },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema)
