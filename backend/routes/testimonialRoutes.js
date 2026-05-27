const express = require('express')
const { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } = require('../controllers/testimonialController')
const { authorize, optionalProtect, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const ADMIN_ROLES = ['Admin', 'staff', 'hiring', 'account team']

router.route('/').get(optionalProtect, getTestimonials).post(protect, authorize(...ADMIN_ROLES), createTestimonial)
router.route('/:id').put(protect, authorize(...ADMIN_ROLES), updateTestimonial).delete(protect, authorize(...ADMIN_ROLES), deleteTestimonial)

module.exports = router
