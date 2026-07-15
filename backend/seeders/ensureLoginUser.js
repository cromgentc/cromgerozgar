require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')

const email = String(process.env.LOGIN_EMAIL || '').trim().toLowerCase()
const password = String(process.env.LOGIN_PASSWORD || '')
const name = String(process.env.LOGIN_NAME || 'INSEET Admin').trim()
const role = String(process.env.LOGIN_ROLE || 'Admin').trim()

async function ensureLoginUser() {
  if (!email || !password) {
    throw new Error('LOGIN_EMAIL and LOGIN_PASSWORD are required.')
  }

  await connectDB()

  const user = await User.findOne({ email })

  if (user) {
    user.name = name || user.name
    user.password = password
    user.role = role
    user.status = 'Active'
    user.recruiterVerificationStatus = role === 'recruiter' ? 'approved' : 'approved'
    await user.save()
    console.log(`Updated login user: ${email}`)
  } else {
    await User.create({
      name,
      email,
      password,
      role,
      status: 'Active',
      recruiterVerificationStatus: 'approved',
    })
    console.log(`Created login user: ${email}`)
  }

  process.exit(0)
}

ensureLoginUser().catch((error) => {
  console.error(error)
  process.exit(1)
})
