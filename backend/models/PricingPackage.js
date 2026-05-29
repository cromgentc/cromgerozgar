const mongoose = require('mongoose')

const pricingPackageSchema = new mongoose.Schema(
  {
    key: { type: String, default: '', trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: String, required: true, trim: true },
    badge: { type: String, default: '' },
    buttonLabel: { type: String, default: 'Start Hiring' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    sortOrder: { type: Number, default: 0 },
    jobLimit: { type: Number, default: 1 },
    validityDays: { type: Number, default: 30 },
    discountPercent: { type: Number, default: 0 },
    coinPerJob: { type: Number, default: 10 },
    features: [{ type: String }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('PricingPackage', pricingPackageSchema)
