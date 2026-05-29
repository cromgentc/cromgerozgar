const express = require('express')
const controllers = require('../controllers/resourceControllers')
const crudRoutes = require('./crudRoutes')
const { getPublicSiteBranding, getPublicSocialLinks, getSiteBranding, updateSiteBranding } = require('../controllers/settingsController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/public/site-branding', getPublicSiteBranding)
router.get('/public/social-links', getPublicSocialLinks)
router.get('/site-branding', protect, authorize('Admin', 'Super Admin'), getSiteBranding)
router.put('/site-branding', protect, authorize('Admin', 'Super Admin'), updateSiteBranding)
router.use('/', crudRoutes.protected(controllers.settings))

module.exports = router
