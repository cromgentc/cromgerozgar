import { useEffect, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, Plus, X } from 'lucide-react'
import { Button } from '../components/Button'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

export function RecruiterJobsPage() {
  const user = getStoredUser()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user?.email) {
      setJobs([])
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .jobs(`?recruiterEmail=${encodeURIComponent(user.email)}&sort=-createdAt&limit=100`)
      .then((payload) => {
        setJobs(payload.data || [])
        setMessage('')
      })
      .catch((error) => {
        setJobs([])
        setMessage(error.message || 'Jobs load nahi ho paya.')
      })
      .finally(() => setLoading(false))
  }, [user?.email])

  const activeJobs = jobs.filter((job) => ['Open', 'Active'].includes(job.status)).length
  const pendingJobs = jobs.filter((job) => job.accountDepartmentStatus === 'Pending' || job.approval === 'Pending').length
  const approvedJobs = jobs.filter((job) => job.accountDepartmentStatus === 'Active' || job.approval === 'Approved').length
  const rejectedJobs = jobs.filter((job) => job.accountDepartmentStatus === 'Rejected' || job.approval === 'Rejected').length

  return (
    <DashboardShell title="My Posted Jobs" subtitle="Aapke recruiter account se post kiye gaye jobs yahan ek-ek karke show honge.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BriefcaseBusiness} label="Total Jobs" value={String(jobs.length)} />
        <MetricCard icon={CheckCircle2} label="Active Jobs" value={String(activeJobs)} />
        <MetricCard icon={Clock3} label="Pending Review" value={String(pendingJobs)} />
        <MetricCard icon={CalendarDays} label="Approved / Rejected" value={`${approvedJobs} / ${rejectedJobs}`} />
      </div>

      <Panel title="Posted Jobs">
        <div className="mb-5 flex justify-end">
          <Button to="/post-job"><Plus size={18} /> Post New Job</Button>
        </div>

        {message && <p className="mb-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{message}</p>}
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Loading your posted jobs...</p>
        ) : jobs.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {['Sr No', 'Job ID', 'Job Title', 'Company', 'Department', 'Location', 'Type', 'Work Mode', 'Salary', 'Account Status', 'Approval', 'Remark', 'Created'].map((label) => (
                    <th className="whitespace-nowrap px-4 py-3 font-black" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job, index) => (
                  <tr className="cursor-pointer transition hover:bg-blue-50/60" key={job._id} onClick={() => setSelectedJob(job)}>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-600">#{index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-600">{getShortId(job._id)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-black text-slate-900">{job.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.company}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.department || 'Not added'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.location}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.type || 'Not added'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.workMode || 'Not added'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.salary || 'Not disclosed'}</td>
                    <td className="whitespace-nowrap px-4 py-3"><StatusBadge label={job.accountDepartmentStatus || 'Pending'} tone={job.accountDepartmentStatus === 'Active' ? 'teal' : job.accountDepartmentStatus === 'Rejected' ? 'rose' : 'amber'} /></td>
                    <td className="whitespace-nowrap px-4 py-3"><StatusBadge label={job.approval || 'Pending'} tone={job.approval === 'Approved' ? 'teal' : job.approval === 'Rejected' ? 'rose' : 'amber'} /></td>
                    <td className="max-w-[240px] truncate px-4 py-3 font-semibold text-rose-700">{job.accountDepartmentRemark || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Not added'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <BriefcaseBusiness className="mx-auto text-blue-600" size={34} />
            <h2 className="mt-4 text-xl font-black text-slate-950">No jobs posted yet</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Aap jab job post karenge, woh yahan show hoga.</p>
            <Button className="mt-5" to="/post-job"><Plus size={18} /> Post First Job</Button>
          </div>
        )}
      </Panel>
      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </DashboardShell>
  )
}

function getShortId(value) {
  return value ? String(value).slice(-8) : ''
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800">{value}</p>
    </div>
  )
}

function JobDetailsModal({ job, onClose }) {
  if (!job) return null

  const fields = [
    ['Job ID', getShortId(job._id)],
    ['Title', job.title],
    ['Company', job.company],
    ['Department', job.department || 'Not added'],
    ['Location', job.location || 'Not added'],
    ['Salary', job.salary || 'Not disclosed'],
    ['Experience', job.experience || 'Not added'],
    ['Job type', job.type || 'Not added'],
    ['Work mode', job.workMode || 'Not added'],
    ['Package', job.packageName || 'Not added'],
    ['Account status', job.accountDepartmentStatus || 'Pending'],
    ['Approval', job.approval || 'Pending'],
    ['Created', job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Not added'],
  ]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">Job Details</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{job.title}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{job.company} / {job.location}</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {job.accountDepartmentRemark && (
          <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-800">
            <span className="font-black">Admin remark:</span> {job.accountDepartmentRemark}
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {fields.map(([label, value]) => <Info key={label} label={label} value={value} />)}
        </div>

        <div className="mt-5 grid gap-4">
          <LongInfo label="Skills" value={Array.isArray(job.skills) ? job.skills.join(', ') : job.skills} />
          <LongInfo label="Description" value={job.description} />
          <LongInfo label="Responsibilities" value={Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities} />
          <LongInfo label="Requirements" value={Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements} />
          <LongInfo label="Benefits" value={Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits} />
        </div>
      </div>
    </div>
  )
}

function LongInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{value || 'Not added'}</p>
    </div>
  )
}

function StatusBadge({ label, tone = 'blue' }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    rose: 'bg-rose-50 text-rose-700',
    teal: 'bg-teal-50 text-teal-700',
  }

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tones[tone] || tones.blue}`}>{label}</span>
}
