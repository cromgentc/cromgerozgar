const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    type: { type: String, enum: ['Candidate', 'Recruiter', 'Company', 'Admin'], default: 'Candidate' },
    frontendPlacement: { type: String, enum: ['Users Frontend', 'Recruiter Frontend'], default: 'Users Frontend' },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    featured: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Testimonial', testimonialSchema)
