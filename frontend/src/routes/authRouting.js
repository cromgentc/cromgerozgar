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
    Hiring: 'hiring',
    'Hiring Team': 'hiring',
    Account: 'account team',
    'Account Team': 'account team',
    'account-team': 'account team',
    account_team: 'account team',
    company: 'recruiter',
    Employer: 'recruiter',
    Freelancer: 'freelancer',
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
    hiring: '/admin/hiring-team',
    'account team': '/admin/employers',
    Candidate: '/candidate-dashboard',
    freelancer: '/admin/projects',
  }

  return paths[normalizedRole] || '/auth'
}

export function getRecruiterVerificationStatus(user = getStoredUser()) {
  if (!user || normalizeRole(user.role) !== 'recruiter') return 'approved'

  return user.recruiterVerificationStatus || 'documents_required'
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
  return nextUser
}

export function getRecruiterVerificationRemark(email) {
  const user = getStoredUser()
  if (email && user?.email?.toLowerCase() !== email.toLowerCase()) return ''

  return user?.recruiterVerificationRemark || ''
}

export function updateRecruiterVerificationRemark(email, remark) {
  if (!email) return

  const user = getStoredUser()
  if (user?.email?.toLowerCase() === email.toLowerCase()) {
    localStorage.setItem('authUser', JSON.stringify({ ...user, recruiterVerificationRemark: remark }))
  }
}
