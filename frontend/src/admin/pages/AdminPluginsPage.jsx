import { useEffect, useMemo, useState } from 'react'
import { Download, PackagePlus, Plug, Trash2 } from 'lucide-react'
import { AdminCard, StatusBadge, Toolbar } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const PLUGIN_SETTING_KEY = 'reactPluginRegistry'

const starterPlugins = [
  {
    id: 'razorpay-gateway',
    name: 'Razorpay Gateway',
    packageName: 'razorpay',
    version: 'latest',
    category: 'Payment',
    entryPoint: 'backend/controllers/recruiterPackageController.js',
    description: 'Recruiter package and coin payment checkout.',
    status: 'Installed',
  },
  {
    id: 'paypal-gateway',
    name: 'PayPal Gateway',
    packageName: '@paypal/react-paypal-js',
    version: 'latest',
    category: 'Payment',
    entryPoint: 'frontend payment checkout',
    description: 'International PayPal wallet and card payment option.',
    status: 'Available',
  },
  {
    id: 'stripe-gateway',
    name: 'Stripe Gateway',
    packageName: '@stripe/react-stripe-js',
    version: 'latest',
    category: 'Payment',
    entryPoint: 'frontend payment checkout',
    description: 'Global card, UPI, and wallet payment method option.',
    status: 'Available',
  },
]

const emptyPlugin = {
  name: '',
  packageName: '',
  version: 'latest',
  category: 'React',
  entryPoint: '',
  description: '',
}

export function AdminAddPluginsPage() {
  return <PluginManager mode="available" />
}

export function AdminInstalledPluginsPage() {
  return <PluginManager mode="installed" />
}

