const asyncHandler = require('../middleware/asyncHandler')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const Payment = require('../models/Payment')
const PricingPackage = require('../models/PricingPackage')
const RecruiterPackageSubscription = require('../models/RecruiterPackageSubscription')
const Setting = require('../models/Setting')

const RAZORPAY_SETTING_KEY = 'razorpayPaymentGateway'
const DEFAULT_PRICING_PACKAGES = [
  {
    key: 'starter',
    name: 'Starter',
    badge: '',
    description: 'For new recruiters getting started',
    price: 'INR 0',
    buttonLabel: 'Start Hiring',
    status: 'Active',
    sortOrder: 1,
    jobLimit: 1,
    validityDays: 30,
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

function getPackageAmount(price) {
  const amount = Number(String(price || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function normalizePackageKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function resolvePricingPackage({ packageId, packageKey, packageName }) {
  let selectedPackage = null

  if (packageId && /^[a-f\d]{24}$/i.test(String(packageId))) {
    selectedPackage = await PricingPackage.findById(packageId)
  }

  const key = normalizePackageKey(packageKey || packageName)
  if (!selectedPackage && key) {
    selectedPackage = await PricingPackage.findOne({ key })
  }

  const name = String(packageName || '').trim()
  if (!selectedPackage && name) {
    selectedPackage = await PricingPackage.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
  }

  const defaultPackage = DEFAULT_PRICING_PACKAGES.find((plan) => plan.key === key || normalizePackageKey(plan.name) === key)
  if (!selectedPackage && defaultPackage) {
    selectedPackage = await PricingPackage.findOneAndUpdate(
      { key: defaultPackage.key },
      { $setOnInsert: defaultPackage },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
  } else if (selectedPackage && key && !selectedPackage.key) {
    selectedPackage.key = key
    await selectedPackage.save()
  }

  return selectedPackage
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

function formatInr(amount) {
  return `INR ${Number(amount || 0).toLocaleString('en-IN')}`
}

function getPackagePayableAmount(selectedPackage) {
  const amount = getPackageAmount(selectedPackage.price)
  const discountPercent = Number(selectedPackage.discountPercent || 0)
  return Math.max(0, Math.round(amount - (amount * discountPercent) / 100))
}

function buildInvoiceNo() {
  return `CR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

async function getRazorpayConfig() {
  const setting = await Setting.findOne({ key: RAZORPAY_SETTING_KEY }).lean().catch(() => null)
  const value = setting?.value || {}

  return {
    enabled: value.enabled !== false,
    keyId: value.keyId || process.env.RAZORPAY_KEY_ID || '',
    keySecret: value.keySecret || process.env.RAZORPAY_KEY_SECRET || '',
    companyName: value.companyName || process.env.RAZORPAY_COMPANY_NAME || 'Cromgen Rozgar',
    themeColor: value.themeColor || '#2563eb',
  }
}

async function getRazorpayClient() {
  const config = await getRazorpayConfig()

  if (!config.enabled) {
    const error = new Error('Razorpay payment gateway is disabled.')
    error.statusCode = 400
    throw error
  }

  if (!config.keyId || !config.keySecret) {
    const error = new Error('Razorpay keys are missing. Save Razorpay settings from Admin > Settings.')
    error.statusCode = 400
    throw error
  }

  return {
    config,
    client: new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    }),
  }
}

function assertRecruiterOwner(req, res, recruiterEmail) {
  if (req.user?.role !== 'recruiter') return
  if (String(req.user.email || '').toLowerCase() === recruiterEmail) return

  res.status(403)
  throw new Error('Forbidden: recruiter account mismatch')
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

async function activatePaidPackage({ recruiterEmail, recruiterName, selectedPackage }) {
  await RecruiterPackageSubscription.updateMany(
    { recruiterEmail, status: 'Active' },
    { status: 'Cancelled', cancelledAt: new Date() },
  )

  const activatedAt = new Date()
  const expiresAt = new Date(activatedAt)
  expiresAt.setDate(expiresAt.getDate() + Number(selectedPackage.validityDays || 30))
  const coinCredit = getCoinCredit(selectedPackage)
  const coinPerJob = Number(selectedPackage.coinPerJob || 10)

  return RecruiterPackageSubscription.create({
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
}

async function creditPaidCoins({ recruiterEmail, recruiterName, coins, amount }) {
  const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
  if (!subscription) {
    const error = new Error('Please activate a recruiter package before buying coins.')
    error.statusCode = 404
    throw error
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

  return subscription
}

exports.razorpayConfig = asyncHandler(async (req, res) => {
  const config = await getRazorpayConfig()

  res.json({
    success: true,
    data: {
      enabled: config.enabled,
      keyId: config.keyId,
      companyName: config.companyName,
      themeColor: config.themeColor,
    },
  })
})

exports.current = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.query.recruiterEmail || '').toLowerCase()
  if (!recruiterEmail) {
    res.status(400)
    throw new Error('Recruiter email is required')
  }
  assertRecruiterOwner(req, res, recruiterEmail)

  const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
  await repairSubscriptionCoins(subscription)

  res.json({ success: true, data: subscription })
})

exports.activate = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  const recruiterName = req.body.recruiterName || ''
  const packageId = req.body.packageId
  const packageKey = req.body.packageKey
  const packageName = req.body.packageName

  if (!recruiterEmail || (!packageId && !packageKey && !packageName)) {
    res.status(400)
    throw new Error('Recruiter email and package are required')
  }
  assertRecruiterOwner(req, res, recruiterEmail)

  const selectedPackage = await resolvePricingPackage({ packageId, packageKey, packageName })
  if (!selectedPackage || selectedPackage.status === 'Inactive') {
    res.status(404)
    throw new Error('Package is not available')
  }

  if (getPackagePayableAmount(selectedPackage) > 0 && !req.body.allowManualActivation) {
    res.status(400)
    throw new Error('Paid package requires Razorpay payment verification.')
  }

  const subscription = await activatePaidPackage({ recruiterEmail, recruiterName, selectedPackage })

  res.status(201).json({ success: true, data: subscription })
})

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  const recruiterName = req.body.recruiterName || ''
  const purpose = req.body.purpose

  if (!recruiterEmail) {
    res.status(400)
    throw new Error('Recruiter email is required')
  }
  assertRecruiterOwner(req, res, recruiterEmail)

  let amount = 0
  let plan = ''
  let packageId = null
  let coins = 0

  if (purpose === 'package') {
    const selectedPackage = await resolvePricingPackage({
      packageId: req.body.packageId,
      packageKey: req.body.packageKey,
      packageName: req.body.packageName,
    })
    if (!selectedPackage || selectedPackage.status === 'Inactive') {
      res.status(404)
      throw new Error('Package is not available')
    }

    amount = getPackagePayableAmount(selectedPackage)
    plan = selectedPackage.name
    packageId = selectedPackage._id
  } else if (purpose === 'coins') {
    coins = Math.max(Number(req.body.coins || 0), 0)
    if (!coins || coins % 10 !== 0) {
      res.status(400)
      throw new Error('Please choose coins in multiples of 10.')
    }

    const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
    if (!subscription) {
      res.status(404)
      throw new Error('Please activate a recruiter package before buying coins.')
    }

    amount = coins * 10
    plan = `${coins} wallet coins`
    packageId = subscription.packageId
  } else {
    res.status(400)
    throw new Error('Payment purpose is required.')
  }

  if (amount <= 0) {
    res.status(400)
    throw new Error('This item does not require online payment.')
  }

  const { client, config } = await getRazorpayClient()
  const invoiceNo = buildInvoiceNo()
  const order = await client.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: invoiceNo,
    notes: {
      recruiterEmail,
      recruiterName,
      purpose,
      plan,
    },
  })

  const payment = await Payment.create({
    employer: recruiterName || recruiterEmail,
    recruiterEmail,
    plan,
    amount: formatInr(amount),
    status: 'Pending',
    invoiceNo,
    gateway: 'Razorpay',
    purpose,
    packageId,
    coins,
    currency: 'INR',
    razorpayOrderId: order.id,
  })

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount,
      currency: 'INR',
      keyId: config.keyId,
      companyName: config.companyName,
      themeColor: config.themeColor,
      payment,
    },
  })
})

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  const razorpayOrderId = req.body.razorpay_order_id
  const razorpayPaymentId = req.body.razorpay_payment_id
  const razorpaySignature = req.body.razorpay_signature

  if (!recruiterEmail || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400)
    throw new Error('Razorpay payment verification details are required.')
  }
  assertRecruiterOwner(req, res, recruiterEmail)

  const { config } = await getRazorpayClient()
  const expectedSignature = crypto
    .createHmac('sha256', config.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  const payment = await Payment.findOne({ razorpayOrderId, recruiterEmail })
  if (!payment) {
    res.status(404)
    throw new Error('Payment order was not found.')
  }

  if (payment.status === 'Paid') {
    const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
    res.json({
      success: true,
      data: { subscription, payment },
      message: 'Payment is already verified.',
    })
    return
  }

  if (expectedSignature !== razorpaySignature) {
    payment.status = 'Failed'
    payment.failureReason = 'Razorpay signature verification failed.'
    await payment.save()

    res.status(400)
    throw new Error('Payment verification failed.')
  }

  payment.status = 'Paid'
  payment.razorpayPaymentId = razorpayPaymentId
  payment.razorpaySignature = razorpaySignature
  payment.paymentMethod = 'Razorpay Checkout'
  payment.paidAt = new Date()
  await payment.save()

  let subscription = null
  if (payment.purpose === 'package') {
    const selectedPackage = await PricingPackage.findById(payment.packageId)
    if (!selectedPackage) {
      res.status(404)
      throw new Error('Paid package was not found.')
    }
    subscription = await activatePaidPackage({ recruiterEmail, recruiterName: payment.employer, selectedPackage })
  } else if (payment.purpose === 'coins') {
    const amount = getPackageAmount(payment.amount)
    subscription = await creditPaidCoins({
      recruiterEmail,
      recruiterName: payment.employer,
      coins: Number(payment.coins || 0),
      amount,
    })
  }

  res.json({
    success: true,
    data: {
      subscription,
      payment,
    },
    message: payment.purpose === 'coins' ? `${payment.coins} coins added to recruiter wallet.` : `${payment.plan} package activated successfully.`,
  })
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
  assertRecruiterOwner(req, res, recruiterEmail)

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
