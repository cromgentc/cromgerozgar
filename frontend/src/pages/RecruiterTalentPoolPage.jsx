import { CalendarDays, Mail, Search, Star, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FreelancerCard } from '../components/FreelancerCard'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'
import { featuredFreelancers } from '../data/marketplaceData'

export function RecruiterTalentPoolPage() {
  const [query, setQuery] = useState('')
  const visibleFreelancers = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return featuredFreelancers
    return featuredFreelancers.filter((freelancer) => [freelancer.name, freelancer.role, freelancer.location, ...freelancer.skills].join(' ').toLowerCase().includes(term))
  }, [query])

  const notify = (message) => window.dispatchEvent(new CustomEvent('portalToast', { detail: { message } }))

  return (
    <DashboardShell title="Freelancer Talent Pool" subtitle="Search verified freelancers, shortlist profiles, and move hiring conversations forward.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Saved Profiles" value="128" />
        <MetricCard icon={Star} label="Top Matches" value="36" />
        <MetricCard icon={CalendarDays} label="Interviews" value="12" />
        <MetricCard icon={Mail} label="Contacted" value="54" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel title="Freelancer Matches">
          <label className="mb-5 flex min-h-12 items-center gap-3 rounded-[7px] bg-slate-50 px-4">
            <Search className="text-[#0057B8]" size={18} />
            <input className="w-full bg-transparent text-sm font-semibold outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search skills, name, role, location" value={query} />
          </label>
          {visibleFreelancers.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleFreelancers.map((freelancer) => (
                <FreelancerCard
                  freelancer={freelancer}
                  key={freelancer.id}
                  onHire={() => notify(`${freelancer.name} hire flow opened`)}
                  onShortlist={() => notify(`${freelancer.name} shortlisted`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-bold text-slate-500">
              No freelancers match this search.
            </div>
          )}
        </Panel>

        <Panel title="Shortlist Flow">
          <div className="grid gap-3">
            {[
              ['New profiles', 42],
              ['Screening', 28],
              ['Shortlisted', 16],
              ['Interview ready', 9],
            ].map(([stage, count]) => (
              <div className="rounded-[7px] bg-[#0057B8]/8 p-4" key={stage}>
                <p className="text-2xl font-black text-[#0057B8]">{count}</p>
                <p className="text-sm font-bold text-slate-600">{stage}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
