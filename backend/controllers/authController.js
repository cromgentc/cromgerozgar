const jwt = require('jsonwebtoken')
const asyncHandler = require('../middleware/asyncHandler')
const Employer = require('../models/Employer')
const User = require('../models/User')

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

module.exports = { login, register, updateRecruiterStatus }
