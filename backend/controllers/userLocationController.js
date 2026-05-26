const asyncHandler = require('../middleware/asyncHandler')
const UserLocation = require('../models/UserLocation')

const trackedRoles = ['Candidate', 'users', 'staff', 'recruiter', 'hiring', 'account team', 'Admin', 'Super Admin']
const adminRoles = ['Admin', 'Super Admin']

function isAdminRole(role) {
  return adminRoles.includes(role)
}

function buildLocationFilter(query = {}) {
  const filter = {}

  if (query.role) filter.role = query.role
  if (query.locationStatus) filter.locationStatus = query.locationStatus

  if (query.from || query.to) {
    filter.trackedAt = {}
    if (query.from) filter.trackedAt.$gte = new Date(query.from)
    if (query.to) filter.trackedAt.$lte = new Date(query.to)
  }

  return filter
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.ip || req.socket?.remoteAddress || ''
}

exports.trackCurrent = asyncHandler(async (req, res) => {
  if (!trackedRoles.includes(req.user.role)) {
    res.status(403)
    throw new Error('Location tracking is available for user, staff, recruiter, hiring, account team, and admin roles only.')
  }

  const locationStatus = ['allowed', 'denied', 'unavailable'].includes(req.body.locationStatus) ? req.body.locationStatus : 'allowed'
  const latitude = Number(req.body.latitude)
  const longitude = Number(req.body.longitude)

  if (locationStatus === 'allowed' && (!Number.isFinite(latitude) || !Number.isFinite(longitude))) {
    res.status(400)
    throw new Error('Valid latitude and longitude are required.')
  }

  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const mapsUrl = hasCoordinates ? `https://www.google.com/maps?q=${latitude},${longitude}` : ''
  const location = await UserLocation.create({
    userId: req.user._id,
    name: req.user.name || '',
    email: String(req.user.email || '').toLowerCase(),
    phone: req.user.phone || '',
    ipAddress: getClientIp(req),
    role: req.user.role,
    latitude: hasCoordinates ? latitude : null,
    longitude: hasCoordinates ? longitude : null,
    accuracy: Number.isFinite(Number(req.body.accuracy)) ? Number(req.body.accuracy) : null,
    heading: Number.isFinite(Number(req.body.heading)) ? Number(req.body.heading) : null,
    speed: Number.isFinite(Number(req.body.speed)) ? Number(req.body.speed) : null,
    mapsUrl,
    loginTime: req.body.loginTime ? new Date(req.body.loginTime) : new Date(),
    deviceInfo: req.body.deviceInfo || req.get('user-agent') || '',
    locationStatus,
    trackedAt: new Date(),
  })

  res.json({ success: true, data: location })
})

exports.current = asyncHandler(async (req, res) => {
  const location = await UserLocation.findOne({ userId: req.user._id }).sort('-trackedAt')
  res.json({ success: true, data: location })
})

exports.active = asyncHandler(async (req, res) => {
  if (!isAdminRole(req.user.role)) {
    res.status(403)
    throw new Error('Admin access required.')
  }

  const since = new Date(Date.now() - Number(req.query.activeWindowMs || 2 * 60 * 1000))
  const match = { ...buildLocationFilter(req.query), trackedAt: { $gte: since } }
  if (req.query.role) match.role = req.query.role

  const locations = await UserLocation.aggregate([
    { $match: match },
    { $sort: { trackedAt: -1 } },
    { $group: { _id: '$userId', latest: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latest' } },
    { $sort: { trackedAt: -1 } },
  ])

  res.json({ success: true, data: locations })
})

exports.history = asyncHandler(async (req, res) => {
  if (!isAdminRole(req.user.role)) {
    res.status(403)
    throw new Error('Admin access required.')
  }

  const limit = Math.min(Number(req.query.limit || 100), 500)
  const locations = await UserLocation.find(buildLocationFilter(req.query)).sort('-trackedAt').limit(limit)
  res.json({ success: true, data: locations })
})

exports.remove = asyncHandler(async (req, res) => {
  if (!isAdminRole(req.user.role)) {
    res.status(403)
    throw new Error('Admin access required.')
  }

  const location = await UserLocation.findByIdAndDelete(req.params.id)
  if (!location) {
    res.status(404)
    throw new Error('Location history record not found.')
  }

  res.json({ success: true, data: location })
})
