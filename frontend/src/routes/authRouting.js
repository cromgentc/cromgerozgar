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
  }

  return roleMap[role] || role
}

export function getDashboardPath(role) {
  const normalizedRole = normalizeRole(role)
  const paths = {
    Admin: '/admin-dashboard',
    staff: '/staff-dashboard',
    company: '/employers',
    users: '/users-dashboard',
    Employer: '/employers-dashboard',
    Candidate: '/candidate-dashboard',
  }

  return paths[normalizedRole] || '/auth'
}
