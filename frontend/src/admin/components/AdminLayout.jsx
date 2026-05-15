import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Send,
  Sun,
  Search,
  Star,
  Wallet,
  UsersRound,
  X,
} from 'lucide-react'
import { adminRoles } from '../data/adminData'
import { api } from '../../services/api'

const sidebarItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, roles: ['Admin'] },
  {
    label: 'User Management',
    to: '/admin/users',
    icon: UsersRound,
    roles: ['Admin'],
    children: [
      { label: 'All Users', to: '/admin/users', icon: UsersRound },
      { label: 'User', to: '/admin/users?role=users', icon: UsersRound },
      { label: 'Admin', to: '/admin/users?role=Admin', icon: UsersRound },
      { label: 'Staff', to: '/admin/users?role=staff', icon: UsersRound },
      { label: 'Recruiter', to: '/admin/users?role=recruiter', icon: UsersRound },
    ],
  },
  { label: 'Jobs Management', to: '/admin/jobs', icon: BriefcaseBusiness, roles: ['Admin'] },
  {
    label: 'Recruiters',
    to: '/admin/employers',
    icon: Building2,
    roles: ['Admin'],
    children: [
      { label: 'Recruiter Management', to: '/admin/employers', icon: Building2 },
      { label: 'Recruiter Documents', to: '/admin/recruiter-documents', icon: FileCheck2 },
    ],
  },
  { label: 'Candidates', to: '/admin/candidates', icon: UsersRound, roles: ['Admin'] },
  { label: 'Applications', to: '/admin/applications', icon: FileCheck2, roles: ['Admin'] },
  {
    label: 'Website Content',
    to: '/admin/testimonials',
    icon: Star,
    roles: ['Admin'],
    children: [
      { label: 'Testimonials', to: '/admin/testimonials', icon: Star },
      { label: 'FAQs', to: '/admin/faqs', icon: HelpCircle },
      { label: 'Policy', to: '/admin/policy', icon: FileText },
      { label: 'Hiring Insights', to: '/admin/hiring-insights', icon: Send },
      { label: 'Support Messages', to: '/admin/support-messages', icon: MessageCircle },
    ],
  },
  {
    label: 'Package',
    to: '/admin/package/pricing',
    icon: CreditCard,
    roles: ['Admin'],
    children: [
      { label: 'Pricing', to: '/admin/package/pricing', icon: CreditCard },
      { label: 'Discount Coupon', to: '/admin/package/discount-coupons', icon: CreditCard },
    ],
  },
  {
    label: 'Settings',
    to: '/admin/settings/google-auth',
    icon: Globe2,
    roles: ['Admin'],
    children: [
      { label: 'Google Auth API', to: '/admin/settings/google-auth', icon: Globe2 },
    ],
  },
]

