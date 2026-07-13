import { useEffect, useState } from 'react'
import { ArrowRight, Bookmark, Briefcase, Clock, Flame, MapPin, Sparkles, Wallet } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { canSaveJobs, isJobSaved, toggleSavedJob } from '../utils/savedJobs'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { isSameAppliedJob } from '../utils/candidateActivity'
import { createJobDetailPath } from '../utils/jobRoutes'
import { formatStateCountryLocation } from '../utils/locationDisplay'

export function JobCard({ denseMobile = false, index = 1, job, onApply, featured = false, premiumList = false, homeLatest = false }) {
  const jobDetailPath = createJobDetailPath(job, index)
  const displayLocation = formatStateCountryLocation(job.location)
  const navigate = useNavigate()
  const user = getStoredUser()
  const [saved, setSaved] = useState(() => isJobSaved(job))
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  useEffect(() => {
    const syncSaved = () => setSaved(isJobSaved(job))
    window.addEventListener('savedJobsChanged', syncSaved)
    window.addEventListener('storage', syncSaved)
    syncSaved()

    return () => {
      window.removeEventListener('savedJobsChanged', syncSaved)
      window.removeEventListener('storage', syncSaved)
    }
  }, [job])

  useEffect(() => {
    let active = true

    const syncApplications = async () => {
      if (user?.role !== 'Candidate' || !user?.email) {
        setAlreadyApplied(false)
        return
      }

      try {
        const payload = await api.list('applications', `?candidateEmail=${encodeURIComponent(user.email)}&limit=100`)
        const applications = Array.isArray(payload.data) ? payload.data : []
        if (active) setAlreadyApplied(applications.some((application) => isSameAppliedJob(application, job)))
      } catch {
        if (active) setAlreadyApplied(false)
      }
    }

    window.addEventListener('candidateActivityChanged', syncApplications)
    window.addEventListener('storage', syncApplications)
    syncApplications()

    return () => {
      active = false
      window.removeEventListener('candidateActivityChanged', syncApplications)
      window.removeEventListener('storage', syncApplications)
    }
  }, [job, user?.email, user?.role])

  const saveJob = () => {
    if (!canSaveJobs()) {
      window.dispatchEvent(new CustomEvent('portalToast', {
        detail: {
          title: 'Login required',
          message: 'Please login as a candidate to save jobs.',
          type: 'info',
          actionLabel: 'Login',
          actionHref: '/auth',
          duration: 2500,
        },
      }))
      window.setTimeout(() => window.location.assign('/auth'), 900)
      return
    }

    const result = toggleSavedJob(job)
    setSaved(result.saved)
  }

  if (homeLatest) {
    return (
      <article className="group min-w-0 overflow-hidden rounded-[7px] border border-emerald-100/80 bg-white p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/70">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d9f4e7] text-sm font-black uppercase text-[#168451]">
              {job.companyLogo || String(job.company || job.title || 'CR').slice(0, 2)}
            </div>
            <div className="min-w-0 pt-0.5">
              <Link className="line-clamp-1 text-lg font-black leading-6 text-slate-950 hover:text-[#178955]" to={jobDetailPath}>
                {job.title}
              </Link>
              <p className="mt-1 truncate text-sm font-bold text-[#178955]">{job.company || 'Cromgen Technology'}</p>
            </div>
          </div>
          <button
            aria-label={saved ? 'Remove saved job' : 'Save job'}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-[7px] border transition ${
              saved ? 'border-emerald-200 bg-emerald-50 text-[#178955]' : 'border-emerald-200 bg-white text-[#178955] hover:bg-emerald-50'
            }`}
            onClick={saveJob}
            type="button"
          >
            <Bookmark fill={saved ? 'currentColor' : 'none'} size={17} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-xs font-bold text-slate-500 sm:grid-cols-3">
          <span className="flex min-w-0 items-center gap-2"><MapPin className="shrink-0 text-[#178955]" size={14} /><span className="truncate">{displayLocation}</span></span>
          <span className="flex min-w-0 items-center gap-2"><Wallet className="shrink-0 text-[#178955]" size={14} /><span className="truncate">{job.salary}</span></span>
          <span className="flex min-w-0 items-center gap-2"><Briefcase className="shrink-0 text-[#178955]" size={14} /><span className="truncate">{job.experience}</span></span>
        </div>

        <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6 text-slate-600">{job.description}</p>

        <div className="mt-5 flex max-h-8 flex-wrap gap-2 overflow-hidden">
          {job.skills.slice(0, 3).map((skill) => (
            <span className="rounded-[7px] bg-[#eaf7ef] px-3 py-1 text-xs font-black text-[#178955]" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-[7px] bg-white text-xs font-bold text-slate-500"><Clock size={14} /> {job.posted}</span>
          <span className="rounded-[7px] bg-[#fff1dd] px-2.5 py-1 text-xs font-black text-[#fb7a00]">{job.workMode}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] bg-[#ff7a00] px-5 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-[#eb6f00]" onClick={() => (alreadyApplied ? navigate('/candidate-applied-jobs') : onApply?.(job))} type="button">
            {alreadyApplied ? 'Already Applied' : 'Apply Now'} <ArrowRight size={16} />
          </button>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-[7px] border border-[#178955] bg-[white] px-5 text-sm font-black text-[#178955] transition hover:-translate-y-0.5 hover:bg-emerald-50" to={jobDetailPath}>View Details</Link>
        </div>
      </article>
    )
  }

  if (premiumList) {
    return (
      <article className="group min-w-0 overflow-hidden rounded-[7px] border border-slate-200 bg-[white] p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[7px] bg-[linear-gradient(135deg,#eaf4ff,#fff2e1)] text-lg font-black text-[#0057B8] ring-1 ring-slate-200">
              {job.companyLogo || String(job.company || job.title || 'JR').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {job.featured && <span className="inline-flex items-center gap-1 rounded-[7px] bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100"><Sparkles size={13} /> Featured</span>}
                {job.urgent && <span className="inline-flex items-center gap-1 rounded-[7px] bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-100"><Flame size={13} /> Urgent</span>}
                <span className="rounded-[7px] bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700 ring-1 ring-orange-100">{job.workMode}</span>
              </div>
              <Link className="line-clamp-2 text-xl font-black leading-7 text-slate-950 hover:text-[#0057B8]" to={jobDetailPath}>
                {job.title}
              </Link>
              <p className="mt-1 truncate text-sm font-semibold text-slate-500">{job.company || 'INSEET partner'}</p>
            </div>
          </div>
          <button
            aria-label={saved ? 'Remove saved job' : 'Save job'}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[7px] border transition ${
              saved ? 'border-red-200 bg-red-50 text-red-600 shadow-sm' : 'border-slate-200 bg-[white] text-red-500 hover:border-red-200 hover:bg-red-50'
            }`}
            onClick={saveJob}
            type="button"
          >
            <Bookmark fill={saved ? 'currentColor' : 'none'} size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <span className="flex min-w-0 items-center gap-2 truncate rounded-[7px] bg-slate-50 px-3 py-2"><MapPin className="shrink-0 text-[#0057B8]" size={15} /><span className="truncate">{displayLocation}</span></span>
          <span className="flex min-w-0 items-center gap-2 truncate rounded-[7px] bg-slate-50 px-3 py-2"><Wallet className="shrink-0 text-[#ff8a00]" size={15} /><span className="truncate">{job.salary}</span></span>
          <span className="flex min-w-0 items-center gap-2 truncate rounded-[7px] bg-slate-50 px-3 py-2"><Briefcase className="shrink-0 text-[#0057B8]" size={15} /><span className="truncate">{job.experience}</span></span>
        </div>

        <p className="mt-5 line-clamp-2 text-sm font-medium leading-6 text-slate-500">{job.description}</p>

        <div className="mt-5 flex max-h-8 flex-wrap gap-2 overflow-hidden">
          {job.skills.slice(0, 5).map((skill) => (
            <span className="rounded-[7px] border border-slate-200 bg-[white] px-3 py-1 text-xs font-bold text-slate-600" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1 rounded-[7px] bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500"><Clock size={14} /> {job.posted}</span>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[300px] sm:flex-row">
            <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[7px] border border-[#ff8a00] px-5 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5" style={{ backgroundColor: '#ff8a00' }} onClick={() => (alreadyApplied ? navigate('/candidate-applied-jobs') : onApply?.(job))} type="button">
              {alreadyApplied ? 'Already Applied' : 'Apply Now'}
            </button>
            <Link className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[7px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-orange-50" to={jobDetailPath}>View Details</Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`group min-w-0 overflow-hidden rounded-[7px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${denseMobile ? 'p-4' : 'p-5'} ${featured ? 'lg:p-6' : ''}`}>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className={`${denseMobile ? 'hidden sm:grid' : 'grid'} h-12 w-12 shrink-0 place-items-center rounded-[7px] border border-slate-100 bg-slate-50 text-sm font-black text-slate-700`}>
            {job.companyLogo || String(job.title || 'JR').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <Link className={`${denseMobile ? 'line-clamp-2 text-base' : 'text-lg'} font-black text-slate-800 hover:text-[#008bdc]`} to={jobDetailPath}>
              {job.title}
            </Link>
            <p className="mt-1 truncate text-sm font-bold text-slate-500">{job.company || 'INSEET partner'}</p>
          </div>
        </div>
        <button
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          className={`grid shrink-0 place-items-center rounded-[7px] border transition ${denseMobile ? 'h-9 w-9' : 'h-11 w-11'} ${
            saved ? 'border-red-200 bg-red-500/10 text-red-600 shadow-sm' : 'border-slate-200 text-red-500 hover:border-red-200 hover:text-red-600'
          }`}
          onClick={saveJob}
          type="button"
        >
          <Bookmark fill={saved ? 'currentColor' : 'none'} size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
        <span className="flex min-w-0 items-center gap-2"><MapPin className="shrink-0" size={16} /><span className="truncate">{displayLocation}</span></span>
        <span className="flex min-w-0 items-center gap-2"><Wallet className="shrink-0" size={16} /><span className="truncate">{job.salary}</span></span>
        <span className="flex items-center gap-2"><Briefcase className="shrink-0" size={16} /><span className="truncate">{job.experience}</span></span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{job.description}</p>

      <div className="mt-4 flex max-h-7 flex-wrap gap-2 overflow-hidden">
        {job.skills.slice(0, 4).map((skill) => (
          <span className="text-xs font-semibold text-slate-500" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-[7px] bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500"><Clock size={14} /> {job.posted}</span>
        {job.featured && <span className="inline-flex items-center gap-1 rounded-[7px] bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"><Sparkles size={13} /> Featured</span>}
        {job.urgent && <span className="inline-flex items-center gap-1 rounded-[7px] bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"><Flame size={13} /> Urgent</span>}
        <span className="rounded-[7px] bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{job.workMode}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button className="min-h-10 flex-1 px-4 text-sm" onClick={() => (alreadyApplied ? navigate('/candidate-applied-jobs') : onApply?.(job))}>
          {alreadyApplied ? 'Already Applied' : 'Apply Now'}
        </Button>
        <div className="flex flex-1">
          <Link className="job-card-details-link w-full" to={jobDetailPath}>View Details</Link>
        </div>
      </div>
    </article>
  )
}
