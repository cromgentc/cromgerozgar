const express = require('express')
const { getAdminDashboard, getEmployerDashboard } = require('../controllers/dashboardController')

const router = express.Router()

router.get('/admin', getAdminDashboard)
router.get('/employer', getEmployerDashboard)

module.exports = router
