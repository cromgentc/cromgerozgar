import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BriefcaseBusiness, Building2, ChevronDown, LayoutDashboard, Menu, UserRound, WalletCards, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { getStoredUser } from '../../routes/authRouting'
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
  const [profileOpen, setProfileOpen] = useState(false)
  const user = getStoredUser()
  const isCompany = user?.role === 'company'
  const brandLabel = isCompany ? 'Rozgar Company' : 'Rozgar Employers'
  const navItems = employerNav.map(([label, to]) => (isCompany && label === 'Dashboard' ? ['Dashboard', '/employers'] : [label, to]))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-sm shadow-blue-100/40 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 font-black text-slate-950" to="/employers">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-100">
              <BriefcaseBusiness size={22} />
            </span>
            <span className="text-xl">{brandLabel}</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, to]) => (
              <NavLink className="group relative rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-blue-700" key={label} to={to}>
                {label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-blue-600 transition group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isCompany ? (
              <CompanyMenu open={profileOpen} setOpen={setProfileOpen} user={user} />
            ) : (
              <>
                <Button to="/employer-login" variant="ghost">Employer Login</Button>
                <Button to="/employer-register" variant="secondary">Register Company</Button>
                <Button to="/post-job">Post a Job</Button>
              </>
            )}
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map(([label, to]) => <Link className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} to={to}>{label}</Link>)}
              {isCompany ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white"><Building2 size={17} /></span>
                    {user.name || 'Company'}
                  </div>
                  <Button to="/companies" variant="secondary">Profile</Button>
                  <Button to="/companies" variant="secondary">Account</Button>
                  <Button to="/employers" variant="secondary">Dashboard</Button>
                  <Button to="/employers#pricing">Pricing</Button>
                </div>
              ) : (
                <div className="grid gap-2 pt-2 sm:grid-cols-3">
                  <Button to="/employer-login" variant="secondary">Login</Button>
                  <Button to="/employer-register" variant="secondary">Register</Button>
                  <Button to="/post-job">Post Job</Button>
                </div>
              )}
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

function CompanyMenu({ open, setOpen, user }) {
  return (
    <div className="relative">
      <button
        className="inline-flex min-h-11 items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-blue-100"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white">
          <Building2 size={16} />
        </span>
        {user?.name || 'Company'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          <CompanyMenuLink icon={UserRound} label="Profile" setOpen={setOpen} to="/companies" />
          <CompanyMenuLink icon={Building2} label="Account" setOpen={setOpen} to="/companies" />
          <CompanyMenuLink icon={LayoutDashboard} label="Dashboard" setOpen={setOpen} to="/employers" />
          <CompanyMenuLink icon={WalletCards} label="Pricing" setOpen={setOpen} to="/employers#pricing" />
        </div>
      )}
    </div>
  )
}

function CompanyMenuLink({ icon: Icon, label, setOpen, to }) {
  return (
    <Link className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)} to={to}>
      <Icon size={17} />
      {label}
    </Link>
  )
}
