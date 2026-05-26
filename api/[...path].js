let app
let connectDB
let dbPromise

module.exports = async function handler(req, res) {
  try {
    if (!app || !connectDB) {
      app = require('../backend/server')
      connectDB = require('../backend/config/db')
    }

    if (!dbPromise) {
      dbPromise = connectDB()
    }

    await dbPromise
    return app(req, res)
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'API function is deployed, but server environment is not ready.',
      error: error.message,
      env: {
        hasMongoUri: Boolean(process.env.MONGO_URI),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
        nodeEnv: process.env.NODE_ENV || '',
      },
    })
  }
}
