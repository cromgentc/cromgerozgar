import authHandler from '../[...path].js'

export default function handler(req, res) {
  req.url = '/api/auth/google'
  return authHandler(req, res)
}
