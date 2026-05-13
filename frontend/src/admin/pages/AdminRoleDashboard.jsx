import { ShieldCheck } from 'lucide-react'
import { AdminDashboard } from './AdminDashboard'

const roleCopy = {
  Admin: {
    title: 'Admin Dashboard',
    text: 'Full platform control for jobs, recruiters, candidates, applications, resume database, reports, settings, and role permissions.',
  },
  staff: {
    title: 'staff Dashboard',
    text: 'Staff workspace for operational follow-up, candidate help, recruiter coordination, and internal tasks.',
  },
  company: {
    title: 'company Dashboard',
    text: 'Company workspace for recruiter accounts, company details, hiring visibility, and recruitment coordination.',
  },
  users: {
    title: 'users Dashboard',
    text: 'Users workspace for registered account tracking, candidate support, and profile activity overview.',
  },
}

export function AdminRoleDashboard({ role }) {
  const copy = roleCopy[role] || roleCopy.Admin

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6 shadow-xl shadow-blue-100/50 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Role based access</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{copy.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{copy.text}</p>
          </div>
        </div>
      </section>
      <AdminDashboard />
    </div>
  )
}
