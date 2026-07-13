const mongoose = require('mongoose')

const pressNewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    category: { type: String, default: 'Company News', trim: true },
    author: { type: String, default: 'INSEET Team', trim: true },
    location: { type: String, default: 'India', trim: true },
    publishedAt: { type: String, default: '', trim: true },
    sourceName: { type: String, default: '', trim: true },
    sourceUrl: { type: String, default: '', trim: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive', 'Draft'], default: 'Active' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('PressNews', pressNewsSchema)
