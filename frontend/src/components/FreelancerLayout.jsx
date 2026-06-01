import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BriefcaseBusiness, Menu, X } from 'lucide-react'
import { useSiteBranding } from '../utils/siteBranding'
import { getStoredUser } from '../routes/authRouting'

const freelancerNav = [
  ['Home', '/freelancer'],
  ['Projects', '/freelancer/projects'],
]

export function FreelancerLayout() {
  const [open, setOpen] = useState(false)
  const branding = useSiteBranding()
  const user = getStoredUser()
  const isFreelancerLoggedIn = user?.role === 'freelancer'
  const mainActionPath = isFreelancerLoggedIn ? '/admin/projects' : '/'

  const handleNavClick = () => {
    setOpen(false)
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-[#0057B8]/10 bg-white/92 shadow-sm shadow-[#0057B8]/10 backdrop-blur-xl">
        <nav className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="site-logo-lockup flex min-w-0 items-center font-black text-slate-950" onClick={handleNavClick} to="/freelancer">
            {branding.logoUrl ? (
              <span className="site-logo-frame">
                <img className="site-logo-img" src={branding.logoUrl} alt={branding.siteName || 'Cromgen Rozgar Freelancer'} />
              </span>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center"><BriefcaseBusiness size={22} /></span>
                <span className="text-xl">{branding.siteName || 'Cromgen Rozgar'}</span>
              </>
            )}
          </Link>

          <div className="hidden items-center justify-center gap-2 lg:flex">
            {freelancerNav.map(([label, to]) => (
              <NavLink
                className={({ isActive }) => `group relative rounded-[7px] px-4 py-2 text-sm font-black transition ${
                  isActive ? 'bg-orange-50 text-[#ff8a00]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#ff8a00]'
                }`}
                key={label}
                onClick={handleNavClick}
                to={to}
              >
                {label}
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 scale-x-0 rounded-[7px] bg-[#ff8a00] transition group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link className="inline-flex min-h-8 items-center justify-center rounded-[3px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-black transition hover:bg-[#fff4e6]" onClick={handleNavClick} to={mainActionPath}>{isFreelancerLoggedIn ? 'Dashboard' : 'Main Site'}</Link>
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-700 lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Open menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <div className={`lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <button aria-label="Close menu overlay" className={`fixed inset-0 z-[80] bg-slate-950/35 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} type="button" />
          <aside className={`fixed inset-y-0 right-0 z-[90] h-dvh w-80 max-w-[86vw] overflow-y-auto border-l border-[#0057B8]/10 bg-white px-4 py-4 shadow-2xl shadow-[#0057B8]/20 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white pb-3">
              <span className="rounded-[7px] bg-blue-50 px-3 py-2 text-sm font-black text-[#0057B8]">Menu</span>
              <button aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-700" onClick={() => setOpen(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-2">
              {freelancerNav.map(([label, to]) => (
                <NavLink
                  className={({ isActive }) => `rounded-[7px] px-4 py-3 text-sm font-black ${
                    isActive ? 'bg-orange-50 text-[#ff8a00]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  key={label}
                  onClick={handleNavClick}
                  to={to}
                >
                  {label}
                </NavLink>
              ))}
              <div className="grid gap-2 pt-2">
                <Link className="inline-flex min-h-10 items-center justify-center rounded-[3px] border border-[#ff8a00] bg-[white] px-4 text-sm font-black text-black transition hover:bg-[#fff4e6]" onClick={handleNavClick} to={mainActionPath}>{isFreelancerLoggedIn ? 'Dashboard' : 'Main Site'}</Link>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-[#0057B8]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-3 py-5 text-xs font-semibold text-slate-500 sm:flex sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 sm:text-sm lg:px-8">
          <p className="leading-5">(c) 2026 Cromgen Rozgar Freelancer Portal. All rights reserved.</p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link className="hover:text-[#ff8a00]" onClick={handleNavClick} to="/freelancer/projects">Projects</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
