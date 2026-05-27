import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { categories } from '../data/portalData'
import { api } from '../services/api'
import { createCategoryJobsPath, getJobsForCategory } from '../utils/categoryMatching'

export function IndustriesPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.jobListings('?sort=-createdAt')
      .then((payload) => {
        if (active) setJobs(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setJobs([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const industryCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category.name] = getJobsForCategory(jobs, category.name).length
      return counts
    }, {})
  }, [jobs])

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button to="/" variant="secondary"><ArrowLeft size={17} /> Back Home</Button>
        <div className="mt-6 rounded-[7px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6 shadow-sm sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-[7px] bg-blue-600 text-white">
            <Building2 size={22} />
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">All Industries</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            Browse every verified industry path and open roles powered by live CromGen Rozgar jobs.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            const count = industryCounts[category.name] || 0
            return (
              <Link
                className="group min-h-40 rounded-[7px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                key={category.name}
                to={createCategoryJobsPath(category)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-[7px] ${category.color}`}>
                    <Icon size={21} />
                  </div>
                  <span className="rounded-[7px] bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                    {loading ? '...' : `${count} roles`}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950 group-hover:text-blue-600">{category.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  {loading ? 'Loading live openings...' : `${count} open roles in ${category.name}`}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
