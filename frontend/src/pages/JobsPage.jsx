import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/PortalUI'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'

const filterConfig = [
  { key: 'location', label: 'Location', field: 'locationState' },
  { key: 'typeFilter', label: 'Job Type', field: 'type', fixedValues: ['Full Time', 'Part Time'] },
  { key: 'workMode', label: 'Work Mode', field: 'workMode', fixedValues: ['Remote', 'Hybrid', 'Office'] },
  { key: 'skills', label: 'Skills', field: 'skills', array: true },
  { key: 'department', label: 'Department', field: 'department' },
]

const salaryBands = [
  { label: '0-3 Lakhs', min: 0, max: 3 },
  { label: '3-6 Lakhs', min: 3, max: 6 },
  { label: '6-10 Lakhs', min: 6, max: 10 },
  { label: '10-15 Lakhs', min: 10, max: 15 },
  { label: '15-25 Lakhs', min: 15, max: 25 },
  { label: '25+ Lakhs', min: 25, max: Infinity },
]

const workModeToWfhType = {
  Office: '0',
  Remote: '2',
  Hybrid: '3',
}

const wfhTypeToWorkMode = Object.entries(workModeToWfhType).reduce((map, [label, value]) => {
  map[value] = label
  return map
}, {})

export function JobsPage({ onApply }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [departmentPage, setDepartmentPage] = useState(1)
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [departmentDraft, setDepartmentDraft] = useState([])
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [skillsSearch, setSkillsSearch] = useState('')
  const [skillsDraft, setSkillsDraft] = useState([])
  const { data: apiJobs } = useApiResource(() => api.jobListings('?sort=-createdAt'), { data: [] }, [])
  const rawList = Array.isArray(apiJobs) ? apiJobs : apiJobs?.data || []
  const normalizedJobs = useMemo(() => rawList.map(normalizeJob), [rawList])
  const dynamicFilters = useMemo(() => buildDynamicFilters(normalizedJobs), [normalizedJobs])
  const keyword = (searchParams.get('q') || '').trim().toLowerCase()
  const selectedLocation = (searchParams.get('location') || '').trim().toLowerCase()
  const selectedType = (searchParams.get('type') || '').trim().toLowerCase()
  const selectedExperienceMax = Number(searchParams.get('experience') || searchParams.get('experienceMax') || 0)
  const selectedSalaryBands = useMemo(() => getParamList(searchParams, 'salaryBand'), [searchParams])
  const departmentFilter = dynamicFilters.find((filter) => filter.key === 'department') || { values: [], counts: {} }
  const selectedFilters = useMemo(() => getSelectedFilters(searchParams, departmentFilter.values), [searchParams, departmentFilter.values.join('|')])
  const departmentPageSize = 5
  const departmentPageCount = Math.max(1, Math.ceil(departmentFilter.values.length / departmentPageSize))
  const visibleDepartmentOptions = departmentFilter.values.slice((departmentPage - 1) * departmentPageSize, departmentPage * departmentPageSize)

  const list = normalizedJobs.filter((job) => {
    const haystack = [
      job.title,
      job.company,
      job.department,
      job.industry,
      job.description,
      ...job.skills,
    ].filter(Boolean).join(' ').toLowerCase()
    const jobLocationState = String(job.locationState || '').toLowerCase()
    const jobType = String(job.type || '').toLowerCase()

    return (!keyword || haystack.includes(keyword))
      && (!selectedLocation || jobLocationState === selectedLocation)
      && (!selectedType || jobType === selectedType)
      && (!selectedExperienceMax || getExperienceMin(job.experience) <= selectedExperienceMax)
      && (!selectedSalaryBands.length || matchesSalaryBands(job.salary, selectedSalaryBands))
      && matchesAdvancedFilters(job, selectedFilters)
  })
  const activeFilterCount = Object.values(selectedFilters).reduce((total, values) => total + values.length, 0) + Number(Boolean(selectedExperienceMax)) + selectedSalaryBands.length
  const hasSearch = Boolean(keyword || selectedLocation || selectedType || selectedExperienceMax || selectedSalaryBands.length || activeFilterCount)

  useEffect(() => {
    setDepartmentPage(1)
  }, [departmentFilter.values.join('|')])

  useEffect(() => {
    if (departmentPage > departmentPageCount) setDepartmentPage(departmentPageCount)
  }, [departmentPage, departmentPageCount])

  const setSingleFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (key === 'experienceMax') {
      if (value) params.set('experience', value)
      else params.delete('experience')
      params.delete('experienceMax')
    } else if (key === 'workMode') {
      params.delete('workMode')
      params.delete('wfhType')
      if (value) params.set('wfhType', workModeToWfhType[value] || value)
      syncClusterParam(params)
    } else if (key === 'department') {
      params.delete('department')
      params.delete('functionAreaIdGid')
      if (value) params.append('functionAreaIdGid', getDepartmentId(value, departmentFilter.values))
      syncClusterParam(params)
    } else if (value) params.set(key, value)
    else params.delete(key)

    setSearchParams(params)
  }

  const setMultiFilter = (key, values) => {
    const params = new URLSearchParams(searchParams)
    const nextValues = values.map((value) => value.trim()).filter(Boolean)
    if (key === 'department') {
      params.delete('department')
      params.delete('functionAreaIdGid')
      nextValues.forEach((value) => params.append('functionAreaIdGid', getDepartmentId(value, departmentFilter.values)))
      syncClusterParam(params)
    } else if (nextValues.length) params.set(key, nextValues.join('|'))
    else params.delete(key)
    setSearchParams(params)
  }

  const openDepartmentModal = () => {
    setDepartmentDraft(selectedFilters.department || [])
    setDepartmentSearch('')
    setDepartmentModalOpen(true)
  }

  const openSkillsModal = () => {
    setSkillsDraft(selectedFilters.skills || [])
    setSkillsSearch('')
    setSkillsModalOpen(true)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    filterConfig.forEach((filter) => params.delete(filter.key))
    params.delete('experience')
    params.delete('experienceMax')
    params.delete('salaryBand')
    params.delete('wfhType')
    params.delete('functionAreaIdGid')
    params.delete('clusters')
    setSearchParams(params)
  }

  const salaryBandCounts = useMemo(() => buildSalaryBandCounts(normalizedJobs), [normalizedJobs])

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
          <aside className="hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[7px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:block">
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
              <RangeFilter
                label="Experience"
                max={30}
                minLabel="0 Yrs"
                onChange={(value) => setSingleFilter('experienceMax', value ? String(value) : '')}
                step={1}
                suffix="Yrs"
                value={selectedExperienceMax || 0}
              />
              <SalaryFilter
                counts={salaryBandCounts}
                onChange={(band) => {
                  const next = selectedSalaryBands.includes(band)
                    ? selectedSalaryBands.filter((item) => item !== band)
                    : [...selectedSalaryBands, band]
                  setMultiFilter('salaryBand', next)
                }}
                selectedValues={selectedSalaryBands}
              />
              {['location'].map((key) => {
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
              <ExpandedFilter
                allLabel="All skills"
                filter={dynamicFilters.find((item) => item.key === 'skills') || { key: 'skills', label: 'Skills', values: [], counts: {} }}
                onChange={(value) => setSingleFilter('skills', value)}
                onViewMore={openSkillsModal}
                value={selectedFilters.skills?.[0] || ''}
              />
              <DepartmentFilter
                filter={departmentFilter}
                onChange={(value) => setSingleFilter('department', value)}
                onNext={() => setDepartmentPage((page) => Math.min(departmentPageCount, page + 1))}
                onPrev={() => setDepartmentPage((page) => Math.max(1, page - 1))}
                onViewMore={openDepartmentModal}
                page={departmentPage}
                pageCount={departmentPageCount}
                value={selectedFilters.department?.[0] || ''}
                visibleOptions={visibleDepartmentOptions}
              />
              {['workMode', 'typeFilter'].map((key) => {
                const filter = dynamicFilters.find((item) => item.key === key) || { key, label: key, values: [] }
                return (
                  <CheckboxFilter
                    key={key}
                    filter={filter}
                    onChange={(value) => setSingleFilter(key, selectedFilters[key]?.[0] === value ? '' : value)}
                    selectedValue={selectedFilters[key]?.[0] || ''}
                  />
                )
              })}

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
      {departmentModalOpen && (
        <DepartmentModal
          draft={departmentDraft}
          filter={dynamicFilters.find((item) => item.key === 'department') || { key: 'department', label: 'Department', values: [], counts: {} }}
          onApply={() => {
            setMultiFilter('department', departmentDraft)
            setDepartmentModalOpen(false)
          }}
          onClose={() => setDepartmentModalOpen(false)}
          onSearch={setDepartmentSearch}
          onToggle={(department) => {
            setDepartmentDraft((current) => (
              current.includes(department)
                ? current.filter((item) => item !== department)
                : [...current, department]
            ))
          }}
          search={departmentSearch}
        />
      )}
      {skillsModalOpen && (
        <FilterModal
          draft={skillsDraft}
          filter={dynamicFilters.find((item) => item.key === 'skills') || { key: 'skills', label: 'Skills', values: [], counts: {} }}
          onApply={() => {
            setMultiFilter('skills', skillsDraft)
            setSkillsModalOpen(false)
          }}
          onClose={() => setSkillsModalOpen(false)}
          onSearch={setSkillsSearch}
          onToggle={(skill) => {
            setSkillsDraft((current) => (
              current.includes(skill)
                ? current.filter((item) => item !== skill)
                : [...current, skill]
            ))
          }}
          search={skillsSearch}
          searchPlaceholder="Search Skills"
        />
      )}
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

function CheckboxFilter({ filter, onChange, selectedValue }) {
  return (
    <div className="grid gap-2 border-t border-slate-100 pt-4">
      <span className="text-sm font-black text-slate-800">{filter.label}</span>
      <div className="grid gap-2">
        {filter.values.slice(0, 6).map((option) => {
          const checked = selectedValue === option
          return (
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600" key={option}>
              <input checked={checked} className="h-4 w-4 rounded-[4px] border-slate-300 accent-blue-600" onChange={() => onChange(option)} type="checkbox" />
              <span className="min-w-0 truncate">{option}</span>
              <span className="ml-auto text-slate-400">({filter.counts[option] || 0})</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function RangeFilter({ label, max, minLabel, onChange, step, suffix, value }) {
  return (
    <div className="grid gap-4 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-slate-800">{label}</span>
        <span className="rounded-[7px] bg-slate-950 px-2 py-1 text-xs font-black text-white">{value || max}</span>
      </div>
      <input
        className="w-full accent-slate-950"
        max={max}
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value || max}
      />
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{minLabel}</span>
        <span>{value || max} {suffix}</span>
      </div>
    </div>
  )
}

function SalaryFilter({ counts, onChange, selectedValues }) {
  return (
    <div className="grid gap-2 border-t border-slate-100 pt-4">
      <span className="text-sm font-black text-slate-800">Salary</span>
      <div className="grid gap-2">
        {salaryBands.map((band) => {
          const checked = selectedValues.includes(band.label)
          return (
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600" key={band.label}>
              <input checked={checked} className="h-4 w-4 rounded-[4px] border-slate-300 accent-blue-600" onChange={() => onChange(band.label)} type="checkbox" />
              <span className="min-w-0 truncate">{band.label}</span>
              <span className="ml-auto text-slate-400">({counts[band.label] || 0})</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function ExpandedFilter({ allLabel, filter, onChange, onViewMore, value }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-800">{filter.label}</span>
        <button className="text-xs font-black text-blue-600 hover:text-blue-700" onClick={onViewMore} type="button">
          View More
        </button>
      </div>
      <select
        className="min-h-11 rounded-[7px] border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{allLabel}</option>
        {filter.values.slice(0, 10).map((option) => (
          <option key={option} value={option}>{option} ({filter.counts[option]})</option>
        ))}
      </select>
    </div>
  )
}

function DepartmentFilter({ filter, onChange, onNext, onPrev, onViewMore, page, pageCount, value, visibleOptions }) {
  const hasPages = filter.values.length > visibleOptions.length

  return (
    <div className="grid gap-2 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-800">Department</span>
        <button className="text-xs font-black text-blue-600 hover:text-blue-700" onClick={onViewMore} type="button">
          View More
        </button>
      </div>
      {visibleOptions.length ? (
        <div className="grid gap-2">
          {visibleOptions.map((department) => {
            const selected = value === department
            return (
              <button
                className={`flex min-h-10 items-center justify-between gap-3 rounded-[7px] px-3 py-2 text-left text-sm font-bold transition ${selected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
                key={department}
                onClick={() => onChange(selected ? '' : department)}
                type="button"
              >
                <span className="min-w-0 truncate">{department}</span>
                <span className={`shrink-0 rounded-[7px] px-2 py-0.5 text-[11px] font-black ${selected ? 'bg-white/20 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>{filter.counts[department] || 0}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="rounded-[7px] bg-slate-50 p-3 text-xs font-semibold text-slate-500">No department options yet</p>
      )}
      {hasPages && (
        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            className="rounded-[7px] bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
            disabled={page === 1}
            onClick={onPrev}
            type="button"
          >
            Prev
          </button>
          <span className="text-xs font-black text-slate-500">{page} / {pageCount}</span>
          <button
            className="rounded-[7px] bg-white px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
            disabled={page === pageCount}
            onClick={onNext}
            type="button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function DepartmentModal({ draft, filter, onApply, onClose, onSearch, onToggle, search }) {
  return (
    <FilterModal
      draft={draft}
      filter={filter}
      onApply={onApply}
      onClose={onClose}
      onSearch={onSearch}
      onToggle={onToggle}
      search={search}
      searchPlaceholder="Search Department"
    />
  )
}

function FilterModal({ draft, filter, onApply, onClose, onSearch, onToggle, search, searchPlaceholder }) {
  const query = search.trim().toLowerCase()
  const options = filter.values.filter((option) => option.toLowerCase().includes(query))

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[7px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h3 className="text-xl font-black text-slate-950">{filter.label}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{draft.length} selected</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-[7px] bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={onClose} type="button" aria-label={`Close ${filter.label.toLowerCase()} filter`}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <label className="mb-5 flex min-h-11 max-w-sm items-center gap-2 rounded-[7px] border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm">
            <Search size={17} className="text-blue-600" />
            <input
              className="w-full bg-transparent font-semibold outline-none placeholder:text-slate-400"
              onChange={(event) => onSearch(event.target.value)}
              placeholder={searchPlaceholder}
              value={search}
            />
          </label>
          <div className="grid max-h-[52vh] gap-x-7 gap-y-3 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.length ? options.map((option) => {
              const checked = draft.includes(option)
              return (
                <label className="flex min-w-0 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600" key={option}>
                  <input checked={checked} className="h-4 w-4 rounded-[4px] border-slate-300 accent-blue-600" onChange={() => onToggle(option)} type="checkbox" />
                  <span className="min-w-0 truncate">{option}</span>
                  <span className="shrink-0 text-slate-400">({filter.counts[option] || 0})</span>
                </label>
              )
            }) : (
              <p className="rounded-[7px] bg-slate-50 p-4 text-sm font-semibold text-slate-500 sm:col-span-2 lg:col-span-3">No {filter.label.toLowerCase()} found.</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-5">
          <button className="rounded-[7px] bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-600" onClick={onClose} type="button">Cancel</button>
          <button className="rounded-[7px] bg-blue-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100" onClick={onApply} type="button">Apply</button>
        </div>
      </div>
    </div>
  )
}

function normalizeJob(job) {
  return {
    ...job,
    locationState: getLocationState(job.location),
    type: normalizeJobType(job.type),
    workMode: normalizeWorkMode(job.workMode),
    skills: Array.isArray(job.skills) ? job.skills : String(job.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
  }
}

function normalizeWorkMode(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('hybrid')) return 'Hybrid'
  if (text.includes('office') || text.includes('onsite') || text.includes('on-site')) return 'Office'
  if (text.includes('remote') || text.includes('work from home') || text.includes('wfh')) return 'Remote'
  return 'Office'
}

function normalizeJobType(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('part')) return 'Part Time'
  return 'Full Time'
}

function getLocationState(value) {
  const parts = String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^india$/i.test(part))

  if (parts.length >= 2) return parts[parts.length - 1]
  return parts[0] || ''
}

function getExperienceMin(value) {
  const numbers = String(value || '').match(/\d+/g)?.map(Number) || []
  return numbers.length ? Math.min(...numbers) : 0
}

function getSalaryRange(value) {
  const numbers = String(value || '').match(/\d+(?:\.\d+)?/g)?.map(Number) || []
  if (!numbers.length) return null
  return {
    min: Math.min(...numbers),
    max: numbers.length > 1 ? Math.max(...numbers) : Math.min(...numbers),
  }
}

function matchesSalaryBands(value, selectedBands) {
  const range = getSalaryRange(value)
  if (!range) return false

  return selectedBands.some((label) => {
    const band = salaryBands.find((item) => item.label === label)
    return band ? range.min <= band.max && range.max >= band.min : false
  })
}

function buildSalaryBandCounts(jobs) {
  return salaryBands.reduce((counts, band) => {
    counts[band.label] = jobs.filter((job) => matchesSalaryBands(job.salary, [band.label])).length
    return counts
  }, {})
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
      values: filter.fixedValues || Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)),
    }
  })
}

function syncClusterParam(params) {
  const clusters = []
  if (params.has('functionAreaIdGid')) clusters.push('functionalAreaGid')
  if (params.has('wfhType')) clusters.push('wfhType')

  if (clusters.length) params.set('clusters', clusters.join(','))
  else params.delete('clusters')
}

function getDepartmentId(department, departments) {
  const index = departments.findIndex((item) => item === department)
  return String(index >= 0 ? index + 1 : department)
}

function getDepartmentById(id, departments) {
  const index = Number(id) - 1
  return Number.isInteger(index) && departments[index] ? departments[index] : ''
}

function getParamList(params, key) {
  return String(params.get(key) || '').split('|').map((item) => item.trim()).filter(Boolean)
}

function getSelectedFilters(params, departments = []) {
  return filterConfig.reduce((selected, filter) => {
    if (filter.key === 'workMode') {
      const modernValues = params.getAll('wfhType').map((value) => wfhTypeToWorkMode[value]).filter(Boolean)
      selected[filter.key] = modernValues.length ? modernValues : getParamList(params, filter.key)
      return selected
    }

    if (filter.key === 'department') {
      const modernValues = params.getAll('functionAreaIdGid').map((id) => getDepartmentById(id, departments)).filter(Boolean)
      selected[filter.key] = modernValues.length ? modernValues : getParamList(params, filter.key)
      return selected
    }

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
