import { CalendarDays, Mail, Star, UsersRound } from 'lucide-react'
import { Button } from '../components/Button'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

const candidates = [
  { name: 'Neha Sharma', role: 'Frontend Developer', status: 'Shortlisted', match: '94%', location: 'Delhi NCR' },
  { name: 'Rohan Mehta', role: 'Product Designer', status: 'Interview', match: '91%', location: 'Bengaluru' },
  { name: 'Simran Kaur', role: 'HR Executive', status: 'Reviewed', match: '88%', location: 'Mumbai' },
  { name: 'Aditya Rao', role: 'Backend Engineer', status: 'New', match: '86%', location: 'Hyderabad' },
]

export function RecruiterTalentPoolPage() {
  return (
    <DashboardShell title="Talent Pool" subtitle="Review matched candidates, shortlist profiles, and move hiring conversations forward.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Saved Profiles" value="128" />
        <MetricCard icon={Star} label="Top Matches" value="36" />
        <MetricCard icon={CalendarDays} label="Interviews" value="12" />
        <MetricCard icon={Mail} label="Contacted" value="54" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="Candidate Matches">
          <div className="grid gap-3">
            {candidates.map((candidate) => (
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={candidate.name}>
                <div>
                  <p className="font-black text-slate-950">{candidate.name}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{candidate.role} - {candidate.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{candidate.match} match</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{candidate.status}</span>
                  <Button variant="secondary">View</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Shortlist Flow">
          <div className="grid gap-3">
            {['New profiles', 'Screening', 'Shortlisted', 'Interview ready'].map((stage, index) => (
              <div className="rounded-2xl bg-blue-50 p-4" key={stage}>
                <p className="text-2xl font-black text-blue-700">{[42, 28, 16, 9][index]}</p>
                <p className="text-sm font-bold text-slate-600">{stage}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
