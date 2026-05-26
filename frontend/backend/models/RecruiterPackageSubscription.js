const mongoose = require('mongoose')

const recruiterPackageSubscriptionSchema = new mongoose.Schema(
  {
    recruiterEmail: { type: String, required: true, lowercase: true, index: true },
    recruiterName: { type: String, default: '' },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingPackage', required: true },
    packageSnapshot: {
      name: String,
      price: String,
      badge: String,
      description: String,
      jobLimit: Number,
      validityDays: Number,
      discountPercent: Number,
      coinPerJob: Number,
      coinCredit: Number,
      features: [String],
    },
    jobsUsed: { type: Number, default: 0 },
    coinBalance: { type: Number, default: 0 },
    coinsUsed: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
    status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active', index: true },
    activatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('RecruiterPackageSubscription', recruiterPackageSubscriptionSchema)
