import { SlidersHorizontal } from 'lucide-react'
import { JobCard } from '../components/JobCard'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/PortalUI'
import { jobs } from '../data/portalData'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'

const filters = {
  Location: ['Remote', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'],
  Experience: ['0-1 years', '1-3 years', '3-6 years', '6+ years'],
  Salary: ['3-6 LPA', '6-10 LPA', '10-18 LPA', '18+ LPA'],
  'Job Type': ['Full Time', 'Part Time', 'Contract', 'Freelance'],
  'Work Mode': ['Remote', 'Hybrid', 'On-site'],
  Skills: ['React', 'CRM', 'Analytics', 'SEO', 'Excel', 'Tailwind'],
  Company: ['Nimbus Tech', 'Talentora', 'Auralis Support', 'BluePeak Finance'],
  Department: ['Engineering', 'Growth', 'Customer Success', 'Research Operations'],
}

export function JobsPage({ onApply }) {
  const { data: apiJobs } = useApiResource(() => api.jobs(), jobs, [])
  const list = Array.isArray(apiJobs) ? apiJobs : jobs

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-5 sm:p-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Enterprise Job Listings</h1>
          <p className="mt-3 text-slate-500">Search, filter, save, and apply to trusted premium opportunities.</p>
          <div className="mt-6"><SearchBar compact /></div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[310px_1fr]">
          <aside className="h-max rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-black text-slate-950">Advanced Filters</h2>
              <SlidersHorizontal className="text-blue-600" size={19} />
            </div>
            <div className="grid gap-6">
              {Object.entries(filters).map(([name, values]) => (
                <div key={name}>
                  <h3 className="mb-3 text-sm font-bold text-slate-800">{name}</h3>
                  <div className="grid gap-2">
                    {values.map((value) => (
                      <label className="flex items-center gap-2 text-sm text-slate-500" key={value}>
                        <input className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600" type="checkbox" />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-slate-600">Showing {list.length} premium jobs</p>
              <select className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 outline-none">
                <option>Sort by relevance</option>
                <option>Sort by newest</option>
                <option>Sort by salary</option>
                <option>Sort by featured</option>
              </select>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {list.map((job) => <JobCard job={job} key={job._id || job.id} onApply={onApply} />)}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {[1, 2, 3, 4].map((page) => (
                <button className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold ${page === 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`} key={page} type="button">
                  {page}
                </button>
              ))}
            </div>
            <div className="mt-8"><EmptyState /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
