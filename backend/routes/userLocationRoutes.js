const express = require('express')
const userLocationController = require('../controllers/userLocationController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(protect, authorize('Candidate', 'users', 'staff', 'recruiter', 'hiring', 'account team', 'Admin', 'Super Admin'))
router.get('/active', userLocationController.active)
router.get('/history', userLocationController.history)
router.get('/current', userLocationController.current)
router.post('/current', userLocationController.trackCurrent)
router.delete('/:id', userLocationController.remove)

module.exports = router
