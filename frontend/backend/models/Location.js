const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Location', locationSchema)
