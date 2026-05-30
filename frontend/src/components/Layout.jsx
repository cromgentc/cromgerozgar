import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ClipboardList, CreditCard, Download, LogOut, Mail, MapPin, Menu, MessageCircle, Phone, Send, Share2, ShieldCheck, Sparkles, Star, UserRound, Users, Wallet, X } from 'lucide-react'
import { AuthModal } from './AuthModal'
import { Button } from './Button'
import { getStoredUser } from '../routes/authRouting'
import { EmployerFooter } from '../employer/components/EmployerFooter'
import { api } from '../services/api'
import { getCandidateProfileCompletion, getJobAlerts } from '../utils/candidateActivity'
import { getSavedJobs } from '../utils/savedJobs'
import { useSiteBranding } from '../utils/siteBranding'
import { useSocialMediaLinks } from '../utils/socialMediaLinks'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Freelancer', to: '/freelancer' },
  { label: 'Candidates', to: '/candidate-dashboard' },
]

const publicNavItems = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'Freelancer', to: '/freelancer' },
  { label: 'Courses', to: '/jobs', offer: true },
]

const recruiterDashboardPath = '/recruiter-dashboard'
const recruiterProfilePath = '/recruiter-profile'
const liveLocationRoles = ['Candidate', 'users', 'recruiter']

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
  const [appBannerOpen, setAppBannerOpen] = useState(true)
  const [authModalMode, setAuthModalMode] = useState('')
  const branding = useSiteBranding()
  const socialLinks = useSocialMediaLinks()
  const location = useLocation()
  const navigate = useNavigate()
  const isCandidate = user?.role === 'Candidate'
  const isUserAccount = ['Candidate', 'users'].includes(user?.role)
  const isRecruiterAccount = user?.role === 'recruiter'
  const hideFooterOnMobile = location.pathname === '/auth' || location.pathname === '/jobs' || location.pathname.startsWith('/jobs/') || location.pathname.startsWith('/job-listings-') || location.pathname.startsWith('/jobs-in-') || location.pathname.startsWith('/company-jobs-') || location.pathname.startsWith('/freelance-project-listings-') || location.pathname === '/candidate-dashboard' || location.pathname.startsWith('/candidate-')
  const visibleNavItems = navItems
    .filter((item) => !isUserAccount || item.label !== 'Recruiter')
    .map((item) => {
      if (isUserAccount && item.label === 'Candidates') return { ...item, label: 'Accounts' }
      if (isRecruiterAccount && item.label === 'Recruiter') return { ...item, to: recruiterDashboardPath }
      return item
    })
  const mobileNavItems = visibleNavItems.filter((item) => !['Freelancer', 'Recruiter'].includes(item.label))

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

  useEffect(() => {
    if (!user?.role || !liveLocationRoles.includes(user.role)) return undefined

    const captureLocation = () => {
      const basePayload = {
        loginTime: new Date().toISOString(),
        deviceInfo: navigator.userAgent || '',
      }

      if (!navigator.geolocation) {
        api.trackUserLocation({ ...basePayload, locationStatus: 'unavailable' }).catch(() => {})
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          api.trackUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            ...basePayload,
            locationStatus: 'allowed',
          }).catch(() => {})
        },
        (error) => {
          api.trackUserLocation({
            ...basePayload,
            locationStatus: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
          }).catch(() => {})
        },
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 12000,
        },
      )
    }

    captureLocation()
    const interval = window.setInterval(captureLocation, 30000)
    return () => window.clearInterval(interval)
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
      const payload = await api.subscribeNewsletter({
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

  const openAuthModal = (mode) => {
    setAuthModalMode(mode)
    setOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-start gap-6 px-4 sm:px-6 lg:px-8">
          <Link className="site-logo-lockup flex min-w-0 items-center font-bold text-slate-950" to="/">
            {branding.logoUrl ? (
              <span className="site-logo-frame">
                <img className="site-logo-img" src={branding.logoUrl} alt={branding.siteName || 'Cromgen Rozgar'} />
              </span>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-white"><BriefcaseBusiness size={22} /></span>
                <span className="ml-3 text-xl">{branding.siteName || 'Cromgen Rozgar'}</span>
              </>
            )}
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {(user ? visibleNavItems : publicNavItems).map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `group relative inline-flex items-center gap-1 py-7 text-sm font-bold transition ${
                    isActive ? 'text-slate-950' : 'text-slate-700 hover:text-slate-950'
                  }`
                }
                key={item.label}
                to={item.to}
              >
                <span>{item.label}</span>
                {item.offer && <span className="rounded-[4px] bg-[#ff8a00] px-1.5 py-0.5 text-[11px] font-black text-white">OFFER</span>}
                {item.dropdown && <ChevronDown size={15} />}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-[7px] bg-[#00A5E0] transition group-hover:scale-x-100" />
                {item.label === 'Recruiter' && (
                  <span className="recruiter-offer-badge absolute -right-9 -top-3 whitespace-nowrap rounded-[7px] bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-rose-100">
                    New Recruiter Offer
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-4 border-l border-slate-100 pl-6 lg:flex">
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
                <button className="inline-flex min-h-8 items-center justify-center rounded-[3px] border border-[#ff8a00] px-5 text-sm font-black text-[#ff8a00] transition hover:border-[#e87500] hover:text-[#e87500]" onClick={() => openAuthModal('login')} type="button">
                  Login
                </button>
                <button className="inline-flex min-h-8 items-center justify-center rounded-[3px] bg-[#ff8a00] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#e87500]" onClick={() => openAuthModal('register')} type="button">
                  Register
                </button>
                <Link className="inline-flex min-h-10 items-center gap-1 whitespace-nowrap px-2 text-sm font-black text-[#0077bd]" to="/recruiter">
                  Employer sign up <ChevronDown className="-rotate-90" size={15} />
                </Link>
              </>
            )}
          </div>

          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-[#0057B8] shadow-sm lg:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <div className={`lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <button aria-label="Close menu overlay" className={`fixed inset-0 z-[80] bg-slate-950/35 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} type="button" />
          <aside className={`fixed inset-y-0 right-0 z-[90] h-dvh w-80 max-w-[86vw] overflow-y-auto border-l border-[#0057B8]/10 bg-white px-4 py-4 shadow-2xl shadow-[#0057B8]/20 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white pb-3">
                <span className="rounded-[7px] bg-blue-50 px-3 py-2 text-sm font-black text-[#0057B8]">Menu</span>
                <button aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-700 transition hover:bg-blue-50 hover:text-[#0057B8]" onClick={() => setOpen(false)} type="button">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-2">
              {mobileNavItems.map((item) => (
                <NavLink className={({ isActive }) => `flex items-center justify-between gap-3 rounded-[7px] px-4 py-3 text-sm font-bold transition ${isActive ? 'bg-[#0057B8]/8 text-[#0057B8]' : 'text-slate-700 hover:bg-slate-50'}`} key={item.label} onClick={() => setOpen(false)} to={item.to}>
                  <span>{item.label}</span>
                  {item.label === 'Recruiter' && (
                    <span className="recruiter-offer-badge rounded-[7px] bg-rose-600 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      New Recruiter Offer
                    </span>
                  )}
                </NavLink>
              ))}
              {isUserAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-[7px] bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-blue-600 text-white">
                      <UserRound size={17} />
                    </span>
                    {user.name || 'Candidate'}
                  </div>
                  <MobileNotifications loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} user={user} />
                  {isCandidate && <Button onClick={() => setOpen(false)} to="/candidate-profile" variant="secondary">Profile</Button>}
                  <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : isRecruiterAccount ? (
                <div className="grid gap-2 pt-2">
                  <div className="flex items-center gap-3 rounded-[7px] bg-blue-50 px-4 py-3 text-sm font-black text-slate-950">
                    <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-blue-600 text-white">
                      <UserRound size={17} />
                    </span>
                    {user.name || 'Company'}
                  </div>
                  <MobileNotifications loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} user={user} />
                  <Button onClick={() => setOpen(false)} to={recruiterProfilePath} variant="secondary">Profile</Button>
                  <Button onClick={() => setOpen(false)} to={recruiterDashboardPath} variant="secondary">Dashboard</Button>
                  <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" onClick={logout} type="button">
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-2 pt-2">
                    <button className="nav-transparent-btn" onClick={() => openAuthModal('login')} type="button">Login</button>
                    <button className="inline-flex min-h-10 items-center justify-center rounded-[3px] bg-[#ff8a00] px-4 text-sm font-black text-white" onClick={() => openAuthModal('register')} type="button">Register</button>
                  </div>
                  <Button className="nav-post-job-btn" onClick={() => setOpen(false)} to="/post-job" variant="teal">Post Job</Button>
                </>
              )}
              </div>
          </aside>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <div className={hideFooterOnMobile ? 'hidden lg:block' : ''}>
      {isRecruiterAccount ? <EmployerFooter /> : <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-12 lg:px-8">
          <div className="hidden overflow-hidden rounded-[7px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 shadow-xl shadow-blue-100/50 sm:block">
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
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-7 py-7 sm:gap-10 sm:py-12 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr_1.1fr]">
            <div className="col-span-3 lg:col-span-1">
              <Link className="flex min-w-0 items-center font-black text-slate-950" to="/">
                {branding.logoUrl ? (
                  <img className="h-12 w-auto max-w-[190px] object-contain sm:h-16 sm:max-w-[240px]" src={branding.logoUrl} alt={branding.siteName || 'Cromgen Rozgar'} />
                ) : (
                  <>
                    <span className="grid h-10 w-10 place-items-center sm:h-12 sm:w-12"><BriefcaseBusiness size={23} /></span>
                    <span className="text-lg sm:text-xl">{branding.siteName || 'Cromgen Rozgar'}</span>
                  </>
                )}
              </Link>
              <p className="mt-3 max-w-sm text-xs leading-6 text-slate-500 sm:mt-4 sm:text-sm sm:leading-7">
                A modern enterprise job portal for candidates, recruiters, HR teams, and growing companies.
              </p>
              <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 sm:mt-5 sm:gap-3 sm:text-sm">
                <p className="flex items-center gap-3"><ShieldCheck className="text-teal-500" size={18} /> Verified company ecosystem</p>
                <p className="flex items-center gap-3"><Sparkles className="text-blue-600" size={18} /> Premium candidate experience</p>
                <p className="flex items-center gap-3"><Users className="text-violet-500" size={18} /> Recruiter-ready dashboards</p>
              </div>
              <SocialLinks links={socialLinks} />
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
              <div className="hidden sm:block">
                <FooterColumn
                  title="Recruiter"
                  links={[
                    ['Recruiter Dashboard', recruiterDashboardPath],
                    ['Post a Job', '/post-job'],
                    ['Applications', recruiterDashboardPath],
                    ['Company Profile', '/companies'],
                  ]}
                />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-[11px] font-black uppercase leading-4 tracking-wide text-slate-950 sm:text-sm">Contact & Updates</h3>
              <div className="mt-3 grid gap-2 text-[10px] leading-4 text-slate-500 sm:mt-4 sm:gap-3 sm:text-sm">
                <p className="min-w-0 break-words sm:flex sm:items-center sm:gap-3"><Mail className="hidden text-blue-600 sm:block" size={18} /> support@cromgenrozgar.com</p>
                <p className="min-w-0 break-words sm:flex sm:items-center sm:gap-3"><Phone className="hidden text-blue-600 sm:block" size={18} /> {branding.tollFreeNumber || '+91 98765 43210'}</p>
                <p className="min-w-0 break-words sm:flex sm:items-center sm:gap-3"><MessageCircle className="hidden text-blue-600 sm:block" size={18} /> Chat with our support team</p>
                <p className="min-w-0 break-words sm:flex sm:items-center sm:gap-3"><MapPin className="hidden text-blue-600 sm:block" size={18} /> New Delhi, India</p>
              </div>
              <div className="mt-5 hidden rounded-[7px] border border-slate-200 bg-slate-50 p-3 sm:block">
                <p className="mb-3 text-sm font-bold text-slate-800">Get hiring insights</p>
                <form className="flex gap-2" onSubmit={subscribeNewsletter}>
                  <input
                    className="min-w-0 flex-1 rounded-[7px] border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 sm:px-4"
                    disabled={newsletterLoading}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    placeholder="Email address"
                    type="email"
                    value={newsletterEmail}
                  />
                  <button className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-blue-600 text-white shadow-lg shadow-blue-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={newsletterLoading} type="submit" aria-label="Subscribe to hiring insights">
                    {newsletterLoading ? <span className="h-4 w-4 animate-spin rounded-[7px] border-2 border-white/40 border-t-white" /> : <Send size={17} />}
                  </button>
                </form>
                <p className={`mt-3 text-xs font-bold ${newsletterStatus.type === 'error' ? 'text-rose-600' : newsletterStatus.type === 'success' ? 'text-teal-700' : 'text-slate-500'}`}>
                  {newsletterStatus.message || 'Subscribe for latest jobs, hiring trends, and recruiter updates.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:pt-6 sm:text-sm md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {['10,000+ Jobs', '5,000+ Candidates', '1,000+ Companies', '500+ Recruiters'].map((item) => (
                <span className="rounded-[7px] bg-slate-100 px-2.5 py-1 text-center font-bold text-slate-600 sm:px-3" key={item}>{item}</span>
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
      <AuthModal
        initialMode={authModalMode || 'login'}
        onClose={() => setAuthModalMode('')}
        onSuccess={() => setUser(getStoredUser())}
        open={Boolean(authModalMode)}
      />
      {appBannerOpen && <FloatingAppBanner onClose={() => setAppBannerOpen(false)} />}
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
      description: 'Complete your profile and resume before applying for jobs.',
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
      description: 'Track your application status and recruiter updates.',
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
      description: 'Review interview and selected-stage applications.',
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
      description: 'Review saved jobs and apply.',
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
      description: 'Alert preferences are active for matching jobs.',
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
      description: 'Your account is ready for support, jobs, and profile access.',
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
      description: 'Review candidates, shortlist them, and move them to the interview stage.',
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
      description: 'View job posting wallet and package details.',
      to: '/recruiter-pricing',
      icon: Wallet,
      tone: Number(wallet.coinBalance || 0) > 0 ? 'emerald' : 'rose',
      meta: wallet.packageSnapshot?.name || 'Wallet',
    })
  } else {
    items.push({
      id: 'recruiter-header-package',
      title: 'Package activation required',
      description: 'Activate a recruiter package to post jobs.',
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
        className="relative grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        onClick={() => {
          setOpen((value) => !value)
          setProfileOpen(false)
        }}
        type="button"
      >
        <Bell size={19} />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-[7px] bg-teal-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
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
    <div className={`${floating ? 'absolute right-0 top-14 z-50 w-[24rem] max-w-[calc(100vw-2rem)] shadow-2xl shadow-blue-100' : 'w-full'} rounded-[7px] border border-slate-200 bg-white p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-slate-950">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button className="rounded-[7px] bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-rose-50 hover:text-rose-700" onClick={onClear} type="button">Clear</button>
          )}
          <span className="rounded-[7px] bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{role || 'User'} live</span>
        </div>
      </div>
      {loading ? (
        <div className="rounded-[7px] bg-slate-50 p-4 text-sm font-bold text-slate-500">Loading notifications...</div>
      ) : notifications.length ? (
        <div className="grid max-h-[26rem] gap-2 overflow-y-auto pr-1">
          {notifications.map((item) => {
            const Icon = item.icon
            return (
              <Link className="group rounded-[7px] border border-slate-100 bg-white p-3 transition hover:border-blue-100 hover:bg-blue-50/50" key={item.id} to={item.to}>
                <div className="flex gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[7px] ring-1 ${getRoleNotificationTone(item.tone)}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-black text-slate-950">{item.title}</span>
                      <span className="shrink-0 rounded-[7px] bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400 group-hover:bg-white">{item.meta}</span>
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-slate-500">{item.description}</span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[7px] bg-slate-50 p-4">
          <p className="font-black text-slate-950">All clear</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">There are no new notifications for your role.</p>
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
        className="inline-flex min-h-11 items-center gap-3 rounded-[7px] bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-white/15 text-white">
          <UserRound size={16} />
        </span>
        {user.name || 'Company'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 rounded-[7px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          {[
            ['Profile', recruiterProfilePath],
            ['Dashboard', recruiterDashboardPath],
          ].map(([label, to]) => (
            <Link className="flex items-center gap-3 rounded-[7px] px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" key={label} onClick={() => setOpen(false)} to={to}>
              <UserRound size={17} />
              {label}
            </Link>
          ))}
          <button className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
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
        className="inline-flex min-h-11 items-center gap-3 rounded-[7px] bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-white/15 text-white">
          <UserRound size={16} />
        </span>
        {user.name || 'Candidate'}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 rounded-[7px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70">
          <Link className="flex items-center gap-3 rounded-[7px] px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)} to="/candidate-profile">
            <UserRound size={17} />
            Profile
          </Link>
          <button className="flex w-full items-center gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
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
    <div className="min-w-0">
      <h3 className="text-[11px] font-black uppercase leading-4 tracking-wide text-slate-950 sm:text-sm">{title}</h3>
      <div className="mt-3 grid gap-2 text-[11px] font-medium leading-4 text-slate-500 sm:mt-4 sm:space-y-3 sm:text-sm">
        {links.map(([label, to]) => (
          <Link className="block min-w-0 break-words transition hover:translate-x-1 hover:text-blue-600" key={label} to={to}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function FloatingAppBanner({ onClose }) {
  const qrCells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 1, 1, 1, 0, 1, 1, 0, 1,
    0, 1, 0, 0, 1, 0, 1, 1, 0,
    1, 0, 1, 1, 1, 0, 0, 1, 1,
    0, 1, 0, 1, 0, 1, 1, 0, 0,
    1, 0, 1, 0, 1, 1, 0, 1, 1,
    1, 1, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 1, 1,
  ]

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 max-w-[430px] overflow-hidden rounded-[12px] bg-white shadow-2xl shadow-slate-950/25 ring-1 ring-slate-200 sm:left-6 sm:right-auto">
      <div className="inline-flex rounded-br-[8px] bg-gradient-to-r from-[#ff4f62] to-[#ff2b91] px-4 py-2 text-sm font-black text-white">
        Download the App!
      </div>
      <button
        aria-label="Close app download banner"
        className="absolute right-3 top-11 grid h-8 w-8 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        onClick={onClose}
        type="button"
      >
        <X size={18} />
      </button>
      <div className="grid grid-cols-[112px_1fr] gap-4 px-4 pb-4 pt-4 sm:px-5">
        <div className="border-r border-slate-200 pr-4">
          <div className="mx-auto grid h-[78px] w-[78px] grid-cols-9 gap-[2px] rounded-[5px] bg-white p-1.5 ring-1 ring-slate-200">
            {qrCells.map((filled, index) => (
              <span className={filled ? 'bg-black' : 'bg-white'} key={index} />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate-600">Scan the QR</p>
        </div>
        <div className="min-w-0 pr-8">
          <div className="grid grid-cols-2 divide-x divide-slate-200 text-center">
            <div className="px-2">
              <p className="inline-flex items-center gap-1 text-base font-black text-slate-800">4.4 <Star className="fill-[#ffb000] text-[#ffb000]" size={15} /></p>
              <p className="mt-1 text-xs font-semibold text-slate-500">42K Reviews</p>
            </div>
            <div className="px-2">
              <p className="inline-flex items-center gap-1 text-base font-black text-slate-800">50L+ <Download size={14} /></p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Downloads</p>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3 text-center">
            <p className="text-xs font-semibold text-slate-500">Available on</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="inline-flex h-7 items-center rounded-[5px] bg-slate-950 px-2 text-[10px] font-black leading-none text-white">Google Play</span>
              <span className="text-lg font-black text-slate-500"></span>
              <span className="h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#30b85a]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialLinks({ links }) {
  const visibleLinks = links.filter((item) => item.url)
  if (!visibleLinks.length) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
      {visibleLinks.map((item) => {
        const tone = getSocialTone(item.platform)
        return (
          <a
            aria-label={item.label || item.platform}
            className={`grid h-9 w-9 place-items-center rounded-[7px] transition sm:h-10 sm:w-10 ${tone}`}
            href={item.url}
            key={`${item.platform}-${item.url}`}
            rel="noreferrer"
            target="_blank"
            title={item.label || item.platform}
          >
            <SocialGlyph platform={item.platform} />
          </a>
        )
      })}
    </div>
  )
}

function SocialGlyph({ platform = '' }) {
  const key = platform.toLowerCase()
  if (key.includes('facebook')) return <span className="text-sm font-black">f</span>
  if (key.includes('instagram')) return <span className="text-sm font-black">◎</span>
  if (key.includes('linkedin')) return <span className="text-sm font-black">in</span>
  if (key.includes('youtube')) return <span className="text-sm font-black">▶</span>
  if (key.includes('twitter') || key === 'x') return <span className="text-sm font-black">X</span>
  if (key.includes('whatsapp')) return <MessageCircle size={18} />
  return <Share2 size={18} />
}

function getSocialTone(platform = '') {
  const key = platform.toLowerCase()
  if (key.includes('facebook')) return 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white'
  if (key.includes('instagram')) return 'bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white'
  if (key.includes('linkedin')) return 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white'
  if (key.includes('youtube')) return 'bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white'
  if (key.includes('twitter') || key === 'x') return 'bg-slate-900/10 text-slate-900 hover:bg-slate-900 hover:text-white'
  if (key.includes('whatsapp')) return 'bg-[#25D366]/10 text-[#1FA855] hover:bg-[#25D366] hover:text-white'
  return 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'
}
