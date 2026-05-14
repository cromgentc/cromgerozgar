import { BarChart3, BriefcaseBusiness, Building2, CalendarDays, FilePlus2, SearchCheck, UserPlus, UsersRound } from 'lucide-react'
import { Button } from '../components/Button'
import { jobs } from '../data/portalData'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

export function EmployerDashboard() {
  const { data } = useApiResource(() => api.employerDashboard(), { metrics: {}, jobs, activity: [] }, [])
  const metrics = data.metrics || {}
  const dashboardJobs = Array.isArray(data.jobs) && data.jobs.length ? data.jobs : jobs

  return (
    <DashboardShell title="Recruiter Dashboard" subtitle="A premium hiring command center for jobs, applications, shortlists, interviews, analytics, and team collaboration.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FilePlus2} label="Total Jobs" value={String(metrics.totalJobs ?? 42)} />
        <MetricCard icon={UsersRound} label="Active Applications" value={String(metrics.activeApplications ?? 318)} />
        <MetricCard icon={BriefcaseBusiness} label="Shortlisted" value={String(metrics.shortlistedCandidates ?? 76)} />
        <MetricCard icon={CalendarDays} label="Interviews" value={String(metrics.interviewSchedule ?? 24)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Panel title="Hiring Analytics">
            <div className="grid gap-4 md:grid-cols-3">
              {['18.4k Job Views', '12.6% Apply Rate', '8.2 Days Avg Shortlist'].map((item) => <div className="rounded-2xl bg-blue-50 p-4 font-black text-blue-700" key={item}>{item}</div>)}
            </div>
            <Button className="mt-4" to="/recruiter-analytics" variant="secondary">Open Analytics</Button>
          </Panel>
          <Panel title="Manage Active Jobs">
            <div className="grid gap-3">
              {dashboardJobs.map((job) => (
                <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center" key={job._id || job.id}>
                  <div><p className="font-bold text-slate-950">{job.title}</p><p className="text-sm text-slate-500">{job.location} · {job.type} · {job.workMode}</p></div>
                  <Button to="/recruiter-applications" variant="secondary">View Applications</Button>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Candidate Pipeline">
            <div className="grid gap-3 md:grid-cols-4">
              {['New', 'Reviewed', 'Shortlisted', 'Interview'].map((stage, index) => <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200" key={stage}><p className="text-2xl font-black text-slate-950">{[84, 52, 26, 12][index]}</p><p className="text-sm font-bold text-slate-500">{stage}</p></div>)}
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
            <div className="grid gap-3">{['Neha Sharma', 'Rohan Mehta', 'Simran Kaur', 'Aditya Rao'].map((name) => <p className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700" key={name}>{name}</p>)}</div>
          </Panel>
          <Panel title="Shortlisted Candidates">
            <div className="grid gap-3">{['Rohan Mehta', 'Neha Sharma'].map((name) => <p className="rounded-2xl bg-teal-50 p-4 font-semibold text-teal-800" key={name}>{name}</p>)}</div>
          </Panel>
          <Panel title="Team Members">
            <div className="grid gap-3">{['Hiring Manager', 'Recruiter', 'Interviewer'].map((name) => <p className="rounded-2xl bg-violet-50 p-4 font-semibold text-violet-800" key={name}>{name}</p>)}</div>
          </Panel>
          <Panel title="Company Profile">
            <Building2 className="text-blue-600" />
            <p className="mt-3 text-sm leading-6 text-slate-500">Nimbus Tech · Cloud software · Verified recruiter · 42 active openings</p>
          </Panel>
          <Panel title="Performance">
            <BarChart3 className="text-blue-600" size={28} />
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">Job performance analytics updated today.</p>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  )
}
