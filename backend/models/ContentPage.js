const mongoose = require('mongoose')

const contentSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false },
)

const contentPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    category: { type: String, enum: ['Privacy', 'Terms', 'Support', 'Policy', 'General'], default: 'Policy' },
    frontendPlacement: { type: String, enum: ['Users Frontend', 'Recruiter Frontend', 'Freelancer Frontend'], default: 'Users Frontend' },
    sections: [contentSectionSchema],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
    effectiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ContentPage', contentPageSchema)
