const asyncHandler = require('../middleware/asyncHandler')
const Job = require('../models/Job')

function normalizeSort(sort) {
  return String(sort || '-createdAt').replace(/,/g, ' ')
}

function buildFilter(query = {}) {
  const filter = {}

  filter.status = 'Active'
  filter.approval = 'Approved'
  filter.accountDepartmentStatus = 'Active'

  if (query.company) filter.company = query.company
  if (query.recruiterEmail) filter.recruiterEmail = String(query.recruiterEmail).toLowerCase()

  if (query.search) {
    const regex = { $regex: query.search, $options: 'i' }
    filter.$or = [
      { title: regex },
      { company: regex },
      { department: regex },
      { industry: regex },
      { location: regex },
      { skills: regex },
      { description: regex },
      { recruiterEmail: regex },
    ]
  }

  return filter
}

const getJobListings = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100)
  const skip = (page - 1) * limit
  const filter = buildFilter(req.query)

  const [items, total] = await Promise.all([
    Job.find(filter).sort(normalizeSort(req.query.sort)).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ])

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

module.exports = { getJobListings }
