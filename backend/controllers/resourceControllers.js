const crudController = require('./crudController')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const Category = require('../models/Category')
const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const Location = require('../models/Location')
const Payment = require('../models/Payment')
const RecruiterDocument = require('../models/RecruiterDocument')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')
const User = require('../models/User')

module.exports = {
  applications: crudController(Application, { searchFields: ['candidateName', 'candidateEmail', 'jobTitle', 'company', 'status'] }),
  candidates: crudController(Candidate, { searchFields: ['name', 'email', 'role', 'location'] }),
  categories: crudController(Category, { searchFields: ['name', 'status'] }),
  companies: crudController(Company, { searchFields: ['name', 'industry', 'location', 'status'] }),
  employers: crudController(Employer, {
    searchFields: ['companyName', 'businessEmail', 'industry', 'location'],
    afterRemove: async (employer) => {
      const email = String(employer.businessEmail || '').toLowerCase()
      if (!email) return

      await Promise.all([
        User.deleteMany({ email, role: 'recruiter' }),
        RecruiterDocument.deleteMany({ recruiterEmail: email }),
      ])
    },
  }),
  jobs: crudController(Job, { searchFields: ['title', 'company', 'department', 'location', 'skills'], safeGet: true }),
  locations: crudController(Location, { searchFields: ['city', 'state', 'country'] }),
  payments: crudController(Payment, { searchFields: ['employer', 'plan', 'invoiceNo', 'status'] }),
  recruiterDocuments: crudController(RecruiterDocument, { searchFields: ['recruiterName', 'recruiterEmail', 'documentType', 'panNumber', 'gstNumber', 'status'] }),
  resumes: crudController(Resume, { searchFields: ['name', 'email', 'role', 'skills', 'experience', 'source'] }),
  settings: crudController(Setting, { searchFields: ['key', 'group'] }),
}
