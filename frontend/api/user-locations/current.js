import apiHandler from '../[...path].js'

export default function handler(req, res) {
  req.url = '/api/user-locations/current'
  return apiHandler(req, res)
}
