import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, Building2, FileCheck2, Laptop, TrendingUp, UsersRound } from 'lucide-react'
import { AdminCard, LoadingSkeleton } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const emptyDashboard = {
  metrics: {},
  charts: { monthly: [] },
}

const statCards = [
  {
    color: '#FFA000',
    icon: BriefcaseBusiness,
    key: 'jobs',
    label: 'Posted Jobs',
    meta: 'Active hiring demand',
    to: '/admin/jobs',
  },
  {
    color: '#F44336',
    icon: FileCheck2,
    key: 'pendingJobs',
    label: 'Pending Jobs',
    meta: 'Needs approval review',
    to: '/admin/jobs?status=Pending',
  },
  {
    color: '#00A76F',
    icon: Building2,
    key: 'recruiters',
    label: 'Recruiters',
    meta: 'Verified company accounts',
    to: '/admin/employers',
  },
  {
    color: '#3367F6',
    icon: UsersRound,
    key: 'applications',
    label: 'Applications',
    meta: 'Candidate hiring pipeline',
    to: '/admin/candidates',
  },
  {
    color: '#0EA5E9',
    icon: Laptop,
    key: 'freelancerApplications',
    label: 'Freelancer Projects',
    meta: 'Project applications',
    to: '/admin/projects?view=applications',
  },
]

export function AdminDashboard({ onRefreshReady }) {
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    onRefreshReady?.(loadDashboard)
    return () => onRefreshReady?.(null)
  }, [loadDashboard, onRefreshReady])

  const cardValues = useMemo(() => {
    const metrics = dashboard.metrics || {}
    return {
      applications: formatNumber(metrics.totalApplications || 0),
      freelancerApplications: formatNumber(metrics.totalFreelancerApplications || 0),
      jobs: formatNumber(metrics.totalJobs || 0),
      pendingJobs: formatNumber(metrics.pendingJobs || 0),
      recruiters: formatNumber(metrics.totalEmployers || 0),
    }
  }, [dashboard.metrics])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="admin-material-dashboard grid gap-5">
      {error && <p className="rounded-[7px] bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link className="block" key={card.label} to={card.to}>
              <article className="flex h-full min-h-[178px] flex-col overflow-hidden rounded-[7px] bg-white shadow-lg shadow-slate-300/50 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex flex-1 items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="text-2xl font-black leading-none" style={{ color: card.color }}>{cardValues[card.key]}</p>
                    <p className="mt-4 max-w-[9rem] text-[15px] font-black leading-6 text-slate-950">{card.label}</p>
                  </div>
                  <Icon className="mt-2 shrink-0" size={34} strokeWidth={1.8} style={{ color: card.color }} />
                </div>
                <div className="flex min-h-[64px] items-center justify-between gap-3 px-5 py-3 text-sm font-black leading-5 text-white" style={{ backgroundColor: card.color }}>
                  <span className="max-w-[10rem]">{card.meta}</span>
                  <TrendingUp className="shrink-0" size={16} />
                </div>
              </article>
            </Link>
          )
        })}
      </section>

      <section className="grid items-stretch gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        <HiringPipelineCard metrics={dashboard.metrics} />
        <FreelancerProjectCard applications={dashboard.recentFreelancerApplications} metrics={dashboard.metrics} />
        <RecruiterStatusCard />
        <ApprovalQueueCard metrics={dashboard.metrics} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Monthly Job Posting Chart" stroke="#3367F6" valueKey="jobs" data={dashboard.charts?.monthly} />
        <ChartPanel title="Application Trend Chart" stroke="#00B8B0" valueKey="applications" data={dashboard.charts?.monthly} />
      </section>
    </div>
  )
}

function HiringPipelineCard({ metrics = {} }) {
  return (
    <AdminCard className="h-full overflow-hidden p-0 shadow-lg shadow-slate-300/50">
      <div className="bg-[#3367F6] p-5 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-black">Hiring Pipeline</h3>
          <span className="text-sm font-black">{formatNumber(metrics.shortlistedCandidates || 0)} shortlisted</span>
        </div>
        <svg className="mt-4 h-24 w-full" viewBox="0 0 420 130">
          <path d="M0 72 C45 70 55 108 103 96 C152 84 144 28 198 46 C252 64 236 118 290 112 C342 106 342 26 392 34 C408 37 416 48 420 54" fill="none" stroke="rgba(255,255,255,0.72)" strokeLinecap="round" strokeWidth="5" />
        </svg>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-200 bg-white py-5 text-center">
        <div>
          <p className="text-2xl font-black text-slate-950">{formatNumber(metrics.totalApplications || 0)}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Total Applications</p>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-950">{formatNumber(metrics.activeApplications || 0)}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Active Applications</p>
        </div>
      </div>
    </AdminCard>
  )
}

