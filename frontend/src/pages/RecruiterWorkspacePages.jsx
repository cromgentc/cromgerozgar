import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CalendarDays, CheckCircle2, ClipboardList, Clock3, Eye, Mail, MessageSquare, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

function useRecruiterApplications() {
  const user = useMemo(() => getStoredUser(), [])
  const [applications, setApplications] = useState([])

  useEffect(() => {
    if (!user?.email) {
      setApplications([])
      return
    }

    api
      .list('applications', `?recruiterEmail=${encodeURIComponent(user.email)}&sort=-createdAt&limit=100`)
      .then((payload) => setApplications(payload.data || []))
      .catch(() => setApplications([]))
  }, [user?.email])

  return applications
}

function countByStatus(applications, statuses) {
  return applications.filter((item) => statuses.includes(item.status)).length
}

const activeApplicationStatuses = ['New', 'Reviewed', 'Interview']
const recruiterActionStatuses = ['Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected']

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString()
}

function getCandidatePhone(application) {
  return String(application?.candidatePhone || application?.phone || '').replace(/\D/g, '')
}

function PhoneReveal({ application }) {
  const [visible, setVisible] = useState(false)
  const phone = getCandidatePhone(application)

  if (!phone) return <span className="text-xs font-semibold text-slate-400">Mobile: -</span>

  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
      <span>Mobile: {visible ? phone : `******${phone.slice(-4)}`}</span>
      <button
        aria-label="View mobile number"
        className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-blue-600 transition hover:bg-blue-100"
        onClick={(event) => {
          event.stopPropagation()
          setVisible((value) => !value)
        }}
        type="button"
      >
        <Eye size={14} />
      </button>
    </span>
  )
}

