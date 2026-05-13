import { Building2, BriefcaseBusiness, CheckCircle2, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { getStoredUser } from '../routes/authRouting'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

const profileStats = [
  [BriefcaseBusiness, 'Open jobs', '0'],
  [UserRound, 'Candidates reviewed', '0'],
  [CheckCircle2, 'Shortlisted', '0'],
  [ShieldCheck, 'Profile status', 'Active'],
]

export function RecruiterProfilePage() {
  const user = getStoredUser()
  const name = user?.name || 'Recruiter'
  const email = user?.email || 'recruiter@cromgen.test'
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <DashboardShell title="Recruiter Profile" subtitle="Manage your recruiter identity, company details, contact information, and hiring workspace profile.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {profileStats.map(([Icon, label, value]) => (
          <MetricCard icon={Icon} key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel title="Profile Summary">
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-100">
              {initials}
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-950">{name}</h2>
              <p className="mt-1 text-sm font-semibold text-blue-700">Recruiter</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Mail className="text-blue-600" size={18} />
              {email}
            </p>
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Phone className="text-blue-600" size={18} />
              Not added
            </p>
            <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <MapPin className="text-blue-600" size={18} />
              India
            </p>
          </div>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Company Information">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem label="Company name" value={name} />
              <InfoItem label="Industry" value="Recruitment" />
              <InfoItem label="Company size" value="Not added" />
              <InfoItem label="Website" value="Not added" />
              <InfoItem label="Office location" value="India" />
              <InfoItem label="Verification" value="Verified recruiter profile" />
            </div>
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

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}
