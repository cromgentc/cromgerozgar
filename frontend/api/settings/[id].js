import apiHandler from '../[...path].js'

export default function handler(req, res) {
  const id = req.query?.id || ''
  const search = req.url?.includes('?') ? `?${req.url.split('?').slice(1).join('?')}` : ''
  req.url = `/api/settings/${encodeURIComponent(id)}${search}`
  return apiHandler(req, res)
}