function PluginManager({ mode }) {
  const [settingId, setSettingId] = useState('')
  const [plugins, setPlugins] = useState(starterPlugins)
  const [form, setForm] = useState(emptyPlugin)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const installedPlugins = useMemo(() => plugins.filter((plugin) => plugin.status === 'Installed'), [plugins])
  const visiblePlugins = mode === 'installed' ? installedPlugins : plugins
  const title = mode === 'installed' ? 'Installed Plugins' : 'Add New Plugins'
  const subtitle = mode === 'installed'
    ? 'View React plugins and integrations installed from the admin registry.'
    : 'Add any React plugin package name, save it, and mark it installed in the plugin registry.'

  const loadPlugins = () => {
    setLoading(true)
    setMessage('')
    api
      .list('settings', `?search=${PLUGIN_SETTING_KEY}&limit=10`)
      .then((payload) => {
        const setting = (payload.data || []).find((item) => item.key === PLUGIN_SETTING_KEY)
        const savedPlugins = Array.isArray(setting?.value?.plugins) ? setting.value.plugins : []
        setSettingId(setting?._id || '')
        setPlugins(savedPlugins.length ? mergeStarterPlugins(savedPlugins) : starterPlugins)
      })
      .catch((error) => setMessage(error.message || 'Plugins could not be loaded.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPlugins()
  }, [])

  const persistPlugins = async (nextPlugins, successMessage) => {
    setSaving(true)
    setMessage('')

    const payload = {
      key: PLUGIN_SETTING_KEY,
      group: 'plugins',
      value: { plugins: nextPlugins },
    }

    try {
      if (settingId) {
        await api.update('settings', settingId, payload)
      } else {
        const created = await api.create('settings', payload)
        setSettingId(created.data?._id || '')
      }
      setPlugins(nextPlugins)
      setMessage(successMessage)
    } catch (error) {
      setMessage(error.message || 'Plugin registry could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const addPlugin = async () => {
    const cleanPlugin = {
      id: slugify(`${form.name || form.packageName}-${Date.now()}`),
      name: form.name.trim(),
      packageName: form.packageName.trim(),
      version: form.version.trim() || 'latest',
      category: form.category.trim() || 'React',
      entryPoint: form.entryPoint.trim(),
      description: form.description.trim(),
      status: 'Available',
    }

    if (!cleanPlugin.name || !cleanPlugin.packageName) {
      setMessage('Plugin name and React package name are required.')
      return
    }

    const nextPlugins = [cleanPlugin, ...plugins]
    await persistPlugins(nextPlugins, `${cleanPlugin.name} added to plugin registry.`)
    setForm(emptyPlugin)
  }

  const installPlugin = async (plugin) => {
    const nextPlugins = plugins.map((item) => (item.id === plugin.id ? { ...item, status: 'Installed', installedAt: new Date().toISOString() } : item))
    await persistPlugins(nextPlugins, `${plugin.name} marked as installed.`)
  }

  const removePlugin = async (plugin) => {
    const nextPlugins = plugins.filter((item) => item.id !== plugin.id)
    await persistPlugins(nextPlugins, `${plugin.name} removed from plugin registry.`)
  }

  return (
    <div className="grid gap-5">
      <Toolbar actionLabel={mode === 'installed' ? 'Installed' : 'Add Plugin'} subtitle={subtitle} title={title} />

      {mode === 'available' && (
        <AdminCard>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-600">React Plugin Registry</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">Add any React plugin</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">Example: package name can be npm packages like react-select, recharts, @stripe/react-stripe-js.</p>
            </div>
            <StatusBadge status={`${plugins.length} Plugins`} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <LabeledInput label="Plugin Name" onChange={(value) => setFormValue(setForm, 'name', value)} placeholder="Analytics Widget" value={form.name} />
            <LabeledInput label="React Package Name" onChange={(value) => setFormValue(setForm, 'packageName', value)} placeholder="react-select" value={form.packageName} />
            <LabeledInput label="Version" onChange={(value) => setFormValue(setForm, 'version', value)} placeholder="latest" value={form.version} />
            <LabeledInput label="Category" onChange={(value) => setFormValue(setForm, 'category', value)} placeholder="UI / Payment / Analytics" value={form.category} />
            <LabeledInput className="lg:col-span-2" label="Entry Point / Usage Note" onChange={(value) => setFormValue(setForm, 'entryPoint', value)} placeholder="Where this plugin will be used" value={form.entryPoint} />
            <label className="grid gap-1 lg:col-span-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Description</span>
              <textarea className="input min-h-24" onChange={(event) => setFormValue(setForm, 'description', event.target.value)} placeholder="What this plugin does..." value={form.description} />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">Install command preview: <span className="font-black text-slate-800">npm install {form.packageName || '<package-name>'}@{form.version || 'latest'}</span></p>
            <button className="inline-flex items-center justify-center gap-2 rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 disabled:opacity-60" disabled={saving} onClick={addPlugin} type="button">
              <PackagePlus size={17} /> Add New Plugin
            </button>
          </div>
        </AdminCard>
      )}

      {message && <p className="rounded-[7px] bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div className="h-48 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200" key={item} />)}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {visiblePlugins.map((plugin) => (
            <AdminCard key={plugin.id || plugin.name}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-[7px] bg-blue-50 text-blue-700">
                  {plugin.status === 'Installed' ? <Plug size={22} /> : <PackagePlus size={22} />}
                </span>
                <StatusBadge status={plugin.status || 'Available'} />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{plugin.name}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{plugin.description || 'React plugin package ready for setup.'}</p>
              <div className="mt-4 grid gap-2 rounded-[7px] bg-slate-50 p-3 text-xs font-bold text-slate-600">
                <span>Package: {plugin.packageName}</span>
                <span>Version: {plugin.version || 'latest'}</span>
                <span>Category: {plugin.category || 'React'}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {plugin.status === 'Installed' ? (
                  <button className="inline-flex items-center gap-2 rounded-[7px] bg-blue-50 px-4 py-2 text-sm font-black text-blue-700" type="button">
                    <Plug size={16} /> Manage Plugin
                  </button>
                ) : (
                  <button className="inline-flex items-center gap-2 rounded-[7px] bg-blue-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60" disabled={saving} onClick={() => installPlugin(plugin)} type="button">
                    <Download size={16} /> Install Plugin
                  </button>
                )}
                <button className="inline-flex items-center gap-2 rounded-[7px] bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 disabled:opacity-60" disabled={saving} onClick={() => removePlugin(plugin)} type="button">
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {!loading && !visiblePlugins.length && (
        <AdminCard>
          <p className="font-black text-slate-950">No plugins found</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Add a React plugin from Add New Plugins, then install it.</p>
        </AdminCard>
      )}
    </div>
  )
}

function mergeStarterPlugins(savedPlugins) {
  const byId = new Map(savedPlugins.map((plugin) => [plugin.id || slugify(plugin.name), plugin]))
  starterPlugins.forEach((plugin) => {
    if (!byId.has(plugin.id)) byId.set(plugin.id, plugin)
  })
  return [...byId.values()]
}

function setFormValue(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }))
}

function slugify(value) {
  return String(value || 'plugin').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function LabeledInput({ className = '', label, onChange, placeholder, value }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input className="input" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="text" value={value || ''} />
    </label>
  )
}
