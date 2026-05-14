import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ClipboardList, CreditCard, LogOut, Mail, MapPin, Menu, MessageCircle, Send, ShieldCheck, Sparkles, UserRound, Users, Wallet, X } from 'lucide-react'
import { Button } from './Button'
import { getStoredUser } from '../routes/authRouting'
import { EmployerFooter } from '../employer/components/EmployerFooter'
import { api } from '../services/api'
import { getCandidateProfileCompletion, getJobAlerts } from '../utils/candidateActivity'
import { getSavedJobs } from '../utils/savedJobs'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Recruiter', to: '/recruiter' },
  { label: 'Candidates', to: '/candidate-dashboard' },
]

const recruiterDashboardPath = '/recruiter-dashboard'
const recruiterProfilePath = '/recruiter-profile'

export function Layout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [clearedNotificationIds, setClearedNotificationIds] = useState([])
  const [user, setUser] = useState(() => getStoredUser())
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState({ type: '', message: '' })
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isCandidate = user?.role === 'Candidate'
  const isUserAccount = ['Candidate', 'users'].includes(user?.role)
  const isRecruiterAccount = user?.role === 'recruiter'
  const visibleNavItems = navItems
    .filter((item) => !isUserAccount || item.label !== 'Recruiter')
    .map((item) => {
      if (isUserAccount && item.label === 'Candidates') return { ...item, label: 'Accounts' }
      if (isRecruiterAccount && item.label === 'Recruiter') return { ...item, to: recruiterDashboardPath }
      return item
    })

  useEffect(() => {
    setUser(getStoredUser())
    setOpen(false)
    setProfileOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!user?.email || !user?.role) {
      setNotifications([])
      setClearedNotificationIds([])
      return
    }

    let mounted = true
    const key = getRoleNotificationClearKey(user)
    const loadNotifications = async () => {
      setNotificationsLoading(true)
      try {
        const roleNotifications = await buildRoleNotifications(user)
        const clearedIds = JSON.parse(localStorage.getItem(key) || '[]')
        if (!mounted) return
        setClearedNotificationIds(clearedIds)
        setNotifications(roleNotifications.filter((item) => !clearedIds.includes(item.id)))
      } catch {
        if (mounted) setNotifications([])
      } finally {
        if (mounted) setNotificationsLoading(false)
      }
    }

    loadNotifications()
    window.addEventListener('focus', loadNotifications)
    window.addEventListener('candidateActivityChanged', loadNotifications)
    window.addEventListener('savedJobsChanged', loadNotifications)
    window.addEventListener('recruiter-wallet-updated', loadNotifications)

    return () => {
      mounted = false
      window.removeEventListener('focus', loadNotifications)
      window.removeEventListener('candidateActivityChanged', loadNotifications)
      window.removeEventListener('savedJobsChanged', loadNotifications)
      window.removeEventListener('recruiter-wallet-updated', loadNotifications)
    }
  }, [user?.email, user?.role])

  const clearNotifications = () => {
    if (!user?.email) return
    const nextIds = [...new Set([...clearedNotificationIds, ...notifications.map((item) => item.id)])]
    localStorage.setItem(getRoleNotificationClearKey(user), JSON.stringify(nextIds))
    setClearedNotificationIds(nextIds)
    setNotifications([])
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setUser(null)
    setProfileOpen(false)
    navigate('/auth')
  }

  const subscribeNewsletter = async (event) => {
    event.preventDefault()
    const email = newsletterEmail.trim().toLowerCase()
    setNewsletterStatus({ type: '', message: '' })

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setNewsletterLoading(true)
    try {
      const payload = await api.create('newsletter-subscribers', {
        email,
        source: user?.role ? `${user.role} footer` : 'public footer',
        topics: ['Hiring insights', 'Latest jobs', 'Recruiter updates'],
      })
      setNewsletterEmail('')
      setNewsletterStatus({ type: 'success', message: payload.message || 'Subscribed successfully. You will receive hiring updates.' })
    } catch (error) {
      setNewsletterStatus({ type: 'error', message: error.message || 'Subscription failed. Please try again.' })
    } finally {
      setNewsletterLoading(false)
    }
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
            {isUserAccount ? (
              <>
                <RoleNotificationBell loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} open={notificationsOpen} setOpen={setNotificationsOpen} setProfileOpen={setProfileOpen} user={user} />
                <CandidateProfileMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
              </>
            ) : isRecruiterAccount ? (
              <>
                <RoleNotificationBell loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} open={notificationsOpen} setOpen={setNotificationsOpen} setProfileOpen={setProfileOpen} user={user} />
                <CompanyProfileMenu logout={logout} open={profileOpen} setOpen={setProfileOpen} user={user} />
              </>
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
              {isUserAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white">
                      <UserRound size={17} />
                    </span>
                    {user.name || 'Candidate'}
                  </div>
                  <MobileNotifications loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} user={user} />
                  {isCandidate && <Button to="/candidate-profile" variant="secondary">Profile</Button>}
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
                  <MobileNotifications loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} user={user} />
                  <Button to={recruiterProfilePath} variant="secondary">Profile</Button>
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

      {isRecruiterAccount ? <EmployerFooter /> : <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
                {!isUserAccount && <Button to="/post-job" variant="secondary">Post a Job</Button>}
              </div>
            </div>
          </div>

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
              links={isUserAccount
                ? [
                    ['Dashboard', '/candidate-dashboard'],
                    ['Applied Jobs', '/candidate-applied-jobs'],
                    ['Saved Jobs', '/candidate-dashboard'],
                    ['Job Alerts', '/candidate-dashboard'],
                  ]
                : [
                    ['Candidate Login', '/auth'],
                    ['Dashboard', '/candidate-dashboard'],
                    ['Saved Jobs', '/candidate-dashboard'],
                    ['Job Alerts', '/candidate-dashboard'],
                  ]}
            />
            {!isUserAccount && (
              <FooterColumn
                title="Recruiter"
                links={[
                  ['Recruiter Dashboard', recruiterDashboardPath],
                  ['Post a Job', '/post-job'],
                  ['Applications', recruiterDashboardPath],
                  ['Company Profile', '/companies'],
                ]}
              />
            )}

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">Contact & Updates</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-500">
                <p className="flex items-center gap-3"><Mail className="text-blue-600" size={18} /> support@cromgenrozgar.com</p>
                <p className="flex items-center gap-3"><MessageCircle className="text-blue-600" size={18} /> Chat with our support team</p>
                <p className="flex items-center gap-3"><MapPin className="text-blue-600" size={18} /> New Delhi, India</p>
              </div>
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-3 text-sm font-bold text-slate-800">Get hiring insights</p>
                <form className="flex gap-2" onSubmit={subscribeNewsletter}>
                  <input
                    className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
                    disabled={newsletterLoading}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Email address"
                    type="email"
                    value={newsletterEmail}
                  />
                  <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={newsletterLoading} type="submit" aria-label="Subscribe to hiring insights">
                    {newsletterLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send size={17} />}
                  </button>
                </form>
                <p className={`mt-3 text-xs font-bold ${newsletterStatus.type === 'error' ? 'text-rose-600' : newsletterStatus.type === 'success' ? 'text-teal-700' : 'text-slate-500'}`}>
                  {newsletterStatus.message || 'Subscribe for latest jobs, hiring trends, and recruiter updates.'}
                </p>
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
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
        </div>
      </footer>}
    </div>
  )
}

