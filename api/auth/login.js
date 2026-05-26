const authHandler = require('../[...path]')

module.exports = function handler(req, res) {
  req.url = '/api/auth/login'
  return authHandler(req, res)
}
