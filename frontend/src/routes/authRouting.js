export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || 'null')
    return user ? { ...user, role: normalizeRole(user.role) } : null
  } catch {
    return null
  }
}

export function normalizeRole(role) {
  const roleMap = {
    'Super Admin': 'Admin',
    'HR Manager': 'staff',
    Support: 'users',
    company: 'recruiter',
    Employer: 'recruiter',
  }

  return roleMap[role] || role
}

export function getDashboardPath(role) {
  const normalizedRole = normalizeRole(role)
  const paths = {
    Admin: '/admin-dashboard',
    staff: '/staff-dashboard',
    recruiter: '/recruiter-dashboard',
    users: '/users-dashboard',
    Candidate: '/candidate-dashboard',
  }

  return paths[normalizedRole] || '/auth'
}

export function getRecruiterVerificationStatus(user = getStoredUser()) {
  if (!user || normalizeRole(user.role) !== 'recruiter') return 'approved'

  return user.recruiterVerificationStatus || 'approved'
}

export function getRecruiterVerificationPath(status) {
  const paths = {
    account_review: '/recruiter-verification',
    documents_required: '/recruiter-documents',
    documents_review: '/recruiter-document-review',
    rejected: '/recruiter-verification',
    hold: '/recruiter-verification',
    suspended: '/recruiter-verification',
    approved: '/recruiter-dashboard',
  }

  return paths[status] || '/recruiter-verification'
}

export function updateStoredRecruiterVerificationStatus(status) {
  const user = getStoredUser()
  if (!user) return null

  const nextUser = { ...user, recruiterVerificationStatus: status }
  localStorage.setItem('authUser', JSON.stringify(nextUser))
  if (nextUser.email) {
    localStorage.setItem(`recruiterVerification:${nextUser.email.toLowerCase()}`, status)
  }
  return nextUser
}

export function getRecruiterVerificationRemark(email) {
  const key = email || getStoredUser()?.email
  if (!key) return ''

  return localStorage.getItem(`recruiterVerificationRemark:${key.toLowerCase()}`) || ''
}

export function updateRecruiterVerificationRemark(email, remark) {
  if (!email) return

  const storageKey = `recruiterVerificationRemark:${email.toLowerCase()}`
  if (remark) localStorage.setItem(storageKey, remark)
  else localStorage.removeItem(storageKey)

  const user = getStoredUser()
  if (user?.email?.toLowerCase() === email.toLowerCase()) {
    localStorage.setItem('authUser', JSON.stringify({ ...user, recruiterVerificationRemark: remark }))
  }
}
