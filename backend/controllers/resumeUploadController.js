const path = require('path')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')
const {
  parseSupaCloudObjectUrl,
  removeSupaCloudObject,
} = require('../utils/supaCloudStorage')

function cleanSegment(value = '') {
  return String(value || 'file')
    .trim()
    .replace(/[^a-z0-9.-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function cleanPath(value = '') {
  return String(value || '')
    .split('/')
    .map(cleanSegment)
    .filter(Boolean)
    .join('/')
}

function storageError(message, statusCode = 502) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

async function readSupaCloudError(response, fallback) {
  const text = await response.text().catch(() => '')
  if (!text) return fallback

  try {
    const payload = JSON.parse(text)
    return payload.message || payload.error || text
  } catch {
    return text
  }
}

async function getSupaCloudConfig() {
  const setting = await Setting.findOne({ key: 'supaCloudStorage' })
  const value = setting?.value || {}

  return {
    enabled: value.enabled !== false,
    supabaseUrl: String(value.supabaseUrl || '').replace(/\/+$/, ''),
    serviceRoleKey: value.serviceRoleKey || value.serviceKey || '',
    bucket: value.resumeBucket || value.bucket || 'resumes',
    folder: value.resumeFolder || value.folder || 'hiring-team',
    resumeBucket: value.resumeBucket || value.bucket || 'resumes',
    resumeFolder: value.resumeFolder || value.folder || 'hiring-team',
    documentBucket: value.documentBucket || 'documents',
    documentFolder: value.documentFolder || 'recruiter-documents',
    recruiterProfileBucket: value.recruiterProfileBucket || 'recruiter-profiles',
    recruiterProfileFolder: value.recruiterProfileFolder || 'logos',
    brandingBucket: value.brandingBucket || 'branding',
    brandingFolder: value.brandingFolder || 'site-assets',
    publicBucket: value.publicBucket !== false,
  }
}

async function ensureSupaCloudBucket(config) {
  const bucketUrl = `${config.supabaseUrl}/storage/v1/bucket/${encodeURIComponent(config.bucket)}`
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  }
  const bucketResponse = await fetch(bucketUrl, { headers })

  if (bucketResponse.ok) {
    const bucket = await bucketResponse.json().catch(() => ({}))
    if (config.publicBucket && bucket.public !== true) {
      const updateResponse = await fetch(bucketUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public: true }),
      })

      if (!updateResponse.ok) {
        const message = await readSupaCloudError(updateResponse, `Supa Cloud bucket "${config.bucket}" could not be made public.`)
        throw storageError(`Supa Cloud bucket update failed: ${message}`)
      }
    }
    return
  }

  const bucketMessage = await readSupaCloudError(bucketResponse, 'Supa Cloud bucket could not be verified.')
  const bucketMissing = bucketResponse.status === 404 || bucketMessage.toLowerCase().includes('bucket not found')

  if (!bucketMissing) {
    const message = bucketMessage
    throw storageError(`Supa Cloud bucket check failed: ${message}`)
  }

  const createResponse = await fetch(`${config.supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: Boolean(config.publicBucket),
    }),
  })

  if (!createResponse.ok && createResponse.status !== 409) {
    const message = await readSupaCloudError(createResponse, `Supa Cloud bucket "${config.bucket}" could not be created.`)
    throw storageError(`Supa Cloud bucket create failed: ${message}`)
  }
}

async function uploadToSupaCloud({ buffer, config, contentType, fileName }) {
  if (!config.enabled || !config.supabaseUrl || !config.serviceRoleKey || !config.bucket) {
    throw storageError('Supa Cloud storage is not configured. Save Supa Cloud settings first.', 400)
  }

  await ensureSupaCloudBucket(config)

  const folder = cleanPath(config.folder)
  const storagePath = `${folder ? `${folder}/` : ''}${Date.now()}-${cleanSegment(fileName)}`
  const uploadUrl = `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.bucket)}/${storagePath}`
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': contentType || 'application/pdf',
      'x-upsert': 'false',
    },
    body: buffer,
  })

  if (!response.ok) {
    const message = await readSupaCloudError(response, 'Supa Cloud upload failed.')
    throw storageError(`Supa Cloud upload failed: ${message}`)
  }

  const publicUrl = config.publicBucket
    ? `${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${storagePath}`
    : ''

  return { publicUrl, storagePath }
}

async function uploadResume(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Resume PDF is required.')
  }

  if (req.file.mimetype !== 'application/pdf') {
    res.status(400)
    throw new Error('Only PDF resume upload is allowed.')
  }

  const config = await getSupaCloudConfig()
  const originalFileName = req.file.originalname || 'resume.pdf'
  const upload = await uploadToSupaCloud({
    buffer: req.file.buffer,
    config,
    contentType: req.file.mimetype,
    fileName: originalFileName,
  })

  const metadata = {
    uploadedAt: new Date().toISOString(),
    candidate: {
      name: req.body.candidateName || '',
      email: req.body.emailId || req.body.email || '',
      phone: req.body.mobileNumber || req.body.phone || '',
      role: req.body.role || '',
      company: req.body.companyName || '',
      companyId: req.body.companyId || '',
    },
    file: {
      originalName: originalFileName,
      extension: path.extname(originalFileName),
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageProvider: 'supa-cloud',
      bucket: config.bucket,
      path: upload.storagePath,
      url: upload.publicUrl,
    },
    form: { ...req.body },
  }

  const resume = await Resume.create({
    name: metadata.candidate.name || 'Hiring Team Candidate',
    email: metadata.candidate.email,
    phone: metadata.candidate.phone,
    role: metadata.candidate.role,
    skills: [],
    experience: '',
    resumeUrl: upload.publicUrl,
    resumeJson: metadata,
    storageProvider: 'supa-cloud',
    storageBucket: config.bucket,
    storagePath: upload.storagePath,
    originalFileName,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    source: 'Admin Upload',
    status: 'Active',
  })

  if (req.body.previousResumeId) {
    const previousResume = await Resume.findById(req.body.previousResumeId).catch(() => null)
    const currentEmail = String(metadata.candidate.email || '').trim().toLowerCase()
    const previousEmail = String(previousResume?.email || '').trim().toLowerCase()

    if (previousResume && (!currentEmail || !previousEmail || currentEmail === previousEmail)) {
      if (previousResume.storageBucket && previousResume.storagePath) {
        await removeSupaCloudObject({ bucket: previousResume.storageBucket, storagePath: previousResume.storagePath }, 'Supa Cloud old resume file')
      } else {
        const parsed = parseSupaCloudObjectUrl(previousResume.resumeUrl)
        if (parsed) await removeSupaCloudObject(parsed, 'Supa Cloud old resume file')
      }
      await Resume.findByIdAndDelete(previousResume._id)
    }
  }

  res.status(201).json({ success: true, data: resume, resumeJson: metadata })
}

async function uploadRecruiterDocumentFile(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Recruiter document file is required.')
  }

  const allowedDocumentTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
  if (!allowedDocumentTypes.has(req.file.mimetype)) {
    res.status(400)
    throw new Error('Only JPEG, PNG, and PDF document upload is allowed.')
  }

  const config = await getSupaCloudConfig()
  const recruiterEmail = req.body.recruiterEmail || req.user?.email || 'recruiter'
  const field = cleanSegment(req.body.field || 'document')
  const originalFileName = req.file.originalname || `${field}${getDocumentExtension(req.file.mimetype)}`
  const upload = await uploadToSupaCloud({
    buffer: req.file.buffer,
    config: {
      ...config,
      bucket: config.documentBucket,
      folder: `${config.documentFolder}/${cleanSegment(recruiterEmail)}`,
    },
    contentType: req.file.mimetype,
    fileName: `${field}-${originalFileName}`,
  })

  const previousObject = parseSupaCloudObjectUrl(req.body.previousFileUrl || req.body.previousUrl)
  if (previousObject && previousObject.bucket === config.documentBucket) {
    await removeSupaCloudObject(previousObject, 'Supa Cloud old recruiter document file')
  }

  res.status(201).json({
    success: true,
    data: {
      url: upload.publicUrl,
      storageProvider: 'supa-cloud',
      storageBucket: config.documentBucket,
      storagePath: upload.storagePath,
      originalFileName,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      field,
    },
  })
}

function getDocumentExtension(mimeType = '') {
  if (mimeType === 'image/jpeg') return '.jpg'
  if (mimeType === 'image/png') return '.png'
  return '.pdf'
}

async function uploadBrandAsset(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Brand image is required.')
  }

  const isIconFile = String(req.file.originalname || '').toLowerCase().endsWith('.ico')
  if (!String(req.file.mimetype || '').startsWith('image/') && !isIconFile) {
    res.status(400)
    throw new Error('Only image upload is allowed for logo or favicon.')
  }

  const config = await getSupaCloudConfig()
  const field = cleanSegment(req.body.field || 'brand-asset')
  const upload = await uploadToSupaCloud({
    buffer: req.file.buffer,
    config: {
      ...config,
      bucket: config.brandingBucket,
      folder: `${config.brandingFolder}/${field}`,
    },
    contentType: req.file.mimetype || 'application/octet-stream',
    fileName: req.file.originalname || `${field}.png`,
  })

  const previousObject = parseSupaCloudObjectUrl(req.body.previousFileUrl || req.body.previousUrl)
  if (previousObject && previousObject.bucket === config.brandingBucket) {
    await removeSupaCloudObject(previousObject, 'Supa Cloud old brand asset')
  }

  res.status(201).json({
    success: true,
    data: {
      url: upload.publicUrl,
      storageProvider: 'supa-cloud',
      storageBucket: config.brandingBucket,
      storagePath: upload.storagePath,
      originalFileName: req.file.originalname || '',
      mimeType: req.file.mimetype || '',
      fileSize: req.file.size,
      field,
    },
  })
}

async function uploadRecruiterProfileImage(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Recruiter profile image is required.')
  }

  if (!String(req.file.mimetype || '').startsWith('image/')) {
    res.status(400)
    throw new Error('Only image upload is allowed for recruiter profile.')
  }

  const config = await getSupaCloudConfig()
  const recruiterEmail = req.body.recruiterEmail || req.user?.email || 'recruiter'
  const field = cleanSegment(req.body.field || 'profile-logo')
  const upload = await uploadToSupaCloud({
    buffer: req.file.buffer,
    config: {
      ...config,
      bucket: config.recruiterProfileBucket,
      folder: `${config.recruiterProfileFolder}/${cleanSegment(recruiterEmail)}`,
    },
    contentType: req.file.mimetype || 'application/octet-stream',
    fileName: req.file.originalname || `${field}.png`,
  })

  const previousObject = parseSupaCloudObjectUrl(req.body.previousFileUrl || req.body.previousUrl)
  if (previousObject && previousObject.bucket === config.recruiterProfileBucket) {
    await removeSupaCloudObject(previousObject, 'Supa Cloud old recruiter profile image')
  }

  res.status(201).json({
    success: true,
    data: {
      url: upload.publicUrl,
      storageProvider: 'supa-cloud',
      storageBucket: config.recruiterProfileBucket,
      storagePath: upload.storagePath,
      originalFileName: req.file.originalname || '',
      mimeType: req.file.mimetype || '',
      fileSize: req.file.size,
      field,
    },
  })
}

async function viewResume(req, res) {
  const resume = await Resume.findById(req.params.id)
  if (!resume) {
    res.status(404)
    throw new Error('Resume not found.')
  }

  if (!resume.storageBucket || !resume.storagePath) {
    res.status(404)
    throw new Error('Resume storage path not found. Please upload the resume again.')
  }

  const config = await getSupaCloudConfig()
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    res.status(400)
    throw new Error('Supa Cloud storage is not configured. Save Supa Cloud settings first.')
  }

  const objectUrl = `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(resume.storageBucket)}/${resume.storagePath}`
  const response = await fetch(objectUrl, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
  })

  if (!response.ok) {
    const message = await readSupaCloudError(response, 'Resume file could not be opened.')
    res.status(response.status === 404 ? 404 : 502)
    throw new Error(`Supa Cloud resume view failed: ${message}. Please upload the resume again or check bucket "${resume.storageBucket}".`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const fileName = cleanSegment(resume.originalFileName || `${resume.name || 'resume'}.pdf`)

  res.setHeader('Content-Type', resume.mimeType || response.headers.get('content-type') || 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
  res.send(Buffer.from(arrayBuffer))
}

module.exports = { uploadBrandAsset, uploadRecruiterDocumentFile, uploadRecruiterProfileImage, uploadResume, viewResume }
