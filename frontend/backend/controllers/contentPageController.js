const asyncHandler = require('../middleware/asyncHandler')
const ContentPage = require('../models/ContentPage')

const collectionAliases = ['contentpages', 'content-pages', 'contentPages']

const listContentPages = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const search = String(req.query.search || '').trim().toLowerCase()
  const status = String(req.query.status || '').trim()
  const slug = String(req.query.slug || '').trim().toLowerCase()
  const frontendPlacement = String(req.query.frontendPlacement || '').trim()
  const bySlug = new Map()

  const modelRows = await ContentPage.find({}).lean().catch(() => [])
  modelRows.forEach((row) => addPageRow(bySlug, row))

  for (const collectionName of collectionAliases) {
    const rows = await ContentPage.db.collection(collectionName).find({}).toArray().catch(() => [])
    rows.forEach((row) => addPageRow(bySlug, row))
  }

  let data = Array.from(bySlug.values())
  if (slug) data = data.filter((row) => row.slug === slug)
  if (status) data = data.filter((row) => row.status === status)
  if (frontendPlacement) data = data.filter((row) => row.frontendPlacement === frontendPlacement)
  if (search) {
    data = data.filter((row) => [row.slug, row.title, row.subtitle, row.category, row.frontendPlacement, row.status].join(' ').toLowerCase().includes(search))
  }

  data.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))

  const total = data.length
  const start = (page - 1) * limit

  res.json({
    success: true,
    data: data.slice(start, start + limit),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

function addPageRow(map, row = {}) {
  const slug = String(row.slug || '').trim().toLowerCase()
  if (!slug) return

  const existing = map.get(slug) || {}
  map.set(slug, {
    ...existing,
    ...row,
    _id: row._id || existing._id,
    slug,
    title: row.title || existing.title || slug,
    subtitle: row.subtitle || existing.subtitle || '',
    category: row.category || existing.category || 'Policy',
    frontendPlacement: row.frontendPlacement || existing.frontendPlacement || 'Users Frontend',
    status: row.status || existing.status || 'Published',
    sections: Array.isArray(row.sections) ? row.sections : existing.sections || [],
    effectiveDate: row.effectiveDate || existing.effectiveDate || row.createdAt,
    createdAt: row.createdAt || existing.createdAt,
    updatedAt: row.updatedAt || existing.updatedAt,
  })
}

module.exports = { listContentPages }
