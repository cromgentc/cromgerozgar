const apiHandler = require('./[...path]')

module.exports = function handler(req, res) {
  const currentUrl = new URL(req.url || '/api', 'https://local.test')
  const rawPath = req.query?.path || currentUrl.searchParams.get('path') || ''
  const path = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath)

  currentUrl.searchParams.delete('path')
  const query = currentUrl.searchParams.toString()
  req.url = `/api${path ? `/${path.replace(/^\/+/, '')}` : ''}${query ? `?${query}` : ''}`

  return apiHandler(req, res)
}
