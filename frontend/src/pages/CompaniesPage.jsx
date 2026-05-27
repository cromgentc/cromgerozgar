import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Globe2, MapPin, SearchCheck, ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { JobCard } from '../components/JobCard'
import { api } from '../services/api'
import { createCompanyDetailPath, getCompanyBySlug } from '../utils/companyProfiles'

export function CompaniesPage() {
  const { companies, loading } = useCompanyProfiles()

  return (
    <section className="py-4 sm:py-14">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="rounded-[7px] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 shadow-sm ring-1 ring-blue-100 sm:p-8">
          <div className="grid h-10 w-10 place-items-center rounded-[7px] bg-blue-600 text-white sm:h-14 sm:w-14"><Building2 size={22} /></div>
          <h1 className="mt-4 text-2xl font-black text-slate-950 sm:mt-5 sm:text-5xl">Top Companies Hiring</h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-slate-500 sm:mt-3 sm:text-base sm:font-normal sm:leading-6">Verified company profiles generated from active jobs, recruiter records, and live MongoDB company data.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((item) => <div className="h-48 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200 sm:h-72" key={item} />)
          ) : companies.length ? (
            companies.map((company) => <CompanyCard company={company} key={company.name} />)
          ) : (
            <div className="col-span-2 rounded-[7px] border border-dashed border-slate-300 bg-white p-8 text-center md:col-span-2 lg:col-span-3">
              <Building2 className="mx-auto text-blue-500" size={34} />
              <h2 className="mt-4 text-2xl font-black text-slate-950">No active companies yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">Approved jobs will automatically create company profiles here.</p>
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
    <article className="min-w-0 rounded-[7px] border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100 sm:p-6">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-gradient-to-br ${company.accent} text-sm font-black text-white shadow-lg shadow-blue-100 sm:h-16 sm:w-16 sm:text-xl`}>{company.badge}</div>
        <span className="rounded-[7px] bg-teal-50 px-2 py-1 text-[10px] font-black text-teal-700 sm:px-3 sm:text-xs">{company.rating} rating</span>
      </div>
      <h2 className="mt-3 truncate text-sm font-black text-slate-950 sm:mt-5 sm:text-xl">{company.name}</h2>
      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-5">{company.industry} - {company.location || 'Location not added'}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:mt-5 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-[7px] bg-slate-50 p-2 sm:p-3"><p className="text-sm font-black text-slate-950 sm:text-base">{company.openJobs}</p><p className="text-[10px] text-slate-500 sm:text-xs">Open jobs</p></div>
        <div className="rounded-[7px] bg-slate-50 p-2 sm:p-3"><p className="text-sm font-black text-slate-950 sm:text-base">{company.rating}</p><p className="text-[10px] text-slate-500 sm:text-xs">Rating</p></div>
        <div className="hidden rounded-[7px] bg-slate-50 p-3 sm:block"><p className="truncate font-black text-slate-950">{company.location || 'NA'}</p><p className="text-xs text-slate-500">Location</p></div>
      </div>
      <Button className="mt-3 min-h-9 w-full text-xs sm:mt-5 sm:min-h-11 sm:text-sm" to={createCompanyDetailPath(company)}>View Jobs</Button>
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
