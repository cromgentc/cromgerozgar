require('dotenv').config()

const connectDB = require('../config/db')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const Category = require('../models/Category')
const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const Location = require('../models/Location')
const Payment = require('../models/Payment')
const Setting = require('../models/Setting')
const User = require('../models/User')

const collections = [
  Application,
  Candidate,
  Category,
  Company,
  Employer,
  Job,
  Location,
  Payment,
  Setting,
  User,
]

async function clearDatabase() {
  for (const Model of collections) {
    await Model.deleteMany({})
  }
}

async function seed() {
  if (!process.argv.includes('--clear')) {
    console.log('Demo data seeding is disabled. Use npm run seed:clear only when you want to clear the database.')
    process.exit(0)
  }

  await connectDB()
  await clearDatabase()

  console.log('Database cleared.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
