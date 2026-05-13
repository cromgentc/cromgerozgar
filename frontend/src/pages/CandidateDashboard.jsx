import { useEffect, useState } from 'react'
import { Building2, CloudUpload, FileCheck2, Rocket, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'
import { JobCard } from '../components/JobCard'
import { jobs } from '../data/portalData'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { getAppliedJobs, getCandidateProfileStrength, getInterviewInvites, getJobAlerts } from '../utils/candidateActivity'
import { getSavedJobs } from '../utils/savedJobs'

export function CandidateDashboard({ onApply }) {
const user = getStoredUser()
  const [savedJobs, setSavedJobs] = useState(() => getSavedJobs())
  const [appliedJobs, setAppliedJobs] = useState(() => getAppliedJobs())
  const [applications, setApplications] = useState([])
  const [interviewInvites, setInterviewInvites] = useState(() => getInterviewInvites())
  const [jobAlerts, setJobAlerts] = useState(() => getJobAlerts())
  const [profileStrength, setProfileStrength] = useState(() => getCandidateProfileStrength())

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const payload = await api.list('applications')
        const list = Array.isArray(payload.data) ? payload.data : []
        setApplications(list.filter((item) => item.candidateEmail?.toLowerCase() === user?.email?.toLowerCase()))
      } catch {
        setApplications([])
      }
    }

    const syncCandidateStats = () => {
      setSavedJobs(getSavedJobs())
      setAppliedJobs(getAppliedJobs())
      setInterviewInvites(getInterviewInvites())
      setJobAlerts(getJobAlerts())
      setProfileStrength(getCandidateProfileStrength())
      loadApplications()
    }

    window.addEventListener('savedJobsChanged', syncCandidateStats)
    window.addEventListener('candidateActivityChanged', syncCandidateStats)
    window.addEventListener('storage', syncCandidateStats)
    syncCandidateStats()

    return () => {
      window.removeEventListener('savedJobsChanged', syncCandidateStats)
      window.removeEventListener('candidateActivityChanged', syncCandidateStats)
      window.removeEventListener('storage', syncCandidateStats)
    }
  }, [user?.email])

  const trackedApplications = applications.length
    ? applications.map((item) => ({
        id: item._id,
        title: item.jobTitle,
        company: item.company,
        status: item.status || 'New',
      }))
    : appliedJobs.map((job) => ({
        id: job._id || job.id,
        title: job.title,
        company: job.company,
        status: job.applicationStatus || 'New',
      }))

  const dashboardItems = [
    { label: 'Profile strength', value: `${profileStrength}%`, icon: ShieldCheck },
    { label: 'Applied jobs', value: String(trackedApplications.length), icon: SearchCheck },
    { label: 'Saved jobs', value: String(savedJobs.length), icon: Sparkles },
    { label: 'Interview invites', value: String(trackedApplications.filter((item) => ['Interview', 'Selected'].includes(item.status)).length || interviewInvites.length), icon: Building2 },
    { label: 'Job alerts', value: String(jobAlerts.length), icon: Rocket },
  ]

  return (
    <DashboardShell title="Candidate Dashboard" subtitle="Manage your profile, applications, saved jobs, and recommendations.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardItems.map((item) => {
          const Icon = item.icon
          return <MetricCard icon={Icon} key={item.label} label={item.label} value={item.value} />
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Panel title="Profile Overview">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-2xl font-black text-white">AR</div>
              <div>
                <h3 className="text-xl font-bold text-slate-950">Aarav Recruiter-ready</h3>
                <p className="mt-1 text-slate-500">React Developer - Bengaluru - Open to hybrid roles</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${profileStrength}%` }} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Applied Jobs">
            <StatusRows applications={trackedApplications} />
          </Panel>

          <Panel title="Application Status Timeline">
            <ApplicationTimeline applications={trackedApplications} />
          </Panel>

          <Panel title="Recommended Jobs">
            <div className="grid gap-4 xl:grid-cols-2">{jobs.slice(0, 2).map((job) => <JobCard job={job} key={job.id} onApply={onApply} />)}</div>
          </Panel>
        </div>

        <div className="grid h-max gap-6">
          <Panel title="Resume Upload">
            <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
              <CloudUpload className="mx-auto text-blue-600" size={34} />
              <p className="mt-3 font-bold text-slate-950">Upload latest resume</p>
              <p className="mt-2 text-sm text-slate-500">PDF or DOCX up to 5MB</p>
              <Button className="mt-5">Choose File</Button>
            </div>
          </Panel>

          <Panel title="Saved Jobs">
            <div className="grid gap-3">
              {savedJobs.length ? (
                savedJobs.slice(0, 4).map((job) => (
                  <div className="rounded-2xl bg-slate-50 p-4" key={job._id || job.id}>
                    <p className="text-sm font-black text-slate-950">{job.title}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{job.company} - {job.location}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No saved jobs yet.</p>
              )}
            </div>
          </Panel>

          <Panel title="Profile Edit">
            <div className="grid gap-3">
              <input className="input" list="dashboard-headline-suggestions" placeholder="Headline" />
              <datalist id="dashboard-headline-suggestions">
                {headlineSuggestions.map((item) => <option key={item} value={item} />)}
              </datalist>
              <input className="input" list="dashboard-location-suggestions" placeholder="Preferred location" />
              <datalist id="dashboard-location-suggestions">
                {locationSuggestions.map((item) => <option key={item} value={item} />)}
              </datalist>
            </div>
          </Panel>

          <Panel title="Job Alerts">
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
              Remote React jobs
              <input
                className="h-5 w-5 accent-blue-600"
                onChange={() => window.dispatchEvent(new CustomEvent('portalToast', { detail: { message: 'Job alert preferences saved' } }))}
                type="checkbox"
              />
            </label>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  )
}

const headlineSuggestions = [
  'Frontend Developer', 'React Developer', 'Next.js Developer', 'Full Stack Developer', 'Backend Developer', 'Node.js Developer', 'Python Developer',
  'Java Developer', 'Mobile App Developer', 'UI/UX Designer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Data Scientist',
  'Digital Marketing Executive', 'SEO Specialist', 'Content Writer', 'Sales Executive', 'Customer Support Executive', 'HR Recruiter', 'Fresher',
]

const locationSuggestions = [
  'Bengaluru, Karnataka', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu', 'Delhi NCR',
  'Noida, Uttar Pradesh', 'Gurugram, Haryana', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Kochi, Kerala',
  'Remote', 'Work from Home', 'Hybrid - Bengaluru', 'Hybrid - Mumbai', 'Hybrid - Delhi NCR', 'International Remote',
]

function StatusRows({ applications }) {
  if (!applications.length) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No applied jobs yet.</p>
  }

  return applications.map((application) => (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4" key={application.id}>
      <div className="flex items-center gap-3"><FileCheck2 className="text-blue-600" size={20} /><span className="font-semibold text-slate-700">{application.title}</span></div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(application.status)}`}>{normalizeStatus(application.status)}</span>
    </div>
  ))
}

