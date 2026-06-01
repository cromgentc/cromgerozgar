import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Globe2, MapPin, Search, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'
import { JobCard } from '../components/JobCard'
import { api } from '../services/api'
import { createCompanyDetailPath, getCompanyBySlug } from '../utils/companyProfiles'

export function CompaniesPage() {
  const { companies, loading } = useCompanyProfiles()
  const [query, setQuery] = useState('')
  const visibleCompanies = companies.filter((company) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return [company.name, company.industry, company.location, company.status].filter(Boolean).join(' ').toLowerCase().includes(term)
  })

  return (
    <section className="bg-[#f6f9fc] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[7px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_58%,#fff4e8_100%)] shadow-sm">
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8a00]">Verified company network</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">Explore trusted hiring companies.</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                Browse verified company profiles, active openings, recruiter-backed teams, and hiring locations in one clean directory.
              </p>
              <label className="mt-6 flex min-h-12 max-w-2xl items-center gap-3 rounded-[7px] border border-slate-200 bg-[white] px-4 shadow-sm focus-within:border-[#ff8a00] focus-within:ring-4 focus-within:ring-orange-100">
                <Search className="text-[#ff8a00]" size={19} />
                <input className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, industries, locations" value={query} />
              </label>
            </div>
            <div className="rounded-[7px] border border-white/80 bg-[white]/85 p-5 shadow-lg shadow-blue-100/50">
              <span className="grid h-12 w-12 place-items-center rounded-[7px] bg-orange-50 text-[#ff8a00]">
                <Building2 size={22} />
              </span>
              <p className="mt-5 text-4xl font-black text-slate-950">{companies.length}</p>
              <p className="text-sm font-bold text-slate-500">verified company profiles</p>
              <div className="mt-5 grid gap-2">
                {['Active hiring teams', 'Company job pages', 'Trusted recruiter records'].map((item) => (
                  <span className="inline-flex items-center gap-2 rounded-[7px] bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700" key={item}>
                    <Sparkles className="text-[#ff8a00]" size={14} /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-[7px] border border-slate-200 bg-[white] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">Company Directory</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{visibleCompanies.length} companies found</p>
          </div>
          <span className="rounded-[7px] bg-orange-50 px-3 py-1 text-xs font-black text-[#b85f00] ring-1 ring-orange-100">Verified profiles only</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((item) => <div className="h-48 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200 sm:h-72" key={item} />)
          ) : visibleCompanies.length ? (
            visibleCompanies.map((company) => <CompanyCard company={company} key={company.name} />)
          ) : (
            <div className="rounded-[7px] border border-dashed border-slate-300 bg-[white] p-8 text-center md:col-span-2 xl:col-span-3">
              <Building2 className="mx-auto text-[#ff8a00]" size={34} />
              <h2 className="mt-4 text-2xl font-black text-slate-950">No companies found</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">Approved jobs and complete company records will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function CompanyDetailsPage({ onApply }) {
  const { companySlug } = useParams()
  const { companies, loading } = useCompanyProfiles()
  const company = getCompanyBySlug(companies, companySlug)
  const jobs = company?.jobs || []

  if (!loading && !company) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[7px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-slate-950">Company not found</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-slate-500">This company profile is not available yet.</p>
            <Button className="mt-6" to="/companies">Back to Companies</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button to="/companies" variant="secondary"><ArrowLeft size={17} /> Back to Companies</Button>

        {loading ? (
          <div className="mt-6 h-80 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200" />
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-[7px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 shadow-xl shadow-blue-100/50">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className={`grid h-16 w-16 place-items-center rounded-[7px] bg-gradient-to-br ${company.accent} text-xl font-black text-white shadow-lg shadow-blue-100`}>{company.badge}</div>
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Verified hiring company</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{company.name}</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{company.industry} · {company.location || 'Location not added'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <CompanyMetric icon={SearchCheck} label="Open jobs" value={company.openJobs} />
                  <CompanyMetric icon={ShieldCheck} label="Rating" value={company.rating} />
                  <CompanyMetric icon={MapPin} label="Location" value={company.location || 'NA'} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside className="h-max rounded-[7px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">Company Profile</h2>
                <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600">
                  <Info icon={Building2} label="Industry" value={company.industry || 'Not added'} />
                  <Info icon={MapPin} label="Location" value={company.location || 'Not added'} />
                  <Info icon={ShieldCheck} label="Status" value={company.status || 'Active'} />
                  <Info icon={Globe2} label="Website" value={company.website || 'Not added'} />
                </div>
              </aside>

              <div>
                <div className="mb-5 rounded-[7px] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-black text-slate-700">{jobs.length} active openings at {company.name}</p>
                </div>
                {jobs.length ? (
                  <div className="grid gap-5 xl:grid-cols-2">
                    {jobs.map((job) => <JobCard job={job} key={job._id || job.id} onApply={onApply} />)}
                  </div>
                ) : (
                  <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-10 text-center">
                    <Building2 className="mx-auto text-blue-500" size={34} />
                    <h2 className="mt-4 text-2xl font-black text-slate-950">No openings yet</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">When this company posts approved jobs, they will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function useCompanyProfiles() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api
      .companyProfiles()
      .then((payload) => {
        if (!active) return
        setCompanies(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (!active) return
        setCompanies([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { companies, loading }
}

function CompanyCard({ company }) {
  return (
    <article className="min-w-0 rounded-[7px] border border-slate-200 bg-[white] p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[7px] bg-gradient-to-br ${company.accent} text-lg font-black text-white shadow-lg shadow-blue-100`}>{company.badge}</div>
        <span className="rounded-[7px] bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">{company.status || 'Active'}</span>
      </div>
      <h2 className="mt-5 truncate text-xl font-black text-slate-950">{company.name}</h2>
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{company.industry} / {company.location || 'Location not added'}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[7px] bg-slate-50 p-3"><p className="font-black text-slate-950">{company.openJobs}</p><p className="text-xs text-slate-500">Open jobs</p></div>
        <div className="rounded-[7px] bg-slate-50 p-3"><p className="font-black text-slate-950">{company.rating}</p><p className="text-xs text-slate-500">Rating</p></div>
        <div className="rounded-[7px] bg-slate-50 p-3"><p className="truncate font-black text-slate-950">{company.location || 'NA'}</p><p className="text-xs text-slate-500">Location</p></div>
      </div>
      <Link className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[7px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-orange-50" to={createCompanyDetailPath(company)}>View Jobs</Link>
    </article>
  )
}

function CompanyMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[7px] border border-white bg-white/80 p-4 shadow-sm">
      <Icon className="text-blue-600" size={20} />
      <p className="mt-3 text-xl font-black text-slate-950">{value}</p>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[7px] bg-slate-50 p-4">
      <Icon className="mb-2 text-blue-600" size={18} />
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words font-black text-slate-800">{value}</p>
    </div>
  )
}
