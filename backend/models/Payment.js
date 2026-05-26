const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    employer: { type: String, required: true },
    recruiterEmail: { type: String, lowercase: true, default: '' },
    plan: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, enum: ['Paid', 'Failed', 'Pending'], default: 'Pending' },
    invoiceNo: { type: String, required: true },
    gateway: { type: String, default: 'Razorpay' },
    purpose: { type: String, enum: ['package', 'coins', 'manual'], default: 'manual' },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingPackage', default: null },
    coins: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paymentMethod: { type: String, default: '' },
    paidAt: { type: Date, default: null },
    failureReason: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)
