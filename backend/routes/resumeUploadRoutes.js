const express = require('express')
const multer = require('multer')
const { uploadBrandAsset, uploadRecruiterDocumentFile, uploadResume, viewResume } = require('../controllers/resumeUploadController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('Only PDF upload is allowed.'))
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

router.post('/supa-cloud', protect, authorize('Admin', 'hiring', 'recruiter', 'users'), upload.single('resume'), uploadResume)
router.post('/recruiter-document', protect, authorize('Admin', 'account team', 'recruiter'), upload.single('document'), uploadRecruiterDocumentFile)
router.post('/brand-asset', protect, authorize('Admin'), imageUpload.single('asset'), uploadBrandAsset)
router.get('/:id/view', protect, authorize('Admin', 'hiring', 'recruiter', 'account team'), viewResume)

module.exports = router
