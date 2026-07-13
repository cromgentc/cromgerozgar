import { useEffect, useState } from 'react'
import { AdminCard, StatusBadge } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const defaultWhatsAppApiConfig = {
  enabled: true,
  provider: 'Meta WhatsApp Cloud API',
  phoneNumberId: '',
  businessAccountId: '',
  accessToken: '',
  otpTemplateName: '',
  languageCode: 'en_US',
  defaultCountryCode: '+91',
  appLink: 'https://www.cromgenrozgar.in',
  appLinkMessage: 'INSEET application link: {link}',
  notes: '',
}

export function AdminWhatsAppApiPage() {
  const [settingId, setSettingId] = useState('')
  const [form, setForm] = useState(defaultWhatsAppApiConfig)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = () => {
    setLoading(true)
    setMessage('')
    api
      .list('settings', '?search=whatsappLoginApi&limit=10')
      .then((payload) => {
        const setting = (payload.data || []).find((item) => item.key === 'whatsappLoginApi')
        const value = setting?.value || {}
        setSettingId(setting?._id || '')
        setForm({
          ...defaultWhatsAppApiConfig,
          enabled: value.enabled !== false,
          provider: value.provider || defaultWhatsAppApiConfig.provider,
          phoneNumberId: value.phoneNumberId || '',
          businessAccountId: value.businessAccountId || '',
          accessToken: value.accessToken || '',
          otpTemplateName: value.otpTemplateName || '',
          languageCode: value.languageCode || 'en_US',
          defaultCountryCode: value.defaultCountryCode || '+91',
          appLink: value.appLink || defaultWhatsAppApiConfig.appLink,
          appLinkMessage: value.appLinkMessage || defaultWhatsAppApiConfig.appLinkMessage,
          notes: value.notes || '',
        })
      })
      .catch((error) => setMessage(error.message || 'WhatsApp API config could not be loaded.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    setSaving(true)
    setMessage('')

    const payload = {
      key: 'whatsappLoginApi',
      group: 'auth',
      value: {
        enabled: Boolean(form.enabled),
        provider: form.provider.trim() || defaultWhatsAppApiConfig.provider,
        phoneNumberId: form.phoneNumberId.trim(),
        businessAccountId: form.businessAccountId.trim(),
        accessToken: form.accessToken.trim(),
        otpTemplateName: form.otpTemplateName.trim(),
        languageCode: form.languageCode.trim() || 'en_US',
        defaultCountryCode: form.defaultCountryCode.trim() || '+91',
        appLink: form.appLink.trim() || defaultWhatsAppApiConfig.appLink,
        appLinkMessage: form.appLinkMessage.trim() || defaultWhatsAppApiConfig.appLinkMessage,
        notes: form.notes.trim(),
      },
    }

    if (payload.value.enabled && (!payload.value.phoneNumberId || !payload.value.accessToken)) {
      setSaving(false)
      setMessage('Phone Number ID and Access Token are required when WhatsApp API is enabled.')
      return
    }

    try {
      if (settingId) {
        await api.update('settings', settingId, payload)
      } else {
        const created = await api.create('settings', payload)
        setSettingId(created.data?._id || '')
      }
      setMessage('WhatsApp API settings saved successfully.')
    } catch (error) {
      setMessage(error.message || 'WhatsApp API config could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[7px] border border-blue-100 bg-white shadow-xl shadow-blue-100/50">
        <div className="grid gap-5 bg-gradient-to-br from-blue-600 via-sky-500 to-teal-400 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-50">Settings / Auth API</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">WhatsApp API</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-blue-50">
              Configure WhatsApp OTP login provider details and the homepage application link message.
            </p>
          </div>
          <StatusBadge status={form.enabled ? 'Active' : 'Inactive'} />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <AdminCard>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-600">WhatsApp Provider</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">OTP login configuration</h3>
            </div>
            <label className="flex items-center gap-3 rounded-[7px] bg-slate-50 px-4 py-2 text-sm font-black text-slate-600">
              <input checked={form.enabled} onChange={(event) => update('enabled', event.target.checked)} type="checkbox" />
              Enable WhatsApp Login
            </label>
          </div>

          {loading ? (
            <div className="mt-5 h-56 animate-pulse rounded-[7px] bg-slate-100" />
          ) : (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput label="Provider" onChange={(value) => update('provider', value)} placeholder="Meta WhatsApp Cloud API" value={form.provider} />
                <LabeledInput label="Default Country Code" onChange={(value) => update('defaultCountryCode', value)} placeholder="+91" value={form.defaultCountryCode} />
                <LabeledInput label="Phone Number ID" onChange={(value) => update('phoneNumberId', value)} placeholder="Meta phone number ID" value={form.phoneNumberId} />
                <LabeledInput label="Business Account ID" onChange={(value) => update('businessAccountId', value)} placeholder="WhatsApp business account ID" value={form.businessAccountId} />
                <LabeledInput label="OTP Template Name" onChange={(value) => update('otpTemplateName', value)} placeholder="login_otp" value={form.otpTemplateName} />
                <LabeledInput label="Language Code" onChange={(value) => update('languageCode', value)} placeholder="en_US, en, en_IN" value={form.languageCode} />
                <LabeledInput className="sm:col-span-2" label="Application Link" onChange={(value) => update('appLink', value)} placeholder="https://www.cromgenrozgar.in/app" value={form.appLink} />
              </div>
              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Application Link Message</span>
                <textarea className="input min-h-20" onChange={(event) => update('appLinkMessage', event.target.value)} placeholder="Use {link} where the app link should appear" value={form.appLinkMessage} />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Access Token</span>
                <textarea className="input min-h-24" onChange={(event) => update('accessToken', event.target.value)} placeholder="Paste WhatsApp Cloud API access token" value={form.accessToken} />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Internal Notes</span>
                <textarea className="input min-h-24" onChange={(event) => update('notes', event.target.value)} placeholder="Template status, provider notes, token rotation..." value={form.notes} />
              </label>
              {message && <p className="rounded-[7px] bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button className="rounded-[7px] bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700" onClick={loadConfig} type="button">Refresh</button>
                <button className="rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 disabled:opacity-60" disabled={saving} onClick={save} type="button">
                  {saving ? 'Saving...' : 'Save WhatsApp API'}
                </button>
              </div>
            </div>
          )}
        </AdminCard>

        <div className="grid gap-5">
          <AdminCard>
            <p className="text-sm font-black uppercase tracking-wide text-teal-600">Login Flow</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              <p>1. User clicks WhatsApp login on the login page.</p>
              <p>2. Registered mobile number receives OTP.</p>
              <p>3. After OTP verification, the user is logged in directly.</p>
              <p>4. Homepage Get link sends the configured application link on WhatsApp.</p>
            </div>
          </AdminCard>
          <AdminCard>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">Integration Note</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Settings are saved here. For actual WhatsApp message delivery, connect the backend sender service to the Meta or Twilio API.
            </p>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

function LabeledInput({ className = '', label, onChange, placeholder, value }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input className="input" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="text" value={value} />
    </label>
  )
}
