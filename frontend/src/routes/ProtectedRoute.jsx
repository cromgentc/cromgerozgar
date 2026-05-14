import { Navigate } from 'react-router-dom'
import { getDashboardPath, getRecruiterVerificationPath, getRecruiterVerificationStatus, getStoredUser } from './authRouting'

export function RoleRedirect() {
  const user = getStoredUser()

  if (!user) return <Navigate replace to="/auth" />

  return <Navigate replace to={getDashboardPath(user.role)} />
}

export function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('authToken')
  const user = getStoredUser()

  if (!token || !user) {
    return <Navigate replace to="/auth" />
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={getDashboardPath(user.role)} />
  }

  if (allowedRoles?.includes('recruiter') && user.role === 'recruiter') {
    const status = getRecruiterVerificationStatus(user)
    if (status !== 'approved') {
      return <Navigate replace to={getRecruiterVerificationPath(status)} />
    }
  }

  return children
}
