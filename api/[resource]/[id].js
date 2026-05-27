const apiHandler = require('../[...path]')

module.exports = function handler(req, res) {
  const resource = req.query?.resource || ''
  const id = req.query?.id || ''
  const search = req.url?.includes('?') ? `?${req.url.split('?').slice(1).join('?')}` : ''
  req.url = `/api/${encodeURIComponent(resource)}/${encodeURIComponent(id)}${search}`
  return apiHandler(req, res)
}
