const crudController = require('./crudController')
const Application = require('../models/Application')
const Candidate = require('../models/Candidate')
const Category = require('../models/Category')
const Company = require('../models/Company')
const Employer = require('../models/Employer')
const Job = require('../models/Job')
const Location = require('../models/Location')
const Payment = require('../models/Payment')
const Resume = require('../models/Resume')
const Setting = require('../models/Setting')

module.exports = {
  applications: crudController(Application, { searchFields: ['candidateName', 'candidateEmail', 'jobTitle', 'company', 'status'] }),
  candidates: crudController(Candidate, { searchFields: ['name', 'email', 'role', 'location'] }),
  categories: crudController(Category, { searchFields: ['name', 'status'] }),
  companies: crudController(Company, { searchFields: ['name', 'industry', 'location', 'status'] }),
  employers: crudController(Employer, { searchFields: ['companyName', 'businessEmail', 'industry', 'location'] }),
  jobs: crudController(Job, { searchFields: ['title', 'company', 'department', 'location', 'skills'] }),
  locations: crudController(Location, { searchFields: ['city', 'state', 'country'] }),
  payments: crudController(Payment, { searchFields: ['employer', 'plan', 'invoiceNo', 'status'] }),
  resumes: crudController(Resume, { searchFields: ['name', 'email', 'role', 'skills', 'experience', 'source'] }),
  settings: crudController(Setting, { searchFields: ['key', 'group'] }),
}
