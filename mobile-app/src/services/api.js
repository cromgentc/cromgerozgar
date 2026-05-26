const LIVE_API_BASE_URL = 'https://www.cromgenrozgar.in/api'

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  const isNative =
    typeof window !== 'undefined' &&
    (window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:')

  if (isNative) return LIVE_API_BASE_URL
  return LIVE_API_BASE_URL
}

const API_BASE_URL = getApiBaseUrl()

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

export function getAuthToken() {
  return localStorage.getItem('authToken') || ''
}

export function saveAuthSession(payload = {}) {
  const token = payload.token || payload.data?.token || ''
  const user = payload.user || payload.data?.user || payload.data || null

  if (token) localStorage.setItem('authToken', token)
  if (user && typeof user === 'object') localStorage.setItem('authUser', JSON.stringify(user))

  return { token, user }
}

export function clearAuthSession() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken()
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

  if (response.ok && payload?.success === false) {
    throw new Error(payload.message || 'API request failed')
  }

  if (!response.ok) {
    if (response.status === 401 && authRequired) {
      clearAuthSession()
      throw new Error('Session expired. Please login again.')
    }

    throw new Error(payload.message || 'API request failed')
  }

  return payload
}

export const api = {
  jobs: (params = '') => apiRequest(`/jobs${params}`),
  job: (id) => apiRequest(`/jobs/${id}`),
  companies: (params = '') => apiRequest(`/companies${params}`),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  createApplication: (data) => apiRequest('/applications', { method: 'POST', body: JSON.stringify(data) }),
  applicationsByCandidate: (email) =>
    apiRequest(`/applications?candidateEmail=${encodeURIComponent(email)}&sort=-createdAt&limit=100`, {
      authRequired: true,
    }),
  publicSiteBranding: () => apiRequest('/settings/public/site-branding'),
  publicSocialLinks: () => apiRequest('/settings/public/social-links'),
}
