import { useMemo, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Edit3, ImagePlus, Mail, MapPin, Phone, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import { AdminCard } from '../components/AdminPrimitives'

const defaultProfile = {
  name: 'Super Admin Dharma',
  email: '',
  phone: '',
  role: 'Admin',
  designation: 'Platform Administrator',
  department: 'Operations',
  location: 'India',
  avatar: '',
  bio: 'Full platform control for jobs, recruiters, candidates, applications, settings, and role permissions.',
}

export function AdminProfilePage() {
  const storedUser = getStoredUser()
  const storageKey = getProfileKey(storedUser)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState(() => getStoredProfile(storedUser, storageKey))
  const initials = useMemo(() => getInitials(profile.name || profile.role || 'AD'), [profile.name, profile.role])

  const update = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  const saveProfile = () => {
    const nextProfile = {
      ...profile,
      name: profile.name.trim() || defaultProfile.name,
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      updatedAt: new Date().toISOString(),
    }
    const nextUser = {
      ...storedUser,
      name: nextProfile.name,
      email: nextProfile.email || storedUser?.email || '',
      phone: nextProfile.phone,
      avatar: nextProfile.avatar,
      role: nextProfile.role || storedUser?.role || 'Admin',
    }

    localStorage.setItem(storageKey, JSON.stringify(nextProfile))
    localStorage.setItem('authUser', JSON.stringify(nextUser))
    setProfile(nextProfile)
    setEditing(false)
    setMessage('Profile updated successfully.')
    window.dispatchEvent(new Event('storage'))
  }

  const uploadProfileImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload only image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      update('avatar', reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-6">
      <AdminCard className="bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <ProfileAvatar avatar={profile.avatar} initials={initials} size="large" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Admin Profile</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">{profile.name || 'Admin User'}</h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{profile.bio || defaultProfile.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ProfilePill icon={ShieldCheck} label={profile.role || 'Admin'} />
                <ProfilePill icon={BriefcaseBusiness} label={profile.designation || 'Platform Administrator'} />
                <ProfilePill icon={CheckCircle2} label="Online" />
              </div>
            </div>
          </div>
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-5 text-sm font-bold shadow-lg transition ${
              editing ? 'bg-slate-100 text-slate-700 shadow-slate-100 hover:bg-slate-200' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
            }`}
            onClick={() => {
              setEditing((value) => !value)
              setMessage('')
            }}
            type="button"
          >
            {editing ? <X size={17} /> : <Edit3 size={17} />}
            {editing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </AdminCard>

      {message && (
        <div className="rounded-[7px] border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminCard>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Profile Details</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">{editing ? 'Edit admin information' : 'Account information'}</h3>
            </div>
            {profile.updatedAt && <span className="rounded-[7px] bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>}
          </div>

          {editing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-4 rounded-[7px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProfileAvatar avatar={profile.avatar} initials={initials} />
                  <div>
                    <p className="text-sm font-black text-slate-900">Profile Image</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Upload a JPG, PNG, or WebP image.</p>
                  </div>
                </div>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-white px-5 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50">
                  <ImagePlus size={17} />
                  Upload Image
                  <input className="hidden" accept="image/*" onChange={(event) => uploadProfileImage(event.target.files?.[0])} type="file" />
                </label>
              </div>
              <EditField label="Full Name" onChange={(value) => update('name', value)} value={profile.name} />
              <EditField label="Email ID" onChange={(value) => update('email', value)} type="email" value={profile.email} />
              <EditField label="Mobile Number" onChange={(value) => update('phone', value)} value={profile.phone} />
              <EditField label="Role" onChange={(value) => update('role', value)} value={profile.role} />
              <EditField label="Designation" onChange={(value) => update('designation', value)} value={profile.designation} />
              <EditField label="Department" onChange={(value) => update('department', value)} value={profile.department} />
              <EditField className="md:col-span-2" label="Location" onChange={(value) => update('location', value)} value={profile.location} />
              <label className="md:col-span-2">
                <span className="text-sm font-black text-slate-700">Bio</span>
                <textarea className="mt-2 min-h-28 w-full rounded-[7px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => update('bio', event.target.value)} value={profile.bio} />
              </label>
              <div className="md:col-span-2 flex justify-end">
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700" onClick={saveProfile} type="button">
                  <Save size={17} />
                  Update Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <InfoLine icon={UserRound} label="Full Name" value={profile.name || 'Not added'} />
              <InfoLine icon={Mail} label="Email ID" value={profile.email || 'Not added'} />
              <InfoLine icon={Phone} label="Mobile Number" value={profile.phone || 'Not added'} />
              <InfoLine icon={ShieldCheck} label="Role" value={profile.role || 'Admin'} />
              <InfoLine icon={BriefcaseBusiness} label="Designation" value={profile.designation || 'Not added'} />
              <InfoLine icon={BriefcaseBusiness} label="Department" value={profile.department || 'Not added'} />
              <InfoLine className="md:col-span-2" icon={MapPin} label="Location" value={profile.location || 'Not added'} />
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Access Summary</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">Role permissions</h3>
          <div className="mt-5 grid gap-3">
            {['Jobs management', 'Recruiter verification', 'Candidate records', 'Reports and settings', 'Role based access'].map((item) => (
              <div className="flex items-center gap-3 rounded-[7px] bg-slate-50 p-3" key={item}>
                <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-blue-600 text-white">
                  <CheckCircle2 size={17} />
                </span>
                <span className="text-sm font-black text-slate-800">{item}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}

function EditField({ className = '', label, onChange, type = 'text', value }) {
  return (
    <label className={className}>
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-[7px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value || ''}
      />
    </label>
  )
}

function InfoLine({ className = '', icon: Icon, label, value }) {
  return (
    <div className={`rounded-[7px] border border-slate-100 bg-slate-50 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-white text-blue-600 ring-1 ring-slate-100">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ProfilePill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[7px] bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-100">
      <Icon size={14} />
      {label}
    </span>
  )
}

function ProfileAvatar({ avatar, initials, size = 'normal' }) {
  const classes = size === 'large' ? 'h-16 w-16 text-xl' : 'h-20 w-20 text-2xl'

  return (
    <span className={`grid ${classes} shrink-0 place-items-center overflow-hidden rounded-[7px] bg-blue-600 font-black text-white shadow-lg shadow-blue-100`}>
      {avatar ? <img className="h-full w-full object-cover" src={avatar} alt="Admin profile" /> : initials}
    </span>
  )
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null') || {}
  } catch {
    return {}
  }
}

function getStoredProfile(user, storageKey) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (stored) return { ...defaultProfile, ...stored, role: stored.role || user?.role || defaultProfile.role }
  } catch {
    // Keep default profile when saved JSON is invalid.
  }

  return {
    ...defaultProfile,
    name: user?.name || defaultProfile.name,
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || defaultProfile.role,
  }
}

function getProfileKey(user = {}) {
  return `adminProfile:${String(user?.email || user?.name || 'default').toLowerCase()}`
}

function getInitials(value) {
  return String(value)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
