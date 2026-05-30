const asyncHandler = require('../middleware/asyncHandler')
const VideoTestimonial = require('../models/VideoTestimonial')

const defaultVideoTestimonials = [
  {
    companyName: 'K9HR Solutions',
    location: '150 Feet Ring Road, Rajkot, India',
    logoText: 'K9HR',
    tone: 'blue',
    sortOrder: 1,
    featured: true,
  },
  {
    companyName: 'Jobsahihai Manpower Solution',
    location: 'Sector 73, Noida, India',
    logoText: 'JS',
    tone: 'stone',
    sortOrder: 2,
    featured: true,
  },
]

async function ensureDefaultVideoTestimonials() {
  const existingCount = await VideoTestimonial.countDocuments()
  if (existingCount) return []
  return VideoTestimonial.insertMany(defaultVideoTestimonials)
}

const listVideoTestimonials = asyncHandler(async (req, res) => {
  await ensureDefaultVideoTestimonials()

  const includeInactive = req.user && ['Admin', 'Super Admin'].includes(req.user.role)
  const query = includeInactive ? {} : { status: 'Active' }
  const items = await VideoTestimonial.find(query).sort('sortOrder -featured -createdAt').limit(24)

  res.json({ success: true, data: items })
})

const createVideoTestimonial = asyncHandler(async (req, res) => {
  const item = await VideoTestimonial.create(req.body)
  res.status(201).json({ success: true, data: item })
})

const updateVideoTestimonial = asyncHandler(async (req, res) => {
  const item = await VideoTestimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!item) {
    res.status(404)
    throw new Error('Video testimonial not found.')
  }
  res.json({ success: true, data: item })
})

const deleteVideoTestimonial = asyncHandler(async (req, res) => {
  const item = await VideoTestimonial.findByIdAndDelete(req.params.id)
  if (!item) {
    res.status(404)
    throw new Error('Video testimonial not found.')
  }
  res.json({ success: true, data: item })
})

module.exports = {
  createVideoTestimonial,
  deleteVideoTestimonial,
  ensureDefaultVideoTestimonials,
  listVideoTestimonials,
  updateVideoTestimonial,
}
