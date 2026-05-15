const express = require('express')
const { googleAuth, googleConfig, login, register, updateRecruiterStatus } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/google-config', googleConfig)
router.post('/google', googleAuth)
router.patch('/recruiter-status', protect, updateRecruiterStatus)

module.exports = router
