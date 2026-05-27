export function createJobDetailPath(job, index = 1) {
  const id = job?._id || job?.id
  if (!id) return '/jobs'

  const slugParts = [
    'job-listings',
    job.title,
    job.company,
    job.location,
    formatExperienceForSlug(job.experience),
    id,
  ]

  const slug = slugParts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const xp = getExperienceMin(job.experience)
  const params = new URLSearchParams({
    src: 'cluster',
    sid: `${Date.now()}_${index}`,
    xp: String(xp || 1),
    px: String(index),
  })

  return `/${slug}?${params.toString()}`
}

export function extractJobIdFromSlug(value = '') {
  const text = String(value)
  const mongoId = text.match(/[a-f\d]{24}/i)
  if (mongoId) return mongoId[0]

  const parts = text.split('-').filter(Boolean)
  return parts[parts.length - 1] || text
}

function formatExperienceForSlug(value) {
  const numbers = String(value || '').match(/\d+/g) || []
  if (numbers.length >= 2) return `${numbers[0]} to ${numbers[1]} years`
  if (numbers.length === 1) return `${numbers[0]} years`
  return ''
}

function getExperienceMin(value) {
  const numbers = String(value || '').match(/\d+/g)?.map(Number) || []
  return numbers.length ? Math.min(...numbers) : 0
}
