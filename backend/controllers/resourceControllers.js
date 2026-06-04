const crudController = require('./crudController')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const CareerJob = require('../models/CareerJob')
const Category = require('../models/Category')
const Company = require('../models/Company')
const ContentPage = require('../models/ContentPage')
const Employer = require('../models/Employer')
const Faq = require('../models/Faq')
const FreelancerProfile = require('../models/FreelancerProfile')
const Job = require('../models/Job')
const Location = require('../models/Location')
const NewsletterSubscriber = require('../models/NewsletterSubscriber')
const Payment = require('../models/Payment')
const PricingPackage = require('../models/PricingPackage')
const RecruiterDocument = require('../models/RecruiterDocument')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')
const SupportMessage = require('../models/SupportMessage')
const Testimonial = require('../models/Testimonial')
const User = require('../models/User')
const { ensureDefaultFaqs } = require('./faqDefaults')
const { ensureDefaultTestimonials } = require('./testimonialDefaults')
const {
  collectSupaCloudObjectsFromFields,
  removeSupaCloudObject,
  removeSupaCloudObjects,
} = require('../utils/supaCloudStorage')

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function normalizeRole(role) {
  const roleMap = {
    'Super Admin': 'Admin',
    'HR Manager': 'staff',
    Support: 'users',
    Hiring: 'hiring',
    'Hiring Team': 'hiring',
    Account: 'account team',
    'Account Team': 'account team',
    'account-team': 'account team',
    account_team: 'account team',
    company: 'recruiter',
    Employer: 'recruiter',
  }

  return roleMap[role] || role
}

function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '')
}

function normalizePan(value = '') {
  return String(value).trim().toUpperCase()
}

function normalizeGst(value = '') {
  return String(value).trim().toUpperCase()
}

function normalizeAadhaar(value = '') {
  return String(value).replace(/\D/g, '')
}

function duplicateError(res, message) {
  res.status(400)
  throw new Error(message)
}

async function upsertNewsletterSubscriber(body, req) {
  const email = normalizeEmail(body.email)
  const isAdminWrite = Boolean(req.user)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    duplicateError(req.res, 'Please enter a valid email address.')
  }

  const existing = await NewsletterSubscriber.findOne({ email })
  if (!existing) {
    body.email = email
    body.status = isAdminWrite ? body.status || 'Subscribed' : 'Subscribed'
    body.source = body.source || (isAdminWrite ? 'admin' : 'footer')
    body.topics = Array.isArray(body.topics) && body.topics.length ? body.topics : ['Hiring insights', 'Latest jobs', 'Recruiter updates']
    body.lastSubscribedAt = body.status === 'Subscribed' ? new Date() : body.lastSubscribedAt
    return
  }

  existing.status = isAdminWrite ? body.status || existing.status || 'Subscribed' : 'Subscribed'
  existing.source = body.source || existing.source || 'footer'
  existing.topics = Array.isArray(body.topics) && body.topics.length ? body.topics : existing.topics
  if (existing.status === 'Subscribed') existing.lastSubscribedAt = new Date()
  await existing.save()

  req.res.status(200).json({ success: true, data: existing, message: 'You are already subscribed. We refreshed your subscription.' })
  return true
}

