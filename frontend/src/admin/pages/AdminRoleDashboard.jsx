import { useCallback, useState } from 'react'
import { AdminDashboard } from './AdminDashboard'

export function AdminRoleDashboard({ role }) {
  const [refreshDashboard, setRefreshDashboard] = useState(null)

  const handleRefreshReady = useCallback((handler) => {
    setRefreshDashboard(() => handler)
  }, [])

  return (
    <div className="grid gap-6">
      <AdminDashboard onRefreshReady={handleRefreshReady} />
    </div>
  )
}
