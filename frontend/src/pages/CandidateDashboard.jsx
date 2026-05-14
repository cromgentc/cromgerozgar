import { useEffect, useMemo, useState } from 'react'
import { Building2, CloudUpload, FileCheck2, Rocket, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { JobCard } from '../components/JobCard'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { getAppliedJobs, getCandidateProfileStrength, getInterviewInvites, getJobAlerts } from '../utils/candidateActivity'
import { getSavedJobs } from '../utils/savedJobs'

export function CandidateDashboard({ onApply }) {
const user = getStoredUser()
  const navigate = useNavigate()
  const [savedJobs, setSavedJobs] = useState(() => getSavedJobs())
  const [appliedJobs, setAppliedJobs] = useState(() => getAppliedJobs())
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [interviewInvites, setInterviewInvites] = useState(() => getInterviewInvites())
  const [jobAlerts, setJobAlerts] = useState(() => getJobAlerts())
  const [profileStrength, setProfileStrength] = useState(() => getCandidateProfileStrength())

  const candidateProfile = useMemo(() => getStoredCandidateProfile(user), [user?.email, user?.name])

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

  useEffect(() => {
    let active = true

    const loadRecommendedJobs = async () => {
      setRecommendationsLoading(true)
      try {
        const payload = await api.jobs('?sort=-createdAt&limit=100')
        const list = Array.isArray(payload.data) ? payload.data : []
        const ranked = rankRecommendedJobs(list, candidateProfile, applications)
        if (active) setRecommendedJobs(ranked.slice(0, 4))
      } catch {
        if (active) setRecommendedJobs([])
      } finally {
        if (active) setRecommendationsLoading(false)
      }
    }

    loadRecommendedJobs()

    return () => {
      active = false
    }
  }, [applications, candidateProfile])

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
    { label: 'Saved jobs', value: String(savedJobs.length), icon: Sparkles, to: '/candidate-saved-jobs' },
    { label: 'Interview invites', value: String(trackedApplications.filter((item) => ['Interview', 'Selected'].includes(item.status)).length || interviewInvites.length), icon: Building2, to: '/candidate-interview-invites' },
    { label: 'Job alerts', value: String(jobAlerts.length), icon: Rocket, to: '/candidate-job-alerts' },
  ]

  return (
    <DashboardShell title="Candidate Dashboard" subtitle="Manage your profile, applications, saved jobs, and recommendations.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardItems.map((item) => {
          const Icon = item.icon
          return <MetricCard icon={Icon} key={item.label} label={item.label} onClick={item.to ? () => navigate(item.to) : item.label === 'Applied jobs' ? () => navigate('/candidate-applied-jobs') : undefined} value={item.value} />
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

          <Panel action={<Button onClick={() => navigate('/candidate-applied-jobs')} variant="secondary">View All</Button>} title="Applied Jobs">
            <StatusRows applications={trackedApplications} />
          </Panel>

          <Panel title="Application Status Timeline">
            <ApplicationTimeline applications={trackedApplications} />
          </Panel>

          <Panel title="Recommended Jobs">
            {recommendationsLoading ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Finding jobs related to your profile...</p>
            ) : recommendedJobs.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {recommendedJobs.map((job) => <JobCard job={job} key={job._id || job.id} onApply={onApply} />)}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                No related jobs found yet. Update your profile skills or search jobs to find matching openings.
              </p>
            )}
          </Panel>
        </div>

        <div className="grid h-max gap-6">
          <Panel title="Resume Upload">
            <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-blue-50 p-6 text-center">
              <CloudUpload className="mx-auto text-blue-600" size={34} />
              <p className="mt-3 font-bold text-slate-950">Upload latest resume</p>
              <p className="mt-2 text-sm text-slate-500">PDF or DOCX up to 5MB</p>
              <Button className="mt-5" to="/candidate-profile?missing=Resume">Choose File</Button>
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

