const express = require('express')
const recruiterPackageController = require('../controllers/recruiterPackageController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect, authorize('Admin', 'recruiter'))
router.get('/current', recruiterPackageController.current)
router.get('/razorpay/config', recruiterPackageController.razorpayConfig)
router.post('/razorpay/order', recruiterPackageController.createRazorpayOrder)
router.post('/razorpay/verify', recruiterPackageController.verifyRazorpayPayment)
router.post('/activate', recruiterPackageController.activate)
router.post('/purchase-coins', recruiterPackageController.purchaseCoins)

module.exports = router
