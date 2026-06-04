import { Outlet } from 'react-router-dom'
import { SiteHeader } from '../../components/SiteHeader'
import { EmployerFooter } from './EmployerFooter'

export function EmployerLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader variant="recruiter" />

      <main>
        <Outlet />
      </main>

      <EmployerFooter />
    </div>
  )
}
