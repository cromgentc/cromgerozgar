const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    employer: { type: String, required: true },
    plan: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, enum: ['Paid', 'Failed', 'Pending'], default: 'Pending' },
    invoiceNo: { type: String, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)
