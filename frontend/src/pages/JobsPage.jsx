import { useMemo } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/PortalUI'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'

const filterConfig = [
  { key: 'location', label: 'Location', field: 'location', mode: 'includes' },
  { key: 'experience', label: 'Experience', field: 'experience' },
  { key: 'salary', label: 'Salary', field: 'salary' },
  { key: 'typeFilter', label: 'Job Type', field: 'type' },
  { key: 'workMode', label: 'Work Mode', field: 'workMode' },
  { key: 'skills', label: 'Skills', field: 'skills', array: true },
  { key: 'company', label: 'Company', field: 'company' },
  { key: 'department', label: 'Department', field: 'department' },
]

export function JobsPage({ onApply }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: apiJobs } = useApiResource(() => api.jobs('?sort=-createdAt&limit=100'), { data: [] }, [])
  const rawList = Array.isArray(apiJobs) ? apiJobs : apiJobs?.data || []
  const normalizedJobs = useMemo(() => rawList.map(normalizeJob), [rawList])
  const dynamicFilters = useMemo(() => buildDynamicFilters(normalizedJobs), [normalizedJobs])
  const keyword = (searchParams.get('q') || '').trim().toLowerCase()
  const selectedLocation = (searchParams.get('location') || '').trim().toLowerCase()
  const selectedType = (searchParams.get('type') || '').trim().toLowerCase()
  const selectedFilters = useMemo(() => getSelectedFilters(searchParams), [searchParams])

  const list = normalizedJobs.filter((job) => {
    const haystack = [
      job.title,
      job.company,
      job.department,
      job.industry,
      job.description,
      ...job.skills,
    ].filter(Boolean).join(' ').toLowerCase()
    const jobLocation = String(job.location || '').toLowerCase()
    const jobType = String(job.type || '').toLowerCase()

    return (!keyword || haystack.includes(keyword))
      && (!selectedLocation || jobLocation.includes(selectedLocation))
      && (!selectedType || jobType === selectedType)
      && matchesAdvancedFilters(job, selectedFilters)
  })
  const activeFilterCount = Object.values(selectedFilters).reduce((total, values) => total + values.length, 0)
  const hasSearch = Boolean(keyword || selectedLocation || selectedType || activeFilterCount)

  const toggleFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    const values = getParamList(params, key)
    const exists = values.includes(value)
    const nextValues = exists ? values.filter((item) => item !== value) : [...values, value]

    if (nextValues.length) params.set(key, nextValues.join('|'))
    else params.delete(key)

    setSearchParams(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    filterConfig.forEach((filter) => params.delete(filter.key))
    setSearchParams(params)
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-5 sm:p-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Enterprise Job Listings</h1>
          <p className="mt-3 text-slate-500">Search, filter, save, and apply to trusted premium opportunities.</p>
          <div className="mt-6"><SearchBar compact /></div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[310px_1fr]">
          <aside className="h-max rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-950">Advanced Filters</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">{activeFilterCount} active filters</p>
              </div>
              <SlidersHorizontal className="text-blue-600" size={19} />
            </div>
            {activeFilterCount > 0 && (
              <button className="mb-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700" onClick={clearFilters} type="button">
                <X size={16} /> Clear filters
              </button>
            )}
            <div className="grid gap-6">
              {dynamicFilters.map((filter) => (
                <div key={filter.key}>
                  <h3 className="mb-3 text-sm font-black text-slate-800">{filter.label}</h3>
                  {filter.values.length ? (
                    <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
                      {filter.values.map((value) => {
                        const checked = selectedFilters[filter.key]?.includes(value)
                        return (
                          <label className={`flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm transition ${checked ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`} key={value}>
                            <span className="flex min-w-0 items-center gap-2">
                              <input checked={checked || false} className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600" onChange={() => toggleFilter(filter.key, value)} type="checkbox" />
                              <span className="truncate">{value}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-400 ring-1 ring-slate-200">{filter.counts[value]}</span>
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">No options yet</p>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-slate-600">Showing {list.length} premium jobs{hasSearch ? ' for your search' : ''}</p>
              <select className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 outline-none">
                <option>Sort by relevance</option>
                <option>Sort by newest</option>
                <option>Sort by salary</option>
                <option>Sort by featured</option>
              </select>
            </div>
            {list.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {list.map((job) => <JobCard job={job} key={job._id || job.id} onApply={onApply} />)}
              </div>
            ) : (
              <div className="mt-8"><EmptyState /></div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function normalizeJob(job) {
  return {
    ...job,
    skills: Array.isArray(job.skills) ? job.skills : String(job.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
  }
}

function buildDynamicFilters(jobs) {
  return filterConfig.map((filter) => {
    const counts = {}

    jobs.forEach((job) => {
      const rawValues = filter.array ? job[filter.field] : [job[filter.field]]
      rawValues.filter(Boolean).forEach((value) => {
        const normalized = String(value).trim()
        if (!normalized) return
        counts[normalized] = (counts[normalized] || 0) + 1
      })
    })

    return {
      ...filter,
      counts,
      values: Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)).slice(0, 30),
    }
  })
}

function getParamList(params, key) {
  return String(params.get(key) || '').split('|').map((item) => item.trim()).filter(Boolean)
}

function getSelectedFilters(params) {
  return filterConfig.reduce((selected, filter) => {
    selected[filter.key] = getParamList(params, filter.key)
    return selected
  }, {})
}

function matchesAdvancedFilters(job, selectedFilters) {
  return filterConfig.every((filter) => {
    const selected = selectedFilters[filter.key] || []
    if (!selected.length) return true

    const jobValues = filter.array ? job[filter.field] : [job[filter.field]]
    const normalizedJobValues = jobValues.filter(Boolean).map((value) => String(value).toLowerCase())

    return selected.some((value) => {
      const normalizedValue = value.toLowerCase()
      return filter.mode === 'includes'
        ? normalizedJobValues.some((jobValue) => jobValue.includes(normalizedValue))
        : normalizedJobValues.includes(normalizedValue)
    })
  })
}
