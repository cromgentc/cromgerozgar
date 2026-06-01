import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, Building2, ChevronDown, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react'
import { AuthModal } from '../../components/AuthModal'
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
  const [authModalMode, setAuthModalMode] = useState('')
  const [user, setUser] = useState(() => getStoredUser())
  const navigate = useNavigate()
  const location = useLocation()
  const branding = useSiteBranding()
  const isLoggedIn = Boolean(user?.email)
  const isRecruiterAccount = user?.role === 'recruiter'
  const navItems = employerNav
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setOpen(false)
    setProfileOpen(false)
    navigate('/recruiter-login')
  }

  useEffect(() => {
    setUser(getStoredUser())
    setOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const openAuthModal = (mode) => {
    setAuthModalMode(mode)
    setOpen(false)
  }

  const handleNavClick = () => {
    setOpen(false)
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-start gap-6 px-4 sm:px-6 lg:px-8">
          <Link className="site-logo-lockup flex min-w-0 items-center font-bold text-slate-950" onClick={handleNavClick} to={isRecruiterAccount ? recruiterDashboardPath : '/recruiter'}>
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

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map(([label, to]) => (
              <NavLink
                className={({ isActive }) =>
                  `group relative inline-flex items-center gap-1 py-7 text-sm font-bold transition ${
                    isActive ? 'text-slate-950' : 'text-slate-700 hover:text-slate-950'
                  }`
                }
                key={label}
                onClick={handleNavClick}
                to={to}
              >
                <span>{label}</span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-[7px] bg-[#00A5E0] transition group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-4 border-l border-slate-100 pl-6 lg:flex">
            {isRecruiterAccount ? (
              <CompanyMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
            ) : (
              <>
                <button className="inline-flex min-h-8 items-center justify-center rounded-[3px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-black transition hover:border-[#e87500] hover:bg-[#fff4e6]" onClick={() => openAuthModal('recruiter-login')} type="button">
                  Recruiter Login
                </button>
                {!isLoggedIn && (
                  <button className="inline-flex min-h-8 items-center justify-center rounded-[3px] bg-[#ff8a00] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#e87500]" onClick={() => openAuthModal('recruiter-register')} type="button">
                    Recruiter Register
                  </button>
                )}
                <Link className="inline-flex min-h-10 items-center gap-1 whitespace-nowrap px-2 text-sm font-black text-slate-950" onClick={handleNavClick} to="/post-job">
                  Post a Job <ChevronDown className="-rotate-90" size={15} />
                </Link>
              </>
            )}
          </div>

          <button className="ml-auto grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-[#0057B8] shadow-sm lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Open menu">
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
              {navItems.map(([label, to]) => <Link className="rounded-[7px] px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} onClick={handleNavClick} to={to}>{label}</Link>)}
              {isRecruiterAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-[7px] bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-blue-600 text-white"><Building2 size={17} /></span>
                    {user.name || 'Company'}
                  </div>
                  <Button onClick={handleNavClick} to={recruiterProfilePath} variant="secondary">Profile</Button>
                  <Button onClick={handleNavClick} to={recruiterDashboardPath} variant="secondary">Dashboard</Button>
                  <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-2 pt-2 sm:grid-cols-3">
                  <button className="inline-flex min-h-10 items-center justify-center rounded-[3px] border border-[#ff8a00] px-4 text-sm font-black text-[#ff8a00]" onClick={() => openAuthModal('recruiter-login')} type="button">Recruiter Login</button>
                  {!isLoggedIn && <button className="inline-flex min-h-10 items-center justify-center rounded-[3px] bg-[#ff8a00] px-4 text-sm font-black text-white" onClick={() => openAuthModal('recruiter-register')} type="button">Recruiter Register</button>}
                  <Button onClick={handleNavClick} to="/post-job">Post Job</Button>
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
      <AuthModal
        initialMode={authModalMode || 'recruiter-login'}
        onClose={() => setAuthModalMode('')}
        onSuccess={() => setUser(getStoredUser())}
        open={Boolean(authModalMode)}
      />
    </div>
  )
}

function CompanyMenu({ logout, open, setOpen, user }) {
  const closeMenu = () => {
    setOpen(false)
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  return (
    <div className="relative">
      <button
        className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[3px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-black transition hover:border-[#e87500] hover:bg-[#fff4e6]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Building2 className="text-black" size={16} />
        {user?.name || 'Company'}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-[7px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          <CompanyMenuLink icon={UserRound} label="Profile" onClick={closeMenu} to={recruiterProfilePath} />
          <CompanyMenuLink icon={LayoutDashboard} label="Dashboard" onClick={closeMenu} to={recruiterDashboardPath} />
          <button className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function CompanyMenuLink({ icon: Icon, label, onClick, to }) {
  return (
    <Link className="flex items-center gap-3 rounded-[7px] px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={onClick} to={to}>
      <Icon size={17} />
      {label}
    </Link>
  )
}
