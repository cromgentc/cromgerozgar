import { useEffect, useState } from 'react'
import { Bookmark, Briefcase, Clock, Flame, MapPin, Sparkles, Wallet } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { canSaveJobs, isJobSaved, toggleSavedJob } from '../utils/savedJobs'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { isSameAppliedJob } from '../utils/candidateActivity'

export function JobCard({ denseMobile = false, job, onApply, featured = false }) {
  const jobRouteId = job._id || job.id
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
    <article className={`group min-w-0 overflow-hidden rounded-[7px] border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 ${denseMobile ? 'p-3 sm:p-5' : 'p-5'} ${featured ? 'lg:p-6' : ''}`}>
      <div className={`${denseMobile ? 'hidden sm:flex' : 'flex'} mb-4 flex-wrap gap-2`}>
        {job.featured && <span className="inline-flex items-center gap-1 rounded-[7px] bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"><Sparkles size={13} /> Featured</span>}
        {job.urgent && <span className="inline-flex items-center gap-1 rounded-[7px] bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"><Flame size={13} /> Urgent hiring</span>}
        <span className="rounded-[7px] bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{job.workMode}</span>
      </div>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className={`${denseMobile ? 'hidden sm:grid' : 'grid'} h-14 w-14 shrink-0 place-items-center rounded-[7px] bg-gradient-to-br from-blue-50 to-teal-50 text-lg font-bold text-blue-700`}>
            {job.companyLogo || job.company.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <Link className={`${denseMobile ? 'line-clamp-2 text-sm sm:text-lg' : 'text-lg'} font-bold text-slate-950 hover:text-blue-600`} to={`/jobs/${jobRouteId}`}>
              {job.title}
            </Link>
            <p className={`${denseMobile ? 'truncate text-xs sm:text-sm' : 'text-sm'} mt-1 font-medium text-slate-500`}>{job.company}</p>
          </div>
        </div>
        <button
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          className={`grid shrink-0 place-items-center rounded-[7px] border transition ${denseMobile ? 'h-9 w-9 sm:h-11 sm:w-11' : 'h-11 w-11'} ${
            saved ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
          }`}
          onClick={saveJob}
          type="button"
        >
          <Bookmark fill={saved ? 'currentColor' : 'none'} size={18} />
        </button>
      </div>

      <div className={`${denseMobile ? 'mt-3 gap-2 text-xs sm:mt-5 sm:gap-3 sm:text-sm' : 'mt-5 gap-3 text-sm'} grid text-slate-500 sm:grid-cols-2`}>
        <span className="flex min-w-0 items-center gap-2"><MapPin className="shrink-0" size={16} /><span className="truncate">{job.location}</span></span>
        <span className="flex min-w-0 items-center gap-2"><Wallet className="shrink-0" size={16} /><span className="truncate">{job.salary}</span></span>
        <span className={`${denseMobile ? 'hidden sm:flex' : 'flex'} items-center gap-2`}><Briefcase size={16} />{job.experience}</span>
        <span className={`${denseMobile ? 'hidden sm:flex' : 'flex'} items-center gap-2`}><Clock size={16} />{job.posted}</span>
      </div>

      <div className={`${denseMobile ? 'hidden sm:flex' : 'flex'} mt-5 flex-wrap gap-2`}>
        {job.skills.map((skill) => (
          <span className="rounded-[7px] bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      <p className={`${denseMobile ? 'hidden sm:line-clamp-2' : 'line-clamp-2'} mt-5 text-sm leading-6 text-slate-500`}>{job.description}</p>

      <div className={`${denseMobile ? 'mt-4' : 'mt-6'} flex flex-col gap-3 sm:flex-row`}>
        <Button className={`${denseMobile ? 'min-h-10 w-full min-w-0 px-2 text-xs sm:min-h-11 sm:px-5 sm:text-sm' : ''} flex-1`} onClick={() => (alreadyApplied ? navigate('/candidate-applied-jobs') : onApply?.(job))}>
          {alreadyApplied ? 'Already Applied' : 'Apply Now'}
        </Button>
        <div className={denseMobile ? 'hidden sm:flex sm:flex-1' : 'flex flex-1'}>
          <Link className="job-card-details-link w-full" to={`/jobs/${jobRouteId}`}>View Details</Link>
        </div>
      </div>
    </article>
  )
}
