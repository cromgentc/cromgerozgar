import { useEffect, useState } from 'react'
import { Bookmark, Briefcase, Clock, Flame, MapPin, Sparkles, Wallet } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { canSaveJobs, isJobSaved, toggleSavedJob } from '../utils/savedJobs'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { isSameAppliedJob } from '../utils/candidateActivity'
import { createJobDetailPath } from '../utils/jobRoutes'
import { formatStateCountryLocation } from '../utils/locationDisplay'

export function JobCard({ denseMobile = false, index = 1, job, onApply, featured = false }) {
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
            <p className="mt-1 truncate text-sm font-bold text-slate-500">{job.company || 'Cromgen Rozgar partner'}</p>
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