const employerSidebarItems = [
  { label: 'Dashboard', to: '/recruiter-dashboard', icon: LayoutDashboard },
  { label: 'Post a Job', to: '/post-job', icon: BriefcaseBusiness },
  { label: 'Applications', to: '/recruiter-applications', icon: ClipboardList },
  { label: 'Pricing', to: '/recruiter-pricing', icon: CreditCard },
  { label: 'Profile', to: '/recruiter-profile', icon: UsersRound },
  { label: 'Resources', to: '/recruiter-resources', icon: FileCheck2 },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [clearedNotificationIds, setClearedNotificationIds] = useState([])
  const [lightActive, setLightActive] = useState(true)
  const [wallet, setWallet] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = getStoredAdminUser()
  const isEmployer = user?.role === 'recruiter'
  const searchValue = searchParams.get('search') || ''
  const crumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((item) => item.replace(/-/g, ' '))

  useEffect(() => {
    if (!isEmployer || !user?.email) {
      setWallet(null)
      return
    }

    let mounted = true
    const loadWallet = () => {
      api
        .currentRecruiterPackage(user.email)
        .then((payload) => {
          if (mounted) setWallet(payload.data || null)
        })
        .catch(() => {
          if (mounted) setWallet(null)
        })
    }

    loadWallet()
    window.addEventListener('focus', loadWallet)
    window.addEventListener('recruiter-wallet-updated', loadWallet)

    return () => {
      mounted = false
      window.removeEventListener('focus', loadWallet)
      window.removeEventListener('recruiter-wallet-updated', loadWallet)
    }
  }, [isEmployer, user?.email])

  useEffect(() => {
    if (!user?.email) {
      setNotifications([])
      setClearedNotificationIds([])
      return
    }

    try {
      setClearedNotificationIds(JSON.parse(localStorage.getItem(getNotificationClearKey(user)) || '[]'))
    } catch {
      setClearedNotificationIds([])
    }

    let mounted = true
    const loadNotifications = async () => {
      setNotificationsLoading(true)
      try {
        const [dashboardPayload, walletPayload] = isEmployer
          ? await Promise.all([
              api.employerDashboard(user.email),
              api.currentRecruiterPackage(user.email).catch(() => ({ data: null })),
            ])
          : await Promise.all([
              api.adminDashboard(),
              Promise.resolve({ data: null }),
            ])
        if (!mounted) return

        const nextNotifications = isEmployer
          ? buildRecruiterNotifications({
              dashboard: dashboardPayload.data || {},
              wallet: walletPayload.data || null,
            })
          : buildAdminNotifications(dashboardPayload.data || {})
        const clearedIds = JSON.parse(localStorage.getItem(getNotificationClearKey(user)) || '[]')
        setClearedNotificationIds(clearedIds)
        setNotifications(nextNotifications.filter((item) => !clearedIds.includes(item.id)))
      } catch {
        if (mounted) setNotifications([])
      } finally {
        if (mounted) setNotificationsLoading(false)
      }
    }

    loadNotifications()
    window.addEventListener('focus', loadNotifications)
    window.addEventListener('recruiter-wallet-updated', loadNotifications)

    return () => {
      mounted = false
      window.removeEventListener('focus', loadNotifications)
      window.removeEventListener('recruiter-wallet-updated', loadNotifications)
    }
  }, [isEmployer, user?.email, user?.role])

  const clearNotifications = () => {
    const ids = notifications.map((item) => item.id)
    const nextIds = [...new Set([...clearedNotificationIds, ...ids])]
    if (user?.email) {
      localStorage.setItem(getNotificationClearKey(user), JSON.stringify(nextIds))
    }
    setClearedNotificationIds(nextIds)
    setNotifications([])
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    navigate('/auth', { replace: true })
  }

  const updateSearch = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('search', value)
    else next.delete('search')
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar isEmployer={isEmployer} mobileOpen={open} onClose={() => setOpen(false)} role={user?.role} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white lg:hidden" onClick={() => setOpen(true)} type="button">
                <Menu size={20} />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {crumbs.map((crumb, index) => (
                    <span className="capitalize" key={crumb}>{index > 0 ? `/ ${crumb}` : crumb}</span>
                  ))}
                </div>
                <h1 className="mt-1 text-xl font-black text-slate-950">{isEmployer ? 'Recruiter Control Center' : 'Admin Control Center'}</h1>
              </div>
            </div>

            <div className="hidden flex-1 justify-center px-8 md:flex">
              <label className="flex w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <Search size={18} className="text-blue-600" />
                <input className="w-full bg-transparent outline-none" onChange={(event) => updateSearch(event.target.value)} placeholder="Search jobs, recruiters, candidates..." value={searchValue} />
              </label>
            </div>

            <div className="flex items-center gap-2">
              {isEmployer && (
                <Link
                  className="hidden h-11 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-100 sm:inline-flex"
                  to="/recruiter"
                >
                  <ExternalLink size={17} />
                  Visit Recruiter Website
                </Link>
              )}
              {isEmployer ? (
                <Link
                  className="hidden h-11 items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 text-sm font-bold text-teal-700 transition hover:bg-teal-100 sm:inline-flex"
                  to="/recruiter-pricing"
                >
                  <Wallet size={17} />
                  Wallet: {wallet?.coinBalance || 0} coins
                </Link>
              ) : (
                <button
                  className={`hidden h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold sm:inline-flex ${lightActive ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
                  onClick={() => setLightActive((value) => !value)}
                  type="button"
                >
                  {lightActive ? <Sun size={17} /> : <Moon size={17} />} {lightActive ? 'Light On' : 'Light'}
                </button>
              )}
              <div className="relative">
                <button
                  className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600"
                  onClick={() => {
                    setNotificationsOpen((value) => !value)
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
                {notificationsOpen && <NotificationMenu isEmployer={isEmployer} loading={notificationsLoading} notifications={notifications} onClear={clearNotifications} />}
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3"
                  onClick={() => {
                    setProfileOpen((value) => !value)
                    setNotificationsOpen(false)
                  }}
                  type="button"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-black text-white">{getInitials(user?.name || user?.role || 'AD')}</span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</span>
                    <span className="block text-xs text-slate-500">{user?.role || 'Admin'} - Online</span>
                  </span>
                  <ChevronDown className={`hidden text-slate-400 transition sm:block ${profileOpen ? 'rotate-180' : ''}`} size={16} />
                </button>
                {profileOpen && <ProfileMenu isEmployer={isEmployer} logout={logout} user={user} />}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function buildRecruiterNotifications({ dashboard = {}, wallet = null }) {
  const metrics = dashboard.metrics || {}
  const applications = Array.isArray(dashboard.applications) ? dashboard.applications : []
  const items = []

  if (Number(metrics.activeApplications || 0) > 0) {
    items.push({
      id: 'active-applications',
      title: `${metrics.activeApplications} active applications`,
      description: 'New, reviewed, aur interview stage candidates pending hain.',
      to: '/recruiter-applications?status=active',
      icon: ClipboardList,
      tone: 'blue',
      meta: 'Live pipeline',
    })
  }

  if (Number(metrics.shortlistedCandidates || 0) > 0) {
    items.push({
      id: 'shortlisted',
      title: `${metrics.shortlistedCandidates} shortlisted candidates`,
      description: 'Shortlisted candidates ko next hiring step par move karein.',
      to: '/recruiter-applications?status=shortlisted',
      icon: UsersRound,
      tone: 'teal',
      meta: 'Candidate stage',
    })
  }

  if (Number(metrics.interviewSchedule || 0) > 0) {
    items.push({
      id: 'interviews',
      title: `${metrics.interviewSchedule} interview invites`,
      description: 'Interview stage candidates ko track karein.',
      to: '/recruiter-applications?status=interview',
      icon: CalendarDays,
      tone: 'violet',
      meta: 'Schedule',
    })
  }

  if (wallet) {
    const coinBalance = Number(wallet.coinBalance || 0)
    const coinPerJob = Number(wallet.packageSnapshot?.coinPerJob || 10)
    items.push({
      id: 'wallet',
      title: `${coinBalance} wallet coins available`,
      description: coinBalance < coinPerJob ? `One job ke liye ${coinPerJob} coins required hain. Coins buy karein.` : 'Wallet ready hai, job post kar sakte hain.',
      to: '/recruiter-pricing',
      icon: Wallet,
      tone: coinBalance < coinPerJob ? 'rose' : 'emerald',
      meta: wallet.packageSnapshot?.name || 'Active package',
    })
  } else {
    items.push({
      id: 'package-required',
      title: 'Package not active',
      description: 'Job post aur wallet coins ke liye recruiter package activate karein.',
      to: '/recruiter-pricing',
      icon: CreditCard,
      tone: 'rose',
      meta: 'Action required',
    })
  }

  applications.slice(0, 3).forEach((application) => {
    items.push({
      id: application._id || `${application.candidateEmail}-${application.jobTitle}`,
      title: `${application.candidateName || 'Candidate'} applied`,
      description: `${application.jobTitle || 'Job'} / ${application.company || 'Company'} / ${application.status || 'New'}`,
      to: application.candidateEmail ? `/recruiter-applications/candidate/${encodeURIComponent(application.candidateEmail)}` : '/recruiter-applications',
      icon: FileCheck2,
      tone: 'slate',
      meta: application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recent',
    })
  })

  return items
}

function buildAdminNotifications(dashboard = {}) {
  const metrics = dashboard.metrics || {}
  const pendingReviews = Array.isArray(dashboard.pendingReviews) ? dashboard.pendingReviews : []
  const supportMessages = Array.isArray(dashboard.supportMessages) ? dashboard.supportMessages : []
  const recentJobs = Array.isArray(dashboard.recentJobs) ? dashboard.recentJobs : []
  const recentApplications = Array.isArray(dashboard.recentApplications) ? dashboard.recentApplications : []
  const items = []

  if (Number(metrics.pendingJobs || 0) > 0) {
    items.push({
      id: 'admin-pending-jobs',
      title: `${metrics.pendingJobs} jobs awaiting approval`,
      description: 'Account department ko pending job posts review karna hai.',
      to: '/admin/jobs',
      icon: BriefcaseBusiness,
      tone: 'blue',
      meta: 'Jobs',
    })
  }

  if (Number(metrics.rejectedJobs || 0) > 0) {
    items.push({
      id: 'admin-rejected-jobs',
      title: `${metrics.rejectedJobs} rejected jobs`,
      description: 'Rejected job posts aur remarks audit karein.',
      to: '/admin/jobs?status=Rejected',
      icon: FileCheck2,
      tone: 'rose',
      meta: 'Review',
    })
  }

  if (Number(metrics.pendingDocuments || 0) > 0) {
    items.push({
      id: 'admin-pending-documents',
      title: `${metrics.pendingDocuments} recruiter documents pending`,
      description: 'PAN, GST, offer letter, aur company document verification pending hai.',
      to: '/admin/recruiter-documents',
      icon: ClipboardList,
      tone: 'violet',
      meta: 'Documents',
    })
  }

  if (Number(metrics.openSupportMessages || 0) > 0) {
    items.push({
      id: 'admin-open-support',
      title: `${metrics.openSupportMessages} support messages open`,
      description: 'Candidate/recruiter support chats need response.',
      to: '/admin/support-messages',
      icon: MessageCircle,
      tone: 'teal',
      meta: 'Support',
    })
  }

  if (Number(metrics.activeSubscriptions || 0) > 0) {
    items.push({
      id: 'admin-active-packages',
      title: `${metrics.activeSubscriptions} active recruiter packages`,
      description: 'Recruiter package and wallet activity live hai.',
      to: '/admin/package/pricing',
      icon: CreditCard,
      tone: 'emerald',
      meta: 'Package',
    })
  }

  pendingReviews.slice(0, 2).forEach((document) => {
    items.push({
      id: `admin-document-${document._id}`,
      title: `${document.recruiterName || 'Recruiter'} document review`,
      description: `${document.documentType || 'Document'} / ${document.status || 'Pending'}`,
      to: `/admin/recruiter-documents/${document._id}`,
      icon: FileCheck2,
      tone: 'slate',
      meta: 'KYC',
    })
  })

  supportMessages.slice(0, 2).forEach((message) => {
    items.push({
      id: `admin-support-${message._id}`,
      title: `${message.name || 'User'} support chat`,
      description: `${message.subject || 'Support message'} / ${message.status || 'Open'}`,
      to: `/admin/support-messages/${message._id}`,
      icon: MessageCircle,
      tone: 'rose',
      meta: 'Chat',
    })
  })

  recentJobs.slice(0, 2).forEach((job) => {
    items.push({
      id: `admin-job-${job._id}`,
      title: `${job.title || 'Job'} posted`,
      description: `${job.company || 'Company'} / ${job.location || 'Location'} / ${job.approval || job.accountDepartmentStatus || job.status || 'Pending'}`,
      to: '/admin/jobs',
      icon: BriefcaseBusiness,
      tone: 'blue',
      meta: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent',
    })
  })

  recentApplications.slice(0, 2).forEach((application) => {
    items.push({
      id: `admin-application-${application._id}`,
      title: `${application.candidateName || 'Candidate'} application`,
      description: `${application.jobTitle || 'Job'} / ${application.company || 'Company'} / ${application.status || 'New'}`,
      to: '/admin/applications',
      icon: UsersRound,
      tone: 'teal',
      meta: application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recent',
    })
  })

  return items
}

function getNotificationClearKey(user = {}) {
  const role = user.role || 'user'
  const email = String(user.email || '').toLowerCase()
  return `${role}NotificationsCleared:${email}`
}

function getNotificationTone(tone) {
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

function NotificationMenu({ isEmployer, loading, notifications, onClear }) {
  const items = notifications

  return (
    <div className="absolute right-0 top-14 z-50 w-[24rem] max-w-[calc(100vw-2rem)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-slate-950">Notifications</h3>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-rose-50 hover:text-rose-700" onClick={onClear} type="button">
              Clear
            </button>
          )}
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">{isEmployer ? 'Recruiter live' : 'Admin live'}</span>
        </div>
      </div>
      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Loading recruiter notifications...</div>
      ) : items.length ? (
        <div className="grid max-h-[26rem] gap-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link className="group rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-blue-100 hover:bg-blue-50/50" key={item.id} to={item.to}>
                <div className="flex gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${getNotificationTone(item.tone)}`}>
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
          <p className="mt-1 text-sm font-semibold text-slate-500">Abhi recruiter workspace mein koi new notification nahi hai.</p>
        </div>
      )}
    </div>
  )
}