function getStageTone(stage) {
  const tones = {
    New: 'bg-slate-50 text-slate-700 ring-slate-200',
    Reviewed: 'bg-sky-50 text-sky-700 ring-sky-100',
    Shortlisted: 'bg-teal-50 text-teal-700 ring-teal-100',
    Interview: 'bg-violet-50 text-violet-700 ring-violet-100',
    Selected: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  return tones[stage] || 'bg-slate-50 text-slate-700 ring-slate-200'
}

function getStageBar(stage) {
  const tones = {
    New: 'bg-slate-500',
    Reviewed: 'bg-sky-500',
    Shortlisted: 'bg-teal-500',
    Interview: 'bg-violet-500',
    Selected: 'bg-emerald-500',
    Rejected: 'bg-rose-500',
  }

  return tones[stage] || 'bg-slate-500'
}

function getApplicationStatusTone(status) {
  const tones = {
    New: 'bg-slate-50 text-slate-700 ring-slate-200',
    Reviewed: 'bg-sky-50 text-sky-700 ring-sky-100',
    Shortlisted: 'bg-teal-50 text-teal-700 ring-teal-100',
    Interview: 'bg-violet-50 text-violet-700 ring-violet-100',
    Selected: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  return tones[status] || tones.New
}

function ApplicationStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${getApplicationStatusTone(status)}`}>
      {status || 'New'}
    </span>
  )
}

function CompactMetric({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl ring-1 ${tones[tone] || tones.blue}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

function RecruiterStageSummary({ applications }) {
  const total = applications.length
  const stages = [
    { label: 'New', query: 'new', helper: 'Fresh candidate applications' },
    { label: 'Reviewed', query: 'reviewed', helper: 'Profiles already screened' },
    { label: 'Shortlisted', query: 'shortlisted', helper: 'Ready for next round' },
    { label: 'Interview', query: 'interview', helper: 'Interview pipeline' },
    { label: 'Selected', query: 'selected', helper: 'Final selected candidates' },
    { label: 'Rejected', query: 'rejected', helper: 'Closed with rejection' },
  ].map((stage) => {
    const count = countByStatus(applications, [stage.label])
    const percent = total ? Math.round((count / total) * 100) : 0
    return { ...stage, count, percent }
  })

  const activeCount = countByStatus(applications, activeApplicationStatuses)
  const conversion = total ? Math.round((countByStatus(applications, ['Shortlisted', 'Interview', 'Selected']) / total) * 100) : 0

  return (
    <Panel title="Stage Summary">
      <div className="rounded-2xl bg-slate-950 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-wide text-blue-200">Recruiter pipeline health</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <p className="text-2xl font-black">{total}</p>
            <p className="text-xs font-semibold text-slate-300">Total</p>
          </div>
          <div>
            <p className="text-2xl font-black">{activeCount}</p>
            <p className="text-xs font-semibold text-slate-300">Active</p>
          </div>
          <div>
            <p className="text-2xl font-black">{conversion}%</p>
            <p className="text-xs font-semibold text-slate-300">Qualified</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {stages.map((stage) => (
          <Link
            className={`block rounded-2xl p-4 ring-1 transition hover:-translate-y-0.5 hover:shadow-lg ${getStageTone(stage.label)}`}
            key={stage.label}
            to={`/recruiter-applications?status=${stage.query}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{stage.label}</p>
                <p className="mt-1 text-xs font-semibold opacity-75">{stage.helper}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{stage.count}</p>
                <p className="text-xs font-black">{stage.percent}%</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
              <div className={`h-full rounded-full ${getStageBar(stage.label)}`} style={{ width: `${stage.percent}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  )
}

export function RecruiterApplicationsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const applications = useRecruiterApplications()
  const [localApplications, setLocalApplications] = useState([])

  useEffect(() => {
    setLocalApplications(applications)
  }, [applications])

  const statusFilter = searchParams.get('status') || 'all'
  const visibleApplications = useMemo(() => {
    if (statusFilter === 'active') {
      return localApplications.filter((item) => activeApplicationStatuses.includes(item.status))
    }
    if (statusFilter === 'reviewed') {
      return localApplications.filter((item) => ['Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].includes(item.status))
    }
    if (statusFilter === 'shortlisted') {
      return localApplications.filter((item) => item.status === 'Shortlisted')
    }
    if (statusFilter === 'interview') {
      return localApplications.filter((item) => item.status === 'Interview')
    }
    if (statusFilter === 'new') {
      return localApplications.filter((item) => item.status === 'New')
    }
    if (statusFilter === 'selected') {
      return localApplications.filter((item) => item.status === 'Selected')
    }
    if (statusFilter === 'rejected') {
      return localApplications.filter((item) => item.status === 'Rejected')
    }
    return localApplications
  }, [localApplications, statusFilter])
  const total = localApplications.length
  const active = countByStatus(localApplications, activeApplicationStatuses)
  const pending = countByStatus(localApplications, ['New'])
  const reviewed = countByStatus(localApplications, ['Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'])
  const shortlisted = countByStatus(localApplications, ['Shortlisted'])
  const interviews = countByStatus(localApplications, ['Interview'])
  const selected = countByStatus(localApplications, ['Selected'])
  const rejected = countByStatus(localApplications, ['Rejected'])
  const pageTitle = statusFilter === 'active' ? 'Active Applications' : 'Applications'
  const pageSubtitle = statusFilter === 'active'
    ? 'Active candidate applications jo review, interview, ya new stage mein hain.'
    : 'Track candidate movement across review, shortlist, interview, and offer stages.'

  const updateApplicationStatus = async (application, status) => {
    if (!application?._id || !status || status === application.status) return

    setLocalApplications((items) => items.map((item) => item._id === application._id ? { ...item, status } : item))
    try {
      const payload = await api.update('applications', application._id, { status })
      setLocalApplications((items) => items.map((item) => item._id === application._id ? payload.data : item))
      window.dispatchEvent(new CustomEvent('portalToast', { detail: { message: `Application moved to ${status}` } }))
    } catch (error) {
      setLocalApplications((items) => items.map((item) => item._id === application._id ? application : item))
      window.dispatchEvent(new CustomEvent('portalToast', { detail: { message: error.message || 'Status update failed' } }))
    }
  }

  return (
    <DashboardShell title={pageTitle} subtitle={pageSubtitle}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications">
          <MetricCard icon={ClipboardList} label="Total Applications" value={String(total)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=active">
          <MetricCard icon={UsersRound} label="Active Applications" value={String(active)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=new">
          <MetricCard icon={Clock3} label="New / Pending" value={String(pending)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=reviewed">
          <MetricCard icon={CheckCircle2} label="Reviewed" value={String(reviewed)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=shortlisted">
          <MetricCard icon={UsersRound} label="Shortlisted" value={String(shortlisted)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=interview">
          <MetricCard icon={CalendarDays} label="Interviews" value={String(interviews)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=selected">
          <MetricCard icon={ShieldCheck} label="Selected" value={String(selected)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=rejected">
          <MetricCard icon={MessageSquare} label="Rejected" value={String(rejected)} />
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title={statusFilter === 'active' ? 'Active Applications Table' : 'Application Pipeline'}>
          {visibleApplications.length ? (
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-black">Sr No</th>
                      <th className="px-4 py-3 font-black">Candidate</th>
                      <th className="px-4 py-3 font-black">Email / Mobile</th>
                      <th className="px-4 py-3 font-black">Job</th>
                      <th className="px-4 py-3 font-black">Status</th>
                      <th className="px-4 py-3 font-black">Applied</th>
                      <th className="px-4 py-3 font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleApplications.map((item, index) => (
                      <tr
                        className="cursor-pointer align-top hover:bg-blue-50/40"
                        key={item._id || `${item.candidateEmail}-${item.jobTitle}-${index}`}
                        onClick={() => item.candidateEmail && navigate(`/recruiter-applications/candidate/${encodeURIComponent(item.candidateEmail)}`)}
                      >
                        <td className="px-4 py-4 font-black text-slate-500">#{index + 1}</td>
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-950">{item.candidateName || 'Candidate'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-600">{item.candidateEmail || '-'}</p>
                          <PhoneReveal application={item} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">{item.jobTitle || '-'}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{item.companyName || item.company || '-'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">{item.status || 'New'}</span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-600">{formatDate(item.createdAt || item.appliedAt)}</td>
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <select
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            onChange={(event) => updateApplicationStatus(item, event.target.value)}
                            value={recruiterActionStatuses.includes(item.status) ? item.status : ''}
                          >
                            <option value="">Actions</option>
                            {recruiterActionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500">
              {statusFilter === 'active' ? 'Abhi koi active application nahi hai.' : 'Aapke posted jobs par abhi koi application nahi aayi hai.'}
            </div>
          )}
        </Panel>
        <RecruiterStageSummary applications={localApplications} />
      </div>
    </DashboardShell>
  )
}

export function RecruiterCandidateApplicationsPage() {
  const { candidateEmail = '' } = useParams()
  const user = useMemo(() => getStoredUser(), [])
  const decodedEmail = decodeURIComponent(candidateEmail)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true)
      try {
        const params = `?recruiterEmail=${encodeURIComponent(user?.email || '')}&candidateEmail=${encodeURIComponent(decodedEmail)}&sort=-createdAt&limit=100`
        const payload = await api.list('applications', params)
        setApplications(Array.isArray(payload.data) ? payload.data : [])
      } catch {
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [decodedEmail, user?.email])

  const candidateName = applications[0]?.candidateName || decodedEmail || 'Candidate'
  const candidatePhone = getCandidatePhone(applications[0])
  const updateApplicationStatus = async (application, status) => {
    if (!application?._id || !status || status === application.status) return

    setApplications((items) => items.map((item) => item._id === application._id ? { ...item, status } : item))
    try {
      const payload = await api.update('applications', application._id, { status })
      setApplications((items) => items.map((item) => item._id === application._id ? payload.data : item))
      window.dispatchEvent(new CustomEvent('portalToast', { detail: { message: `Application moved to ${status}` } }))
    } catch (error) {
      setApplications((items) => items.map((item) => item._id === application._id ? application : item))
      window.dispatchEvent(new CustomEvent('portalToast', { detail: { message: error.message || 'Status update failed' } }))
    }
  }

  return (
    <DashboardShell title="Candidate Applications" subtitle={`${candidateName} ne kitne jobs apply kiye hain, status aur actions ke saath.`}>
      <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-100">
              {candidateName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-950">{candidateName}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{decodedEmail}</p>
            </div>
          </div>
          <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600 sm:min-w-64">
            <p className="flex justify-between gap-3"><span>Mobile</span><span>{candidatePhone || '-'}</span></p>
            <p className="flex justify-between gap-3"><span>Total applied</span><span>{applications.length}</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompactMetric icon={ClipboardList} label="Total Applied Jobs" value={String(applications.length)} />
        <CompactMetric icon={UsersRound} label="Active Applications" value={String(countByStatus(applications, activeApplicationStatuses))} />
        <CompactMetric icon={Clock3} label="New / Pending" tone="slate" value={String(countByStatus(applications, ['New']))} />
        <CompactMetric icon={CheckCircle2} label="Reviewed" value={String(countByStatus(applications, ['Reviewed']))} />
        <CompactMetric icon={UsersRound} label="Shortlisted" tone="teal" value={String(countByStatus(applications, ['Shortlisted']))} />
        <CompactMetric icon={CalendarDays} label="Interviews" tone="violet" value={String(countByStatus(applications, ['Interview']))} />
        <CompactMetric icon={ShieldCheck} label="Selected" tone="emerald" value={String(countByStatus(applications, ['Selected']))} />
        <CompactMetric icon={MessageSquare} label="Rejected" tone="rose" value={String(countByStatus(applications, ['Rejected']))} />
      </div>

      <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-black text-slate-950">Candidate Job Applications</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Row click karke full application view open karein.</p>
          </div>
          <span className="w-max rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 ring-1 ring-blue-100">
            {applications.length} records
          </span>
        </div>
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Loading candidate applications...</p>
        ) : applications.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {['Sr No', 'Candidate', 'Email / Mobile', 'Job Title', 'Company', 'Status', 'Applied', 'Actions'].map((label) => (
                      <th className="px-5 py-4 font-black" key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {applications.map((application, index) => (
                    <tr
                      className="cursor-pointer transition hover:bg-blue-50/50"
                      key={application._id || `${application.candidateEmail}-${application.jobTitle}-${index}`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <td className="px-5 py-4 font-black text-slate-500">#{index + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950">{application.candidateName || '-'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">Candidate</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-600">{application.candidateEmail || '-'}</p>
                        <PhoneReveal application={application} />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{application.jobTitle || '-'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">Applied role</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{application.company || '-'}</td>
                      <td className="px-5 py-4">
                        <ApplicationStatusBadge status={application.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{formatDate(application.createdAt || application.appliedAt)}</td>
                      <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                        <select
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          onChange={(event) => updateApplicationStatus(application, event.target.value)}
                          value={recruiterActionStatuses.includes(application.status) ? application.status : ''}
                        >
                          <option value="">Actions</option>
                          {recruiterActionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Is candidate ke applications nahi mile.</p>
        )}
      </div>
      {selectedApplication && (
        <ApplicationViewModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={(status) => updateApplicationStatus(selectedApplication, status)}
        />
      )}
    </DashboardShell>
  )
}

function ApplicationViewModal({ application, onClose, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <div className="rounded-t-[2rem] bg-slate-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-200">Application View</p>
              <h2 className="mt-2 text-3xl font-black">{application.jobTitle || 'Job Application'}</h2>
              <p className="mt-1 text-sm font-bold text-slate-300">{application.company || 'Company not available'}</p>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl font-black text-white hover:bg-white/20" onClick={onClose} type="button">x</button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-4">
            <div>
              <p className="text-lg font-black text-slate-950">{application.candidateName || '-'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{application.candidateEmail || '-'}</p>
            </div>
            <ApplicationStatusBadge status={application.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoTile label="Mobile" value={getCandidatePhone(application) || '-'} />
            <InfoTile label="Applied Date" value={application.createdAt ? new Date(application.createdAt).toLocaleString() : '-'} />
            <InfoTile label="Application ID" value={String(application._id || '').slice(-8) || '-'} />
            <InfoTile label="Recruiter" value={application.recruiterName || application.recruiterEmail || '-'} />
            <InfoTile label="Resume" value={application.resumeUrl || 'Not attached'} />
            <InfoTile label="Company" value={application.company || '-'} />
          </div>

          {application.coverNote && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Cover Note</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{application.coverNote}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl bg-blue-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-slate-950">Update application stage</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Recruiter action yahin se update hoga.</p>
            </div>
            <select
              className="rounded-full border border-blue-100 bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-500"
              onChange={(event) => onStatusChange(event.target.value)}
              value={recruiterActionStatuses.includes(application.status) ? application.status : ''}
            >
              <option value="">Actions</option>
              {recruiterActionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  )
}

export function RecruiterInterviewsPage() {
  const applications = useRecruiterApplications()
  const interviews = applications.filter((item) => item.status === 'Interview')

  return (
    <DashboardShell title="Interviews" subtitle="Manage upcoming interviews, panel owners, and candidate readiness in one schedule.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CalendarDays} label="This Week" value={String(interviews.length)} />
        <MetricCard icon={Clock3} label="Today" value="0" />
        <MetricCard icon={MessageSquare} label="Feedback Pending" value={String(interviews.length)} />
        <MetricCard icon={CheckCircle2} label="Completed" value="0" />
      </div>

      <Panel title="Interview Schedule">
        {interviews.length ? (
          <div className="grid gap-3">
            {interviews.map((item) => (
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center" key={item._id}>
                <div>
                  <p className="font-black text-slate-950">{item.candidateName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{item.jobTitle} / {item.candidateEmail}</p>
                </div>
                <Button variant="secondary">Open</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500">Aapke account me abhi koi interview scheduled nahi hai.</div>
        )}
      </Panel>
    </DashboardShell>
  )
}

export function RecruiterAnalyticsPage() {
  const applications = useRecruiterApplications()
  const total = applications.length
  const reviewed = countByStatus(applications, ['Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'])
  const applyRate = total ? `${Math.round((reviewed / total) * 100)}%` : '0%'

  return (
    <DashboardShell title="Analytics" subtitle="Measure sourcing, application quality, time-to-shortlist, and job performance.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BarChart3} label="Applications" value={String(total)} />
        <MetricCard icon={UsersRound} label="Reviewed Rate" value={applyRate} />
        <MetricCard icon={Clock3} label="Interviews" value={String(countByStatus(applications, ['Interview']))} />
        <MetricCard icon={ShieldCheck} label="Shortlisted" value={String(countByStatus(applications, ['Shortlisted']))} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ['Pipeline', [`New: ${countByStatus(applications, ['New'])}`, `Reviewed: ${reviewed}`, `Shortlisted: ${countByStatus(applications, ['Shortlisted'])}`]],
          ['Top Roles', applications.slice(0, 4).map((item) => item.jobTitle)],
          ['Hiring Health', [`Total applications: ${total}`, `Interviews: ${countByStatus(applications, ['Interview'])}`, `Selected: ${countByStatus(applications, ['Selected'])}`]],
        ].map(([title, rows]) => (
          <Panel key={title} title={title}>
            <div className="grid gap-3">
              {(rows.length ? rows : ['No data yet']).map((row) => <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700" key={row}>{row}</p>)}
            </div>
          </Panel>
        ))}
      </div>
    </DashboardShell>
  )
}

export function RecruiterTeamPage() {
  const user = getStoredUser()

  return (
    <DashboardShell title="Team" subtitle="Invite collaborators, assign ownership, and keep role-based hiring access organized.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UserPlus} label="Team Members" value="1" />
        <MetricCard icon={ShieldCheck} label="Approvers" value="1" />
        <MetricCard icon={Mail} label="Invites Sent" value="0" />
        <MetricCard icon={CheckCircle2} label="Active" value="1" />
      </div>

      <Panel title="Team Access">
        <div className="grid gap-3">
          <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-black text-slate-950">{user?.name || 'Recruiter'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{user?.email || 'Email not available'} / Owner access</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Active</span>
          </div>
        </div>
      </Panel>
    </DashboardShell>
  )
}
