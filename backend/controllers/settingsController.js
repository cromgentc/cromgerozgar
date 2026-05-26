const asyncHandler = require('../middleware/asyncHandler')
const Setting = require('../models/Setting')

const MONGO_SETTING_KEY = 'mongoDbConnection'
const PUBLIC_BRANDING_KEY = 'siteSeoBranding'
const PUBLIC_SOCIAL_LINKS_KEY = 'socialMediaLinks'

const getPublicSiteBranding = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: PUBLIC_BRANDING_KEY }).lean()

  res.json({
    success: true,
    data: setting
      ? {
        _id: setting._id,
        key: setting.key,
        group: setting.group,
        value: setting.value || {},
        updatedAt: setting.updatedAt,
      }
      : null,
  })
})

const getPublicSocialLinks = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: PUBLIC_SOCIAL_LINKS_KEY }).lean()
  const links = Array.isArray(setting?.value?.links) ? setting.value.links : []

  res.json({
    success: true,
    data: links
      .filter((item) => item?.enabled !== false && item?.url)
      .map((item) => ({
        platform: item.platform || 'Website',
        url: item.url,
        label: item.label || item.platform || 'Social',
      })),
  })
})

const getMongoDbConfig = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: MONGO_SETTING_KEY }).lean()
  const envDetails = buildMongoDetails(process.env.MONGO_URI || '')
  const value = setting?.value || {}

  res.json({
    success: true,
    data: {
      _id: setting?._id || '',
      key: MONGO_SETTING_KEY,
      group: 'database',
      source: setting ? 'settings' : 'env',
      value: {
        enabled: value.enabled !== false,
        connectionName: value.connectionName || 'Primary MongoDB',
        mongoUri: value.mongoUri || process.env.MONGO_URI || '',
        databaseName: value.databaseName || envDetails.databaseName || 'cromgenrozgar',
        host: value.host || envDetails.host || '',
        username: value.username || envDetails.username || '',
        port: value.port || process.env.PORT || '5050',
        clientUrl: value.clientUrl || process.env.CLIENT_URL || '',
        notes: value.notes || '',
      },
      envPreview: {
        databaseName: envDetails.databaseName || '',
        host: envDetails.host || '',
        username: envDetails.username || '',
        port: process.env.PORT || '',
        clientUrl: process.env.CLIENT_URL || '',
      },
      updatedAt: setting?.updatedAt || null,
    },
  })
})

const updateMongoDbConfig = asyncHandler(async (req, res) => {
  const body = req.body || {}
  const mongoUri = String(body.mongoUri || '').trim()

  if (!mongoUri) {
    res.status(400)
    throw new Error('MongoDB URI is required.')
  }

  const details = buildMongoDetails(mongoUri)
  const value = {
    enabled: body.enabled !== false,
    connectionName: String(body.connectionName || 'Primary MongoDB').trim(),
    mongoUri,
    databaseName: String(body.databaseName || details.databaseName || '').trim(),
    host: String(body.host || details.host || '').trim(),
    username: String(body.username || details.username || '').trim(),
    port: String(body.port || process.env.PORT || '').trim(),
    clientUrl: String(body.clientUrl || process.env.CLIENT_URL || '').trim(),
    notes: String(body.notes || '').trim(),
  }

  const setting = await Setting.findOneAndUpdate(
    { key: MONGO_SETTING_KEY },
    { key: MONGO_SETTING_KEY, group: 'database', value },
    { new: true, upsert: true, runValidators: true },
  )

  res.json({ success: true, data: setting })
})

function buildMongoDetails(uri) {
  if (!uri) return {}

  try {
    const url = new URL(uri)
    return {
      databaseName: url.pathname.replace(/^\//, ''),
      host: url.host,
      username: decodeURIComponent(url.username || ''),
    }
  } catch {
    const databaseName = uri.split('/').pop()?.split('?')[0] || ''
    const host = uri.replace(/^mongodb(\+srv)?:\/\//, '').split('/')[0] || ''
    return { databaseName, host, username: '' }
  }
}

module.exports = { getMongoDbConfig, getPublicSiteBranding, getPublicSocialLinks, updateMongoDbConfig }
