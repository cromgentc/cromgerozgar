const LIVE_API_BASE_URL = 'https://www.cromgenrozgar.in'

const API_BASE_URL = getApiBaseUrl()

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.DEV ? import.meta.env.VITE_API_URL : ''

  if (configuredUrl) {
    return configuredUrl
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  return LIVE_API_BASE_URL
}

function apiUrl(path) {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const apiRoot = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const endpointPath = normalizedPath.startsWith('/api/') ? normalizedPath.slice(4) : normalizedPath

  if (isLiveApiBase(baseUrl)) {
    const [routePath, queryString = ''] = endpointPath.replace(/^\/+/, '').split('?')
    const gatewayQuery = new URLSearchParams({ path: routePath })
    const existingQuery = new URLSearchParams(queryString)
    existingQuery.forEach((value, key) => gatewayQuery.append(key, value))
    return `${apiRoot}?${gatewayQuery.toString()}`
  }

  return `${apiRoot}${endpointPath}`
}

function isLiveApiBase(baseUrl) {
  try {
    return new URL(baseUrl).hostname.replace(/^www\./, '') === 'cromgenrozgar.in'
  } catch {
    return false
  }
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('authToken')
  const { authRequired = false, ...fetchOptions } = options
  const isFormData = fetchOptions.body instanceof FormData
  const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null
  const headers = {
    ...(!isFormData && hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(authRequired && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  }

  const response = await fetch(apiUrl(path), {
    cache: 'no-store',
    ...fetchOptions,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

  if (response.ok && payload?.success === false) {
    throw new Error(payload.message || 'API request failed')
  }

  if (!response.ok) {
    if (response.status === 401) {
      if (authRequired) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')

        if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
          window.location.assign('/auth')
        }

        throw new Error('Session expired. Please login again.')
      }

      throw new Error(payload.message || 'Unauthorized request')
    }

    throw new Error(payload.message || 'API request failed')
  }

  return payload
}

const readAuthResources = new Set([
  'applications',
  'candidates',
  'employers',
  'jobs',
  'newsletter-subscribers',
  'newslettersubscribers',
  'newsletter-updates',
  'payments',
  'recruiter-documents',
  'resumes',
  'settings',
  'support-messages',
  'testimonials',
  'users',
])

const writeAuthResources = new Set([
  'applications',
  'candidates',
  'categories',
  'companies',
  'content-pages',
  'employers',
  'faqs',
  'locations',
  'newsletter-subscribers',
  'newslettersubscribers',
  'newsletter-updates',
  'payments',
  'pricing-packages',
  'recruiter-documents',
  'resumes',
  'settings',
  'support-messages',
  'testimonials',
  'users',
])

const publicCreateResources = new Set([
  'applications',
  'employers',
  'newsletter-subscribers',
  'newslettersubscribers',
  'recruiter-documents',
  'support-messages',
])

function needsReadAuth(resource) {
  return readAuthResources.has(resource)
}

function needsWriteAuth(resource) {
  return writeAuthResources.has(resource) && !publicCreateResources.has(resource)
}

function mergeParams(params = '', nextParams = {}) {
  const query = new URLSearchParams(String(params || '').replace(/^\?/, ''))
  Object.entries(nextParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

async function listAll(resource, params = '') {
  const firstPayload = await apiRequest(`/${resource}${mergeParams(params, { page: 1, limit: 100 })}`, { authRequired: needsReadAuth(resource) })
  const firstData = Array.isArray(firstPayload.data) ? firstPayload.data : []
  const pagination = firstPayload.pagination || {}
  const totalPages = Number(pagination.pages || 1)

  if (totalPages <= 1) {
    return { ...firstPayload, data: firstData }
  }

  const remainingPayloads = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      apiRequest(`/${resource}${mergeParams(params, { page: index + 2, limit: 100 })}`, { authRequired: needsReadAuth(resource) })
    )),
  )
  const data = remainingPayloads.reduce((items, payload) => items.concat(Array.isArray(payload.data) ? payload.data : []), firstData)

  return {
    ...firstPayload,
    data,
    pagination: {
      ...pagination,
      page: 1,
      limit: data.length,
      total: Number(pagination.total || data.length),
      pages: 1,
    },
  }
}

async function listAllWithAuth(resource, params = '') {
  const firstPayload = await apiRequest(`/${resource}${mergeParams(params, { page: 1, limit: 100 })}`, { authRequired: true })
  const firstData = Array.isArray(firstPayload.data) ? firstPayload.data : []
  const pagination = firstPayload.pagination || {}
  const totalPages = Number(pagination.pages || 1)

  if (totalPages <= 1) {
    return { ...firstPayload, data: firstData }
  }

  const remainingPayloads = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      apiRequest(`/${resource}${mergeParams(params, { page: index + 2, limit: 100 })}`, { authRequired: true })
    )),
  )
  const data = remainingPayloads.reduce((items, payload) => items.concat(Array.isArray(payload.data) ? payload.data : []), firstData)

  return {
    ...firstPayload,
    data,
    pagination: {
      ...pagination,
      page: 1,
      limit: data.length,
      total: Number(pagination.total || data.length),
      pages: 1,
    },
  }
}

async function openAuthorizedFile(path) {
  const token = localStorage.getItem('authToken')
  const response = await fetch(apiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || 'File could not be opened')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
}

