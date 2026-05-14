const express = require('express')
const recruiterJobController = require('../controllers/recruiterJobController')

const router = express.Router()

router.post('/submit', recruiterJobController.submit)

module.exports = router
