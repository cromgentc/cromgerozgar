import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Clock3,
  CreditCard,
  FileCheck2,
  Headphones,
  RefreshCw,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { AnalyticsGrid } from '../components/AdminCharts'
import { AdminCard, EmptyAdminState, LoadingSkeleton, StatusBadge } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}

const emptyDashboard = {
  metrics: {},
  charts: { monthly: [], categories: [], recruiterPerformance: [] },
  recentJobs: [],
  recentApplications: [],
  pendingReviews: [],
  supportMessages: [],
  recentActivity: [],
}

export function AdminDashboard() {
  const user = getStoredAdminUser()
  const isAdmin = user?.role === 'Admin'
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = await api.adminDashboard()
      setDashboard({ ...emptyDashboard, ...(payload.data || {}) })
    } catch (err) {
      setError(err.message || 'Dashboard data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const metrics = useMemo(() => buildMetricCards(dashboard.metrics), [dashboard.metrics])
  const monthlyData = dashboard.charts?.monthly?.length ? dashboard.charts.monthly : emptyDashboard.charts.monthly
  const categoryData = dashboard.charts?.categories?.length ? dashboard.charts.categories : [{ name: 'No jobs', value: 1 }]
  const recruiterData = dashboard.charts?.recruiterPerformance?.length ? dashboard.charts.recruiterPerformance : [{ company: 'No recruiters', hires: 0, views: 0 }]

  return (
    <div className="grid max-w-full gap-6 overflow-hidden">
      <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-100/50">
        <div className="grid gap-6 bg-gradient-to-br from-blue-600 via-sky-500 to-teal-400 p-6 text-white sm:p-8 xl:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-50">Live admin overview</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">Enterprise Platform Command Center</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50 sm:text-base">
              Monitor jobs, recruiters, candidates, document verification, packages, support messages, and revenue from one live operations dashboard.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.5rem] bg-white/15 p-4 backdrop-blur">
            <QuickSignal label="Pending job approvals" value={dashboard.metrics?.pendingJobs || 0} />
            <QuickSignal label="Document reviews" value={dashboard.metrics?.pendingDocuments || 0} />
            <QuickSignal label="Open support tickets" value={dashboard.metrics?.openSupportMessages || 0} />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-blue-100 bg-white p-4 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-slate-500">
            Signed in as <span className="font-black text-slate-900">{user?.name || 'Admin'}</span>. Data refreshes from MongoDB through the dashboard API.
          </p>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-100" onClick={loadDashboard} type="button">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </section>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} key={metric.label} transition={{ delay: index * 0.03 }}>
                  <Link to={metric.to}>
                    <AdminCard className="h-full transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${colorClasses[metric.color]}`}>
                          <Icon size={22} />
                        </div>
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-500">{metric.meta}</span>
                      </div>
                      <p className="mt-5 text-3xl font-black text-slate-950">{metric.value}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{metric.label}</p>
                    </AdminCard>
                  </Link>
                </motion.div>
              )
            })}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
            <AdminCard>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-blue-600">Operational Queue</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">Today needs attention</h3>
                </div>
                <StatusBadge status={dashboard.metrics?.pendingJobs || dashboard.metrics?.pendingDocuments ? 'Pending' : 'Active'} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <QueueLink label="Approve pending jobs" to="/admin/jobs" value={dashboard.metrics?.pendingJobs || 0} />
                <QueueLink label="Verify recruiter documents" to="/admin/recruiter-documents" value={dashboard.metrics?.pendingDocuments || 0} />
                <QueueLink label="Resolve support messages" to="/admin/support-messages" value={dashboard.metrics?.openSupportMessages || 0} />
                <QueueLink label="Review pending recruiters" to="/admin/employers" value={dashboard.metrics?.pendingEmployers || 0} />
              </div>
            </AdminCard>

            <AdminCard>
              <p className="text-sm font-black uppercase tracking-wide text-teal-600">Commercial Health</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(dashboard.metrics?.revenueAmount || 0)}</h3>
              <div className="mt-5 grid gap-3">
                <HealthRow label="Paid payments" value={dashboard.metrics?.paidPayments || 0} />
                <HealthRow label="Active packages" value={dashboard.metrics?.activeSubscriptions || 0} />
                <HealthRow label="Approved recruiters" value={dashboard.metrics?.approvedEmployers || 0} />
              </div>
            </AdminCard>
          </section>

          <AnalyticsGrid categoryData={categoryData} monthlyData={monthlyData} recruiterData={recruiterData} />

          {isAdmin && <AdminControlCenter />}

          <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <RecentJobs jobs={dashboard.recentJobs} />
            <div className="grid gap-5">
              <ActivityPulse items={dashboard.recentActivity} />
              <RecentApplications applications={dashboard.recentApplications} />
              <ReviewQueue documents={dashboard.pendingReviews} supportMessages={dashboard.supportMessages} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function buildMetricCards(metrics = {}) {
  return [
    { label: 'Total Jobs', value: formatNumber(metrics.totalJobs), meta: `${formatNumber(metrics.activeJobs)} active`, icon: BriefcaseBusiness, color: 'blue', to: '/admin/jobs' },
    { label: 'Pending Jobs', value: formatNumber(metrics.pendingJobs), meta: `${formatNumber(metrics.rejectedJobs)} rejected`, icon: Clock3, color: 'amber', to: '/admin/jobs?status=Pending' },
    { label: 'Recruiters', value: formatNumber(metrics.totalEmployers), meta: `${formatNumber(metrics.approvedEmployers)} approved`, icon: Building2, color: 'teal', to: '/admin/employers' },
    { label: 'Candidates', value: formatNumber(metrics.totalCandidates), meta: `${formatNumber(metrics.shortlistedCandidates)} shortlisted`, icon: UsersRound, color: 'violet', to: '/admin/candidates' },
    { label: 'Applications', value: formatNumber(metrics.totalApplications), meta: 'live pipeline', icon: FileCheck2, color: 'blue', to: '/admin/applications' },
    { label: 'Documents', value: formatNumber(metrics.pendingDocuments), meta: 'need review', icon: ShieldCheck, color: 'amber', to: '/admin/recruiter-documents' },
    { label: 'Support', value: formatNumber(metrics.openSupportMessages), meta: 'open tickets', icon: Headphones, color: 'rose', to: '/admin/support-messages' },
    { label: 'Revenue', value: formatCurrency(metrics.revenueAmount), meta: `${formatNumber(metrics.paidPayments)} paid`, icon: BadgeDollarSign, color: 'teal', to: '/admin/package/pricing' },
  ]
}

