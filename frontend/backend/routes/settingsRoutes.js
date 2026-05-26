const express = require('express')
const controllers = require('../controllers/resourceControllers')
const crudRoutes = require('./crudRoutes')
const { getMongoDbConfig, getPublicSiteBranding, getPublicSocialLinks, updateMongoDbConfig } = require('../controllers/settingsController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/public/site-branding', getPublicSiteBranding)
router.get('/public/social-links', getPublicSocialLinks)
router.get('/mongodb-config', protect, authorize('Admin', 'Super Admin'), getMongoDbConfig)
router.put('/mongodb-config', protect, authorize('Admin', 'Super Admin'), updateMongoDbConfig)
router.use('/', crudRoutes.protected(controllers.settings))

module.exports = router
