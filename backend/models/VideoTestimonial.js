const mongoose = require('mongoose')

const videoTestimonialSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    logoText: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    thumbnailUrl: { type: String, default: '', trim: true },
    tone: { type: String, default: 'blue', enum: ['blue', 'stone', 'amber', 'slate'] },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('VideoTestimonial', videoTestimonialSchema)
