const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5050/api' : '/api')

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('authToken')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')

      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.assign('/auth')
      }

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
  employerDashboard: () => apiRequest('/dashboard/employer'),
  createJob: (data) => apiRequest('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  createApplication: (data) => apiRequest('/applications', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  employerLogin: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  employerRegister: (data) => apiRequest('/employers', { method: 'POST', body: JSON.stringify(data) }),
  list: (resource, params = '') => apiRequest(`/${resource}${params}`),
  create: (resource, data) => apiRequest(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => apiRequest(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (resource, id) => apiRequest(`/${resource}/${id}`, { method: 'DELETE' }),
}
