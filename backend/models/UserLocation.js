const mongoose = require('mongoose')

const userLocationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    role: { type: String, required: true, index: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    heading: { type: Number, default: null },
    speed: { type: Number, default: null },
    mapsUrl: { type: String, default: '' },
    loginTime: { type: Date, default: Date.now, index: true },
    deviceInfo: { type: String, default: '' },
    locationStatus: { type: String, enum: ['allowed', 'denied', 'unavailable'], default: 'allowed', index: true },
    trackedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('UserLocation', userLocationSchema)