function ApplicationTimeline({ applications }) {
  if (!applications.length) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No application tracking yet.</p>
  }

  return (
    <div className="grid gap-5">
      {applications.map((application) => {
        const currentIndex = getStatusIndex(application.status)

        return (
          <div className="rounded-2xl bg-slate-50 p-4" key={application.id}>
            <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <div>
                <p className="font-black text-slate-950">{application.title}</p>
                <p className="text-sm font-semibold text-slate-500">{application.company}</p>
              </div>
              <span className={`w-max rounded-full px-3 py-1 text-xs font-black ${getStatusTone(application.status)}`}>{normalizeStatus(application.status)}</span>
            </div>

            <div className="grid gap-3">
              {getTimelineSteps(application.status).map((step, index) => {
                const complete = index <= currentIndex
                const rejected = application.status === 'Rejected' && step === 'Rejected'

                return (
                  <div className="flex items-center gap-3" key={step}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black ${complete ? (rejected ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white') : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="font-bold text-slate-800">{step}</p>
                      <p className="text-sm text-slate-500">{application.title} - {application.company}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function normalizeStatus(status) {
  return status === 'New' ? 'Applied' : status
}

function getTimelineSteps(status) {
  if (status === 'Rejected') return ['Applied', 'Reviewed', 'Rejected']
  if (status === 'Selected') return ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Selected']
  return ['Applied', 'Reviewed', 'Shortlisted', 'Interview']
}

function getStatusIndex(status) {
  return getTimelineSteps(status).indexOf(normalizeStatus(status))
}

function getStatusTone(status) {
  const tones = {
    New: 'bg-blue-50 text-blue-700',
    Reviewed: 'bg-sky-50 text-sky-700',
    Shortlisted: 'bg-teal-50 text-teal-700',
    Interview: 'bg-violet-50 text-violet-700',
    Selected: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-700',
  }

  return tones[status] || 'bg-slate-100 text-slate-600'
}

export function DashboardShell({ title, subtitle, children }) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-3 text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

export function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="text-blue-600" size={24} />
      <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

export function Panel({ title, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  )
}
