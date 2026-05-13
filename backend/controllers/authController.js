const jwt = require('jsonwebtoken')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')

function normalizeRole(role) {
  const roleMap = {
    'Super Admin': 'Admin',
    'HR Manager': 'staff',
    Support: 'users',
  }

  return roleMap[role] || role
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: normalizeRole(user.role) }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function authPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  }
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  const exists = await User.findOne({ email })

  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({ name, email, password, role })
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

module.exports = { login, register }
