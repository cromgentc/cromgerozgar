import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ApplyModal, Toast } from './components/PortalUI'
import { AdminLayout } from './admin/components/AdminLayout'
import { AdminManagementPage, AdminSettingsPage } from './admin/pages/AdminManagementPage'
import { AdminRoleDashboard } from './admin/pages/AdminRoleDashboard'
import { Layout } from './components/Layout'
import { EmployerLayout } from './employer/components/EmployerLayout'
import { EmployerLoginPage, EmployerRegisterPage } from './employer/pages/EmployerAuthPages'
import { EmployerLandingPage } from './employer/pages/EmployerLandingPage'
import { AuthPage } from './pages/AuthPage'
import { CandidateDashboard } from './pages/CandidateDashboard'
import { CandidateProfilePage } from './pages/CandidateProfilePage'
import { CompaniesPage } from './pages/CompaniesPage'
import { ContactPage } from './pages/ContactPage'
import { EmployerDashboard } from './pages/EmployerDashboard'
import { HomePage } from './pages/HomePage'
import { JobDetailsPage } from './pages/JobDetailsPage'
import { JobsPage } from './pages/JobsPage'
import { PostJobPage } from './pages/PostJobPage'
import { ProtectedRoute, RoleRedirect } from './routes/ProtectedRoute'

function App() {
  const [selectedJob, setSelectedJob] = useState(null)

  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { path: '/', element: <HomePage onApply={setSelectedJob} /> },
        { path: '/jobs', element: <JobsPage onApply={setSelectedJob} /> },
        { path: '/companies', element: <CompaniesPage /> },
        { path: '/jobs/:jobId', element: <JobDetailsPage onApply={setSelectedJob} /> },
        { path: '/auth', element: <AuthPage /> },
        {
          path: '/candidate-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Candidate']}>
              <CandidateDashboard onApply={setSelectedJob} />
            </ProtectedRoute>
          ),
        },
        {
          path: '/candidate-profile',
          element: (
            <ProtectedRoute allowedRoles={['Candidate']}>
              <CandidateProfilePage />
            </ProtectedRoute>
          ),
        },
        { path: '/candidate-dashoard', element: <RoleRedirect /> },
        { path: '/employer-dashoard', element: <RoleRedirect /> },
        { path: '/post-job', element: <PostJobPage /> },
        { path: '/contact', element: <ContactPage /> },
      ],
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute allowedRoles={['Admin', 'staff', 'company', 'users']}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <RoleRedirect /> },
        { path: 'users', element: <AdminManagementPage type="users" /> },
        { path: 'jobs', element: <AdminManagementPage type="jobs" /> },
        { path: 'companies', element: <AdminManagementPage type="companies" /> },
        { path: 'employers', element: <AdminManagementPage type="employers" /> },
        { path: 'candidates', element: <AdminManagementPage type="candidates" /> },
        { path: 'applications', element: <AdminManagementPage type="applications" /> },
        { path: 'resumes', element: <AdminManagementPage type="resumes" /> },
        { path: 'categories', element: <AdminManagementPage type="categories" /> },
        { path: 'locations', element: <AdminManagementPage type="locations" /> },
        { path: 'payments', element: <AdminManagementPage type="payments" /> },
        { path: 'reports', element: <AdminManagementPage type="reports" /> },
        { path: 'settings', element: <AdminSettingsPage /> },
      ],
    },
    {
      element: <AdminLayout />,
      children: [
        {
          path: '/recruiter/recruiter-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Employer', 'company']}>
              <EmployerDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/recruiter-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Employer', 'company']}>
              <EmployerDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/employers-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Employer', 'company']}>
              <EmployerDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/employer-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Employer', 'company']}>
              <EmployerDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: '/admin-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminRoleDashboard role="Admin" />
            </ProtectedRoute>
          ),
        },
        {
          path: '/staff-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['staff']}>
              <AdminRoleDashboard role="staff" />
            </ProtectedRoute>
          ),
        },
        {
          path: '/company-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['company']}>
              <AdminRoleDashboard role="company" />
            </ProtectedRoute>
          ),
        },
        {
          path: '/users-dashboard',
          element: (
            <ProtectedRoute allowedRoles={['users']}>
              <AdminRoleDashboard role="users" />
            </ProtectedRoute>
          ),
        },
        { path: '/admin-dashoard', element: <RoleRedirect /> },
        { path: '/employers-dashoard', element: <RoleRedirect /> },
        { path: '/recruiter-dashoard', element: <RoleRedirect /> },
        { path: '/staff-dashoard', element: <RoleRedirect /> },
        { path: '/company-dashoard', element: <RoleRedirect /> },
        { path: '/users-dashoard', element: <RoleRedirect /> },
      ],
    },
    {
      element: <EmployerLayout />,
      children: [
        { path: '/recruiter', element: <EmployerLandingPage /> },
        { path: '/employers', element: <EmployerLandingPage /> },
        { path: '/recruiter-login', element: <EmployerLoginPage /> },
        { path: '/employer-login', element: <EmployerLoginPage /> },
        { path: '/recruiter-register', element: <EmployerRegisterPage /> },
        { path: '/employer-register', element: <EmployerRegisterPage /> },
      ],
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
      <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <Toast />
    </>
  )
}

export default App
