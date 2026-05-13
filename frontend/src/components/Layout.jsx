import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, ChevronDown, LogOut, Mail, MapPin, Menu, MessageCircle, Send, ShieldCheck, Sparkles, UserRound, Users, X } from 'lucide-react'
import { Button } from './Button'
import { getStoredUser } from '../routes/authRouting'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Recruiter', to: '/recruiter' },
  { label: 'Candidates', to: '/candidate-dashboard' },
]

const recruiterDashboardPath = '/recruiter-dashboard'

export function Layout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(() => getStoredUser())
  const location = useLocation()
  const navigate = useNavigate()
  const isCandidate = user?.role === 'Candidate'
  const isRecruiterAccount = user?.role === 'company' || user?.role === 'Employer'
  const visibleNavItems = navItems
    .filter((item) => !isCandidate || item.label !== 'Recruiter')
    .map((item) => {
      if (isCandidate && item.label === 'Candidates') return { ...item, label: 'Accounts' }
      if (isRecruiterAccount && item.label === 'Recruiter') return { ...item, to: recruiterDashboardPath }
      return item
    })

  useEffect(() => {
    setUser(getStoredUser())
    setOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setUser(null)
    setProfileOpen(false)
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3 font-bold text-slate-950" to="/">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-200">
              <BriefcaseBusiness size={22} />
            </span>
            <span className="text-xl">Cromgen Rozgar</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
                key={item.label}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isCandidate ? (
              <CandidateProfileMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
            ) : isRecruiterAccount ? (
              <CompanyProfileMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
            ) : (
              <>
                <Button to="/auth" variant="ghost">
                  Login
                </Button>
                <Button to="/auth" variant="secondary">
                  Register
                </Button>
                <Button to="/post-job">Post Job</Button>
              </>
            )}
          </div>

          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="grid gap-2">
              {visibleNavItems.map((item) => (
                <NavLink className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" key={item.label} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
              {isCandidate ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
                      <UserRound size={17} />
                    </span>
                    {user.name || 'Candidate'}
                  </div>
                  <Button to="/candidate-profile" variant="secondary">Profile</Button>
                  <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : isRecruiterAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
                      <UserRound size={17} />
                    </span>
                    {user.name || 'Company'}
                  </div>
                  <Button to={recruiterDashboardPath} variant="secondary">Profile</Button>
                  <Button to={recruiterDashboardPath} variant="secondary">Dashboard</Button>
                  <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button to="/auth" variant="secondary">Login</Button>
                    <Button to="/auth">Register</Button>
                  </div>
                  <Button to="/post-job" variant="teal">Post Job</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {!isCandidate && <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {!isCandidate && (
            <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 shadow-xl shadow-blue-100/50">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Enterprise Hiring Network</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Hire faster or find your next role with trusted companies.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                    Premium job discovery, company dashboards, candidate profiles, and scalable recruitment workflows in one clean platform.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button to="/jobs">Find Jobs</Button>
                  <Button to="/post-job" variant="secondary">Post a Job</Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-10 py-12 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr_1.1fr]">
            <div>
              <Link className="flex items-center gap-3 font-black text-slate-950" to="/">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-100">
                  <BriefcaseBusiness size={23} />
                </span>
                <span className="text-xl">Cromgen Rozgar</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
                A modern enterprise job portal for candidates, recruiters, HR teams, and growing companies.
              </p>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
                <p className="flex items-center gap-3"><ShieldCheck className="text-teal-500" size={18} /> Verified company ecosystem</p>
                <p className="flex items-center gap-3"><Sparkles className="text-blue-600" size={18} /> Premium candidate experience</p>
                <p className="flex items-center gap-3"><Users className="text-violet-500" size={18} /> Recruiter-ready dashboards</p>
              </div>
            </div>

            <FooterColumn
              title="Platform"
              links={[
                ['Home', '/'],
                ['Jobs', '/jobs'],
                ['Companies', '/companies'],
              ]}
            />
            <FooterColumn
              title="Candidates"
              links={[
                ['Candidate Login', '/auth'],
                ['Dashboard', '/candidate-dashboard'],
                ['Saved Jobs', '/candidate-dashboard'],
                ['Job Alerts', '/candidate-dashboard'],
              ]}
            />
            <FooterColumn
              title="Recruiter"
              links={[
                ['Recruiter Dashboard', recruiterDashboardPath],
                ['Post a Job', '/post-job'],
                ['Applications', recruiterDashboardPath],
                ['Company Profile', '/companies'],
              ]}
            />

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">Contact & Updates</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-500">
                <p className="flex items-center gap-3"><Mail className="text-blue-600" size={18} /> support@cromgenrozgar.com</p>
                <p className="flex items-center gap-3"><MessageCircle className="text-blue-600" size={18} /> Chat with our support team</p>
                <p className="flex items-center gap-3"><MapPin className="text-blue-600" size={18} /> New Delhi, India</p>
              </div>
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-3 text-sm font-bold text-slate-800">Get hiring insights</p>
                <div className="flex gap-2">
                  <input className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500" placeholder="Email address" />
                  <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100" type="button">
                    <Send size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap gap-3">
              {['10,000+ Jobs', '5,000+ Candidates', '1,000+ Companies', '500+ Recruiters'].map((item) => (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600" key={item}>{item}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <span>© 2026 Cromgen Rozgar</span>
              <Link to="/contact">Privacy</Link>
              <Link to="/contact">Terms</Link>
              <Link to="/contact">Support</Link>
            </div>
          </div>
        </div>
      </footer>}
    </div>
  )
}

function CompanyProfileMenu({ logout, open, setOpen, user }) {
  return (
    <div className="relative">
      <button
        className="inline-flex min-h-11 items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-blue-100"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white">
          <UserRound size={16} />
        </span>
        {user.name || 'Company'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          {[
            ['Profile', recruiterDashboardPath],
            ['Dashboard', recruiterDashboardPath],
          ].map(([label, to]) => (
            <Link className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} onClick={() => setOpen(false)} to={to}>
              <UserRound size={17} />
              {label}
            </Link>
          ))}
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function CandidateProfileMenu({ logout, open, setOpen, user }) {
  return (
    <div className="relative">
      <button
        className="inline-flex min-h-11 items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-blue-100"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white">
          <UserRound size={16} />
        </span>
        {user.name || 'Candidate'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          <Link className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)} to="/candidate-profile">
            <UserRound size={17} />
            Profile
          </Link>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">{title}</h3>
      <div className="mt-4 grid gap-3 text-sm font-medium text-slate-500">
        {links.map(([label, to]) => (
          <Link className="transition hover:translate-x-1 hover:text-blue-600" key={label} to={to}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
