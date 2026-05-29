const mongoose = require('mongoose')

const supportMessageSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    company: { type: String, default: '', trim: true },
    role: { type: String, default: 'Guest' },
    subject: { type: String, default: 'Support chat' },
    message: { type: String, required: true, trim: true },
    packageName: { type: String, default: '', trim: true },
    candidatesNeeded: { type: String, default: '', trim: true },
    callbackTime: { type: String, default: '', trim: true },
    adminReply: { type: String, default: '', trim: true },
    chatMessages: [
      {
        sender: { type: String, enum: ['user', 'admin', 'system'], default: 'user' },
        text: { type: String, default: '', trim: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    lastUserMessageAt: { type: Date, default: Date.now },
    sessionEndsAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
    endedReason: { type: String, default: '' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    source: { type: String, default: 'support-chat' },
  },
  { timestamps: true },
)

supportMessageSchema.pre('validate', function setInitialChat() {
  if (!this.chatMessages?.length && this.message) {
    const sentAt = this.createdAt || new Date()
    this.chatMessages = [{ sender: 'user', text: this.message, sentAt }]
    this.lastUserMessageAt = sentAt
    this.sessionEndsAt = new Date(sentAt.getTime() + 10 * 60 * 1000)
  }
})

module.exports = mongoose.model('SupportMessage', supportMessageSchema)