function getRoleNotificationClearKey(user = {}) {
  return `roleNotificationsCleared:${user.role || 'guest'}:${String(user.email || '').toLowerCase()}`
}

async function buildRoleNotifications(user) {
  if (user.role === 'Candidate') return buildCandidateNotifications(user)
  if (user.role === 'users') return buildUserNotifications(user)
  if (user.role === 'recruiter') return buildRecruiterHeaderNotifications(user)
  return []
}

async function buildCandidateNotifications(user) {
  const [applicationsPayload] = await Promise.all([
    api.list('applications', `?candidateEmail=${encodeURIComponent(user.email)}&sort=-createdAt&limit=100`).catch(() => ({ data: [] })),
  ])
  const applications = Array.isArray(applicationsPayload.data) ? applicationsPayload.data : []
  const savedJobs = getSavedJobs(user)
  const jobAlerts = getJobAlerts(user)
  const profileCompletion = getCandidateProfileCompletion(user)
  const interviewCount = applications.filter((item) => ['Interview', 'Selected'].includes(item.status)).length
  const items = []

  if (!profileCompletion.complete) {
    items.push({
      id: 'candidate-profile-incomplete',
      title: `${profileCompletion.missing.length} profile details pending`,
      description: 'Job apply karne ke liye profile aur resume complete karein.',
      to: '/candidate-profile',
      icon: ShieldCheck,
      tone: 'rose',
      meta: 'Profile',
    })
  }

  if (applications.length) {
    items.push({
      id: 'candidate-applications',
      title: `${applications.length} applied jobs`,
      description: 'Aapke application status aur recruiter updates track karein.',
      to: '/candidate-applied-jobs',
      icon: ClipboardList,
      tone: 'blue',
      meta: 'Applications',
    })
  }

  if (interviewCount) {
    items.push({
      id: 'candidate-interviews',
      title: `${interviewCount} interview invites`,
      description: 'Interview/selected stage applications review karein.',
      to: '/candidate-interview-invites',
      icon: CalendarDays,
      tone: 'violet',
      meta: 'Interview',
    })
  }

  if (savedJobs.length) {
    items.push({
      id: 'candidate-saved-jobs',
      title: `${savedJobs.length} saved jobs`,
      description: 'Saved jobs ko review karke apply karein.',
      to: '/candidate-saved-jobs',
      icon: Sparkles,
      tone: 'teal',
      meta: 'Saved',
    })
  }

  if (jobAlerts.length) {
    items.push({
      id: 'candidate-job-alerts',
      title: `${jobAlerts.length} job alerts active`,
      description: 'Matching jobs ke liye alert preferences active hain.',
      to: '/candidate-job-alerts',
      icon: Bell,
      tone: 'emerald',
      meta: 'Alerts',
    })
  }

  applications.slice(0, 3).forEach((application) => {
    items.push({
      id: `candidate-application-${application._id}`,
      title: `${application.jobTitle || 'Job'} status: ${application.status || 'New'}`,
      description: `${application.company || 'Company'} / applied ${application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'recently'}`,
      to: '/candidate-applied-jobs',
      icon: BriefcaseBusiness,
      tone: application.status === 'Rejected' ? 'rose' : application.status === 'Selected' ? 'emerald' : 'slate',
      meta: application.status || 'New',
    })
  })

  return items
}