const defaultCategoryNames = [
  'IT & Software',
  'Sales & Marketing',
  'Customer Support',
  'BPO & Telecalling',
  'HR & Recruitment',
  'Finance & Accounting',
  'Data Collection',
  'Digital Marketing',
  'Work From Home',
  'Freelance Jobs',
  'AI & Data Annotation',
  'Business Development',
  'Field Sales',
  'Telecalling',
  'Banking & Finance',
  'Operations',
  'Back Office',
  'Admin & Office Support',
  'Delivery & Logistics',
  'Retail & Store Jobs',
  'Healthcare & Nursing',
  'Hospitality & Hotel Management',
  'Manufacturing',
  'Engineering',
  'Education & Training',
  'Graphic Design',
  'UI/UX Design',
  'Video Editing',
  'Content Writing',
  'Social Media Management',
  'E-commerce',
  'Customer Success',
  'Technical Support',
  'Human Resources',
  'Business Operations',
  'Legal & Compliance',
  'Real Estate',
  'Insurance',
  'Travel & Tourism',
  'Event Management',
  'Media & Entertainment',
  'Security Services',
  'Construction',
  'Automobile',
  'International BPO',
  'Voice Process',
  'Non Voice Process',
  'Chat Process',
  'KPO',
  'Data Entry',
  'Part Time Jobs',
  'Internships',
  'Remote Jobs',
  'Startup Jobs',
  'Government Projects',
  'Translation & Localization',
  'Voice Recording',
  'Audio Transcription',
  'QA & Testing',
  'Cloud Computing',
  'Cyber Security',
  'DevOps',
  'Mobile App Development',
  'Web Development',
  'React JS Development',
  'Node.js Development',
  'Python Development',
  'AI & Machine Learning',
  'Blockchain',
  'Product Management',
  'Project Management',
  'Vendor Management',
  'Supply Chain',
  'Procurement',
  'Warehouse Management',
  'Recruitment Process Outsourcing',
  'Staffing & Consultancy',
]

async function ensureDefaultCategories() {
  const categoryNames = Array.from(new Set(defaultCategoryNames.map((name) => String(name || '').trim()).filter(Boolean)))

  await Category.bulkWrite(
    categoryNames.map((name) => ({
      updateOne: {
        filter: { name },
        update: { $setOnInsert: { name, jobs: 0, status: 'Active' } },
        upsert: true,
      },
    })),
  )
}

async function ensureMongoDefaultFaqs(filter) {
  await ensureDefaultFaqs(Faq, filter)
}

const defaultPolicyPage = {
  slug: 'privacy',
  title: 'Privacy Policy',
  subtitle: 'How CromGen Rozgar handles candidate, recruiter, application, and hiring data.',
  category: 'Privacy',
  frontendPlacement: 'Users Frontend',
  status: 'Published',
  effectiveDate: new Date(),
  sections: [
    {
      heading: 'Data We Collect',
      body: 'We collect account details, profile information, resumes, job applications, recruiter documents, payment and wallet activity, and platform usage data needed to operate hiring workflows.',
    },
    {
      heading: 'How We Use Data',
      body: 'Data is used to verify accounts, match candidates with jobs, process applications, help recruiters manage hiring, improve platform security, and send relevant hiring insights when users subscribe.',
    },
    {
      heading: 'User Control',
      body: 'Users can update profile data, manage application activity, unsubscribe from updates, and request support for privacy-related account actions.',
    },
  ],
}

async function ensureDefaultPolicyPage(filter) {
  const requestedSlug = filter.slug || 'privacy'
  if (requestedSlug !== 'privacy') return

  await ContentPage.updateOne(
    { slug: 'privacy' },
    { $setOnInsert: defaultPolicyPage },
    { upsert: true },
  )
}

