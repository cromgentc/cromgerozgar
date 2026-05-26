import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AdminCard, StatusBadge, Toolbar } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const defaultLinks = [
  { platform: 'Facebook', label: 'Facebook', url: '', enabled: true },
  { platform: 'Instagram', label: 'Instagram', url: '', enabled: true },
  { platform: 'LinkedIn', label: 'LinkedIn', url: '', enabled: true },
  { platform: 'YouTube', label: 'YouTube', url: '', enabled: true },
  { platform: 'Twitter', label: 'Twitter / X', url: '', enabled: true },
]

export function AdminSocialMediaPage() {
  const [settingId, setSettingId] = useState('')
  const [links, setLinks] = useState(defaultLinks)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadLinks = () => {
    setLoading(true)
    setMessage('')
    api
      .list('settings', '?search=socialMediaLinks&limit=10')
      .then((payload) => {
        const setting = (payload.data || []).find((item) => item.key === 'socialMediaLinks')
        const savedLinks = Array.isArray(setting?.value?.links) ? setting.value.links : []
        setSettingId(setting?._id || '')
        setLinks(savedLinks.length ? savedLinks : defaultLinks)
      })
      .catch((error) => setMessage(error.message || 'Social media links could not be loaded.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLinks()
  }, [])

  const updateLink = (index, key, value) => {
    setLinks((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)))
  }

  const addLink = () => {
    setLinks((current) => [...current, { platform: 'Website', label: 'Social Link', url: '', enabled: true }])
  }

  const removeLink = (index) => {
    setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const save = async () => {
    setSaving(true)
    setMessage('')

    const cleanLinks = links.map((item) => ({
      platform: String(item.platform || '').trim() || 'Website',
      label: String(item.label || '').trim() || String(item.platform || 'Social').trim(),
      url: String(item.url || '').trim(),
      enabled: item.enabled !== false,
    }))

    const invalidLink = cleanLinks.find((item) => item.url && !/^https?:\/\//i.test(item.url))
    if (invalidLink) {
      setSaving(false)
      setMessage(`${invalidLink.label} URL must start with http:// or https://`)
      return
    }

    const payload = {
      key: 'socialMediaLinks',
      group: 'website',
      value: { links: cleanLinks },
    }

    try {
      if (settingId) {
        await api.update('settings', settingId, payload)
      } else {
        const created = await api.create('settings', payload)
        setSettingId(created.data?._id || '')
      }
      window.dispatchEvent(new Event('social-media-links-updated'))
      setMessage('Social media links saved successfully.')
    } catch (error) {
      setMessage(error.message || 'Social media links could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5">
      <Toolbar actionLabel="Add Link" onAction={addLink} subtitle="Manage footer social media links shown on users and recruiter frontends." title="Social Media" />
      {message && <p className="rounded-[7px] bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}
      <AdminCard>
        {loading ? (
          <div className="h-56 animate-pulse rounded-[7px] bg-slate-100" />
        ) : (
          <div className="grid gap-4">
            {links.map((item, index) => (
              <div className="grid gap-3 rounded-[7px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[0.7fr_0.8fr_1.4fr_auto_auto] lg:items-end" key={`${item.platform}-${index}`}>
                <LabeledInput label="Platform" onChange={(value) => updateLink(index, 'platform', value)} placeholder="Facebook" value={item.platform} />
                <LabeledInput label="Label" onChange={(value) => updateLink(index, 'label', value)} placeholder="Follow us" value={item.label} />
                <LabeledInput label="URL" onChange={(value) => updateLink(index, 'url', value)} placeholder="https://facebook.com/yourpage" value={item.url} />
                <label className="flex min-h-11 items-center gap-3 rounded-[7px] bg-white px-4 text-sm font-black text-slate-600">
                  <input checked={item.enabled !== false} onChange={(event) => updateLink(index, 'enabled', event.target.checked)} type="checkbox" />
                  <StatusBadge status={item.enabled !== false ? 'Active' : 'Inactive'} />
                </label>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-rose-50 px-4 text-sm font-black text-rose-700" onClick={() => removeLink(index)} type="button">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button className="inline-flex items-center justify-center gap-2 rounded-[7px] bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700" onClick={addLink} type="button">
                <Plus size={16} /> Add Another
              </button>
              <button className="rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 disabled:opacity-60" disabled={saving} onClick={save} type="button">
                {saving ? 'Saving...' : 'Save Social Media'}
              </button>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  )
}

function LabeledInput({ label, onChange, placeholder, value }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input className="input" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="text" value={value || ''} />
    </label>
  )
}
