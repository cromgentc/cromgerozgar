import { getStoredUser } from '../routes/authRouting'

function getJobId(job) {
  return String(job?._id || job?.id || '')
}

function getStorageKey(user = getStoredUser()) {
  const identity = user?.id || user?.email
  return identity ? `savedJobs:${identity}` : null
}

export function canSaveJobs(user = getStoredUser()) {
  return user?.role === 'Candidate'
}

export function getSavedJobs(user = getStoredUser()) {
  const key = getStorageKey(user)
  if (!key) return []

  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export function isJobSaved(job, user = getStoredUser()) {
  const jobId = getJobId(job)
  return Boolean(jobId) && getSavedJobs(user).some((item) => getJobId(item) === jobId)
}

export function toggleSavedJob(job, user = getStoredUser()) {
  if (!canSaveJobs(user)) {
    return { allowed: false, saved: false, jobs: getSavedJobs(user) }
  }

  const key = getStorageKey(user)
  const jobId = getJobId(job)
  const current = getSavedJobs(user)
  const exists = current.some((item) => getJobId(item) === jobId)
  const nextJobs = exists ? current.filter((item) => getJobId(item) !== jobId) : [{ ...job, savedAt: new Date().toISOString() }, ...current]

  localStorage.setItem(key, JSON.stringify(nextJobs))
  window.dispatchEvent(new CustomEvent('savedJobsChanged', { detail: { userId: user.id || user.email, jobs: nextJobs } }))

  return { allowed: true, saved: !exists, jobs: nextJobs }
}
