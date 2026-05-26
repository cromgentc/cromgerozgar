import path from 'path'
import Module from 'module'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

process.env.NODE_PATH = [
  path.join(__dirname, '..', 'node_modules'),
  process.env.NODE_PATH,
]
  .filter(Boolean)
  .join(path.delimiter)
Module._initPaths()

let app
let connectDB
let dbPromise

const fallbackData = {
  jobs: [
    {
      title: 'Senior React Engineer',
      company: 'Nimbus Tech',
      companyLogo: 'NT',
      department: 'Engineering',
      location: 'Bengaluru',
      salary: '18 - 28 LPA',
      experience: '4-7 years',
      type: 'Full Time',
      workMode: 'Hybrid',
      featured: true,
      urgent: true,
      skills: ['React', 'TypeScript', 'Tailwind', 'REST API'],
      description: 'Build elegant hiring tools used by enterprise teams.',
      status: 'Active',
      approval: 'Approved',
      accountDepartmentStatus: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      title: 'Customer Success Specialist',
      company: 'Auralis Support',
      companyLogo: 'AS',
      department: 'Customer Success',
      location: 'Delhi NCR',
      salary: '4 - 7 LPA',
      experience: '1-3 years',
      type: 'Full Time',
      workMode: 'Remote',
      featured: false,
      urgent: true,
      skills: ['CRM', 'Communication', 'Retention'],
      description: 'Support premium clients through onboarding and account management.',
      status: 'Active',
      approval: 'Approved',
      accountDepartmentStatus: 'Active',
      createdAt: new Date().toISOString(),
    },
  ],
  companies: [
    { name: 'Nimbus Tech', industry: 'Cloud software', jobs: 42, badge: 'NT', location: 'Bengaluru', rating: '4.8', status: 'Active', documents: 'Verified', plan: 'Enterprise' },
    { name: 'BluePeak Finance', industry: 'Fintech', jobs: 27, badge: 'BP', location: 'Hyderabad', rating: '4.7', status: 'Active', documents: 'Verified', plan: 'Enterprise' },
    { name: 'Auralis Support', industry: 'Customer success', jobs: 18, badge: 'AS', location: 'Remote', rating: '4.6', status: 'Active', documents: 'Verified', plan: 'Starter' },
  ],
  faqs: [
    { category: 'General', question: 'How do I apply for jobs?', answer: 'Create an account, open a job, and submit your application from the job details page.', status: 'Active', sortOrder: 1, featured: true },
    { category: 'Recruiter', question: 'Can recruiters post jobs?', answer: 'Yes, recruiters can register, complete verification, and submit jobs for review.', status: 'Active', sortOrder: 2, featured: true },
  ],
  testimonials: [
    { name: 'Neha Sharma', role: 'React Developer', company: 'Nimbus Tech', type: 'Candidate', text: 'Cromgen Rozgar helped me find relevant roles quickly.', rating: 5, status: 'Active', featured: true },
    { name: 'Amit Verma', role: 'Recruiter', company: 'BluePeak Finance', type: 'Recruiter', text: 'The platform made candidate shortlisting faster for our hiring team.', rating: 5, status: 'Active', featured: true },
  ],
}

function getStartupStatus() {
  return {
    success: false,
    message: 'API function is deployed, but server environment is not ready.',
    env: {
      hasMongoUri: Boolean(process.env.MONGO_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      nodeEnv: process.env.NODE_ENV || '',
    },
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify(payload))
}

function getFallbackPayload(req) {
  if (req.method && req.method !== 'GET') return null

  const url = new URL(req.url || '/', 'https://local.test')
  const pathname = url.pathname.replace(/^\/api(?=\/|$)/, '')

  if (pathname === '/health') {
    return { success: true, message: 'Cromgen Rozgar API fallback is running' }
  }

  if (pathname === '/settings/public/site-branding' || pathname.endsWith('/public/site-branding')) {
    return {
      success: true,
      data: {
        key: 'siteSeoBranding',
        group: 'website',
        value: {
          siteName: 'Cromgen Rozgar',
          adminName: 'Rozgar Admin',
          recruiterName: 'Rozgar Recruiter',
          logoUrl: '/cromgen-rozgar-logo.png',
        },
      },
      fallback: true,
    }
  }

  if (pathname === '/settings/public/social-links' || pathname.endsWith('/public/social-links')) {
    return { success: true, data: [], fallback: true }
  }

  const resource = pathname.split('/').filter(Boolean)[0]
  if (['jobs', 'companies', 'faqs', 'testimonials'].includes(resource)) {
    const data = fallbackData[resource] || []
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || data.length, 1), 100)
    return {
      success: true,
      data: data.slice(0, limit),
      pagination: { page: 1, limit, total: data.length, pages: 1 },
      fallback: true,
    }
  }

  return null
}

function getAuthUnavailablePayload(req) {
  const url = new URL(req.url || '/', 'https://local.test')
  const pathname = url.pathname.replace(/^\/api(?=\/|$)/, '')
  if (!pathname.startsWith('/auth/')) return null

  return {
    success: false,
    message: 'Authentication service is not fully configured. Add MONGO_URI and JWT_SECRET in Vercel environment variables.',
    env: {
      hasMongoUri: Boolean(process.env.MONGO_URI),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    },
  }
}

function normalizeApiUrl(req) {
  const currentUrl = req.url || '/'
  const parsed = new URL(currentUrl, 'https://local.test')
  if (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/')) return currentUrl
  return `/api${parsed.pathname}${parsed.search}`
}

export default async function handler(req, res) {
  try {
    const publicSettingsFallback = getFallbackPayload(req)
    if (publicSettingsFallback && (req.url || '').includes('/public/')) {
      return sendJson(res, 200, publicSettingsFallback)
    }

    if (!process.env.MONGO_URI) {
      const fallback = getFallbackPayload(req)
      if (fallback) return sendJson(res, 200, fallback)
      const authUnavailable = getAuthUnavailablePayload(req)
      if (authUnavailable) return sendJson(res, 200, authUnavailable)
    }

    if (!app || !connectDB) {
      app = require('../backend/server.js')
      connectDB = require('../backend/config/db.js')
    }

    if (!dbPromise) {
      dbPromise = connectDB()
    }

    await dbPromise
    req.url = normalizeApiUrl(req)
    return app(req, res)
  } catch (error) {
    console.error(error)
    const fallback = getFallbackPayload(req)
    if (fallback) return sendJson(res, 200, fallback)
    const authUnavailable = getAuthUnavailablePayload(req)
    if (authUnavailable) return sendJson(res, 200, authUnavailable)

    const status = getStartupStatus()
    status.error = error.message
    return sendJson(res, 500, status)
  }
}
