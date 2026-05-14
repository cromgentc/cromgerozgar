const express = require('express')
const { login, register, updateRecruiterStatus } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.patch('/recruiter-status', protect, updateRecruiterStatus)

module.exports = router
