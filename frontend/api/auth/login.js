import authHandler from '../[...path].js'

export default function handler(req, res) {
  req.url = '/api/auth/login'
  return authHandler(req, res)
}
