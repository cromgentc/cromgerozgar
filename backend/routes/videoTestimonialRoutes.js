const express = require('express')
const {
  createVideoTestimonial,
  deleteVideoTestimonial,
  listVideoTestimonials,
  updateVideoTestimonial,
} = require('../controllers/videoTestimonialController')
const { authorize, optionalProtect, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const ADMIN_ROLES = ['Admin', 'staff', 'hiring', 'account team']

router.route('/').get(optionalProtect, listVideoTestimonials).post(protect, authorize(...ADMIN_ROLES), createVideoTestimonial)
router.route('/:id').put(protect, authorize(...ADMIN_ROLES), updateVideoTestimonial).delete(protect, authorize(...ADMIN_ROLES), deleteVideoTestimonial)

module.exports = router
