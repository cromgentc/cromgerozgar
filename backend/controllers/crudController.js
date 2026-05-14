const asyncHandler = require('../middleware/asyncHandler')

function buildQuery(query) {
  const filter = {}

  for (const [key, value] of Object.entries(query)) {
    if (['page', 'limit', 'sort', 'search'].includes(key) || value === '') continue
    filter[key] = value
  }

  return filter
}

function crudController(Model, options = {}) {
  const searchFields = options.searchFields || []

  return {
    getAll: asyncHandler(async (req, res) => {
      const page = Math.max(Number(req.query.page) || 1, 1)
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
      const skip = (page - 1) * limit
      const filter = buildQuery(req.query)

      if (req.query.search && searchFields.length) {
        filter.$or = searchFields.map((field) => ({ [field]: { $regex: req.query.search, $options: 'i' } }))
      }

      try {
        const [items, total] = await Promise.all([
          Model.find(filter).sort(req.query.sort || '-createdAt').skip(skip).limit(limit),
          Model.countDocuments(filter),
        ])

        res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
      } catch (error) {
        if (!options.safeGet) throw error
        res.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 }, warning: error.message })
      }
    }),

    getById: asyncHandler(async (req, res) => {
      const item = await Model.findById(req.params.id)
      if (!item) {
        res.status(404)
        throw new Error(`${Model.modelName} not found`)
      }
      res.json({ success: true, data: item })
    }),

    create: asyncHandler(async (req, res) => {
      const item = await Model.create(req.body)
      res.status(201).json({ success: true, data: item })
    }),

    update: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      if (!item) {
        res.status(404)
        throw new Error(`${Model.modelName} not found`)
      }
      res.json({ success: true, data: item })
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id)
      if (!item) {
        res.status(404)
        throw new Error(`${Model.modelName} not found`)
      }
      if (options.afterRemove) await options.afterRemove(item)
      res.json({ success: true, data: item })
    }),
  }
}

module.exports = crudController
