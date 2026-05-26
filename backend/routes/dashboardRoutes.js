const express = require('express')
const { getAdminDashboard, getEmployerDashboard } = require('../controllers/dashboardController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/admin', protect, authorize('Admin', 'staff', 'hiring', 'account team'), getAdminDashboard)
router.get('/employer', protect, authorize('Admin', 'recruiter', 'account team'), getEmployerDashboard)

module.exports = router
