const express = require('express')
const multer = require('multer')
const { uploadBrandAsset, uploadRecruiterDocumentFile, uploadRecruiterProfileImage, uploadResume, viewResume } = require('../controllers/resumeUploadController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const resumeFileTypes = new Set(['application/pdf', 'application/octet-stream', 'application/x-pdf', 'binary/octet-stream'])
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const isPdfFile = String(file.originalname || '').toLowerCase().endsWith('.pdf')
    if (!isPdfFile || !resumeFileTypes.has(file.mimetype)) {
      callback(new Error('Only PDF upload is allowed.'))
      return
    }
    callback(null, true)
  },
})

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, and PDF document upload is allowed.'))
      return
    }
    callback(null, true)
  },
})

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const isIconFile = String(file.originalname || '').toLowerCase().endsWith('.ico')
    if (!String(file.mimetype || '').startsWith('image/') && !isIconFile) {
      callback(new Error('Only image upload is allowed.'))
      return
    }
    callback(null, true)
  },
})

router.post('/cloudflare-r2', protect, authorize('Admin', 'hiring', 'recruiter', 'users'), upload.single('resume'), uploadResume)
router.post('/recruiter-document', protect, authorize('Admin', 'account team', 'recruiter'), documentUpload.single('document'), uploadRecruiterDocumentFile)
router.post('/recruiter-profile-image', protect, authorize('Admin', 'account team', 'recruiter'), imageUpload.single('image'), uploadRecruiterProfileImage)
router.post('/brand-asset', protect, authorize('Admin'), imageUpload.single('asset'), uploadBrandAsset)
router.get('/:id/view', protect, authorize('Admin', 'hiring', 'recruiter', 'account team'), viewResume)

module.exports = router
