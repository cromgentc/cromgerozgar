import { BookOpen, FileCheck2, HelpCircle, ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { DashboardShell, MetricCard, Panel } from './CandidateDashboard'

const resources = [
  ['Hiring Guide', 'Build cleaner job descriptions and screening steps for faster shortlisting.'],
  ['Interview Checklist', 'Standardize role fit, culture fit, and offer readiness reviews.'],
  ['Recruiter Policy', 'Review platform rules, profile quality checks, and hiring best practices.'],
  ['Support Center', 'Get help with job posting, applications, billing, and recruiter profile setup.'],
]

export function RecruiterResourcesPage() {
  return (
    <DashboardShell title="Resources" subtitle="Recruiter guides, checklists, and support resources for managing hiring work.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BookOpen} label="Guides" value="18" />
        <MetricCard icon={FileCheck2} label="Templates" value="12" />
        <MetricCard icon={ShieldCheck} label="Policies" value="6" />
        <MetricCard icon={HelpCircle} label="Support Topics" value="24" />
      </div>

      <div className="mt-6">
        <Panel title="Recruiter Library">
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map(([title, text]) => (
              <div className="rounded-2xl bg-slate-50 p-5" key={title}>
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                <Button className="mt-4" variant="secondary">Open</Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}
