const asyncHandler = require('../middleware/asyncHandler')
const Job = require('../models/Job')
const RecruiterPackageSubscription = require('../models/RecruiterPackageSubscription')

exports.submit = asyncHandler(async (req, res) => {
  const recruiterEmail = String(req.body.recruiterEmail || '').toLowerCase()
  if (!recruiterEmail) {
    res.status(400)
    throw new Error('Recruiter email is required')
  }

  if (req.user?.role === 'recruiter' && String(req.user.email || '').toLowerCase() !== recruiterEmail) {
    res.status(403)
    throw new Error('Forbidden: recruiter account mismatch')
  }

  const subscription = await RecruiterPackageSubscription.findOne({ recruiterEmail, status: 'Active' }).sort('-activatedAt')
  if (!subscription || subscription.paymentStatus !== 'Paid') {
    res.status(402)
    throw new Error('Please choose a package and complete payment before posting a job.')
  }

  if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
    res.status(402)
    throw new Error('Your package has expired. Please upgrade or renew your package.')
  }

  const jobLimit = Number(subscription.packageSnapshot?.jobLimit || 0)
  if (jobLimit > 0 && Number(subscription.jobsUsed || 0) >= jobLimit) {
    res.status(402)
    throw new Error(`Your ${subscription.packageSnapshot?.name || 'current'} package job limit is finished. Please upgrade your package.`)
  }

  const coinPerJob = Number(subscription.packageSnapshot?.coinPerJob || 10)
  if (Number(subscription.coinBalance || 0) < coinPerJob) {
    res.status(402)
    throw new Error(`Insufficient wallet coins. Please purchase coins or upgrade your package. ${coinPerJob} coins are required to post one job.`)
  }

  const job = await Job.create({
    ...req.body,
    recruiterEmail,
    recruiterName: req.body.recruiterName || '',
    packageSubscriptionId: subscription._id,
    packageName: subscription.packageSnapshot?.name || '',
    status: 'Open',
    approval: 'Pending',
    accountDepartmentStatus: 'Pending',
  })

  subscription.jobsUsed = Number(subscription.jobsUsed || 0) + 1
  subscription.coinBalance = Number(subscription.coinBalance || 0) - coinPerJob
  subscription.coinsUsed = Number(subscription.coinsUsed || 0) + coinPerJob
  await subscription.save()

  res.status(201).json({ success: true, data: job, subscription })
})
