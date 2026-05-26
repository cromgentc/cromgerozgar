import authHandler from '../[...path].js'

export default function handler(req, res) {
  req.url = '/api/auth/register'
  return authHandler(req, res)
}
