import { Building2 } from 'lucide-react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { companies } from '../data/portalData'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'

export function CompaniesPage() {
  const { data: apiCompanies } = useApiResource(() => api.companies(), companies, [])
  const list = Array.isArray(apiCompanies) ? apiCompanies : companies

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6 sm:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white"><Building2 size={25} /></div>
          <h1 className="mt-5 text-3xl font-black text-slate-950 sm:text-5xl">Top Companies Hiring</h1>
          <p className="mt-3 max-w-2xl text-slate-500">Explore verified company profiles, industry details, locations, ratings, and active openings.</p>
        </div>
      </div>
      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((company) => (
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={company.name}>
              <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${company.accent} text-xl font-black text-white shadow-lg shadow-blue-100`}>{company.badge}</div>
              <h2 className="mt-5 text-xl font-black text-slate-950">{company.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{company.industry}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">{company.jobs}</p><p className="text-xs text-slate-500">Open jobs</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">{company.rating}</p><p className="text-xs text-slate-500">Rating</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="font-black text-slate-950">{company.location}</p><p className="text-xs text-slate-500">Location</p></div>
              </div>
              <Button className="mt-5 w-full" to="/jobs">View Company Jobs</Button>
            </article>
          ))}
        </div>
      </Section>
    </section>
  )
}
