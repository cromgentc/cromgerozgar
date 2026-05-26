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

const app = require('../../backend/server.js')
const connectDB = require('../../backend/config/db.js')

let dbPromise

export default async function handler(req, res) {
  if (!dbPromise) {
    dbPromise = connectDB()
  }

  await dbPromise
  return app(req, res)
}
