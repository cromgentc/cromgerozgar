import { BarChart3, BriefcaseBusiness, Building2, CalendarDays, FilePlus2, SearchCheck, UserPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApiResource } from '../hooks/useApiResource'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

export function EmployerDashboard() {
  const user = getStoredUser()
  const { data } = useApiResource(() => api.employerDashboard(user?.email), { metrics: {}, jobs: [], applications: [], shortlistedApplications: [], activity: [] }, [user?.email])
  const metrics = data.metrics || {}
  const dashboardJobs = Array.isArray(data.jobs) ? data.jobs : []
  const applications = Array.isArray(data.applications) ? data.applications : []
  const shortlistedApplications = Array.isArray(data.shortlistedApplications) ? data.shortlistedApplications : []

  return (
    <DashboardShell title="Recruiter Dashboard" subtitle="A premium hiring command center for jobs, applications, shortlists, interviews, analytics, and team collaboration.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-jobs">
          <MetricCard icon={FilePlus2} label="Total Jobs" value={String(metrics.totalJobs ?? 0)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=active">
          <MetricCard icon={UsersRound} label="Active Applications" value={String(metrics.activeApplications ?? 0)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=shortlisted">
          <MetricCard icon={BriefcaseBusiness} label="Shortlisted" value={String(metrics.shortlistedCandidates ?? 0)} />
        </Link>
        <Link className="block rounded-[1.5rem] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" to="/recruiter-applications?status=interview">
          <MetricCard icon={CalendarDays} label="Interviews" value={String(metrics.interviewSchedule ?? 0)} />
        </Link>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Panel title="Hiring Analytics">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                `${metrics.totalJobs ?? 0} Jobs`,
                `${metrics.activeApplications ?? 0} Active applications`,
                `${metrics.shortlistedCandidates ?? 0} Shortlisted`,
              ].map((item) => <div className="rounded-2xl bg-blue-50 p-4 font-black text-blue-700" key={item}>{item}</div>)}
            </div>
            <Button className="mt-4" to="/recruiter-analytics" variant="secondary">Open Analytics</Button>
          </Panel>
          <Panel title="Manage Active Jobs">
            {dashboardJobs.length ? (
              <div className="grid gap-3">
                {dashboardJobs.map((job) => (
                  <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center" key={job._id || job.id}>
                    <div><p className="font-bold text-slate-950">{job.title}</p><p className="text-sm text-slate-500">{job.location} / {job.type} / {job.workMode}</p></div>
                    <Button to="/recruiter-applications" variant="secondary">View Applications</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6 text-sm font-bold text-slate-500">
                Aapke account me abhi koi job post nahi hai.
              </div>
            )}
          </Panel>
          <Panel title="Candidate Pipeline">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ['New', applications.filter((item) => item.status === 'New').length],
                ['Reviewed', applications.filter((item) => item.status === 'Reviewed').length],
                ['Shortlisted', shortlistedApplications.length],
                ['Interview', applications.filter((item) => item.status === 'Interview').length],
              ].map(([stage, count]) => <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200" key={stage}><p className="text-2xl font-black text-slate-950">{count}</p><p className="text-sm font-bold text-slate-500">{stage}</p></div>)}
            </div>
          </Panel>
        </div>
        <div className="grid h-max gap-6">
          <Panel title="Quick Actions">
            <div className="grid gap-3">
              <Button className="w-full" to="/post-job"><FilePlus2 size={18} /> Create New Job</Button>
              <Button className="w-full" to="/recruiter-find-resume" variant="secondary"><SearchCheck size={18} /> Find Resume</Button>
              <Button className="w-full" to="/recruiter-interviews" variant="secondary"><CalendarDays size={18} /> Interviews</Button>
              <Button className="w-full" to="/recruiter-team" variant="secondary"><UserPlus size={18} /> Team Access</Button>
            </div>
          </Panel>
          <Panel title="Candidate List">
            {applications.length ? (
              <div className="grid gap-3">{applications.map((item) => <p className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700" key={item._id}>{item.candidateName}</p>)}</div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Aapke jobs par abhi koi candidate nahi hai.</p>
            )}
          </Panel>
          <Panel title="Shortlisted Candidates">
            {shortlistedApplications.length ? (
              <div className="grid gap-3">{shortlistedApplications.map((item) => <p className="rounded-2xl bg-teal-50 p-4 font-semibold text-teal-800" key={item._id}>{item.candidateName}</p>)}</div>
            ) : (
              <p className="rounded-2xl bg-teal-50 p-4 text-sm font-bold text-teal-800">Aapke account me abhi koi shortlisted candidate nahi hai.</p>
            )}
          </Panel>
          <Panel title="Team Members">
            <div className="grid gap-3">
              <p className="rounded-2xl bg-violet-50 p-4 font-semibold text-violet-800">{user?.name || 'Recruiter'}</p>
            </div>
          </Panel>
          <Panel title="Company Profile">
            <Building2 className="text-blue-600" />
            <p className="mt-3 text-sm leading-6 text-slate-500">{user?.name || 'Recruiter'} / {user?.email || 'Email not available'} / {metrics.totalJobs ?? 0} posted jobs</p>
          </Panel>
          <Panel title="Performance">
            <BarChart3 className="text-blue-600" size={28} />
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">Job performance analytics updated from your own recruiter account.</p>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  )
}
