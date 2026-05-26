const express = require('express')
const recruiterJobController = require('../controllers/recruiterJobController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/submit', protect, authorize('Admin', 'recruiter'), recruiterJobController.submit)

module.exports = router
