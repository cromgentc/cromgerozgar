const asyncHandler = require('../middleware/asyncHandler')
const PricingPackage = require('../models/PricingPackage')
const RecruiterPackageSubscription = require('../models/RecruiterPackageSubscription')

function getPackageAmount(price) {
  const amount = Number(String(price || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function getCoinCredit(selectedPackage) {
  const amount = getPackageAmount(selectedPackage.price)
  const discountPercent = Number(selectedPackage.discountPercent || 0)
  const payableAmount = Math.max(0, amount - (amount * discountPercent) / 100)
  const amountCoins = Math.floor(payableAmount / 100) * 10
  const coinPerJob = Number(selectedPackage.coinPerJob || selectedPackage.packageSnapshot?.coinPerJob || 10)
  const jobLimit = Number(selectedPackage.jobLimit || selectedPackage.packageSnapshot?.jobLimit || 1)
  const minimumPackageCoins = Math.max(coinPerJob, jobLimit * coinPerJob)

  return Math.max(amountCoins, minimumPackageCoins)
}

async function repairSubscriptionCoins(subscription) {
  if (!subscription) return subscription

  const coinPerJob = Number(subscription.packageSnapshot?.coinPerJob || 10)
  const jobLimit = Number(subscription.packageSnapshot?.jobLimit || 1)
  const snapshotCredit = Number(subscription.packageSnapshot?.coinCredit || 0)
  const minimumPackageCoins = Math.max(coinPerJob, jobLimit * coinPerJob)
  const expectedCredit = Math.max(snapshotCredit, minimumPackageCoins)
  const currentBalance = Number(subscription.coinBalance || 0)
  const coinsUsed = Number(subscription.coinsUsed || 0)
  const repairedBalance = Math.max(0, expectedCredit - coinsUsed)

  if (currentBalance >= repairedBalance && snapshotCredit >= expectedCredit) return subscription

  subscription.packageSnapshot = {
    ...(subscription.packageSnapshot?.toObject ? subscription.packageSnapshot.toObject() : subscription.packageSnapshot),
    coinPerJob,
    jobLimit,
    coinCredit: expectedCredit,
  }
  subscription.coinBalance = Math.max(currentBalance, repairedBalance)
  await subscription.save()

  return subscription
}

exports.current = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.query.recruiterEmail || '').toLowerCase()
  if (!recruiterEmail) {
    res.status(400)
    throw new Error('Recruiter email is required')
  }

  const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
  await repairSubscriptionCoins(subscription)

  res.json({ success: true, data: subscription })
})

exports.activate = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  const recruiterName = req.body.recruiterName || ''
  const packageId = req.body.packageId

  if (!recruiterEmail || !packageId) {
    res.status(400)
    throw new Error('Recruiter email and package id are required')
  }

  const selectedPackage = await PricingPackage.findById(packageId)
  if (!selectedPackage || selectedPackage.status === 'Inactive') {
    res.status(404)
    throw new Error('Package is not available')
  }

  await RecruiterPackageSubscription.updateMany(
    { recruiterEmail, status: 'Active' },
    { status: 'Cancelled', cancelledAt: new Date() },
  )

  const activatedAt = new Date()
  const expiresAt = new Date(activatedAt)
  expiresAt.setDate(expiresAt.getDate() + Number(selectedPackage.validityDays || 30))
  const coinCredit = getCoinCredit(selectedPackage)
  const coinPerJob = Number(selectedPackage.coinPerJob || 10)

  const subscription = await RecruiterPackageSubscription.create({
    recruiterEmail,
    recruiterName,
    packageId: selectedPackage._id,
    packageSnapshot: {
      name: selectedPackage.name,
      price: selectedPackage.price,
      badge: selectedPackage.badge,
      description: selectedPackage.description,
      jobLimit: selectedPackage.jobLimit,
      validityDays: selectedPackage.validityDays,
      discountPercent: selectedPackage.discountPercent,
      coinPerJob,
      coinCredit,
      features: selectedPackage.features,
    },
    coinBalance: coinCredit,
    coinsUsed: 0,
    paymentStatus: 'Paid',
    status: 'Active',
    activatedAt,
    expiresAt,
  })

  res.status(201).json({ success: true, data: subscription })
})

exports.purchaseCoins = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  const recruiterName = req.body.recruiterName || ''
  const coins = Math.max(Number(req.body.coins || 0), 0)
  const amount = Number(req.body.amount || 0)
  const expectedAmount = coins * 10

  if (!recruiterEmail) {
    res.status(400)
    throw new Error('Recruiter email is required')
  }

  if (!coins || coins % 10 !== 0) {
    res.status(400)
    throw new Error('Please choose coins in multiples of 10.')
  }

  if (amount !== expectedAmount) {
    res.status(400)
    throw new Error(`Invalid payment amount. ${coins} coins require INR ${expectedAmount}.`)
  }

  const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
  if (!subscription) {
    res.status(404)
    throw new Error('Please activate a recruiter package before buying coins.')
  }

  subscription.recruiterName = recruiterName || subscription.recruiterName
  subscription.coinBalance = Number(subscription.coinBalance || 0) + coins
  subscription.packageSnapshot = {
    ...(subscription.packageSnapshot?.toObject ? subscription.packageSnapshot.toObject() : subscription.packageSnapshot),
    coinCredit: Number(subscription.packageSnapshot?.coinCredit || 0) + coins,
    lastCoinPurchase: {
      coins,
      amount,
      paidAt: new Date(),
    },
  }
  subscription.paymentStatus = 'Paid'
  await subscription.save()

  res.json({
    success: true,
    data: subscription,
    message: `${coins} coins added to recruiter wallet.`,
  })
})
