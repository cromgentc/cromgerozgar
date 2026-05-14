const express = require('express')
const recruiterPackageController = require('../controllers/recruiterPackageController')

const router = express.Router()

router.get('/current', recruiterPackageController.current)
router.post('/activate', recruiterPackageController.activate)
router.post('/purchase-coins', recruiterPackageController.purchaseCoins)

module.exports = router
