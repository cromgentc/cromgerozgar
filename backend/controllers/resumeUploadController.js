const path = require('path')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')

function cleanSegment(value = '') {
  return String(value || 'file')
    .trim()
    .replace(/[^a-z0-9.-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
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
    bucket: value.bucket || 'resumes',
    folder: value.folder || 'hiring-team',
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

  if (bucketResponse.ok) return

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

  const storagePath = `${cleanSegment(config.folder)}/${Date.now()}-${cleanSegment(fileName)}`
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

  res.status(201).json({ success: true, data: resume, resumeJson: metadata })
}

async function uploadRecruiterDocumentFile(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Recruiter document PDF is required.')
  }

  if (req.file.mimetype !== 'application/pdf') {
    res.status(400)
    throw new Error('Only PDF document upload is allowed.')
  }

  const config = await getSupaCloudConfig()
  const recruiterEmail = req.body.recruiterEmail || req.user?.email || 'recruiter'
  const field = cleanSegment(req.body.field || 'document')
  const originalFileName = req.file.originalname || `${field}.pdf`
  const upload = await uploadToSupaCloud({
    buffer: req.file.buffer,
    config: {
      ...config,
      bucket: 'documents',
      folder: `recruiter-documents/${cleanSegment(recruiterEmail)}`,
    },
    contentType: req.file.mimetype,
    fileName: `${field}-${originalFileName}`,
  })

  res.status(201).json({
    success: true,
    data: {
      url: upload.publicUrl,
      storageProvider: 'supa-cloud',
      storageBucket: 'documents',
      storagePath: upload.storagePath,
      originalFileName,
      mimeType: req.file.mimetype,
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

module.exports = { uploadRecruiterDocumentFile, uploadResume, viewResume }
