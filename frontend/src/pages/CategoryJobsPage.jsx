import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BriefcaseBusiness, Building2, Clock3, MapPin, SearchCheck, SlidersHorizontal } from 'lucide-react'
import { JobCard } from '../components/JobCard'
import { Button } from '../components/Button'
import { categories } from '../data/portalData'
import { api } from '../services/api'
import { getCategoryBySlug, getJobsForCategory } from '../utils/categoryMatching'

export function CategoryJobsPage({ onApply }) {
  const { categorySlug } = useParams()
  const category = getCategoryBySlug(categories, categorySlug)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [workMode, setWorkMode] = useState('')
  const [jobType, setJobType] = useState('')

  useEffect(() => {
    let active = true

    const loadJobs = async () => {
      setLoading(true)
      try {
        const payload = await api.jobListings('?sort=-createdAt')
        if (active) setJobs(Array.isArray(payload.data) ? payload.data : [])
      } catch {
        if (active) setJobs([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadJobs()

    return () => {
      active = false
    }
  }, [])

  const matchedJobs = useMemo(() => {
    if (!category) return []

    return getJobsForCategory(jobs, category.name).filter((job) => {
      const matchesWorkMode = !workMode || String(job.workMode || '').toLowerCase() === workMode.toLowerCase()
      const matchesType = !jobType || String(job.type || '').toLowerCase() === jobType.toLowerCase()
      return matchesWorkMode && matchesType
    })
  }, [category, jobType, jobs, workMode])

  const topCompanies = useMemo(() => {
    const counts = matchedJobs.reduce((items, job) => {
      const company = job.company || 'Company'
      items[company] = (items[company] || 0) + 1
      return items
    }, {})

    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [matchedJobs])

  if (!category) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[7px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-slate-950">Category not found</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-slate-500">The job category you opened is not available. Please go back and choose another category.</p>
            <Button className="mt-6" to="/">Back to Categories</Button>
          </div>
        </div>
      </section>
    )
  }

  const CategoryIcon = category.icon

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center gap-2 rounded-[7px] bg-white px-4 py-2 text-sm font-black text-slate-600 ring-1 ring-slate-200 hover:text-blue-700" to="/">
          <ArrowLeft size={17} /> Back to categories
        </Link>

        <div className="mt-5 overflow-hidden rounded-[7px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 shadow-xl shadow-blue-100/50">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className={`grid h-14 w-14 place-items-center rounded-[7px] ${category.color}`}>
                <CategoryIcon size={25} />
              </div>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-blue-600">Category openings</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{category.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Dynamic openings matched using title, skills, department, work mode, company, and description signals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric icon={BriefcaseBusiness} label="Open roles" value={matchedJobs.length} />
              <Metric icon={Building2} label="Companies" value={topCompanies.length} />
              <Metric icon={SearchCheck} label="SEO matched" value="Live" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-max rounded-[7px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">Filters</h2>
              <SlidersHorizontal className="text-blue-600" size={19} />
            </div>
            <div className="grid gap-4">
              <label>
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Work mode</span>
                <select className="mt-2 w-full rounded-[7px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" onChange={(event) => setWorkMode(event.target.value)} value={workMode}>
                  <option value="">All work modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Job type</span>
                <select className="mt-2 w-full rounded-[7px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" onChange={(event) => setJobType(event.target.value)} value={jobType}>
                  <option value="">All job types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </label>

              <div className="rounded-[7px] bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">Top companies</p>
                <div className="mt-3 grid gap-2">
                  {topCompanies.length ? topCompanies.map(([company, count]) => (
                    <p className="flex items-center justify-between rounded-[7px] bg-white px-3 py-2 text-sm font-bold text-slate-600" key={company}>
                      <span>{company}</span>
                      <span className="text-blue-700">{count}</span>
                    </p>
                  )) : (
                    <p className="text-sm font-semibold text-slate-500">No company data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-[7px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
              <p className="text-sm font-black text-slate-700">
                {loading ? 'Loading openings...' : `${matchedJobs.length} ${category.name} openings found`}
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-black text-slate-500">
                <span className="rounded-[7px] bg-blue-50 px-3 py-1 text-blue-700">Active jobs only</span>
                <span className="rounded-[7px] bg-teal-50 px-3 py-1 text-teal-700">Dynamic API</span>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => <div className="h-72 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200" key={item} />)}
              </div>
            ) : matchedJobs.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {matchedJobs.map((job) => <JobCard job={job} key={job._id || job.id} onApply={onApply} />)}
              </div>
            ) : (
              <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-10 text-center">
                <Clock3 className="mx-auto text-blue-500" size={34} />
                <h2 className="mt-4 text-2xl font-black text-slate-950">No openings in this category yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                  When admin or recruiter adds active jobs related to this category, they will appear here automatically.
                </p>
                <Button className="mt-6" to="/jobs">Browse All Jobs</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[7px] border border-white bg-white/80 p-4 shadow-sm">
      <Icon className="text-blue-600" size={20} />
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}
