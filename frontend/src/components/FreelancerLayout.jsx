import { Link, Outlet } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'

export function FreelancerLayout() {
  const handleNavClick = () => {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <SiteHeader variant="freelancer" />

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-[#0057B8]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-3 py-5 text-xs font-semibold text-slate-500 sm:flex sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 sm:text-sm lg:px-8">
          <p className="leading-5">(c) 2026 Cromgen Rozgar Freelancer Portal. All rights reserved.</p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link className="hover:text-[#ff8a00]" onClick={handleNavClick} to="/freelancer/projects">Projects</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/about">About Us</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/press-news">Press / News</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/freelancer/privacy">Privacy</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/freelancer/terms">Terms</Link>
            <Link className="hover:text-[#0057B8]" onClick={handleNavClick} to="/freelancer/support">Support Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
