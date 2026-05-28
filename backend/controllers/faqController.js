const asyncHandler = require('../middleware/asyncHandler')
const Faq = require('../models/Faq')
const { ensureDefaultFaqs } = require('./faqDefaults')

const listFaqs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const search = String(req.query.search || '').trim().toLowerCase()
  const status = String(req.query.status || '').trim()
  const seedFilter = status ? { status } : {}
  await ensureDefaultFaqs(Faq, seedFilter)
  const rows = await Faq.db.collection('faqs').find({}).toArray()

  let data = rows.map((row) => ({
    ...row,
    category: row.category || 'General',
    status: row.status || 'Active',
    sortOrder: Number(row.sortOrder || 0),
    featured: Boolean(row.featured),
  }))

  if (status) data = data.filter((row) => row.status === status)
  if (search) {
    data = data.filter((row) => [row.category, row.question, row.answer, row.status].join(' ').toLowerCase().includes(search))
  }

  data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || Number(b.featured) - Number(a.featured) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const total = data.length
  const start = (page - 1) * limit

  res.json({
    success: true,
    data: data.slice(start, start + limit),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

module.exports = { listFaqs }
