import { useEffect, useState } from 'react'
import { AdminCard, StatusBadge, Toolbar } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const roles = ['Admin', 'staff', 'recruiter', 'users', 'hiring', 'account team']

const modules = [
  'Dashboard',
  'User Management',
  'Jobs Management',
  'Recruiters',
  'Candidates',
  'Hiring Team',
  'Applications',
  'Website Content',
  'Package',
  'Payments',
  'Plugins',
  'Reports',
  'Settings',
]

const defaultPermissions = {
  Admin: modules,
  staff: ['Dashboard', 'Jobs Management', 'Recruiters', 'Candidates', 'Applications', 'Website Content'],
  recruiter: ['Dashboard', 'Jobs Management', 'Applications', 'Package', 'Payments'],
  users: ['Dashboard'],
  hiring: ['Hiring Team', 'Applications', 'Candidates'],
  'account team': ['Jobs Management', 'Recruiters', 'Payments'],
}

export function AdminRolePermissionPage() {
  const [settingId, setSettingId] = useState('')
  const [permissions, setPermissions] = useState(defaultPermissions)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadPermissions = () => {
    setLoading(true)
    setMessage('')
    api
      .list('settings', '?search=rolePermissions&limit=10')
      .then((payload) => {
        const setting = (payload.data || []).find((item) => item.key === 'rolePermissions')
        setSettingId(setting?._id || '')
        setPermissions({ ...defaultPermissions, ...(setting?.value?.permissions || {}) })
      })
      .catch((error) => setMessage(error.message || 'Role permissions could not be loaded.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const togglePermission = (role, moduleName) => {
    setPermissions((current) => {
      const rolePermissions = current[role] || []
      const nextRolePermissions = rolePermissions.includes(moduleName)
        ? rolePermissions.filter((item) => item !== moduleName)
        : [...rolePermissions, moduleName]

      return { ...current, [role]: nextRolePermissions }
    })
  }

  const save = async () => {
    setSaving(true)
    setMessage('')

    const payload = {
      key: 'rolePermissions',
      group: 'settings',
      value: { permissions },
    }

    try {
      if (settingId) {
        await api.update('settings', settingId, payload)
      } else {
        const created = await api.create('settings', payload)
        setSettingId(created.data?._id || '')
      }
      setMessage('Role permissions saved successfully.')
    } catch (error) {
      setMessage(error.message || 'Role permissions could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5">
      <Toolbar actionLabel="Save Permissions" onAction={save} subtitle="Configure dashboard module access for admin, staff, recruiter, hiring, account team, and users roles." title="Role & Permission" />
      {message && <p className="rounded-[7px] bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}

      {loading ? (
        <div className="h-96 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200" />
      ) : (
        <AdminCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 font-bold">Module</th>
                  {roles.map((role) => <th className="whitespace-nowrap px-5 py-4 font-bold" key={role}>{role}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((moduleName) => (
                  <tr className="transition hover:bg-blue-50/40" key={moduleName}>
                    <td className="whitespace-nowrap px-5 py-4 font-black text-slate-800">{moduleName}</td>
                    {roles.map((role) => {
                      const checked = (permissions[role] || []).includes(moduleName)
                      return (
                        <td className="whitespace-nowrap px-5 py-4" key={`${role}-${moduleName}`}>
                          <label className="inline-flex items-center gap-2 rounded-[7px] bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
                            <input checked={checked} onChange={() => togglePermission(role, moduleName)} type="checkbox" />
                            {checked ? 'Allowed' : 'Blocked'}
                          </label>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => <StatusBadge key={role} status={`${role}: ${(permissions[role] || []).length}`} />)}
            </div>
            <button className="rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 disabled:opacity-60" disabled={saving} onClick={save} type="button">
              {saving ? 'Saving...' : 'Save Role Permissions'}
            </button>
          </div>
        </AdminCard>
      )}
    </div>
  )
}
