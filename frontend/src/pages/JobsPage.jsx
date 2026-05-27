import { useEffect, useMemo, useState } from 'react'
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
  const [companyPage, setCompanyPage] = useState(1)
  const { data: apiJobs } = useApiResource(() => api.jobListings('?sort=-createdAt'), { data: [] }, [])
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
  const companyFilter = dynamicFilters.find((filter) => filter.key === 'company') || { values: [], counts: {} }
  const companyPageSize = 10
  const companyPageCount = Math.max(1, Math.ceil(companyFilter.values.length / companyPageSize))
  const visibleCompanyOptions = companyFilter.values.slice((companyPage - 1) * companyPageSize, companyPage * companyPageSize)

  useEffect(() => {
    setCompanyPage(1)
  }, [companyFilter.values.join('|')])

  useEffect(() => {
    if (companyPage > companyPageCount) setCompanyPage(companyPageCount)
  }, [companyPage, companyPageCount])

  const setSingleFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)

    setSearchParams(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    filterConfig.forEach((filter) => params.delete(filter.key))
    setSearchParams(params)
  }

  return (
    <section className="w-full max-w-full overflow-x-hidden py-3 sm:py-14">
      <div className="w-full max-w-full px-0 sm:mx-auto sm:max-w-7xl sm:px-6 lg:px-8">
        <div className="w-full max-w-full overflow-hidden rounded-none border-y border-[#0057B8]/10 bg-white p-2 shadow-sm sm:rounded-[7px] sm:border sm:p-8">
          <div className="hidden sm:block">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0057B8]">Verified job search</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">Explore roles matched to your ambition</h1>
            <p className="mt-3 text-slate-500">Search, filter, save, and apply to trusted opportunities across India.</p>
          </div>
          <div className="sm:mt-6"><SearchBar compact /></div>
        </div>

        <div className="mt-4 grid w-full max-w-full gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="hidden h-max rounded-[7px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:block">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-950">Advanced Filters</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">{activeFilterCount} active filters</p>
              </div>
              <SlidersHorizontal className="text-[#0057B8]" size={19} />
            </div>
            {activeFilterCount > 0 && (
              <button className="mb-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[7px] bg-slate-100 px-4 text-sm font-black text-slate-600 hover:bg-blue-50 hover:text-blue-700" onClick={clearFilters} type="button">
                <X size={16} /> Clear filters
              </button>
            )}
            <div className="grid gap-5">
              {['location', 'experience', 'salary', 'skills', 'department'].map((key) => {
                const filter = dynamicFilters.find((item) => item.key === key) || { key, label: key, values: [] }
                return (
                  <FilterSelect
                    key={key}
                    filter={filter}
                    onChange={(value) => setSingleFilter(key, value)}
                    value={selectedFilters[key]?.[0] || ''}
                  />
                )
              })}

              <div>
                <h3 className="mb-3 text-sm font-black text-slate-800">Company</h3>
                {companyFilter.values.length ? (
                  <>
                    <div className="grid gap-2">
                      {visibleCompanyOptions.map((company) => {
                        const selected = selectedFilters.company?.[0] === company
                        return (
                          <button
                            className={`flex min-h-10 items-center justify-between gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold transition ${selected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
                            key={company}
                            onClick={() => setSingleFilter('company', selected ? '' : company)}
                            type="button"
                          >
                            <span className="min-w-0 truncate">{company}</span>
                            <span className={`shrink-0 rounded-[7px] px-2 py-0.5 text-[11px] font-black ${selected ? 'bg-white/20 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>{companyFilter.counts[company]}</span>
                          </button>
                        )
                      })}
                    </div>
                    {companyFilter.values.length > companyPageSize && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          className="rounded-[7px] bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
                          disabled={companyPage === 1}
                          onClick={() => setCompanyPage((page) => Math.max(1, page - 1))}
                          type="button"
                        >
                          Prev
                        </button>
                        <span className="text-xs font-black text-slate-500">{companyPage} / {companyPageCount}</span>
                        <button
                          className="rounded-[7px] bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
                          disabled={companyPage === companyPageCount}
                          onClick={() => setCompanyPage((page) => Math.min(companyPageCount, page + 1))}
                          type="button"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="rounded-[7px] bg-slate-50 p-3 text-xs font-semibold text-slate-500">No company options yet</p>
                )}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex w-full max-w-full items-center justify-between gap-2 rounded-none border-y border-slate-200 bg-white p-2 sm:mb-5 sm:rounded-[7px] sm:border sm:p-4">
              <p className="min-w-0 truncate text-xs font-semibold text-slate-600 sm:text-sm">Showing {list.length} premium jobs{hasSearch ? ' for your search' : ''}</p>
              <select className="w-28 shrink-0 rounded-[7px] border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-600 outline-none sm:w-auto sm:px-4 sm:text-sm">
                <option>Sort by relevance</option>
                <option>Sort by newest</option>
                <option>Sort by salary</option>
                <option>Sort by featured</option>
              </select>
            </div>
            {list.length ? (
              <div className="grid w-full max-w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 px-1 sm:grid-cols-1 sm:px-0 sm:gap-5">
                {list.map((job) => <JobCard denseMobile job={job} key={job._id || job.id} onApply={onApply} />)}
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

function FilterSelect({ filter, onChange, value }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-slate-800">{filter.label}</span>
      <select
        className="min-h-11 rounded-[7px] border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All {filter.label.toLowerCase()}</option>
        {filter.values.map((option) => (
          <option key={option} value={option}>{option} ({filter.counts[option]})</option>
        ))}
      </select>
    </label>
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
