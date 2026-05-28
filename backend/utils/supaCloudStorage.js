const Setting = require('../models/Setting')

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

async function getSupaCloudStorageConfig() {
  const setting = await Setting.findOne({ key: 'supaCloudStorage' })
  const value = setting?.value || {}

  return {
    supabaseUrl: String(value.supabaseUrl || '').replace(/\/+$/, ''),
    serviceRoleKey: value.serviceRoleKey || value.serviceKey || '',
  }
}

function parseSupaCloudObjectUrl(value = '') {
  const url = String(value || '').trim()
  if (!url) return null

  try {
    const parsed = new URL(url)
    const marker = '/storage/v1/object/'
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex === -1) return null

    const objectPath = parsed.pathname.slice(markerIndex + marker.length)
    const segments = objectPath.split('/').filter(Boolean)
    if (segments[0] === 'public') segments.shift()
    const bucket = decodeURIComponent(segments.shift() || '')
    const storagePath = segments.map((segment) => decodeURIComponent(segment)).join('/')

    if (!bucket || !storagePath) return null
    return { bucket, storagePath }
  } catch {
    return null
  }
}

async function removeSupaCloudObject({ bucket, storagePath }, label = 'Supa Cloud file') {
  if (!bucket || !storagePath) return

  const config = await getSupaCloudStorageConfig()
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    throw new Error('Supa Cloud storage is not configured. File was not deleted.')
  }

  const response = await fetch(`${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: 'DELETE',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: [storagePath] }),
  })

  if (!response.ok) {
    const message = await readSupaCloudError(response, `${label} could not be deleted.`)
    if (response.status === 404 || message.toLowerCase().includes('not found')) return
    throw new Error(message || `${label} could not be deleted.`)
  }
}

function collectSupaCloudObjectsFromFields(record, fields = []) {
  const objects = []
  const seen = new Set()

  fields.forEach((field) => {
    const parsed = parseSupaCloudObjectUrl(record?.[field])
    if (!parsed) return
    const key = `${parsed.bucket}/${parsed.storagePath}`
    if (seen.has(key)) return
    seen.add(key)
    objects.push(parsed)
  })

  return objects
}

async function removeSupaCloudObjects(objects = [], label = 'Supa Cloud file') {
  for (const object of objects) {
    await removeSupaCloudObject(object, label)
  }
}

module.exports = {
  collectSupaCloudObjectsFromFields,
  getSupaCloudStorageConfig,
  parseSupaCloudObjectUrl,
  readSupaCloudError,
  removeSupaCloudObject,
  removeSupaCloudObjects,
}
