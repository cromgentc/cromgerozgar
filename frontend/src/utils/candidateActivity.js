import { getStoredUser } from '../routes/authRouting'

function getScopedItems(prefix, user = getStoredUser()) {
  const identity = user?.id || user?.email
  if (!identity) return []

  try {
    return JSON.parse(localStorage.getItem(`${prefix}:${identity}`) || '[]')
  } catch {
    return []
  }
}

export function getAppliedJobs(user = getStoredUser()) {
  return getScopedItems('appliedJobs', user)
}

export function getInterviewInvites(user = getStoredUser()) {
  return getScopedItems('interviewInvites', user)
}

export function getJobAlerts(user = getStoredUser()) {
  return getScopedItems('jobAlerts', user)
}

export function getCandidateProfileStrength() {
  try {
    const storedProfile = localStorage.getItem('candidateProfile')
    if (!storedProfile) return 0

    const profile = JSON.parse(storedProfile)
    const fields = ['name', 'email', 'phone', 'city', 'state', 'headline', 'experience', 'preferredRole', 'avatar', 'banner']
    const completedFields = fields.filter((field) => {
      const value = profile[field]
      return Array.isArray(value) ? value.length > 0 : Boolean(value)
    }).length
    const skillsComplete = Array.isArray(profile.skills) && profile.skills.length > 0 ? 1 : 0
    const workModeComplete = Array.isArray(profile.workMode) && profile.workMode.length > 0 ? 1 : 0
    const total = fields.length + 2
    const completed = completedFields + skillsComplete + workModeComplete

    return Math.round((completed / total) * 100)
  } catch {
    return 0
  }
}

export function getCandidateProfileCompletion(user = getStoredUser()) {
  try {
    const profile = JSON.parse(localStorage.getItem('candidateProfile') || '{}')
    const required = [
      ['name', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['city', 'City'],
      ['state', 'State'],
      ['headline', 'Headline'],
      ['experience', 'Experience'],
      ['preferredRole', 'Preferred role'],
      ['workMode', 'Work mode'],
      ['expectedSalary', 'Expected salary'],
      ['noticePeriod', 'Notice period'],
      ['skills', 'Skills'],
      ['resumeName', 'Resume'],
    ]

    const merged = {
      ...profile,
      name: profile.name || user?.name || '',
      email: profile.email || user?.email || '',
    }

    const missing = required
      .filter(([key]) => {
        const value = merged[key]
        return Array.isArray(value) ? value.length === 0 : !String(value || '').trim()
      })
      .map(([, label]) => label)

    return { complete: missing.length === 0, missing, profile: merged }
  } catch {
    return { complete: false, missing: ['Candidate profile', 'Resume'], profile: {} }
  }
}

export function getCandidateProfileRedirect(missing = []) {
  const target = missing[0] || 'Candidate profile'
  const params = new URLSearchParams({ missing: target })
  return `/candidate-profile?${params.toString()}`
}

export function isSameAppliedJob(application, job) {
  const applicationJobId = String(application?.jobId || application?._id || application?.id || '')
  const jobId = String(job?._id || job?.id || '')
  if (applicationJobId && jobId && applicationJobId === jobId) return true

  return String(application?.jobTitle || application?.title || '').trim().toLowerCase() === String(job?.title || '').trim().toLowerCase()
    && String(application?.company || '').trim().toLowerCase() === String(job?.company || '').trim().toLowerCase()
}
