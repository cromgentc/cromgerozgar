const authHandler = require('../[...path]')

module.exports = function handler(req, res) {
  req.url = '/api/auth/google'
  return authHandler(req, res)
}
