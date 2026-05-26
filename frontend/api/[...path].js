import path from 'path'
import Module from 'module'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

process.env.NODE_PATH = [
  path.join(__dirname, '..', 'node_modules'),
  process.env.NODE_PATH,
]
  .filter(Boolean)
  .join(path.delimiter)
Module._initPaths()

let app
let connectDB
let dbPromise

function getStartupStatus() {
  return {
    success: false,
    message: 'API function is deployed, but server environment is not ready.',
    env: {
      hasMongoUri: Boolean(process.env.MONGO_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      nodeEnv: process.env.NODE_ENV || '',
    },
  }
}

export default async function handler(req, res) {
  try {
    if (!app || !connectDB) {
      app = require('../../backend/server.js')
      connectDB = require('../../backend/config/db.js')
    }

    if (!dbPromise) {
      dbPromise = connectDB()
    }

    await dbPromise
    return app(req, res)
  } catch (error) {
    console.error(error)
    const status = getStartupStatus()
    status.error = error.message
    return res.status(500).json(status)
  }
}
