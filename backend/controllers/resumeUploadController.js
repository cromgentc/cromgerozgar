const fs = require('fs/promises')
const path = require('path')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')
const {
  parseSupaCloudObjectUrl,
  removeSupaCloudObject,
} = require('../utils/supaCloudStorage')
const {
  fetchR2Object,
  parseR2ObjectUrl,
  readR2Error,
  removeR2Object,
  uploadResumeToR2,
} = require('../utils/r2Storage')

const SITE_BRANDING_KEY = 'siteSeoBranding'
const LOCAL_UPLOAD_ROOT = path.join(__dirname, '..', 'uploads')

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

function getRequestOrigin(req) {
  return `${req.protocol}://${req.get('host')}`
}

function isPdfUpload(file) {
  const mimeType = String(file?.mimetype || '')
  const originalName = String(file?.originalname || '').toLowerCase()
  return originalName.endsWith('.pdf') && ['application/pdf', 'application/octet-stream', 'application/x-pdf', 'binary/octet-stream'].includes(mimeType)
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
  validateSupaCloudConfig(config)

  const bucketUrl = `${config.supabaseUrl}/storage/v1/bucket/${encodeURIComponent(config.bucket)}`
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  }
  const bucketResponse = await fetchSupaCloud(bucketUrl, { headers })

  if (bucketResponse.ok) {
    const bucket = await bucketResponse.json().catch(() => ({}))
    if (config.publicBucket && bucket.public !== true) {
      const updateResponse = await fetchSupaCloud(bucketUrl, {
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

  const createResponse = await fetchSupaCloud(`${config.supabaseUrl}/storage/v1/bucket`, {
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
  const response = await fetchSupaCloud(uploadUrl, {
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

function validateSupaCloudConfig(config = {}) {
  try {
    const url = new URL(config.supabaseUrl)
    if (!/^https?:$/.test(url.protocol)) throw new Error('invalid protocol')
  } catch {
    throw storageError('Supa Cloud URL is invalid. Save a valid https://... Supa Cloud URL in Admin > Settings > Supa Cloud Storage.', 400)
  }
}

async function fetchSupaCloud(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    throw storageError(`Supa Cloud connection failed: ${error.message}. Check Supa Cloud URL, service role key, and internet access.`, 502)
  }
}

async function uploadResume(req, res) {
  if (!req.file) {
    res.status(400)
    throw new Error('Resume PDF is required.')
  }

  if (!isPdfUpload(req.file)) {
    res.status(400)
    throw new Error('Only PDF resume upload is allowed.')
  }

  const originalFileName = req.file.originalname || 'resume.pdf'
  const resumeMimeType = req.file.mimetype === 'application/pdf' ? req.file.mimetype : 'application/pdf'
  const upload = await uploadResumeToR2({
    buffer: req.file.buffer,
    contentType: resumeMimeType,
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
      mimeType: resumeMimeType,
      size: req.file.size,
      storageProvider: 'cloudflare-r2',
      bucket: upload.bucket,
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
    storageProvider: 'cloudflare-r2',
    storageBucket: upload.bucket,
    storagePath: upload.storagePath,
    originalFileName,
    mimeType: resumeMimeType,
    fileSize: req.file.size,
    source: 'Admin Upload',
    status: 'Active',
  })

  if (req.body.previousResumeId) {
    const previousResume = await Resume.findById(req.body.previousResumeId).catch(() => null)
    const currentEmail = String(metadata.candidate.email || '').trim().toLowerCase()
    const previousEmail = String(previousResume?.email || '').trim().toLowerCase()

    if (previousResume && (!currentEmail || !previousEmail || currentEmail === previousEmail)) {
      if (previousResume.storageProvider === 'cloudflare-r2' && previousResume.storageBucket && previousResume.storagePath) {
        await removeR2Object({ bucket: previousResume.storageBucket, storagePath: previousResume.storagePath }, 'Cloudflare R2 old resume file')
      } else if (previousResume.storageBucket && previousResume.storagePath) {
        await removeSupaCloudObject({ bucket: previousResume.storageBucket, storagePath: previousResume.storagePath }, 'Supa Cloud old resume file')
      } else {
        const parsedR2 = parseR2ObjectUrl(previousResume.resumeUrl)
        if (parsedR2) {
          await removeR2Object(parsedR2, 'Cloudflare R2 old resume file')
        } else {
          const parsed = parseSupaCloudObjectUrl(previousResume.resumeUrl)
          if (parsed) await removeSupaCloudObject(parsed, 'Supa Cloud old resume file')
        }
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

function withVersionedUrl(url = '') {
  const next = String(url || '').trim()
  if (!next) return ''

  const separator = next.includes('?') ? '&' : '?'
  return `${next}${separator}v=${Date.now()}`
}

function normalizeBrandAssetField(value = '') {
  const field = cleanSegment(value || 'brand-asset')
  if (['favicon', 'favicon-url', 'faviconurl'].includes(field)) return 'faviconUrl'
  return 'logoUrl'
}

async function publishBrandAssetUrl({ field, url }) {
  const brandingField = normalizeBrandAssetField(field)
  const setting = await Setting.findOne({ key: SITE_BRANDING_KEY }).lean()
  const currentValue = setting?.value || {}
  const value = {
    ...currentValue,
    [brandingField]: withVersionedUrl(url),
  }

  const updated = await Setting.findOneAndUpdate(
    { key: SITE_BRANDING_KEY },
    { $set: { key: SITE_BRANDING_KEY, group: 'website', value } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean()

  return {
    field: brandingField,
    value: updated?.value || value,
  }
}

async function uploadBrandAssetLocally({ file, field, req }) {
  const folder = path.join(LOCAL_UPLOAD_ROOT, 'branding', cleanSegment(field || 'brand-asset'))
  await fs.mkdir(folder, { recursive: true })

  const fileName = `${Date.now()}-${cleanSegment(file.originalname || `${field || 'brand-asset'}.png`)}`
  const storagePath = path.join(folder, fileName)
  await fs.writeFile(storagePath, file.buffer)

  const publicPath = `/uploads/branding/${cleanSegment(field || 'brand-asset')}/${fileName}`
  return {
    publicUrl: `${getRequestOrigin(req)}${publicPath}`,
    storagePath: publicPath,
    storageProvider: 'local',
  }
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
  let upload
  let uploadWarning = ''
  try {
    upload = await uploadToSupaCloud({
      buffer: req.file.buffer,
      config: {
        ...config,
        bucket: config.brandingBucket,
        folder: `${config.brandingFolder}/${field}`,
      },
      contentType: req.file.mimetype || 'application/octet-stream',
      fileName: req.file.originalname || `${field}.png`,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error

    uploadWarning = error.message
    console.warn(`Supa Cloud brand asset upload skipped, using local dev storage: ${error.message}`)
    upload = await uploadBrandAssetLocally({ file: req.file, field, req })
  }

  const previousObject = parseSupaCloudObjectUrl(req.body.previousFileUrl || req.body.previousUrl)
  if (upload.storageProvider !== 'local' && previousObject && previousObject.bucket === config.brandingBucket) {
    try {
      await removeSupaCloudObject(previousObject, 'Supa Cloud old brand asset')
    } catch (error) {
      console.warn(`Supa Cloud old brand asset cleanup skipped: ${error.message}`)
    }
  }

  const branding = await publishBrandAssetUrl({ field, url: upload.publicUrl })

  res.status(201).json({
    success: true,
    data: {
      url: branding.value[branding.field] || withVersionedUrl(upload.publicUrl),
      storageProvider: upload.storageProvider || 'supa-cloud',
      storageBucket: upload.storageProvider === 'local' ? 'local' : config.brandingBucket,
      storagePath: upload.storagePath,
      originalFileName: req.file.originalname || '',
      mimeType: req.file.mimetype || '',
      fileSize: req.file.size,
      field,
      brandingField: branding.field,
      branding: branding.value,
      warning: uploadWarning,
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

  assertResumeAccess(req, res, resume)

  if (!resume.storageBucket || !resume.storagePath) {
    res.status(404)
    throw new Error('Resume storage path not found. Please upload the resume again.')
  }

  const isR2Resume = resume.storageProvider === 'cloudflare-r2'
  const response = isR2Resume
    ? await fetchR2Object({ bucket: resume.storageBucket, storagePath: resume.storagePath })
    : await fetchSupaCloudResumeObject(resume)

  if (!response.ok) {
    const message = isR2Resume
      ? await readR2Error(response, 'Resume file could not be opened.')
      : await readSupaCloudError(response, 'Resume file could not be opened.')
    res.status(response.status === 404 ? 404 : 502)
    throw new Error(`${isR2Resume ? 'Cloudflare R2' : 'Supa Cloud'} resume view failed: ${message}. Please upload the resume again or check bucket "${resume.storageBucket}".`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const fileName = cleanSegment(resume.originalFileName || `${resume.name || 'resume'}.pdf`)

  res.setHeader('Content-Type', resume.mimeType || response.headers.get('content-type') || 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
  res.send(Buffer.from(arrayBuffer))
}

async function deleteResume(req, res) {
  const resume = await Resume.findById(req.params.id)
  if (!resume) {
    res.status(404)
    throw new Error('Resume not found.')
  }

  assertResumeAccess(req, res, resume)
  await removeStoredResumeFile(resume)
  await Resume.findByIdAndDelete(resume._id)

  res.json({ success: true, message: 'Resume deleted.' })
}

function assertResumeAccess(req, res, resume) {
  const role = req.user?.role
  if (['Admin', 'hiring', 'recruiter', 'account team'].includes(role)) return

  const requesterEmail = String(req.user?.email || '').trim().toLowerCase()
  const resumeEmail = String(resume.email || resume.resumeJson?.candidate?.email || '').trim().toLowerCase()
  if (role === 'users' && requesterEmail && resumeEmail && requesterEmail === resumeEmail) return

  res.status(403)
  throw new Error('Forbidden: you can access only your own resume.')
}

async function removeStoredResumeFile(resume) {
  if (resume.storageProvider === 'cloudflare-r2' && resume.storageBucket && resume.storagePath) {
    await removeR2Object({ bucket: resume.storageBucket, storagePath: resume.storagePath }, 'Cloudflare R2 resume file')
    return
  }

  const parsedR2 = parseR2ObjectUrl(resume.resumeUrl)
  if (parsedR2) {
    await removeR2Object(parsedR2, 'Cloudflare R2 resume file')
    return
  }

  if (resume.storageBucket && resume.storagePath) {
    await removeSupaCloudObject({ bucket: resume.storageBucket, storagePath: resume.storagePath }, 'Supa Cloud resume file')
    return
  }

  const parsed = parseSupaCloudObjectUrl(resume.resumeUrl)
  if (parsed) await removeSupaCloudObject(parsed, 'Supa Cloud resume file')
}

async function fetchSupaCloudResumeObject(resume) {
  const config = await getSupaCloudConfig()
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    const error = new Error('Supa Cloud storage is not configured. Save Supa Cloud settings first.')
    error.statusCode = 400
    throw error
  }

  const objectUrl = `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(resume.storageBucket)}/${resume.storagePath}`
  return fetch(objectUrl, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
  })
}

module.exports = { deleteResume, uploadBrandAsset, uploadRecruiterDocumentFile, uploadRecruiterProfileImage, uploadResume, viewResume }
