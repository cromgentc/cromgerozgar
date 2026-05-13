require('dotenv').config()

const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const connectDB = require('./config/db')
const apiRoutes = require('./routes')
const { errorHandler, notFound } = require('./middleware/errorMiddleware')

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`))
      }
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }))

app.use('/api', apiRoutes)
app.use(notFound)
app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API running on http://localhost:${port}`))
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
