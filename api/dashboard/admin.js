const apiHandler = require('../[...path]')

module.exports = function handler(req, res) {
  req.url = '/api/dashboard/admin'
  return apiHandler(req, res)
}
