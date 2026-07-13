const aws4 = require('aws4')

const DEFAULT_R2_ACCOUNT_ID = '69d4cb35ab86c2664455ce656338ea7a'
const DEFAULT_R2_BUCKET = 'inseet-resumes'

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

function getR2Config() {
  const accountId = String(process.env.CLOUDFLARE_R2_ACCOUNT_ID || DEFAULT_R2_ACCOUNT_ID).trim()
  const bucket = String(process.env.CLOUDFLARE_R2_BUCKET || DEFAULT_R2_BUCKET).trim()
  const accessKeyId = String(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '').trim()
  const secretAccessKey = String(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '').trim()
  const folder = cleanPath(process.env.CLOUDFLARE_R2_RESUME_FOLDER || '')
  const publicBaseUrl = String(process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '')

  return {
    accountId,
    accessKeyId,
    bucket,
    endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '',
    folder,
    publicBaseUrl,
    secretAccessKey,
  }
}

function ensureR2Config(config = getR2Config()) {
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucket) {
    const error = new Error('Cloudflare R2 is not configured. Add CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_BUCKET.')
    error.statusCode = 400
    throw error
  }
}

function encodePath(path = '') {
  return String(path)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function signR2Request({ body, config, contentType = '', key, method }) {
  ensureR2Config(config)

  const host = `${config.accountId}.r2.cloudflarestorage.com`
  const path = `/${encodePath(config.bucket)}/${encodePath(key)}`
  const request = {
    headers: {},
    host,
    method,
    path,
    region: 'auto',
    service: 's3',
  }

  if (body !== undefined) request.body = body
  if (contentType) request.headers['Content-Type'] = contentType

  aws4.sign(request, {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  })

  return {
    headers: request.headers,
    url: `${config.endpoint}${path}`,
  }
}

async function readR2Error(response, fallback) {
  const text = await response.text().catch(() => '')
  if (!text) return fallback
  const message = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || fallback
  if (message.includes('SignatureDoesNotMatch')) {
    return 'Cloudflare R2 credentials are invalid or mismatched. Regenerate the R2 API token and copy the S3 clients Access Key ID and Secret Access Key again.'
  }
  return message
}

async function uploadResumeToR2({ buffer, contentType, fileName }) {
  const config = getR2Config()
  ensureR2Config(config)

  const storagePath = `${config.folder ? `${config.folder}/` : ''}${Date.now()}-${cleanSegment(fileName || 'resume.pdf')}`
  const signedRequest = signR2Request({
    body: buffer,
    config,
    contentType: contentType || 'application/pdf',
    key: storagePath,
    method: 'PUT',
  })

  const response = await fetch(signedRequest.url, {
    method: 'PUT',
    headers: signedRequest.headers,
    body: buffer,
  })

  if (!response.ok) {
    const error = new Error(`Cloudflare R2 upload failed: ${await readR2Error(response, 'Resume upload failed.')}`)
    error.statusCode = 502
    throw error
  }

  return {
    bucket: config.bucket,
    publicUrl: config.publicBaseUrl ? `${config.publicBaseUrl}/${encodePath(storagePath)}` : `r2://${config.bucket}/${storagePath}`,
    storagePath,
  }
}

async function fetchR2Object({ bucket, storagePath }) {
  const config = { ...getR2Config(), bucket: bucket || getR2Config().bucket }
  const signedRequest = signR2Request({
    config,
    key: storagePath,
    method: 'GET',
  })

  return fetch(signedRequest.url, {
    headers: signedRequest.headers,
  })
}

async function removeR2Object({ bucket, storagePath }, label = 'Cloudflare R2 file') {
  if (!bucket || !storagePath) return

  const config = { ...getR2Config(), bucket }
  const signedRequest = signR2Request({
    config,
    key: storagePath,
    method: 'DELETE',
  })
  const response = await fetch(signedRequest.url, {
    method: 'DELETE',
    headers: signedRequest.headers,
  })

  if (!response.ok && response.status !== 404) {
    const error = new Error(await readR2Error(response, `${label} could not be deleted.`))
    error.statusCode = 502
    throw error
  }
}

function parseR2ObjectUrl(value = '') {
  const url = String(value || '').trim()
  if (!url.startsWith('r2://')) return null

  const [, rest = ''] = url.split('r2://')
  const [bucket, ...pathSegments] = rest.split('/').filter(Boolean)
  const storagePath = pathSegments.join('/')
  if (!bucket || !storagePath) return null
  return { bucket, storagePath }
}

module.exports = {
  cleanPath,
  cleanSegment,
  fetchR2Object,
  getR2Config,
  parseR2ObjectUrl,
  readR2Error,
  removeR2Object,
  uploadResumeToR2,
}