async function buildUserNotifications(user) {
  const supportPayload = await api.list('support-messages', `?email=${encodeURIComponent(user.email)}&sort=-createdAt&limit=20`).catch(() => ({ data: [] }))
  const supportMessages = Array.isArray(supportPayload.data) ? supportPayload.data : []
  const items = [
    {
      id: 'user-account-ready',
      title: 'Account workspace ready',
      description: 'Aapka account support, jobs, aur profile access ke liye ready hai.',
      to: '/candidate-dashboard',
      icon: UserRound,
      tone: 'blue',
      meta: 'Account',
    },
  ]

  supportMessages.slice(0, 4).forEach((message) => {
    items.push({
      id: `user-support-${message._id}`,
      title: `${message.subject || 'Support chat'}: ${message.status || 'Open'}`,
      description: message.message || 'Support team conversation update.',
      to: '/support',
      icon: MessageCircle,
      tone: ['Open', 'In Progress'].includes(message.status) ? 'teal' : 'slate',
      meta: 'Support',
    })
  })

  return items
}

async function buildRecruiterHeaderNotifications(user) {
  const [dashboardPayload, walletPayload] = await Promise.all([
    api.employerDashboard(user.email).catch(() => ({ data: {} })),
    api.currentRecruiterPackage(user.email).catch(() => ({ data: null })),
  ])
  const dashboard = dashboardPayload.data || {}
  const metrics = dashboard.metrics || {}
  const applications = Array.isArray(dashboard.applications) ? dashboard.applications : []
  const wallet = walletPayload.data
  const items = []

  if (Number(metrics.activeApplications || 0)) {
    items.push({
      id: 'recruiter-header-active-applications',
      title: `${metrics.activeApplications} active applications`,
      description: 'Candidates ko review, shortlist, interview stage mein move karein.',
      to: '/recruiter-applications?status=active',
      icon: ClipboardList,
      tone: 'blue',
      meta: 'Hiring',
    })
  }

  if (wallet) {
    items.push({
      id: 'recruiter-header-wallet',
      title: `${wallet.coinBalance || 0} wallet coins`,
      description: 'Job posting wallet aur package details dekhein.',
      to: '/recruiter-pricing',
      icon: Wallet,
      tone: Number(wallet.coinBalance || 0) > 0 ? 'emerald' : 'rose',
      meta: wallet.packageSnapshot?.name || 'Wallet',
    })
  } else {
    items.push({
      id: 'recruiter-header-package',
      title: 'Package activation required',
      description: 'Job post karne ke liye recruiter package activate karein.',
      to: '/recruiter-pricing',
      icon: CreditCard,
      tone: 'rose',
      meta: 'Package',
    })
  }

  applications.slice(0, 3).forEach((application) => {
    items.push({
      id: `recruiter-header-application-${application._id}`,
      title: `${application.candidateName || 'Candidate'} applied`,
      description: `${application.jobTitle || 'Job'} / ${application.status || 'New'}`,
      to: application.candidateEmail ? `/recruiter-applications/candidate/${encodeURIComponent(application.candidateEmail)}` : '/recruiter-applications',
      icon: Users,
      tone: 'teal',
      meta: application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recent',
    })
  })

  return items
}

