import { api } from '../services/api'

export const PRICING_PACKAGES_KEY = 'rozgarPricingPackages'

export const defaultPricingPackages = [
  {
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

function normalizePackages(value) {
  return Array.isArray(value) && value.length ? value : defaultPricingPackages
}

export function getPricingPackages() {
  try {
    const stored = localStorage.getItem(PRICING_PACKAGES_KEY)
    return normalizePackages(stored ? JSON.parse(stored) : null)
  } catch {
    return defaultPricingPackages
  }
}

export function cachePricingPackages(packages) {
  const normalized = Array.isArray(packages) ? packages : defaultPricingPackages
  localStorage.setItem(PRICING_PACKAGES_KEY, JSON.stringify(normalized))
  localStorage.setItem(`${PRICING_PACKAGES_KEY}:updatedAt`, String(Date.now()))
  window.dispatchEvent(new CustomEvent('pricing-packages-updated', { detail: normalized }))
  return normalized
}

export async function fetchPricingPackages(options = {}) {
  const params = new URLSearchParams({ sort: 'sortOrder', limit: '100' })
  const payload = await api.list('pricing-packages', `?${params.toString()}`)
  const packages = payload.data || []
  if (options.activeOnly) {
    const activePackages = packages.filter((plan) => plan.status !== 'Inactive')
    return activePackages.length ? cachePricingPackages(activePackages) : cachePricingPackages(defaultPricingPackages)
  }
  return cachePricingPackages(packages.length ? packages : defaultPricingPackages)
}

export async function seedDefaultPricingPackages() {
  const payload = await api.list('pricing-packages', '?sort=sortOrder&limit=100')
  const packages = payload.data || []
  if (packages.length) return cachePricingPackages(packages)

  await Promise.all(defaultPricingPackages.map((plan) => api.create('pricing-packages', plan)))
  return fetchPricingPackages()
}
