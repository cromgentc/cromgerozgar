const mongoose = require('mongoose')

const newsletterUpdateSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    previewText: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    ctaLabel: { type: String, default: '', trim: true },
    ctaUrl: { type: String, default: '', trim: true },
    status: { type: String, enum: ['Draft', 'Sending', 'Sent', 'Failed'], default: 'Sent' },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    failedEmails: [{ type: String }],
    sentByName: { type: String, default: '' },
    sentByEmail: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('NewsletterUpdate', newsletterUpdateSchema)
