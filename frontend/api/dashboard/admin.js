import apiHandler from '../[...path].js'

export default function handler(req, res) {
  req.url = '/api/dashboard/admin'
  return apiHandler(req, res)
}
