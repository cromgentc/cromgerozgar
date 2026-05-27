const apiHandler = require('../[...path]')

module.exports = function handler(req, res) {
  req.url = '/api/user-locations/current'
  return apiHandler(req, res)
}
