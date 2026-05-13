import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CreditCard, FileCheck2, Settings, ShieldCheck, UsersRound } from 'lucide-react'
import { AnalyticsGrid } from '../components/AdminCharts'
import { AdminCard, EmptyAdminState, LoadingSkeleton } from '../components/AdminPrimitives'
import { auditItems, dashboardMetrics } from '../data/adminData'

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  purple: 'bg-violet-50 text-violet-600',
}

export function AdminDashboard() {
  const user = getStoredAdminUser()
  const isAdmin = user?.role === 'Admin'

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-sky-500 to-teal-400 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-50">Admin overview</p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">Premium Job Portal Admin Panel</h2>
        <p className="mt-4 max-w-3xl text-blue-50">Monitor listings, employers, candidates, applications, reports, revenue, and access roles from one clean enterprise dashboard.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} key={metric.label}>
              <AdminCard className="transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${colorClasses[metric.color]}`}>
                    <Icon size={22} />
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{metric.change}</span>
                </div>
                <p className="mt-5 text-2xl font-black text-slate-950">{metric.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{metric.label}</p>
              </AdminCard>
            </motion.div>
          )
        })}
      </section>

      <AnalyticsGrid />

      {isAdmin && <AdminControlCenter />}

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <AdminCard>
          <h3 className="text-lg font-black text-slate-950">Recent Admin Activity</h3>
          <div className="mt-4 grid gap-3">
            {auditItems.map((item) => <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600" key={item}>{item}</p>)}
          </div>
        </AdminCard>
        <div className="grid gap-5">
          <LoadingSkeleton />
          <EmptyAdminState title="No critical alerts" />
        </div>
      </div>
    </div>
  )
}

function AdminControlCenter() {
  const actions = [
    ['User roles', '/admin/users', UsersRound, 'Create admins, reset access, and assign Admin/staff/company/users roles.'],
    ['Payments', '/admin/payments', CreditCard, 'Review invoices, failed payments, subscription plans, and revenue records.'],
    ['Settings', '/admin/settings', Settings, 'Control website, SEO, email, notifications, and role permission settings.'],
    ['Reports', '/admin/reports', FileCheck2, 'Generate platform, employer, job, candidate, and revenue reports.'],
    ['Approvals', '/admin/employers', ShieldCheck, 'Approve employers, verify companies, and manage account access.'],
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

function getStoredAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}
