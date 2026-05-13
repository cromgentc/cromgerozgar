import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CreditCard,
  Database,
  FileCheck2,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Sun,
  Search,
  Settings,
  UsersRound,
  X,
} from 'lucide-react'
import { adminRoles } from '../data/adminData'

const sidebarItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, roles: ['Admin'] },
  { label: 'User Management', to: '/admin/users', icon: UsersRound, roles: ['Admin'] },
  { label: 'Jobs Management', to: '/admin/jobs', icon: BriefcaseBusiness, roles: ['Admin'] },
  { label: 'Companies', to: '/admin/companies', icon: Building2, roles: ['Admin'] },
  { label: 'Recruiters', to: '/admin/employers', icon: Building2, roles: ['Admin'] },
  { label: 'Candidates', to: '/admin/candidates', icon: UsersRound, roles: ['Admin'] },
  { label: 'Applications', to: '/admin/applications', icon: FileCheck2, roles: ['Admin'] },
  { label: 'Resume Database', to: '/admin/resumes', icon: Database, roles: ['Admin'] },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree, roles: ['Admin'] },
  { label: 'Locations', to: '/admin/locations', icon: MapPin, roles: ['Admin'] },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard, roles: ['Admin'] },
  { label: 'Reports', to: '/admin/reports', icon: FileCheck2, roles: ['Admin'] },
  { label: 'Settings', to: '/admin/settings', icon: Settings, roles: ['Admin'] },
]

const employerSidebarItems = [
  { label: 'Dashboard', to: '/recruiter-dashboard', icon: LayoutDashboard },
  { label: 'Post a Job', to: '/post-job', icon: BriefcaseBusiness },
  { label: 'Recruiter Profile', to: '/recruiter-profile', icon: Building2 },
  { label: 'Applications', to: '/recruiter-dashboard', icon: FileCheck2 },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [lightActive, setLightActive] = useState(true)
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
              <button
                className={`hidden h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold sm:inline-flex ${lightActive ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}
                onClick={() => setLightActive((value) => !value)}
                type="button"
              >
                {lightActive ? <Sun size={17} /> : <Moon size={17} />} {lightActive ? 'Light On' : 'Light'}
              </button>
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
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-white" />
                </button>
                {notificationsOpen && <NotificationMenu />}
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

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NotificationMenu() {
  const items = [
    '12 new applications received',
    '4 recruiter accounts need review',
    '2 payments marked as failed',
    'Candidate shortlist updated',
  ]

  return (
    <div className="absolute right-0 top-14 z-50 w-80 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-slate-950">Notifications</h3>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">Live</span>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <button className="rounded-2xl bg-slate-50 p-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700" key={item} type="button">
            {item}
          </button>
        ))}
      </div>
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
  const navigate = useNavigate()
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
      <div className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Role access</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(isEmployer ? ['Recruiter'] : adminRoles).map((role) => <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm" key={role}>{role}</span>)}
          </div>
        </div>
      </div>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {items.length ? (
          items.map((item) => {
            const Icon = item.icon
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
