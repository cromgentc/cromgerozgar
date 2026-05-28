import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { api } from '../services/api'
import { createCategoryJobsPath, getJobsForCategory } from '../utils/categoryMatching'
import { decorateCategories } from '../utils/portalResources'

export function IndustriesPage() {
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      api.jobListings('?sort=-createdAt'),
      api.listAll('categories', '?status=Active&sort=name'),
    ])
      .then(([jobsPayload, categoriesPayload]) => {
        if (active) {
          setJobs(Array.isArray(jobsPayload.data) ? jobsPayload.data : [])
          setCategories(decorateCategories(Array.isArray(categoriesPayload.data) ? categoriesPayload.data : []))
        }
      })
      .catch(() => {
        if (active) {
          setJobs([])
          setCategories([])
        }
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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button to="/" variant="secondary"><ArrowLeft size={17} /> Back Home</Button>
        <div className="mt-6 rounded-[7px] border border-blue-100/80 bg-white/72 p-6 shadow-sm shadow-blue-100/60 backdrop-blur sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-[7px] bg-blue-600 text-white shadow-lg shadow-blue-100">
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
                className="group min-h-40 rounded-[7px] border border-blue-100/80 bg-white/78 p-5 shadow-sm shadow-slate-200/60 backdrop-blur transition hover:-translate-y-1 hover:border-blue-300 hover:bg-white/95 hover:shadow-xl hover:shadow-blue-100"
                key={category.name}
                to={createCategoryJobsPath(category)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-[7px] ${category.color} ring-1 ring-white/80`}>
                    <Icon size={21} />
                  </div>
                  <span className="rounded-[7px] bg-blue-50/80 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                    {loading ? '...' : `${count} roles`}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950 transition group-hover:text-blue-700">{category.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
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
