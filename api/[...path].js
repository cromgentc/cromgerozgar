const app = require('../backend/server')
const connectDB = require('../backend/config/db')

let dbPromise

module.exports = async function handler(req, res) {
  if (!dbPromise) {
    dbPromise = connectDB()
  }

  await dbPromise
  return app(req, res)
}
