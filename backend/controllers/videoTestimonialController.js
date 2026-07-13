const asyncHandler = require('../middleware/asyncHandler')
const VideoTestimonial = require('../models/VideoTestimonial')

const defaultVideoTestimonials = [
  {
    companyName: 'K9HR Solutions',
    quote: 'INSEET has simplified our hiring process and helped us connect with the right talent faster than ever.',
    location: '150 Feet Ring Road, Rajkot, India',
    duration: '02:45',
    logoText: 'K9HR',
    tone: 'blue',
    sortOrder: 1,
    featured: true,
  },
  {
    companyName: 'Jobsahihai Manpower Solution',
    quote: 'The platform is easy to use, reliable, and has significantly improved our recruitment efficiency.',
    location: 'Sector 73, Noida, India',
    duration: '03:12',
    logoText: 'JS',
    tone: 'orange',
    sortOrder: 2,
    featured: true,
  },
]

async function ensureDefaultVideoTestimonials() {
  const existingCount = await VideoTestimonial.countDocuments()
  if (!existingCount) return VideoTestimonial.insertMany(defaultVideoTestimonials)

  const updatedItems = []
  for (const item of defaultVideoTestimonials) {
    const existing = await VideoTestimonial.findOne({ companyName: item.companyName })
    if (!existing) {
      updatedItems.push(await VideoTestimonial.create(item))
      continue
    }

    const patch = {}
    ;['quote', 'duration', 'logoText', 'location', 'tone'].forEach((key) => {
      if (!existing[key] && item[key]) patch[key] = item[key]
    })

    if (Object.keys(patch).length) {
      updatedItems.push(await VideoTestimonial.findByIdAndUpdate(existing._id, patch, { new: true }))
    }
  }

  return updatedItems
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