function ProfileMenu({ isEmployer, logout, user }) {
  const profilePath = isEmployer ? '/recruiter-profile' : '/admin'

  return (
    <div className="absolute right-0 top-14 z-50 w-72 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-100">
      <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-sm font-black text-white">{getInitials(user?.name || user?.role || 'AD')}</span>
        <div>
          <p className="font-black text-slate-950">{user?.name || 'Admin User'}</p>
          <p className="text-sm font-semibold text-blue-700">{user?.role || 'Admin'}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        <Link className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50" to={profilePath}>Profile</Link>
        <Link className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50" to={profilePath}>Account Settings</Link>
        <button className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </div>
  )
}

function AdminSidebar({ isEmployer, mobileOpen, onClose, role }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent isEmployer={isEmployer} role={role} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button aria-label="Close sidebar overlay" className="absolute inset-0 bg-slate-900/30" onClick={onClose} type="button" />
          <aside className="relative h-full w-80 max-w-[86vw] border-r border-slate-200 bg-white shadow-2xl">
            <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-100" onClick={onClose} type="button">
              <X size={18} />
            </button>
            <SidebarContent isEmployer={isEmployer} role={role} />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarContent({ isEmployer, role }) {
  const [openGroups, setOpenGroups] = useState({})
  const navigate = useNavigate()
  const location = useLocation()
  const items = isEmployer ? employerSidebarItems : role === 'Admin' ? sidebarItems : []

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    navigate('/auth', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <Link className="flex items-center gap-3 px-6 py-5" to={isEmployer ? '/recruiter-dashboard' : '/admin'}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-100">
          <BriefcaseBusiness size={23} />
        </span>
        <span>
          <span className="block text-lg font-black text-slate-950">{isEmployer ? 'Rozgar Recruiter' : 'Rozgar Admin'}</span>
          <span className="block text-xs font-semibold text-slate-500">{isEmployer ? 'Hiring panel' : 'Enterprise panel'}</span>
        </span>
      </Link>
      {!isEmployer && (
        <div className="px-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Role access</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {adminRoles.map((role) => <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm" key={role}>{role}</span>)}
            </div>
          </div>
        </div>
      )}
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {items.length ? (
          items.map((item) => {
            const Icon = item.icon

            if (item.children?.length) {
              const isExpanded = openGroups[item.label]
              const currentPath = `${location.pathname}${location.search}`
              const isGroupActive = item.children.some((child) => location.pathname === child.to.split('?')[0])

              return (
                <div key={item.label}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isGroupActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                    onClick={() => setOpenGroups((current) => ({ ...current, [item.label]: !isExpanded }))}
                    type="button"
                  >
                    <Icon size={19} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={`transition ${isExpanded ? 'rotate-180' : ''}`} size={16} />
                  </button>
                  {isExpanded && (
                    <div className="mt-1 grid gap-1 pl-5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon

                        return (
                          <NavLink
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                                isActive && currentPath === child.to ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
                              }`
                            }
                            key={child.label}
                            to={child.to}
                          >
                            <ChildIcon size={17} /> {child.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
                end={item.to === '/admin'}
                key={item.label}
                to={item.to}
              >
                <Icon size={19} /> {item.label}
              </NavLink>
            )
          })
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
            {isEmployer ? 'Recruiter workspace' : `${role || 'User'} dashboard access only`}
          </div>
        )}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50" onClick={logout} type="button">
          <LogOut size={19} /> Logout
        </button>
      </div>
    </div>
  )
}

function getStoredAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

function getInitials(value) {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
