import { BarChart3, CalendarDays, CheckCircle2, ClipboardList, Clock3, Mail, MessageSquare, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { Button } from '../components/Button'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

const applications = [
  { candidate: 'Neha Sharma', job: 'Senior React Engineer', stage: 'Shortlisted', owner: 'Hiring Manager', score: '94%', date: 'Today' },
  { candidate: 'Rohan Mehta', job: 'Performance Marketing Manager', stage: 'Interview', owner: 'Recruiter', score: '91%', date: 'Tomorrow' },
  { candidate: 'Simran Kaur', job: 'Customer Success Specialist', stage: 'Reviewed', owner: 'Recruiter', score: '86%', date: '18 May' },
  { candidate: 'Aditya Rao', job: 'Data Collection Lead', stage: 'New', owner: 'Coordinator', score: '82%', date: '20 May' },
]

const interviews = [
  { candidate: 'Rohan Mehta', role: 'Performance Marketing Manager', time: '10:30 AM', mode: 'Video', panel: 'Growth Lead' },
  { candidate: 'Neha Sharma', role: 'Senior React Engineer', time: '02:00 PM', mode: 'Technical', panel: 'Frontend Lead' },
  { candidate: 'Simran Kaur', role: 'Customer Success Specialist', time: '04:30 PM', mode: 'HR Round', panel: 'People Ops' },
]

const team = [
  { name: 'Hiring Manager', role: 'Approver', access: 'Jobs, offers, interviews', status: 'Active' },
  { name: 'Recruiter', role: 'Pipeline owner', access: 'Applications, resumes, shortlists', status: 'Active' },
  { name: 'Interviewer', role: 'Evaluator', access: 'Interview feedback', status: 'Invited' },
]

export function RecruiterApplicationsPage() {
  return (
    <DashboardShell title="Applications" subtitle="Track candidate movement across review, shortlist, interview, and offer stages.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ClipboardList} label="Total Applications" value="318" />
        <MetricCard icon={CheckCircle2} label="Reviewed" value="156" />
        <MetricCard icon={UsersRound} label="Shortlisted" value="76" />
        <MetricCard icon={CalendarDays} label="Interviews" value="24" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title="Application Pipeline">
          <div className="grid gap-3">
            {applications.map((item) => (
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 xl:grid-cols-[1fr_auto] xl:items-center" key={`${item.candidate}-${item.job}`}>
                <div>
                  <p className="font-black text-slate-950">{item.candidate}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{item.job} - {item.owner}</p>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{item.score} match</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{item.stage}</span>
                  <Button variant="secondary">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Stage Summary">
          <div className="grid gap-3">
            {['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer'].map((stage, index) => (
              <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4" key={stage}>
                <span className="text-sm font-black text-blue-700">{stage}</span>
                <span className="text-xl font-black text-slate-950">{[84, 52, 26, 12, 4][index]}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}

export function RecruiterInterviewsPage() {
  return (
    <DashboardShell title="Interviews" subtitle="Manage upcoming interviews, panel owners, and candidate readiness in one schedule.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CalendarDays} label="This Week" value="24" />
        <MetricCard icon={Clock3} label="Today" value="3" />
        <MetricCard icon={MessageSquare} label="Feedback Pending" value="7" />
        <MetricCard icon={CheckCircle2} label="Completed" value="18" />
      </div>

      <Panel title="Interview Schedule">
        <div className="grid gap-3">
          {interviews.map((item) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[120px_1fr_auto] md:items-center" key={`${item.candidate}-${item.time}`}>
              <div className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200">
                <p className="text-lg font-black text-slate-950">{item.time}</p>
                <p className="text-xs font-black uppercase text-blue-700">{item.mode}</p>
              </div>
              <div>
                <p className="font-black text-slate-950">{item.candidate}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.role} - {item.panel}</p>
              </div>
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardShell>
  )
}

export function RecruiterAnalyticsPage() {
  return (
    <DashboardShell title="Analytics" subtitle="Measure sourcing, application quality, time-to-shortlist, and job performance.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BarChart3} label="Job Views" value="18.4k" />
        <MetricCard icon={UsersRound} label="Apply Rate" value="12.6%" />
        <MetricCard icon={Clock3} label="Avg Shortlist" value="8.2d" />
        <MetricCard icon={ShieldCheck} label="Quality Score" value="91%" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ['Source Quality', ['Direct: 42%', 'Search: 31%', 'Alerts: 18%', 'Referrals: 9%']],
          ['Top Roles', ['React Engineer', 'Marketing Manager', 'Customer Success', 'Data Lead']],
          ['Hiring Health', ['Fast response: 88%', 'SLA met: 92%', 'Offer acceptance: 67%', 'Drop-off risk: Low']],
        ].map(([title, rows]) => (
          <Panel key={title} title={title}>
            <div className="grid gap-3">
              {rows.map((row) => <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700" key={row}>{row}</p>)}
            </div>
          </Panel>
        ))}
      </div>
    </DashboardShell>
  )
}

export function RecruiterTeamPage() {
  return (
    <DashboardShell title="Team" subtitle="Invite collaborators, assign ownership, and keep role-based hiring access organized.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UserPlus} label="Team Members" value="6" />
        <MetricCard icon={ShieldCheck} label="Approvers" value="2" />
        <MetricCard icon={Mail} label="Invites Sent" value="3" />
        <MetricCard icon={CheckCircle2} label="Active" value="5" />
      </div>

      <Panel title="Team Access">
        <div className="grid gap-3">
          {team.map((member) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center" key={member.name}>
              <div>
                <p className="font-black text-slate-950">{member.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{member.role} - {member.access}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{member.status}</span>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardShell>
  )
}
