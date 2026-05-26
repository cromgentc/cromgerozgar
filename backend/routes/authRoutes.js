const express = require('express')
const rateLimit = require('express-rate-limit')
const { googleAuth, googleConfig, login, register, requestEmailReset, requestWhatsappOtp, resetPassword, updateRecruiterStatus, verifyWhatsappOtp } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT || 20),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.OTP_RATE_LIMIT || 5),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot/email', otpLimiter, requestEmailReset)
router.post('/reset-password', authLimiter, resetPassword)
router.post('/forgot/whatsapp/request-otp', otpLimiter, requestWhatsappOtp)
router.post('/forgot/whatsapp/verify-otp', authLimiter, verifyWhatsappOtp)
router.post('/whatsapp/request-otp', otpLimiter, requestWhatsappOtp)
router.post('/whatsapp/verify-otp', authLimiter, verifyWhatsappOtp)
router.get('/google-config', googleConfig)
router.post('/google', authLimiter, googleAuth)
router.patch('/recruiter-status', protect, updateRecruiterStatus)

module.exports = router
