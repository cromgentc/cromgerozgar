const express = require('express')
const multer = require('multer')
const { uploadResume, viewResume } = require('../controllers/resumeUploadController')
const { authorize, protect } = require('../middleware/authMiddleware')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('Only PDF resume upload is allowed.'))
      return
    }
    callback(null, true)
  },
})

router.post('/supa-cloud', protect, authorize('Admin', 'hiring', 'recruiter', 'users'), upload.single('resume'), uploadResume)
router.get('/:id/view', protect, authorize('Admin', 'hiring', 'recruiter', 'account team'), viewResume)

module.exports = router
