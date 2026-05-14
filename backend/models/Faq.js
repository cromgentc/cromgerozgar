const mongoose = require('mongoose')

const faqSchema = new mongoose.Schema(
  {
    category: { type: String, default: 'General', trim: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Faq', faqSchema)