async function upsertSettingByKey(body, req) {
  const key = String(body.key || '').trim()
  if (!key) {
    duplicateError(req.res, 'Setting key is required.')
  }

  const setting = await Setting.findOneAndUpdate(
    { key },
    {
      $set: {
        key,
        group: body.group || 'website',
        value: body.value ?? null,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )

  req.res.status(200).json({ success: true, data: setting })
  return true
}

async function ensureUniqueEmployerIdentity(body, req) {
  const businessEmail = normalizeEmail(body.businessEmail)
  const phone = normalizePhone(body.phone)

  body.businessEmail = businessEmail
  body.phone = phone

  const filters = []
  if (businessEmail) filters.push({ businessEmail })
  if (phone) filters.push({ phone })
  if (!filters.length) return

  const existingEmployer = await Employer.findOne({ $or: filters })
  if (existingEmployer) {
    duplicateError(
      req.res,
      existingEmployer.businessEmail === businessEmail
        ? 'Recruiter email already registered.'
        : 'Mobile number already registered with another recruiter.',
    )
  }

  const userFilters = []
  if (businessEmail) userFilters.push({ email: businessEmail })
  if (phone) userFilters.push({ phone })
  const existingUser = userFilters.length ? await User.findOne({ $or: userFilters }) : null
  if (existingUser && existingUser.email !== businessEmail) {
    duplicateError(req.res, 'Mobile number already registered.')
  }
}

async function ensureUniqueRecruiterDocumentIdentity(body, req) {
  const recruiterEmail = normalizeEmail(body.recruiterEmail)
  const panNumber = normalizePan(body.panNumber)
  const gstNumber = normalizeGst(body.gstNumber)
  const aadhaarNumber = normalizeAadhaar(body.aadhaarNumber)

  body.recruiterEmail = recruiterEmail
  body.panNumber = panNumber
  body.gstNumber = gstNumber
  body.aadhaarNumber = aadhaarNumber

  const filters = []
  if (panNumber) filters.push({ panNumber })
  if (gstNumber) filters.push({ gstNumber })
  if (aadhaarNumber) filters.push({ aadhaarNumber })
  if (!filters.length) return

  const duplicate = await RecruiterDocument.findOne({
    recruiterEmail: { $ne: recruiterEmail },
    $or: filters,
  })

  if (!duplicate) return

  if (panNumber && duplicate.panNumber === panNumber) duplicateError(req.res, 'PAN number already registered with another recruiter.')
  if (gstNumber && duplicate.gstNumber === gstNumber) duplicateError(req.res, 'GST number already registered with another recruiter.')
  if (aadhaarNumber && duplicate.aadhaarNumber === aadhaarNumber) duplicateError(req.res, 'Aadhar number already registered with another recruiter.')
  duplicateError(req.res, 'Recruiter identity document already registered.')
}

async function createOrReplaceRecruiterDocument(body, req) {
  await ensureUniqueRecruiterDocumentIdentity(body, req)

  const recruiterEmail = normalizeEmail(body.recruiterEmail)
  if (!recruiterEmail) return

  const existingDocuments = await RecruiterDocument.find({ recruiterEmail }).sort('-updatedAt')
  const existing = existingDocuments[0]
  if (!existing) return

  const changedFields = recruiterDocumentFileFields.filter((field) => (
    Object.prototype.hasOwnProperty.call(body, field)
      && String(body[field] || '') !== String(existing[field] || '')
  ))
  const oldObjects = [
    ...collectSupaCloudObjectsFromFields(existing, changedFields),
    ...existingDocuments.slice(1).flatMap((document) => collectSupaCloudObjectsFromFields(document, recruiterDocumentFileFields)),
  ]

  Object.assign(existing, body, {
    submittedAt: body.submittedAt || new Date(),
    updatedAt: new Date(),
  })
  const saved = await existing.save()

  if (existingDocuments.length > 1) {
    await RecruiterDocument.deleteMany({ _id: { $in: existingDocuments.slice(1).map((document) => document._id) } })
  }

  await removeSupaCloudObjects(oldObjects, 'Supa Cloud old recruiter document file')

  req.res.status(200).json({ success: true, data: saved, message: 'Recruiter document updated. Old Supa Cloud files were removed.' })
  return true
}

async function attachRecruiterToApplication(body, req) {
  body.candidateEmail = normalizeEmail(body.candidateEmail)
  body.candidatePhone = normalizePhone(body.candidatePhone || body.phone)

  if (body.recruiterEmail) {
    body.recruiterEmail = normalizeEmail(body.recruiterEmail)
  }

  if (!body.candidatePhone && body.candidateEmail) {
    const candidateContact = await User.findOne({ email: body.candidateEmail }).select('phone')
      || await Candidate.findOne({ email: body.candidateEmail }).select('phone')
    body.candidatePhone = normalizePhone(candidateContact?.phone)
  }

  let job = null

  if (body.applicationType !== 'Freelancer Project' && body.jobId) {
    job = await Job.findById(body.jobId)
  }

  if (body.applicationType !== 'Freelancer Project' && !job && body.jobTitle && body.company) {
    job = await Job.findOne({
      title: body.jobTitle,
      company: body.company,
    }).sort('-createdAt')
  }

  if (job) {
    body.jobId = job._id
    body.recruiterEmail = normalizeEmail(job.recruiterEmail)
    body.recruiterName = job.recruiterName || ''
  }

  const duplicateFilters = []
  if (body.jobId) duplicateFilters.push({ candidateEmail: body.candidateEmail, jobId: body.jobId })
  if (body.applicationType === 'Freelancer Project' && body.projectSlug) duplicateFilters.push({ candidateEmail: body.candidateEmail, applicationType: 'Freelancer Project', projectSlug: body.projectSlug })
  if (body.jobTitle && body.company) duplicateFilters.push({ candidateEmail: body.candidateEmail, jobTitle: body.jobTitle, company: body.company })

  if (!duplicateFilters.length) return

  const existingApplication = await Application.findOne({ $or: duplicateFilters })
  if (existingApplication) {
    duplicateError(
      req.res,
      body.applicationType === 'Freelancer Project'
        ? 'You have already applied for this project.'
        : 'You have already applied for this job.',
    )
  }
}

async function hydrateApplicationContacts(items) {
  const applications = items.map((item) => item.toObject ? item.toObject() : item)
  const missingPhoneEmails = [...new Set(applications
    .filter((item) => !item.candidatePhone && item.candidateEmail)
    .map((item) => normalizeEmail(item.candidateEmail)))]

  if (!missingPhoneEmails.length) return applications

  const [users, candidates] = await Promise.all([
    User.find({ email: { $in: missingPhoneEmails } }).select('email phone'),
    Candidate.find({ email: { $in: missingPhoneEmails } }).select('email phone'),
  ])

  const phoneByEmail = new Map()
  candidates.forEach((candidate) => {
    const phone = normalizePhone(candidate.phone)
    if (phone) phoneByEmail.set(normalizeEmail(candidate.email), phone)
  })
  users.forEach((user) => {
    const phone = normalizePhone(user.phone)
    if (phone) phoneByEmail.set(normalizeEmail(user.email), phone)
  })

  return applications.map((item) => ({
    ...item,
    candidatePhone: item.candidatePhone || phoneByEmail.get(normalizeEmail(item.candidateEmail)) || '',
  }))
}

function scopeJobsForRequester(filter, req) {
  const role = normalizeRole(req.user?.role)
  if (role === 'recruiter') {
    filter.recruiterEmail = normalizeEmail(req.user.email)
    delete filter.includeAll
    return
  }

  if (['Admin', 'staff', 'hiring', 'account team'].includes(role) && req.query.includeAll === 'true') {
    delete filter.includeAll
    return
  }

  if (req.query.recruiterEmail && ['Admin', 'staff', 'hiring', 'account team'].includes(role)) return
  if (req.query.includeAll === 'true') {
    delete filter.includeAll
  }

  filter.accountDepartmentStatus = 'Active'
  filter.approval = 'Approved'
  filter.status = 'Active'
}

function scopeApplicationsForRequester(filter, req) {
  const role = normalizeRole(req.user?.role)
  const email = normalizeEmail(req.user?.email)

  if (['Admin', 'staff', 'hiring', 'account team'].includes(role)) return
  if (role === 'recruiter') {
    filter.recruiterEmail = email
    return
  }
  if (role === 'users') {
    filter.candidateEmail = email
  }
  if (role === 'freelancer') {
    filter.candidateEmail = email
  }
}

function scopeSupportMessagesForRequester(filter, req) {
  const role = normalizeRole(req.user?.role)
  const email = normalizeEmail(req.user?.email)

  if (['Admin', 'staff', 'hiring', 'account team'].includes(role)) return
  if (email) filter.email = email
}

function scopeRecruiterDocumentsForRequester(filter, req) {
  const role = normalizeRole(req.user?.role)
  if (role === 'recruiter') filter.recruiterEmail = normalizeEmail(req.user.email)
}

function scopeEmployersForRequester(filter, req) {
  const role = normalizeRole(req.user?.role)
  if (role === 'recruiter') filter.businessEmail = normalizeEmail(req.user.email)
}

function isPrivilegedRole(role) {
  return ['Admin', 'staff', 'hiring', 'account team'].includes(normalizeRole(role))
}

function canAccessApplication(item, req) {
  const role = normalizeRole(req.user?.role)
  const email = normalizeEmail(req.user?.email)
  if (isPrivilegedRole(role)) return true
  if (role === 'recruiter') return normalizeEmail(item.recruiterEmail) === email
  if (role === 'users') return normalizeEmail(item.candidateEmail) === email
  if (role === 'freelancer') return normalizeEmail(item.candidateEmail) === email
  return false
}

function canAccessRecruiterDocument(item, req) {
  const role = normalizeRole(req.user?.role)
  if (['Admin', 'account team'].includes(role)) return true
  return role === 'recruiter' && normalizeEmail(item.recruiterEmail) === normalizeEmail(req.user?.email)
}

function canAccessSupportMessage(item, req) {
  if (isPrivilegedRole(req.user?.role)) return true
  return normalizeEmail(item.email) === normalizeEmail(req.user?.email)
}

function canAccessEmployer(item, req) {
  if (isPrivilegedRole(req.user?.role)) return true
  return normalizeRole(req.user?.role) === 'recruiter' && normalizeEmail(item.businessEmail) === normalizeEmail(req.user?.email)
}

function normalizeJobReview(body) {
  if (body.accountDepartmentStatus === 'Active') {
    body.status = 'Active'
    body.approval = 'Approved'
    body.accountDepartmentRemark = ''
    return
  }

  if (body.accountDepartmentStatus === 'Rejected') {
    body.status = 'Closed'
    body.approval = 'Rejected'
    return
  }

  if (body.accountDepartmentStatus === 'Hold') {
    body.status = 'Closed'
    body.approval = 'Hold'
    return
  }

  if (body.accountDepartmentStatus === 'Removed') {
    body.status = 'Closed'
    body.approval = 'Removed'
  }
}

async function removeResumeFromSupaCloud(resume) {
  if (resume.storageProvider === 'supa-cloud' && resume.storageBucket && resume.storagePath) {
    await removeSupaCloudObject({ bucket: resume.storageBucket, storagePath: resume.storagePath }, 'Supa Cloud resume file')
    return
  }

  await removeSupaCloudObjects(collectSupaCloudObjectsFromFields(resume, ['resumeUrl']), 'Supa Cloud resume file')
}

async function removeChangedResumeFile(item, req, previous) {
  if (!previous) return
  const urlChanged = Object.prototype.hasOwnProperty.call(req.body, 'resumeUrl') && String(req.body.resumeUrl || '') !== String(previous.resumeUrl || '')
  const pathChanged = Object.prototype.hasOwnProperty.call(req.body, 'storagePath') && String(req.body.storagePath || '') !== String(previous.storagePath || '')
  const bucketChanged = Object.prototype.hasOwnProperty.call(req.body, 'storageBucket') && String(req.body.storageBucket || '') !== String(previous.storageBucket || '')

  if (urlChanged || pathChanged || bucketChanged) {
    await removeResumeFromSupaCloud(previous)
  }
}

const recruiterDocumentFileFields = ['panDocument', 'gstDocument', 'offerLetter', 'aadhaarDocument']

async function removeRecruiterDocumentFiles(document) {
  await removeSupaCloudObjects(collectSupaCloudObjectsFromFields(document, recruiterDocumentFileFields), 'Supa Cloud recruiter document file')
}

async function removeChangedRecruiterDocumentFiles(item, req, previous) {
  if (!previous) return

  const changedFields = recruiterDocumentFileFields.filter((field) => (
    Object.prototype.hasOwnProperty.call(req.body, field)
      && String(req.body[field] || '') !== String(previous[field] || '')
  ))

  if (!changedFields.length) return
  await removeSupaCloudObjects(collectSupaCloudObjectsFromFields(previous, changedFields), 'Supa Cloud old recruiter document file')
}

async function removeRecruiterDocumentFilesByEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  const documents = await RecruiterDocument.find({ recruiterEmail: normalizedEmail })
  for (const document of documents) {
    await removeRecruiterDocumentFiles(document)
  }
}

module.exports = {
  applications: crudController(Application, {
    searchFields: ['candidateName', 'candidateEmail', 'candidatePhone', 'jobTitle', 'company', 'status', 'recruiterEmail', 'applicationType', 'projectCategory'],
    beforeCreate: attachRecruiterToApplication,
    beforeGetAll: scopeApplicationsForRequester,
    afterGetAll: hydrateApplicationContacts,
    canAccess: canAccessApplication,
  }),
  candidates: crudController(Candidate, { searchFields: ['name', 'email', 'role', 'location'] }),
  careerJobs: crudController(CareerJob, { searchFields: ['title', 'department', 'location', 'workMode', 'type', 'skills', 'description', 'status'] }),
  categories: crudController(Category, { searchFields: ['name', 'status'], beforeGetAll: ensureDefaultCategories }),
  companies: crudController(Company, { searchFields: ['name', 'contactPerson', 'contactNumber', 'contactEmail', 'gstNumber', 'industry', 'location', 'status'] }),
  contentPages: crudController(ContentPage, { searchFields: ['slug', 'title', 'subtitle', 'category', 'frontendPlacement', 'status'], beforeGetAll: ensureDefaultPolicyPage }),
  employers: crudController(Employer, {
    searchFields: ['companyName', 'businessEmail', 'industry', 'location'],
    beforeCreate: ensureUniqueEmployerIdentity,
    beforeGetAll: scopeEmployersForRequester,
    canAccess: canAccessEmployer,
    afterRemove: async (employer) => {
      const email = String(employer.businessEmail || '').toLowerCase()
      if (!email) return

      await removeRecruiterDocumentFilesByEmail(email)
      await Promise.all([
        User.deleteMany({ email, role: 'recruiter' }),
        RecruiterDocument.deleteMany({ recruiterEmail: email }),
      ])
    },
  }),
  faqs: crudController(Faq, { searchFields: ['category', 'question', 'answer', 'status'], beforeGetAll: ensureMongoDefaultFaqs }),
  freelancerProfiles: crudController(FreelancerProfile, { searchFields: ['name', 'email', 'role', 'location', 'rate', 'skills', 'availability', 'status'] }),
  jobs: crudController(Job, {
    searchFields: ['title', 'company', 'department', 'location', 'skills'],
    safeGet: true,
    beforeGetAll: scopeJobsForRequester,
    beforeUpdate: normalizeJobReview,
  }),
  locations: crudController(Location, { searchFields: ['city', 'state', 'country'] }),
  newsletterSubscribers: crudController(NewsletterSubscriber, {
    searchFields: ['email', 'source', 'status', 'topics'],
    beforeCreate: upsertNewsletterSubscriber,
  }),
  payments: crudController(Payment, { searchFields: ['employer', 'plan', 'invoiceNo', 'status'] }),
  pricingPackages: crudController(PricingPackage, { searchFields: ['name', 'description', 'price', 'badge'] }),
  recruiterDocuments: crudController(RecruiterDocument, {
    searchFields: ['recruiterName', 'recruiterEmail', 'documentType', 'panNumber', 'gstNumber', 'status'],
    beforeCreate: createOrReplaceRecruiterDocument,
    beforeGetAll: scopeRecruiterDocumentsForRequester,
    afterUpdate: removeChangedRecruiterDocumentFiles,
    beforeRemove: removeRecruiterDocumentFiles,
    canAccess: canAccessRecruiterDocument,
  }),
  resumes: crudController(Resume, {
    searchFields: ['name', 'email', 'role', 'skills', 'experience', 'source', 'resumeUrl', 'storagePath'],
    afterUpdate: removeChangedResumeFile,
    beforeRemove: removeResumeFromSupaCloud,
  }),
  settings: crudController(Setting, { searchFields: ['key', 'group'], beforeCreate: upsertSettingByKey }),
  supportMessages: crudController(SupportMessage, {
    searchFields: ['name', 'email', 'role', 'subject', 'message', 'status'],
    beforeGetAll: scopeSupportMessagesForRequester,
    canAccess: canAccessSupportMessage,
  }),
  testimonials: crudController(Testimonial, {
    searchFields: ['name', 'role', 'company', 'type', 'frontendPlacement', 'text', 'status'],
    afterGetAll: async (items) => (items.length ? items : ensureDefaultTestimonials(Testimonial)),
  }),
}
