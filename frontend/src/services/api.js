const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5050/api' : '/api')

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

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

const protectedResources = new Set([
  'applications',
  'candidates',
  'content-pages',
  'employers',
  'faqs',
  'newsletter-subscribers',
  'payments',
  'recruiter-documents',
  'resumes',
  'settings',
  'support-messages',
  'users',
])

function needsAuth(resource) {
  return protectedResources.has(resource)
}

async function openAuthorizedFile(path) {
  const token = localStorage.getItem('authToken')
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  job: (id) => apiRequest(`/jobs/${id}`),
  companies: (params = '') => apiRequest(`/companies${params}`),
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
  mongodbConfig: () => apiRequest('/settings/mongodb-config', { authRequired: true }),
  updateMongodbConfig: (data) => apiRequest('/settings/mongodb-config', { method: 'PUT', body: JSON.stringify(data), authRequired: true }),
  updateRecruiterStatus: (status) => apiRequest('/auth/recruiter-status', { method: 'PATCH', body: JSON.stringify({ status }), authRequired: true }),
  currentUserLocation: () => apiRequest('/user-locations/current', { authRequired: true }),
  trackUserLocation: (data) => apiRequest('/user-locations/current', { method: 'POST', body: JSON.stringify(data), authRequired: true }),
  activeUserLocations: (params = '') => apiRequest(`/user-locations/active${params}`, { authRequired: true }),
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
  resumeViewUrl: (id) => `${API_BASE_URL}/resume-uploads/${encodeURIComponent(id)}/view`,
  openResume: (id) => openAuthorizedFile(`/resume-uploads/${encodeURIComponent(id)}/view`),
  list: (resource, params = '') => apiRequest(`/${resource}${params}`, { authRequired: needsAuth(resource) }),
  get: (resource, id) => apiRequest(`/${resource}/${id}`, { authRequired: needsAuth(resource) }),
  create: (resource, data) => apiRequest(`/${resource}`, { method: 'POST', body: JSON.stringify(data), authRequired: (needsAuth(resource) || resource === 'testimonials') && !['applications', 'employers', 'newsletter-subscribers', 'recruiter-documents', 'support-messages'].includes(resource) }),
  update: (resource, id, data) => apiRequest(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data), authRequired: needsAuth(resource) }),
  remove: (resource, id) => apiRequest(`/${resource}/${id}`, { method: 'DELETE', authRequired: true }),
}
