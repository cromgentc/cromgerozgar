import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'
import { DashboardShell, Panel } from './CandidateDashboard'

const plans = [
  {
    name: 'Starter',
    price: 'INR 0',
    note: 'For new recruiters getting started',
    features: ['1 active job', 'Basic candidate visibility', 'Recruiter profile', 'Email support'],
  },
  {
    name: 'Growth',
    price: 'INR 4,999',
    note: 'For growing hiring teams',
    features: ['10 active jobs', 'Candidate shortlisting', 'Hiring analytics', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    note: 'For high-volume hiring workflows',
    features: ['Unlimited jobs', 'Resume database access', 'Team collaboration', 'Dedicated success support'],
  },
]

export function RecruiterPricingPage() {
  return (
    <DashboardShell title="Recruiter Pricing" subtitle="Choose a hiring plan for posting jobs, reviewing candidates, and scaling your recruitment workflow.">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article className={`rounded-[2rem] border bg-white p-6 shadow-sm ${plan.highlighted ? 'border-blue-200 shadow-xl shadow-blue-100' : 'border-slate-200'}`} key={plan.name}>
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${plan.highlighted ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <CreditCard size={22} />
              </span>
              {plan.highlighted && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">Popular</span>}
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950">{plan.name}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{plan.note}</p>
            <p className="mt-5 text-3xl font-black text-slate-950">{plan.price}</p>
            <div className="mt-6 grid gap-3">
              {plan.features.map((feature) => (
                <p className="flex items-center gap-3 text-sm font-bold text-slate-600" key={feature}>
                  <CheckCircle2 className="text-teal-500" size={18} />
                  {feature}
                </p>
              ))}
            </div>
            <Button className="mt-6 w-full" to="/post-job" variant={plan.highlighted ? 'primary' : 'secondary'}>
              Start Hiring
            </Button>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Plan Benefits">
          <div className="grid gap-3">
            {[
              [Sparkles, 'Better hiring visibility across premium job listings'],
              [ShieldCheck, 'Verified recruiter profile and clean hiring workspace'],
            ].map(([Icon, text]) => (
              <p className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700" key={text}>
                <Icon size={18} />
                {text}
              </p>
            ))}
          </div>
        </Panel>
        <Panel title="Need Help Choosing?">
          <p className="text-sm leading-7 text-slate-500">
            Choose Starter for basic posting, Growth for active hiring, or Enterprise for larger recruitment teams and dedicated workflows.
          </p>
        </Panel>
      </div>
    </DashboardShell>
  )
}
