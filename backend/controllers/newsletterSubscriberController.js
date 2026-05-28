const asyncHandler = require('../middleware/asyncHandler')
const NewsletterSubscriber = require('../models/NewsletterSubscriber')

const collectionAliases = ['newslettersubscribers', 'newsletter-subscribers', 'newsletterSubscribers']

const listNewsletterSubscribers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const search = String(req.query.search || '').trim().toLowerCase()
  const status = String(req.query.status || '').trim()
  const byEmail = new Map()

  const modelRows = await NewsletterSubscriber.find({}).lean().catch(() => [])
  modelRows.forEach((row) => addSubscriberRow(byEmail, row))

  for (const collectionName of collectionAliases) {
    const rows = await NewsletterSubscriber.db.collection(collectionName).find({}).toArray().catch(() => [])
    rows.forEach((row) => addSubscriberRow(byEmail, row))
  }

  let data = Array.from(byEmail.values())
  if (status) data = data.filter((row) => row.status === status)
  if (search) {
    data = data.filter((row) => [row.email, row.source, row.status, ...(row.topics || [])].join(' ').toLowerCase().includes(search))
  }

  data.sort((a, b) => new Date(b.createdAt || b.lastSubscribedAt || 0) - new Date(a.createdAt || a.lastSubscribedAt || 0))

  const total = data.length
  const start = (page - 1) * limit

  res.json({
    success: true,
    data: data.slice(start, start + limit),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

function addSubscriberRow(map, row = {}) {
  const email = String(row.email || '').trim().toLowerCase()
  if (!email) return

  const existing = map.get(email) || {}
  map.set(email, {
    ...existing,
    ...row,
    _id: row._id || existing._id,
    email,
    source: row.source || existing.source || 'footer',
    status: row.status || existing.status || 'Subscribed',
    topics: Array.isArray(row.topics) ? row.topics : String(row.topics || existing.topics || '').split(',').map((topic) => topic.trim()).filter(Boolean),
    lastSubscribedAt: row.lastSubscribedAt || existing.lastSubscribedAt || row.createdAt,
    createdAt: row.createdAt || existing.createdAt || row.lastSubscribedAt,
  })
}

module.exports = { listNewsletterSubscribers }
