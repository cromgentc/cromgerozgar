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
