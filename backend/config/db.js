const mongoose = require('mongoose')

async function connectDB() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Copy .env.example to .env and set MongoDB connection string.')
  }

  const dbName = getMongoDbName(mongoUri)
  const connection = await mongoose.connect(mongoUri, dbName ? { dbName } : {})
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`)
}

function getMongoDbName(mongoUri) {
  if (process.env.MONGO_DB_NAME) return process.env.MONGO_DB_NAME

  try {
    const parsed = new URL(mongoUri)
    const dbName = parsed.pathname.replace(/^\/+/, '').split('/')[0]
    return dbName || 'cromgenrozgar'
  } catch {
    return 'cromgenrozgar'
  }
}

module.exports = connectDB
