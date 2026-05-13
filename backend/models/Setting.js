const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    group: { type: String, default: 'website' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Setting', settingSchema)
