import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ChevronDown, ClipboardList, FileSpreadsheet, UserPlus } from 'lucide-react'
import { AdminCard, StatusBadge } from '../components/AdminPrimitives'
import { api } from '../../services/api'

const bulkRows = [
  { role: 'Sales Executive', company: 'Cromgen Technologies', openings: 25, location: 'Noida', status: 'Active' },
  { role: 'Customer Support Associate', company: 'Rozgar Enterprise', openings: 40, location: 'Delhi NCR', status: 'Pending' },
  { role: 'Field Recruiter', company: 'TalentBridge Services', openings: 12, location: 'Gurugram', status: 'Review' },
]

const singleRows = [
  { candidate: 'Amit Sharma', role: 'Frontend Developer', company: 'Cromgen Technologies', status: 'Interview' },
  { candidate: 'Priya Singh', role: 'HR Executive', company: 'NextHire Solutions', status: 'Shortlisted' },
  { candidate: 'Rohit Verma', role: 'Account Manager', company: 'Rozgar Enterprise', status: 'Pending' },
]

export function AdminHiringPage() {
  const [entryOpen, setEntryOpen] = useState(false)

  const metrics = useMemo(() => [
    { label: 'Bulk hiring drives', value: bulkRows.length, icon: FileSpreadsheet, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Single hiring leads', value: singleRows.length, icon: UserPlus, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Total openings', value: bulkRows.reduce((total, row) => total + row.openings, 0), icon: BriefcaseBusiness, tone: 'bg-violet-50 text-violet-700' },
  ], [])

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">CRM / Hiring</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Hiring CRM</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Bulk hiring drives aur single candidate hiring entries ko ek CRM workspace se manage karein.
          </p>
        </div>
        <div className="relative">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
            onClick={() => setEntryOpen((value) => !value)}
            type="button"
          >
            <UserPlus size={17} />
            Add Entry
            <ChevronDown className={`transition ${entryOpen ? 'rotate-180' : ''}`} size={16} />
          </button>
          {entryOpen && (
            <div className="absolute right-0 top-14 z-20 grid w-56 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-blue-100">
              <Link className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700" to="/admin/crm/hiring/bulk">
                <FileSpreadsheet size={16} /> Bulk Hiring
              </Link>
              <Link className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700" to="/admin/crm/hiring/single">
                <UserPlus size={16} /> Single Hiring
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <AdminCard key={metric.label}>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${metric.tone}`}>
                <Icon size={22} />
              </span>
              <p className="mt-5 text-3xl font-black text-slate-950">{metric.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{metric.label}</p>
            </AdminCard>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <HiringTable title="Bulk Hiring" rows={bulkRows} columns={['Role', 'Company', 'Openings', 'Location', 'Status']} type="bulk" />
        <HiringTable title="Single Hiring" rows={singleRows} columns={['Candidate', 'Role', 'Company', 'Status']} type="single" />
      </section>
    </div>
  )
}

export function AdminBulkHiringPage() {
  const { companies, companyError, loadingCompanies, selectedCompany, selectedCompanyId, setSelectedCompanyId } = useHiringCompanies()
  const hiringData = useCompanyHiringData(selectedCompany)
  const schedule = useHiringSchedule()

  return (
    <HiringFormShell
      eyebrow="CRM / Hiring / Bulk Hiring Company"
      icon={FileSpreadsheet}
      title="Bulk Hiring Company"
      subtitle="Company select karke available locations, positions, aur deadline ke saath bulk hiring entry create karein."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-600">
          Company
          <select className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none" disabled={loadingCompanies} onChange={(event) => setSelectedCompanyId(event.target.value)} value={selectedCompanyId}>
            <option value="">{loadingCompanies ? 'Loading companies...' : 'Select company'}</option>
            {companies.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </label>
        <TextField label="Company location" placeholder="Company select karne par location yahan dikhegi" value={selectedCompany?.location || ''} readOnly />
        <CompanyHiringSelectors hiringData={hiringData} schedule={schedule} />
        {selectedCompany && <CompanyFieldPanel company={selectedCompany} />}
        {companyError && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 lg:col-span-2">{companyError}</p>}
        <TextField label="Number of openings" placeholder="Example: 50" type="number" />
        <TextField label="Experience" placeholder="Example: 0-2 years" />
        <TextField label="Salary range" placeholder="Example: INR 18,000 - 25,000" />
      </div>
      <label className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
        Bulk hiring note
        <textarea className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none" placeholder={`Hiring requirements${selectedCompany?.name ? ` for ${selectedCompany.name}` : ''}`} />
      </label>
    </HiringFormShell>
  )
}

export function AdminSingleHiringPage() {
  const { companies, companyError, loadingCompanies, selectedCompany, selectedCompanyId, setSelectedCompanyId } = useHiringCompanies()
  const hiringData = useCompanyHiringData(selectedCompany)
  const schedule = useHiringSchedule()

  return (
    <HiringFormShell
      eyebrow="CRM / Hiring / Single Hiring Company"
      icon={UserPlus}
      title="Single Hiring Company"
      subtitle="Company ke available location aur position ke hisaab se single hiring entry create karein."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <TextField label="Candidate name" placeholder="Example: Aman Gupta" />
        <TextField label="Candidate phone" placeholder="Example: 9876543210" />
        <TextField label="Candidate email" placeholder="Example: aman@email.com" type="email" />
        <label className="grid gap-2 text-sm font-bold text-slate-600">
          Company
          <select className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none" disabled={loadingCompanies} onChange={(event) => setSelectedCompanyId(event.target.value)} value={selectedCompanyId}>
            <option value="">{loadingCompanies ? 'Loading companies...' : 'Select company'}</option>
            {companies.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </label>
        <TextField label="Current status" placeholder="Example: Pending" />
        <CompanyHiringSelectors hiringData={hiringData} schedule={schedule} />
        {selectedCompany && <CompanyFieldPanel company={selectedCompany} />}
        {companyError && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 lg:col-span-2">{companyError}</p>}
      </div>
      <label className="mt-4 grid gap-2 text-sm font-bold text-slate-600">
        Recruiter note
        <textarea className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none" placeholder="Interview, skill, salary, ya joining note add karein" />
      </label>
    </HiringFormShell>
  )
}

function useHiringCompanies() {
  const [companies, setCompanies] = useState([])
  const [companyError, setCompanyError] = useState('')
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')

  useEffect(() => {
    let mounted = true

    const loadCompanies = async () => {
      setLoadingCompanies(true)
      setCompanyError('')
      try {
        const payload = await api.companies('?limit=100&sort=name')
        const nextCompanies = Array.isArray(payload.data) ? payload.data : []
        if (!mounted) return
        setCompanies(nextCompanies)
        setSelectedCompanyId((current) => current || nextCompanies[0]?._id || '')
      } catch (error) {
        if (!mounted) return
        setCompanies([])
        setCompanyError(error.message || 'Company data MongoDB se load nahi ho paya.')
      } finally {
        if (mounted) setLoadingCompanies(false)
      }
    }

    loadCompanies()

    return () => {
      mounted = false
    }
  }, [])

  const selectedCompany = useMemo(
    () => companies.find((company) => company._id === selectedCompanyId) || null,
    [companies, selectedCompanyId],
  )

  return { companies, companyError, loadingCompanies, selectedCompany, selectedCompanyId, setSelectedCompanyId }
}

function useCompanyHiringData(selectedCompany) {
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [form, setForm] = useState({
    country: '',
    state: '',
    city: '',
    position: '',
  })

  useEffect(() => {
    let mounted = true

    const loadJobs = async () => {
      if (!selectedCompany?.name) {
        setJobs([])
        setForm({ country: '', state: '', city: '', position: '' })
        return
      }

      setLoadingJobs(true)
      setJobsError('')

      try {
        const payload = await api.jobs(`?company=${encodeURIComponent(selectedCompany.name)}&limit=100&sort=-createdAt`)
        if (!mounted) return
        setJobs(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) {
        if (!mounted) return
        setJobs([])
        setJobsError(error.message || 'Company ke jobs load nahi ho paye.')
      } finally {
        if (mounted) setLoadingJobs(false)
      }
    }

    loadJobs()

    return () => {
      mounted = false
    }
  }, [selectedCompany?.name])

  const options = useMemo(() => {
    const locationRows = [
      selectedCompany,
      ...jobs,
    ].filter(Boolean)

    const countries = uniqueValues(locationRows.map((item) => item.country))
    const states = uniqueValues(locationRows.filter((item) => !form.country || item.country === form.country).map((item) => item.state))
    const cities = uniqueValues(locationRows.filter((item) => (!form.country || item.country === form.country) && (!form.state || item.state === form.state)).map((item) => item.city || item.location))
    const positions = uniqueValues(jobs.map((job) => job.title))
    const deadlines = uniqueValues(jobs.map((job) => job.deadline))

    return {
      countries,
      states,
      cities,
      positions,
      deadlines,
    }
  }, [form.country, form.state, jobs, selectedCompany])

  useEffect(() => {
    setForm((current) => ({
      country: current.country && options.countries.includes(current.country) ? current.country : options.countries[0] || '',
      state: current.state && options.states.includes(current.state) ? current.state : options.states[0] || '',
      city: current.city && options.cities.includes(current.city) ? current.city : options.cities[0] || '',
      position: current.position && options.positions.includes(current.position) ? current.position : options.positions[0] || '',
    }))
  }, [options.cities, options.countries, options.positions, options.states])

  const updateForm = (key, value) => {
    setForm((current) => {
      if (key === 'country') return { ...current, country: value, state: '', city: '' }
      if (key === 'state') return { ...current, state: value, city: '' }
      return { ...current, [key]: value }
    })
  }

  return { form, jobsError, loadingJobs, options, updateForm }
}

function useHiringSchedule() {
  const [days, setDays] = useState('')
  const [deadline, setDeadline] = useState('')

  const updateDays = (value) => {
    setDays(value)
    const daysNumber = Number(value)
    if (!Number.isFinite(daysNumber) || daysNumber <= 0) return

    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + daysNumber)
    setDeadline(nextDate.toISOString().slice(0, 10))
  }

  return { days, deadline, setDeadline, updateDays }
}

function CompanyHiringSelectors({ hiringData, schedule }) {
  const { form, jobsError, loadingJobs, options, updateForm } = hiringData
  const hasCompanyData = options.countries.length || options.states.length || options.cities.length || options.positions.length

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2 lg:grid-cols-3">
      <SelectField disabled={loadingJobs || !options.positions.length} label="Available position" onChange={(value) => updateForm('position', value)} options={options.positions} placeholder={loadingJobs ? 'Loading positions...' : 'No position found'} value={form.position} />
      <SelectField disabled={loadingJobs || !options.countries.length} label="Available country" onChange={(value) => updateForm('country', value)} options={options.countries} placeholder={loadingJobs ? 'Loading countries...' : 'No country found'} value={form.country} />
      <SelectField disabled={loadingJobs || !options.states.length} label="Available state" onChange={(value) => updateForm('state', value)} options={options.states} placeholder={loadingJobs ? 'Loading states...' : 'No state found'} value={form.state} />
      <SelectField disabled={loadingJobs || !options.cities.length} label="Available city" onChange={(value) => updateForm('city', value)} options={options.cities} placeholder={loadingJobs ? 'Loading cities...' : 'No city found'} value={form.city} />
      <TextField label="Hiring days" placeholder="Example: 15" type="number" value={schedule.days} onChange={schedule.updateDays} />
      <TextField label="Deadline date" placeholder="Select date" type="date" value={schedule.deadline} onChange={schedule.setDeadline} />
      {options.deadlines.length > 0 && (
        <label className="grid gap-2 text-sm font-bold text-slate-600 lg:col-span-3">
          Existing job deadlines
          <select className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none" onChange={(event) => schedule.setDeadline(event.target.value)} value="">
            <option value="">Select existing deadline</option>
            {options.deadlines.map((item) => <option key={item} value={formatDeadlineForInput(item)}>{item}</option>)}
          </select>
        </label>
      )}
      {!loadingJobs && !hasCompanyData && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 lg:col-span-3">Is company ke liye abhi location ya position jobs me available nahi hai.</p>}
      {jobsError && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 lg:col-span-3">{jobsError}</p>}
    </div>
  )
}

function SelectField({ disabled = false, label, onChange, options, placeholder, value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <select className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400" disabled={disabled} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function CompanyFieldPanel({ company }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 lg:col-span-2 lg:grid-cols-3">
      <ReadOnlyField label="Industry" value={company.industry} />
      <ReadOnlyField label="Status" value={company.status} />
      <ReadOnlyField label="Plan" value={company.plan} />
      <ReadOnlyField label="City" value={company.city} />
      <ReadOnlyField label="State" value={company.state} />
      <ReadOnlyField label="Country" value={company.country} />
      <ReadOnlyField label="Address" value={company.address || company.location} wide />
      <ReadOnlyField label="Website" value={company.website} wide />
    </div>
  )
}

function ReadOnlyField({ label, value, wide = false }) {
  return (
    <label className={`grid gap-2 text-sm font-bold text-slate-600 ${wide ? 'lg:col-span-3' : ''}`}>
      {label}
      <input className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none" readOnly value={value || '-'} />
    </label>
  )
}

function HiringFormShell({ children, eyebrow, icon: Icon, subtitle, title }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <Icon size={24} />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-blue-600">{eyebrow}</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">{title}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
            </div>
          </div>
          <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700" to="/admin/crm/hiring">
            <ClipboardList size={16} /> Hiring List
          </Link>
        </div>
      </section>
      <AdminCard>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-100 px-5 text-sm font-bold text-slate-700" to="/admin/crm/hiring">Cancel</Link>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-100" type="button">Save Entry</button>
        </div>
      </AdminCard>
    </div>
  )
}

function TextField({ label, onChange, placeholder, readOnly = false, type = 'text', value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <input className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none" onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} readOnly={readOnly} type={type} value={value} />
    </label>
  )
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function formatDeadlineForInput(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function HiringTable({ columns, rows, title, type }) {
  return (
    <AdminCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">{title}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Recent entries</h3>
        </div>
        <Link className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700" to={`/admin/crm/hiring/${type}`}>Add</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((column) => <th className="whitespace-nowrap px-5 py-4 font-bold" key={column}>{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="hover:bg-blue-50/40" key={`${row.role}-${row.company}-${row.candidate || row.openings}`}>
                {'candidate' in row && <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">{row.candidate}</td>}
                <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">{row.role}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.company}</td>
                {'openings' in row && <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.openings}</td>}
                {'location' in row && <td className="whitespace-nowrap px-5 py-4 text-slate-600">{row.location}</td>}
                <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  )
}
