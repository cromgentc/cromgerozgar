const asyncHandler = require('../middleware/asyncHandler')
const Testimonial = require('../models/Testimonial')
const { ensureDefaultTestimonials } = require('./testimonialDefaults')

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 'Featured' || value === 'Yes'
}

function normalizeTestimonial(body = {}) {
  return {
    name: String(body.name || '').trim(),
    role: String(body.role || '').trim(),
    company: String(body.company || '').trim(),
    type: body.type || 'Candidate',
    frontendPlacement: body.frontendPlacement || 'Users Frontend',
    text: String(body.text || '').trim(),
    rating: Math.min(Math.max(Number(body.rating || 5), 1), 5),
    featured: normalizeBoolean(body.featured),
    status: body.status || 'Active',
    avatar: String(body.avatar || '').trim(),
  }
}

function buildFilter(req) {
  const filter = {}
  if (!req.user) filter.status = 'Active'
  if (req.query.status) filter.status = req.query.status
  if (req.query.frontendPlacement) filter.frontendPlacement = req.query.frontendPlacement
  if (req.query.search) {
    const regex = { $regex: req.query.search, $options: 'i' }
    filter.$or = [{ name: regex }, { role: regex }, { company: regex }, { type: regex }, { text: regex }, { status: regex }]
  }
  return filter
}

function normalizeSort(sort) {
  return String(sort || '-featured -createdAt').replace(/,/g, ' ')
}

const getTestimonials = asyncHandler(async (req, res) => {
  await ensureDefaultTestimonials(Testimonial)

  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const skip = (page - 1) * limit
  const filter = buildFilter(req)

  const [items, total] = await Promise.all([
    Testimonial.find(filter).sort(normalizeSort(req.query.sort)).skip(skip).limit(limit),
    Testimonial.countDocuments(filter),
  ])

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

const createTestimonial = asyncHandler(async (req, res) => {
  const payload = normalizeTestimonial(req.body)
  if (!payload.name || !payload.text) {
    res.status(400)
    throw new Error('Name and testimonial text are required.')
  }

  const testimonial = await Testimonial.create(payload)
  res.status(201).json({ success: true, data: testimonial })
})

const updateTestimonial = asyncHandler(async (req, res) => {
  const payload = normalizeTestimonial(req.body)
  if (!payload.name || !payload.text) {
    res.status(400)
    throw new Error('Name and testimonial text are required.')
  }

  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
  if (!testimonial) {
    res.status(404)
    throw new Error('Testimonial not found')
  }

  res.json({ success: true, data: testimonial })
})

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
  if (!testimonial) {
    res.status(404)
    throw new Error('Testimonial not found')
  }

  res.json({ success: true, data: testimonial })
})

module.exports = { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial }
