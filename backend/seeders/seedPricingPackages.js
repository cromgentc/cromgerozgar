require('dotenv').config()

const connectDB = require('../config/db')
const PricingPackage = require('../models/PricingPackage')

const pricingPackages = [
  {
    key: 'starter',
    name: 'Starter',
    badge: '',
    description: 'For new recruiters getting started',
    price: 'INR 0',
    buttonLabel: 'Start Free Trial',
    status: 'Active',
    sortOrder: 1,
    jobLimit: 1,
    validityDays: 3,
    discountPercent: 0,
    coinPerJob: 10,
    features: ['1 active job', 'Basic candidate visibility', 'Recruiter profile', 'Email support'],
  },
  {
    key: 'growth',
    name: 'Growth',
    badge: 'Popular',
    description: 'For growing hiring teams',
    price: 'INR 4,999',
    buttonLabel: 'Start Hiring',
    status: 'Active',
    sortOrder: 2,
    jobLimit: 10,
    validityDays: 30,
    discountPercent: 0,
    coinPerJob: 10,
    features: ['10 active jobs', 'Candidate shortlisting', 'Hiring analytics', 'Priority support'],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    badge: '',
    description: 'For high-volume hiring workflows',
    price: 'Custom',
    buttonLabel: 'Start Hiring',
    status: 'Active',
    sortOrder: 3,
    jobLimit: 9999,
    validityDays: 365,
    discountPercent: 0,
    coinPerJob: 10,
    features: ['Unlimited jobs', 'Resume database access', 'Team collaboration', 'Dedicated success support'],
  },
]

async function seedPricingPackages() {
  await connectDB()

  for (const plan of pricingPackages) {
    await PricingPackage.findOneAndUpdate(
      { key: plan.key },
      { $set: plan },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    )
  }

  console.log(`Seeded ${pricingPackages.length} pricing packages.`)
  process.exit(0)
}

seedPricingPackages().catch((error) => {
  console.error(error)
  process.exit(1)
})