export const api = {
  jobs: (params = '') => apiRequest(`/jobs${params}`),
  jobListings: (params = '?sort=-createdAt') => listAll('job-listings', params),
  job: (id) => apiRequest(`/jobs/${id}`),
  faqs: (params = '?status=Active&sort=sortOrder -featured -createdAt') => listAll('faqs', params),
  adminFaqs: (params = '?sort=sortOrder -featured -createdAt') => listAllWithAuth('faqs', params),
  contentPages: (params = '?status=Published&sort=-updatedAt') => listAll('contentpages', params),
  adminContentPages: (params = '?sort=-updatedAt') => listAllWithAuth('contentpages', params),
  adminNewsletterSubscribers: (params = '?sort=-createdAt') => listAllWithAuth('newslettersubscribers', params),
  subscribeNewsletter: (data) => apiRequest('/newslettersubscribers', { method: 'POST', body: JSON.stringify(data) }),
  companies: (params = '') => apiRequest(`/companies${params}`),
  companyProfiles: () => apiRequest('/company-profiles'),
  adminDashboard: () => apiRequest('/dashboard/admin', { authRequired: true }),
  recruiterPage: () => apiRequest('/recruiter-page'),
  employerDashboard: (email = '') => apiRequest(`/dashboard/employer${email ? `?recruiterEmail=${encodeURIComponent(email)}` : ''}`, { authRequired: true }),
  createJob: (data) => apiRequest('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  createApplication: (data) => apiRequest('/applications', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotEmail: (data) => apiRequest('/auth/forgot/email', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  requestWhatsappOtp: (data) => apiRequest('/auth/forgot/whatsapp/request-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifyWhatsappOtp: (data) => apiRequest('/auth/forgot/whatsapp/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  whatsappLoginOtp: (data) => apiRequest('/auth/forgot/whatsapp/request-otp', { method: 'POST', body: JSON.stringify(data) }),
  whatsappLoginVerify: (data) => apiRequest('/auth/forgot/whatsapp/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  googleAuthConfig: () => apiRequest('/auth/google-config'),
  googleAuth: (data) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  publicSiteBranding: () => apiRequest('/settings/public/site-branding'),
  publicSocialLinks: () => apiRequest('/settings/public/social-links'),
  siteBranding: () => apiRequest('/settings/site-branding', { authRequired: true }),
  updateSiteBranding: (data) => apiRequest('/settings/site-branding', { method: 'PUT', body: JSON.stringify(data), authRequired: true }),
  mongodbConfig: () => apiRequest('/settings/mongodb-config', { authRequired: true }),
  updateMongodbConfig: (data) => apiRequest('/settings/mongodb-config', { method: 'PUT', body: JSON.stringify(data), authRequired: true }),
  updateRecruiterStatus: (status) => apiRequest('/auth/recruiter-status', { method: 'PATCH', body: JSON.stringify({ status }), authRequired: true }),
  currentUserLocation: () => apiRequest('/user-locations/current', { authRequired: true }),
  trackUserLocation: (data) => apiRequest('/user-locations/current', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  activeUserLocations: (params = '') => apiRequest(`/user-locations/active${params}`, { authRequired: true }),
  newsletterUpdates: (params = '?sort=-createdAt') => listAll('newsletter-updates', params),
  sendNewsletterUpdate: (data) => apiRequest('/newsletter-updates/send', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  userLocationHistory: (params = '') => apiRequest(`/user-locations/history${params}`, { authRequired: true }),
  removeUserLocation: (id) => apiRequest(`/user-locations/${id}`, { method: 'DELETE', authRequired: true }),
  employerLogin: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  employerRegister: (data) => apiRequest('/employers', { method: 'POST', body: JSON.stringify(data) }),
  currentRecruiterPackage: (email) => apiRequest(`/recruiter-package-subscriptions/current?recruiterEmail=${encodeURIComponent(email)}`, { authRequired: true }),
  recruiterRazorpayConfig: () => apiRequest('/recruiter-package-subscriptions/razorpay/config', { authRequired: true }),
  createRecruiterRazorpayOrder: (data) => apiRequest('/recruiter-package-subscriptions/razorpay/order', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  verifyRecruiterRazorpayPayment: (data) => apiRequest('/recruiter-package-subscriptions/razorpay/verify', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  activateRecruiterPackage: (data) => apiRequest('/recruiter-package-subscriptions/activate', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  purchaseRecruiterCoins: (data) => apiRequest('/recruiter-package-subscriptions/purchase-coins', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  submitRecruiterJob: (data) => apiRequest('/recruiter-job-posts/submit', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  uploadResumeToSupaCloud: (data) => apiRequest('/resume-uploads/supa-cloud', { method: 'POST', body: data, authRequired: true }),
  resumeViewUrl: (id) => apiUrl(`/resume-uploads/${encodeURIComponent(id)}/view`),
  openResume: (id) => openAuthorizedFile(`/resume-uploads/${encodeURIComponent(id)}/view`),
  list: (resource, params = '') => apiRequest(`/${resource}${params}`, { authRequired: needsReadAuth(resource) }),
  listAll,
  get: (resource, id) => apiRequest(`/${resource}/${id}`, { authRequired: needsReadAuth(resource) }),
  create: (resource, data) => apiRequest(`/${resource}`, { method: 'POST', body: JSON.stringify(data), authRequired: needsWriteAuth(resource) }),
  update: (resource, id, data) => apiRequest(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data), authRequired: writeAuthResources.has(resource) }),
  remove: (resource, id) => apiRequest(`/${resource}/${id}`, { method: 'DELETE', authRequired: true }),
}
