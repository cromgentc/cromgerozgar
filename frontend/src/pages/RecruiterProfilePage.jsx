import { useState } from 'react'
import { Building2, Mail, MapPin, Phone } from 'lucide-react'
import { getStoredUser } from '../routes/authRouting'
import { DashboardShell, Panel } from './CandidateDashboard'

export function RecruiterProfilePage() {
  const user = getStoredUser()
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState(() => ({
    name: user?.name || 'Recruiter',
    email: user?.email || 'recruiter@cromgen.test',
    phone: '',
    location: 'India',
    industry: 'Recruitment',
    companySize: '',
    website: '',
  }))
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const update = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  const save = () => {
    setEditing(false)
    setMessage('Recruiter profile updated.')
    window.setTimeout(() => setMessage(''), 3000)
  }

  return (
    <DashboardShell title="Recruiter Profile" subtitle="Manage your recruiter identity, company details, contact information, and hiring workspace profile.">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel title="Profile Summary">
          <div className="mb-5 flex justify-end">
            {editing ? (
              <div className="flex gap-2">
                <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200" onClick={() => setEditing(false)} type="button">Cancel</button>
                <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" onClick={save} type="button">Save</button>
              </div>
            ) : (
              <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700" onClick={() => setEditing(true)} type="button">Edit Profile</button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-100">
              {initials}
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-950">{profile.name}</h2>
              <p className="mt-1 text-sm font-semibold text-blue-700">Recruiter</p>
            </div>
          </div>
          {message && <p className="mt-5 rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-700">{message}</p>}
          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Mail className="text-blue-600" size={18} />
              {profile.email}
            </p>
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Phone className="text-blue-600" size={18} />
              {profile.phone || 'Not added'}
            </p>
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <MapPin className="text-blue-600" size={18} />
              {profile.location}
            </p>
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Company Information">
            {editing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ProfileField label="Company name" onChange={(value) => update('name', value)} value={profile.name} />
                <ProfileField label="Business email" onChange={(value) => update('email', value)} type="email" value={profile.email} />
                <ProfileField label="Phone" onChange={(value) => update('phone', value)} value={profile.phone} />
                <ProfileField label="Industry" onChange={(value) => update('industry', value)} value={profile.industry} />
                <ProfileField label="Company size" onChange={(value) => update('companySize', value)} value={profile.companySize} />
                <ProfileField label="Website" onChange={(value) => update('website', value)} value={profile.website} />
                <ProfileField className="md:col-span-2" label="Office location" onChange={(value) => update('location', value)} value={profile.location} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="Company name" value={profile.name} />
                <InfoItem label="Industry" value={profile.industry} />
                <InfoItem label="Company size" value={profile.companySize || 'Not added'} />
                <InfoItem label="Website" value={profile.website || 'Not added'} />
                <InfoItem label="Office location" value={profile.location} />
                <InfoItem label="Verification" value="Verified recruiter profile" />
              </div>
            )}
          </Panel>

          <Panel title="Hiring Workspace">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoItem label="Hiring role" value="Recruiter" />
              <InfoItem label="Default dashboard" value="/recruiter-dashboard" />
              <InfoItem label="Access level" value="Recruiter workspace" />
            </div>
          </Panel>

          <Panel title="Profile Checklist">
            <div className="grid gap-3">
              {['Add company logo', 'Update phone number', 'Add office address', 'Post first active job'].map((item) => (
                <p className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700" key={item}>
                  <Building2 size={17} />
                  {item}
                </p>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  )
}

function ProfileField({ className = '', label, onChange, type = 'text', value }) {
  return (
    <label className={className}>
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" onChange={(event) => onChange(event.target.value)} type={type} value={value} />
    </label>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
