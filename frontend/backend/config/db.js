const mongoose = require('mongoose')

async function connectDB() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Copy .env.example to .env and set MongoDB connection string.')
  }

  const connection = await mongoose.connect(mongoUri)
  console.log(`MongoDB connected: ${connection.connection.host}`)
}

module.exports = connectDB