function QuickSignal({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3">
      <span className="text-sm font-bold text-blue-50">{label}</span>
      <span className="text-xl font-black text-white">{formatNumber(value)}</span>
    </div>
  )
}

function QueueLink({ label, to, value }) {
  return (
    <Link className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-blue-50" to={to}>
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="text-2xl font-black text-slate-950">{formatNumber(value)}</span>
    </Link>
  )
}

function HealthRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="font-black text-slate-950">{formatNumber(value)}</span>
    </div>
  )
}

function ActivityPulse({ items = [] }) {
  return (
    <AdminCard>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <TrendingUp size={20} />
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">Live Activity</p>
          <h3 className="text-xl font-black text-slate-950">Platform pulse</h3>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600" key={item}>{item}</p>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No live activity yet.</p>}
      </div>
    </AdminCard>
  )
}

function RecentJobs({ jobs = [] }) {
  return (
    <AdminCard className="overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">Latest Jobs</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Recently posted jobs</h3>
        </div>
        <Link className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700" to="/admin/jobs">View all</Link>
      </div>
      {jobs.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Job', 'Recruiter', 'Status', 'Approval', 'Created'].map((label) => <th className="whitespace-nowrap px-4 py-3" key={label}>{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr className="hover:bg-blue-50/40" key={job._id}>
                  <td className="whitespace-nowrap px-4 py-3 font-black text-slate-900">{job.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{job.recruiterName || job.company}</td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={job.accountDepartmentStatus || job.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={job.approval || 'Pending'} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyAdminState title="No jobs posted yet" />}
    </AdminCard>
  )
}

function RecentApplications({ applications = [] }) {
  return (
    <AdminCard>
      <p className="text-sm font-black uppercase tracking-wide text-teal-600">Candidate Flow</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">Recent applications</h3>
      <div className="mt-4 grid gap-3">
        {applications.length ? applications.map((application) => (
          <div className="rounded-2xl bg-slate-50 p-4" key={application._id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{application.candidateName}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{application.jobTitle} - {application.company}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
          </div>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No recent applications.</p>}
      </div>
    </AdminCard>
  )
}

function ReviewQueue({ documents = [], supportMessages = [] }) {
  const items = [
    ...documents.map((item) => ({ id: item._id, title: item.recruiterName || item.recruiterEmail, text: item.documentType || 'Document review', status: item.status, to: '/admin/recruiter-documents' })),
    ...supportMessages.map((item) => ({ id: item._id, title: item.name || item.email || 'Guest User', text: item.subject || item.message, status: item.status, to: '/admin/support-messages' })),
  ].slice(0, 6)

  return (
    <AdminCard>
      <p className="text-sm font-black uppercase tracking-wide text-violet-600">Review Queue</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">Documents and support</h3>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <Link className="rounded-2xl bg-slate-50 p-4 transition hover:bg-blue-50" key={item.id} to={item.to}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.text}</p>
              </div>
              <StatusBadge status={item.status || 'Pending'} />
            </div>
          </Link>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No pending review items.</p>}
      </div>
    </AdminCard>
  )
}

function AdminControlCenter() {
  const actions = [
    ['User roles', '/admin/users', UsersRound, 'Create admins, reset access, and assign Admin/staff/recruiter/users roles.'],
    ['Package', '/admin/package/pricing', CreditCard, 'Manage recruiter pricing packages, coins, and discount coupons.'],
    ['Settings', '/admin/settings', Settings, 'Control website, SEO, email, notifications, and role permission settings.'],
    ['Reports', '/admin/reports', FileCheck2, 'Generate platform, recruiter, job, candidate, and revenue reports.'],
    ['Approvals', '/admin/employers', UserCheck, 'Approve recruiters, verify companies, and manage account access.'],
  ]

  return (
    <AdminCard>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">Admin Work</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">Platform control center</h3>
        </div>
        <span className="w-max rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Full access</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {actions.map(([label, to, Icon, text]) => (
          <Link className="rounded-2xl bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100" key={label} to={to}>
            <Icon className="text-blue-600" size={22} />
            <p className="mt-3 font-black text-slate-950">{label}</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{text}</p>
          </Link>
        ))}
      </div>
    </AdminCard>
  )
}

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString('en-IN')
}

function formatCurrency(value = 0) {
  return `INR ${Number(value || 0).toLocaleString('en-IN')}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

function getStoredAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}
