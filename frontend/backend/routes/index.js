const express = require('express')
const controllers = require('../controllers/resourceControllers')
const authRoutes = require('./authRoutes')
const crudRoutes = require('./crudRoutes')
const dashboardRoutes = require('./dashboardRoutes')
const gstRoutes = require('./gstRoutes')
const { getRecruiterPage } = require('../controllers/recruiterPageController')
const recruiterPackageRoutes = require('./recruiterPackageRoutes')
const recruiterJobRoutes = require('./recruiterJobRoutes')
const resumeUploadRoutes = require('./resumeUploadRoutes')
const settingsRoutes = require('./settingsRoutes')
const testimonialRoutes = require('./testimonialRoutes')
const { getMongoDbConfig, updateMongoDbConfig } = require('../controllers/settingsController')
const userRoutes = require('./userRoutes')
const userLocationRoutes = require('./userLocationRoutes')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const accountRoles = ['Admin', 'staff', 'hiring', 'account team', 'recruiter', 'users', 'freelancer']

router.get('/health', (req, res) => res.json({ success: true, message: 'Cromgen Rozgar API is running' }))
router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/gst', gstRoutes)
router.get('/recruiter-page', getRecruiterPage)
router.use('/users', userRoutes)
router.use('/user-locations', userLocationRoutes)
router.use('/jobs', crudRoutes.protected(controllers.jobs, { publicRead: true }))
router.use('/companies', crudRoutes.protected(controllers.companies, { publicRead: true }))
router.use('/content-pages', crudRoutes.protected(controllers.contentPages, { publicRead: true }))
router.use('/employers', crudRoutes.protected(controllers.employers, {
  publicCreate: true,
  readRoles: ['Admin', 'staff', 'account team', 'recruiter'],
  updateRoles: ['Admin', 'staff', 'account team', 'recruiter'],
}))
router.use('/faqs', crudRoutes.protected(controllers.faqs, { publicRead: true }))
router.use('/candidates', crudRoutes.protected(controllers.candidates, { readRoles: ['Admin', 'hiring', 'recruiter'] }))
router.use('/applications', crudRoutes.protected(controllers.applications, {
  publicCreate: true,
  readRoles: accountRoles,
  updateRoles: ['Admin', 'staff', 'hiring', 'account team', 'recruiter'],
}))
router.use('/categories', crudRoutes.protected(controllers.categories, { publicRead: true }))
router.use('/locations', crudRoutes.protected(controllers.locations, { publicRead: true }))
router.use('/newsletter-subscribers', crudRoutes.protected(controllers.newsletterSubscribers, { publicCreate: true }))
router.use('/payments', crudRoutes.protected(controllers.payments))
router.use('/pricing-packages', crudRoutes.protected(controllers.pricingPackages, { publicRead: true }))
router.use('/recruiter-package-subscriptions', recruiterPackageRoutes)
router.use('/recruiter-job-posts', recruiterJobRoutes)
router.use('/recruiter-documents', crudRoutes.protected(controllers.recruiterDocuments, {
  publicCreate: true,
  readRoles: ['Admin', 'account team', 'recruiter'],
  updateRoles: ['Admin', 'account team'],
}))
router.use('/resume-uploads', resumeUploadRoutes)
router.use('/resumes', crudRoutes.protected(controllers.resumes, { readRoles: ['Admin', 'hiring', 'recruiter'] }))
router.get('/settings/mongodb-config', protect, authorize('Admin'), getMongoDbConfig)
router.put('/settings/mongodb-config', protect, authorize('Admin'), updateMongoDbConfig)
router.use('/settings', settingsRoutes)
router.use('/support-messages', crudRoutes.protected(controllers.supportMessages, {
  publicCreate: true,
  readRoles: accountRoles,
  updateRoles: accountRoles,
}))
router.use('/testimonials', testimonialRoutes)

module.exports = router
