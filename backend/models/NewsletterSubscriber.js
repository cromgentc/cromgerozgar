const mongoose = require('mongoose')

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: 'footer' },
    status: { type: String, enum: ['Subscribed', 'Unsubscribed'], default: 'Subscribed' },
    topics: [{ type: String }],
    lastSubscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema)