export function CandidateAppliedJobsPage() {
  const user = getStoredUser()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true)
      try {
        const payload = await api.list('applications', `?candidateEmail=${encodeURIComponent(user?.email || '')}&sort=-createdAt&limit=100`)
        const list = Array.isArray(payload.data) ? payload.data : []
        setApplications(list)
      } catch {
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [user?.email])

  return (
    <DashboardShell title="Applied Jobs" subtitle="Track every job you applied for, company details, application status, and submitted resume.">
      <Panel title="Your Applications">
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Loading applied jobs...</p>
        ) : applications.length ? (
          <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  {['Sr No', 'Job Title', 'Company', 'Status', 'Resume', 'Applied Date', 'Actions'].map((label) => (
                    <th className="px-4 py-3" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map((application, index) => (
                  <tr className="hover:bg-blue-50/40" key={application._id || `${application.jobTitle}-${index}`}>
                    <td className="px-4 py-3 font-black text-slate-500">#{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-black text-slate-950">{application.jobTitle}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Application ID: {String(application._id || '').slice(-8)}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{application.company}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusTone(application.status)}`}>{normalizeStatus(application.status)}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{application.resumeUrl ? 'Submitted' : 'Not attached'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{application.createdAt ? new Date(application.createdAt).toLocaleString() : 'Recently'}</td>
                    <td className="px-4 py-3">
                      <Button to={application.jobId ? `/jobs/${application.jobId}` : '/jobs'} variant="secondary">View Job</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No applied jobs yet.</p>
        )}
      </Panel>
    </DashboardShell>
  )
}

export function CandidateSavedJobsPage() {
  const user = getStoredUser()
  const [savedJobs, setSavedJobs] = useState(() => getSavedJobs(user))

  useEffect(() => {
    const syncSavedJobs = () => setSavedJobs(getSavedJobs(user))
    window.addEventListener('savedJobsChanged', syncSavedJobs)
    window.addEventListener('storage', syncSavedJobs)
    syncSavedJobs()

    return () => {
      window.removeEventListener('savedJobsChanged', syncSavedJobs)
      window.removeEventListener('storage', syncSavedJobs)
    }
  }, [user?.email, user?.id])

  return (
    <DashboardShell title="Saved Jobs" subtitle="Aapke saved jobs table view mein, company, location, salary, aur action ke saath.">
      <Panel title="Saved Jobs Table">
        {savedJobs.length ? (
          <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  {['Sr No', 'Job Title', 'Company', 'Location', 'Type', 'Salary', 'Saved Date', 'Actions'].map((label) => (
                    <th className="px-4 py-3" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {savedJobs.map((job, index) => (
                  <tr className="hover:bg-blue-50/40" key={job._id || job.id || `${job.title}-${index}`}>
                    <td className="px-4 py-3 font-black text-slate-500">#{index + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-950">{job.title || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{job.company || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{job.location || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{job.type || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{job.salary || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{job.savedAt ? new Date(job.savedAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">
                      <Button to={job._id || job.id ? `/jobs/${job._id || job.id}` : '/jobs'} variant="secondary">View Job</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No saved jobs yet.</p>
        )}
      </Panel>
    </DashboardShell>
  )
}

export function CandidateInterviewInvitesPage() {
  const user = getStoredUser()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvites = async () => {
      setLoading(true)
      try {
        const payload = await api.list('applications', `?candidateEmail=${encodeURIComponent(user?.email || '')}&sort=-createdAt&limit=100`)
        const list = Array.isArray(payload.data) ? payload.data : []
        const applicationInvites = list.filter((item) => ['Interview', 'Selected'].includes(item.status))
        setInvites(applicationInvites.length ? applicationInvites : getInterviewInvites(user))
      } catch {
        setInvites(getInterviewInvites(user))
      } finally {
        setLoading(false)
      }
    }

    loadInvites()
  }, [user?.email, user?.id])

  return (
    <DashboardShell title="Interview Invites" subtitle="Recruiter interview invites aur selected-stage applications ek table mein.">
      <Panel title="Interview Invites Table">
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Loading interview invites...</p>
        ) : invites.length ? (
          <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  {['Sr No', 'Job Title', 'Company', 'Status', 'Email', 'Invite Date', 'Actions'].map((label) => (
                    <th className="px-4 py-3" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invites.map((invite, index) => (
                  <tr className="hover:bg-blue-50/40" key={invite._id || invite.id || `${invite.jobTitle || invite.title}-${index}`}>
                    <td className="px-4 py-3 font-black text-slate-500">#{index + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-950">{invite.jobTitle || invite.title || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{invite.company || '-'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusTone(invite.status)}`}>{normalizeStatus(invite.status || 'Interview')}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{invite.recruiterEmail || invite.email || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{invite.createdAt || invite.invitedAt ? new Date(invite.createdAt || invite.invitedAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">
                      <Button to={invite.jobId ? `/jobs/${invite.jobId}` : '/candidate-applied-jobs'} variant="secondary">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No interview invites yet.</p>
        )}
      </Panel>
    </DashboardShell>
  )
}

export function CandidateJobAlertsPage() {
  const user = getStoredUser()
  const [jobAlerts, setJobAlerts] = useState(() => getJobAlerts(user))

  useEffect(() => {
    const syncAlerts = () => setJobAlerts(getJobAlerts(user))
    window.addEventListener('candidateActivityChanged', syncAlerts)
    window.addEventListener('storage', syncAlerts)
    syncAlerts()

    return () => {
      window.removeEventListener('candidateActivityChanged', syncAlerts)
      window.removeEventListener('storage', syncAlerts)
    }
  }, [user?.email, user?.id])

  return (
    <DashboardShell title="Job Alerts" subtitle="Aapke saved alert preferences aur matching job alert rules table mein.">
      <Panel title="Job Alerts Table">
        {jobAlerts.length ? (
          <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  {['Sr No', 'Alert Name', 'Keyword', 'Location', 'Frequency', 'Status', 'Created', 'Actions'].map((label) => (
                    <th className="px-4 py-3" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {jobAlerts.map((alert, index) => (
                  <tr className="hover:bg-blue-50/40" key={alert.id || alert._id || `${alert.keyword || alert.title}-${index}`}>
                    <td className="px-4 py-3 font-black text-slate-500">#{index + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-950">{alert.title || alert.name || 'Job alert'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{alert.keyword || alert.role || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{alert.location || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{alert.frequency || 'Instant'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{alert.status || 'Active'}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">
                      <Button to="/jobs" variant="secondary">Find Jobs</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No job alerts yet.</p>
        )}
      </Panel>
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

function getStoredCandidateProfile(user) {
  try {
    const profile = JSON.parse(localStorage.getItem('candidateProfile') || '{}')
    return {
      ...profile,
      name: profile.name || user?.name || '',
      email: profile.email || user?.email || '',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      workMode: Array.isArray(profile.workMode) ? profile.workMode : [],
    }
  } catch {
    return { name: user?.name || '', email: user?.email || '', skills: [], workMode: [] }
  }
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ')
}

function getSeoTerms(profile) {
  const terms = [
    profile.headline,
    profile.preferredRole,
    profile.experience,
    profile.city,
    profile.state,
    profile.country,
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    ...(Array.isArray(profile.workMode) ? profile.workMode : []),
  ]

  return terms
    .flatMap((value) => normalizeText(value).split(/\s+|,\s*/))
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
}

function rankRecommendedJobs(list, profile, applications = []) {
  const terms = getSeoTerms(profile)
  if (!terms.length) return []

  const appliedKeys = new Set(applications.map((item) => `${normalizeText(item.jobTitle)}|${normalizeText(item.company)}`))
  const profileLocation = normalizeText([profile.city, profile.state, profile.country].filter(Boolean).join(' '))

  return list
    .filter((job) => !appliedKeys.has(`${normalizeText(job.title)}|${normalizeText(job.company)}`))
    .map((job) => {
      const seoText = normalizeText([
        job.title,
        job.company,
        job.department,
        job.industry,
        job.description,
        job.location,
        job.type,
        job.workMode,
        ...(Array.isArray(job.skills) ? job.skills : []),
      ].filter(Boolean).join(' '))
      const keywordScore = terms.reduce((score, term) => score + (seoText.includes(term) ? 1 : 0), 0)
      const roleTerm = normalizeText(profile.preferredRole || profile.headline)
      const locationTerm = normalizeText(profile.city || profile.state)
      const roleBoost = roleTerm && normalizeText(job.title).includes(roleTerm) ? 4 : 0
      const locationBoost = profileLocation && locationTerm && normalizeText(job.location).includes(locationTerm) ? 2 : 0
      return { ...job, recommendationScore: keywordScore + roleBoost + locationBoost }
    })
    .filter((job) => job.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}

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

export function MetricCard({ icon: Icon, label, onClick, value }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component className={`rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm ${onClick ? 'transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100' : ''}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <Icon className="text-blue-600" size={24} />
      <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </Component>
  )
}

export function Panel({ action, title, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