function getRoleNotificationTone(tone) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
  }

  return tones[tone] || tones.blue
}

function RoleNotificationBell({ loading, notifications, onClear, open, setOpen, setProfileOpen, user }) {
  return (
    <div className="relative">
      <button
        className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        onClick={() => {
          setOpen((value) => !value)
          setProfileOpen(false)
        }}
        type="button"
      >
        <Bell size={19} />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-teal-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {notifications.length}
          </span>
        )}
      </button>
      {open && <RoleNotificationMenu floating loading={loading} notifications={notifications} onClear={onClear} role={user?.role} />}
    </div>
  )
}

function RoleNotificationMenu({ floating = false, loading, notifications, onClear, role }) {
  return (
    <div className={`${floating ? 'absolute right-0 top-14 z-50 w-[24rem] max-w-[calc(100vw-2rem)] shadow-2xl shadow-blue-100' : 'w-full'} rounded-[1.5rem] border border-slate-200 bg-white p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-slate-950">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-rose-50 hover:text-rose-700" onClick={onClear} type="button">Clear</button>
          )}
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{role || 'User'} live</span>
        </div>
      </div>
      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Loading notifications...</div>
      ) : notifications.length ? (
        <div className="grid max-h-[26rem] gap-2 overflow-y-auto pr-1">
          {notifications.map((item) => {
            const Icon = item.icon
            return (
              <Link className="group rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-blue-100 hover:bg-blue-50/50" key={item.id} to={item.to}>
                <div className="flex gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${getRoleNotificationTone(item.tone)}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-black text-slate-950">{item.title}</span>
                      <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400 group-hover:bg-white">{item.meta}</span>
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-slate-500">{item.description}</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-black text-slate-950">All clear</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Aapke role ke liye abhi koi new notification nahi hai.</p>
        </div>
      )}
    </div>
  )
}

function MobileNotifications({ loading, notifications, onClear, user }) {
  return (
    <div className="pt-2">
      <RoleNotificationMenu loading={loading} notifications={notifications} onClear={onClear} role={user?.role} />
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
            ['Profile', recruiterProfilePath],
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
