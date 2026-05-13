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
const demoData = require('../data/demoData')

const collections = [
  [Application, demoData.applications],
  [Candidate, demoData.candidates],
  [Category, demoData.categories],
  [Company, demoData.companies],
  [Employer, demoData.employers],
  [Job, demoData.jobs],
  [Location, demoData.locations],
  [Payment, demoData.payments],
  [Setting, demoData.settings],
  [User, demoData.users],
]

async function clearDatabase() {
  for (const [Model] of collections) {
    await Model.deleteMany({})
  }
}

async function seed() {
  await connectDB()
  await clearDatabase()

  if (process.argv.includes('--clear')) {
    console.log('Demo data cleared')
    process.exit(0)
  }

  for (const [Model, data] of collections) {
    if (Model.modelName === 'User') {
      await Model.create(data)
    } else {
      await Model.insertMany(data)
    }
  }

  console.log('Demo data seeded successfully')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
