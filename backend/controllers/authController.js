const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const asyncHandler = require('../middleware/asyncHandler')
const Employer = require('../models/Employer')
const Setting = require('../models/Setting')
const User = require('../models/User')

async function getGoogleAuthConfig() {
  const setting = await Setting.findOne({ key: 'googleAuthLogin' }).lean().catch(() => null)
  const value = setting?.value || {}
  const clientId = value.clientId || process.env.GOOGLE_CLIENT_ID || ''

  return {
    enabled: value.enabled !== false && Boolean(clientId),
    clientId,
    projectId: value.projectId || '',
    authorizedDomains: Array.isArray(value.authorizedDomains) ? value.authorizedDomains : [],
  }
}

function normalizeRole(role) {
  const roleMap = {
    'Super Admin': 'Admin',
    'HR Manager': 'staff',
    Support: 'users',
    company: 'recruiter',
    Employer: 'recruiter',
  }

  return roleMap[role] || role
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: normalizeRole(user.role) }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function authPayload(user) {
  const role = normalizeRole(user.role)

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role,
    status: user.status,
    avatar: user.avatar,
    authProvider: user.authProvider,
    recruiterVerificationStatus: user.recruiterVerificationStatus || (role === 'recruiter' ? 'documents_required' : 'approved'),
    recruiterVerificationRemark: user.recruiterVerificationRemark,
  }
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function normalizePhone(phone = '') {
  return String(phone).replace(/\D/g, '')
}

const register = asyncHandler(async (req, res) => {
  const { name, password, role } = req.body
  const email = normalizeEmail(req.body.email)
  const phone = normalizePhone(req.body.phone)
  const normalizedRole = normalizeRole(role)
  const duplicateChecks = [{ email }]

  if (!password || String(password).length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters.')
  }

  if (phone) duplicateChecks.push({ phone })

  const exists = await User.findOne({ $or: duplicateChecks })

  if (exists) {
    res.status(400)
    throw new Error(exists.email === email ? 'Email already registered.' : 'Mobile number already registered.')
  }

  if (normalizedRole === 'recruiter') {
    const employerDuplicateFilters = [{ businessEmail: email }]
    if (phone) employerDuplicateFilters.push({ phone })

    const employerExists = await Employer.findOne({ $or: employerDuplicateFilters })
    if (employerExists) {
      res.status(400)
      throw new Error(employerExists.businessEmail === email ? 'Recruiter email already registered.' : 'Mobile number already registered with another recruiter.')
    }
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: normalizedRole,
    recruiterVerificationStatus: normalizedRole === 'recruiter' ? 'documents_required' : 'approved',
  })
  res.status(201).json({ success: true, token: signToken(user), data: authPayload(user) })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  res.json({ success: true, token: signToken(user), data: authPayload(user) })
})

const googleAuth = asyncHandler(async (req, res) => {
  const { credential, mode = 'login' } = req.body
  const requestedRole = normalizeRole(req.body.role || 'Candidate')
  const googleConfig = await getGoogleAuthConfig()

  if (!googleConfig.enabled || !googleConfig.clientId) {
    res.status(500)
    throw new Error('Google auth is not configured. Add Google client ID from admin package settings.')
  }

  if (!credential) {
    res.status(400)
    throw new Error('Google credential is required.')
  }

  const googleClient = new OAuth2Client(googleConfig.clientId)
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleConfig.clientId,
  })
  const googleProfile = ticket.getPayload()
  const email = normalizeEmail(googleProfile.email)

  if (!email || !googleProfile.email_verified) {
    res.status(401)
    throw new Error('Google account email is not verified.')
  }

  let user = await User.findOne({ email })

  if (user) {
    const normalizedExistingRole = normalizeRole(user.role)
    if (requestedRole === 'recruiter' && normalizedExistingRole !== 'recruiter') {
      res.status(409)
      throw new Error('This Google email is already registered as a user. Use another email for recruiter account.')
    }

    if (requestedRole !== 'recruiter' && normalizedExistingRole === 'recruiter') {
      res.status(409)
      throw new Error('This Google email is registered as recruiter. Please login from recruiter page.')
    }

    user.authProvider = user.authProvider || 'google'
    user.googleId = user.googleId || googleProfile.sub
    user.avatar = user.avatar || googleProfile.picture || ''
    if (!user.name) user.name = googleProfile.name || email.split('@')[0]
    await user.save()
  } else {
    if (mode === 'login') {
      res.status(404)
      throw new Error('Google account not registered. Please register first.')
    }

    user = await User.create({
      name: googleProfile.name || email.split('@')[0],
      email,
      role: requestedRole,
      authProvider: 'google',
      googleId: googleProfile.sub,
      avatar: googleProfile.picture || '',
      status: 'Active',
      recruiterVerificationStatus: requestedRole === 'recruiter' ? 'documents_required' : 'approved',
    })
  }

  res.json({ success: true, token: signToken(user), data: authPayload(user) })
})

const googleConfig = asyncHandler(async (req, res) => {
  const config = await getGoogleAuthConfig()

  res.json({
    success: true,
    data: {
      enabled: config.enabled,
      clientId: config.clientId,
      projectId: config.projectId,
      authorizedDomains: config.authorizedDomains,
    },
  })
})

const updateRecruiterStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user || normalizeRole(user.role) !== 'recruiter') {
    res.status(403)
    throw new Error('Only recruiter accounts can update recruiter verification status')
  }

  user.recruiterVerificationStatus = req.body.status || user.recruiterVerificationStatus
  await user.save()

  res.json({ success: true, data: authPayload(user) })
})

module.exports = { googleAuth, googleConfig, login, register, updateRecruiterStatus }