function FreelancerProjectCard({ applications = [], metrics = {} }) {
  const rows = Array.isArray(applications) ? applications : []

  return (
    <AdminCard className="h-full overflow-hidden p-0 shadow-lg shadow-slate-300/50">
      <div className="bg-[#0EA5E9] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black">Freelancer Projects</h3>
          <Link className="rounded-[7px] bg-white/15 px-3 py-1 text-xs font-black hover:bg-white/25" to="/admin/projects?view=applications">View All</Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniDashboardCount label="Pending" value={metrics.pendingFreelancerApplications || 0} />
          <MiniDashboardCount label="Approved" value={metrics.approvedFreelancerApplications || 0} />
          <MiniDashboardCount label="Rejected" value={metrics.rejectedFreelancerApplications || 0} />
        </div>
      </div>
      <div className="grid max-h-60 gap-2 overflow-y-auto bg-white p-4">
        {rows.length ? rows.map((application) => (
          <Link
            className="rounded-[7px] border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
            key={application._id || `${application.candidateEmail}-${application.jobTitle}`}
            to={`/admin/projects?view=applications&applicationId=${application._id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">{application.jobTitle || 'Freelancer Project'}</p>
                <p className="mt-1 truncate text-xs font-bold text-slate-500">{application.candidateName || application.candidateEmail || 'Freelancer'} / {application.company || '-'}</p>
              </div>
              <span className="shrink-0 rounded-[7px] bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{application.status || 'New'}</span>
            </div>
          </Link>
        )) : (
          <p className="rounded-[7px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">No freelancer project applications yet.</p>
        )}
      </div>
    </AdminCard>
  )
}

function MiniDashboardCount({ label, value }) {
  return (
    <div className="rounded-[7px] bg-white/15 p-3">
      <p className="text-xl font-black">{formatNumber(value)}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-blue-50">{label}</p>
    </div>
  )
}

function RecruiterStatusCard() {
  return (
    <AdminCard className="h-full p-0 shadow-lg shadow-slate-300/50">
      <div className="border-b border-slate-200 p-5">
        <h3 className="font-black text-slate-950">Recruiter Status</h3>
      </div>
      <div className="grid place-items-center p-6">
        <div className="admin-material-donut" />
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-600">
          <Legend color="#EF3E35" label="Pending" />
          <Legend color="#3367F6" label="Approved" />
          <Legend color="#11C5C6" label="Documents" />
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-slate-200 text-center">
        <MiniRevenue label="Approved" tone="text-[#3367F6]" value="Verified" />
        <MiniRevenue label="Documents" tone="text-[#00A76F]" value="Review" />
        <MiniRevenue label="Pending" tone="text-[#F59E0B]" value="Action" />
      </div>
    </AdminCard>
  )
}

function ApprovalQueueCard({ metrics = {} }) {
  const rows = [
    ['Pending Jobs', metrics.pendingJobs || 0, '#3367F6'],
    ['Recruiter Documents', metrics.pendingDocuments || 0, '#5B6472'],
    ['Open Support', metrics.openSupportMessages || 0, '#3367F6'],
    ['Pending Recruiters', metrics.pendingEmployers || 0, '#5B6472'],
    ['Approved Recruiters', metrics.approvedEmployers || 0, '#00A76F'],
  ]
  const max = Math.max(...rows.map(([, value]) => Number(value || 0)), 1)

  return (
    <AdminCard className="h-full shadow-lg shadow-slate-300/50">
      <h3 className="font-black text-slate-950">Approval Queue</h3>
      <div className="mt-7 grid gap-5">
        {rows.map(([label, value, color]) => (
          <div key={label}>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>{label}</span>
              <span>{formatNumber(value)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full" style={{ width: `${Math.max(8, (Number(value || 0) / max) * 100)}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  )
}

function ChartPanel({ data = [], stroke, title, valueKey }) {
  const chartData = data?.length ? data : [
    { month: 'Jan', [valueKey]: 0 },
    { month: 'Feb', [valueKey]: 1 },
    { month: 'Mar', [valueKey]: 2 },
    { month: 'Apr', [valueKey]: 4 },
  ]
  const max = Math.max(...chartData.map((item) => Number(item[valueKey] || 0)), 1)
  const points = chartData.map((item, index) => {
    const x = (index / Math.max(chartData.length - 1, 1)) * 500
    const y = 230 - (Number(item[valueKey] || 0) / max) * 190
    return `${x},${y}`
  }).join(' ')

  return (
    <AdminCard className="shadow-lg shadow-slate-300/50">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <svg className="mt-6 h-64 w-full" viewBox="0 0 500 260" preserveAspectRatio="none">
        {[40, 90, 140, 190, 240].map((y) => <line key={y} x1="0" x2="500" y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 6" />)}
        <polyline fill="none" points={points} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      </svg>
    </AdminCard>
  )
}

function Legend({ color, label }) {
  return <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} /> {label}</span>
}

function MiniRevenue({ label, tone, value }) {
  return (
    <div className="p-5">
      <p className="font-black text-slate-950">{label}</p>
      <p className={`mt-1 text-sm font-black ${tone}`}>{value}</p>
    </div>
  )
}

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString('en-IN')
}
