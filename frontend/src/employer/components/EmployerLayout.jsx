import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, Building2, ChevronDown, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { getStoredUser } from '../../routes/authRouting'
import { useSiteBranding } from '../../utils/siteBranding'
import { EmployerFooter } from './EmployerFooter'

const employerNav = [
  ['Home', '/recruiter'],
  ['Candidates', '/recruiter-talent'],
  ['Pricing', '/recruiter-pricing'],
]

const recruiterDashboardPath = '/recruiter-dashboard'
const recruiterProfilePath = '/recruiter-profile'

export function EmployerLayout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const branding = useSiteBranding()
  const user = getStoredUser()
  const isLoggedIn = Boolean(user?.email)
  const isRecruiterAccount = user?.role === 'recruiter'
  const navItems = employerNav.map(([label, to]) => (isRecruiterAccount ? [label, recruiterDashboardPath] : [label, to]))
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setOpen(false)
    setProfileOpen(false)
    navigate('/recruiter-login')
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-[#0057B8]/10 bg-white/92 shadow-sm shadow-[#0057B8]/10 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link className="site-logo-lockup flex min-w-0 items-center font-black text-slate-950" to="/recruiter">
            {branding.logoUrl ? (
              <span className="site-logo-frame">
                <img className="site-logo-img" src={branding.logoUrl} alt={branding.recruiterName || 'Rozgar Recruiter'} />
              </span>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center"><BriefcaseBusiness size={22} /></span>
                <span className="text-xl">{branding.recruiterName || 'Rozgar Recruiter'}</span>
              </>
            )}
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, to]) => (
              <NavLink className="group relative rounded-[7px] px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-blue-700" key={label} to={to}>
                {label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 scale-x-0 rounded-[7px] bg-blue-600 transition group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isRecruiterAccount ? (
              <CompanyMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
            ) : (
              <>
              <Button to="/recruiter-login" variant="ghost">Recruiter Login</Button>
              {!isLoggedIn && <Button to="/recruiter-register" variant="secondary">Register Recruiter</Button>}
                <Button to="/post-job">Post a Job</Button>
              </>
            )}
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-700 lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <div className={`lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <button aria-label="Close menu overlay" className={`fixed inset-0 z-[80] bg-slate-950/35 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} type="button" />
          <aside className={`fixed inset-y-0 right-0 z-[90] h-dvh w-80 max-w-[86vw] overflow-y-auto border-l border-slate-200 bg-white px-4 py-4 shadow-2xl shadow-blue-100 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white pb-3">
                <span className="rounded-[7px] bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">Menu</span>
                <button aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700" onClick={() => setOpen(false)} type="button">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-2">
              {navItems.map(([label, to]) => <Link className="rounded-[7px] px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} onClick={() => setOpen(false)} to={to}>{label}</Link>)}
              {isRecruiterAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-[7px] bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-blue-600 text-white"><Building2 size={17} /></span>
                    {user.name || 'Company'}
                  </div>
                  <Button onClick={() => setOpen(false)} to={recruiterProfilePath} variant="secondary">Profile</Button>
                  <Button onClick={() => setOpen(false)} to={recruiterDashboardPath} variant="secondary">Dashboard</Button>
                  <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-2 pt-2 sm:grid-cols-3">
                  <Button onClick={() => setOpen(false)} to="/recruiter-login" variant="secondary">Login</Button>
                  {!isLoggedIn && <Button onClick={() => setOpen(false)} to="/recruiter-register" variant="secondary">Register</Button>}
                  <Button onClick={() => setOpen(false)} to="/post-job">Post Job</Button>
                </div>
              )}
              </div>
          </aside>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <EmployerFooter />
    </div>
  )
}

function CompanyMenu({ logout, open, setOpen, user }) {
  return (
    <div className="relative">
      <button
        className="inline-flex min-h-11 items-center gap-3 rounded-[7px] bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-white/15 text-white">
          <Building2 size={16} />
        </span>
        {user?.name || 'Company'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-[7px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          <CompanyMenuLink icon={UserRound} label="Profile" setOpen={setOpen} to={recruiterProfilePath} />
          <CompanyMenuLink icon={LayoutDashboard} label="Dashboard" setOpen={setOpen} to={recruiterDashboardPath} />
          <button className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function CompanyMenuLink({ icon: Icon, label, setOpen, to }) {
  return (
    <Link className="flex items-center gap-3 rounded-[7px] px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)} to={to}>
      <Icon size={17} />
      {label}
    </Link>
  )
}
