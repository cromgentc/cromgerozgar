import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BriefcaseBusiness, Menu, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { EmployerFooter } from './EmployerFooter'

const employerNav = [
  ['Home', '/employers'],
  ['Solutions', '/employers#solutions'],
  ['Pricing', '/employers#pricing'],
  ['Talent Pool', '/employers#talent'],
  ['Dashboard', '/employer-dashboard'],
  ['Resources', '/employers#resources'],
]

export function EmployerLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-sm shadow-blue-100/40 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 font-black text-slate-950" to="/employers">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-100">
              <BriefcaseBusiness size={22} />
            </span>
            <span className="text-xl">Rozgar Employers</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {employerNav.map(([label, to]) => (
              <NavLink className="group relative rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-blue-700" key={label} to={to}>
                {label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-blue-600 transition group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Button to="/employer-login" variant="ghost">Employer Login</Button>
            <Button to="/employer-register" variant="secondary">Register Company</Button>
            <Button to="/post-job">Post a Job</Button>
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="grid gap-2">
              {employerNav.map(([label, to]) => <Link className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} to={to}>{label}</Link>)}
              <div className="grid gap-2 pt-2 sm:grid-cols-3">
                <Button to="/employer-login" variant="secondary">Login</Button>
                <Button to="/employer-register" variant="secondary">Register</Button>
                <Button to="/post-job">Post Job</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <EmployerFooter />
    </div>
  )
}
