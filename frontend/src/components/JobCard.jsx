import { useEffect, useState } from 'react'
import { Bookmark, Briefcase, Clock, Flame, MapPin, Sparkles, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { canSaveJobs, isJobSaved, toggleSavedJob } from '../utils/savedJobs'

export function JobCard({ job, onApply, featured = false }) {
  const jobRouteId = job._id || job.id
  const [saved, setSaved] = useState(() => isJobSaved(job))

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

  const saveJob = () => {
    if (!canSaveJobs()) {
      window.alert('Please login as a candidate to save jobs.')
      return
    }

    const result = toggleSavedJob(job)
    setSaved(result.saved)
  }

  return (
    <article className={`group rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 ${featured ? 'lg:p-6' : ''}`}>
      <div className="mb-4 flex flex-wrap gap-2">
        {job.featured && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700"><Sparkles size={13} /> Featured</span>}
        {job.urgent && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700"><Flame size={13} /> Urgent hiring</span>}
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{job.workMode}</span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 text-lg font-bold text-blue-700">
            {job.companyLogo || job.company.slice(0, 2)}
          </div>
          <div>
            <Link className="text-lg font-bold text-slate-950 hover:text-blue-600" to={`/jobs/${jobRouteId}`}>
              {job.title}
            </Link>
            <p className="mt-1 text-sm font-medium text-slate-500">{job.company}</p>
          </div>
        </div>
        <button
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${
            saved ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
          }`}
          onClick={saveJob}
          type="button"
        >
          <Bookmark fill={saved ? 'currentColor' : 'none'} size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <span className="flex items-center gap-2"><MapPin size={16} />{job.location}</span>
        <span className="flex items-center gap-2"><Wallet size={16} />{job.salary}</span>
        <span className="flex items-center gap-2"><Briefcase size={16} />{job.experience}</span>
        <span className="flex items-center gap-2"><Clock size={16} />{job.posted}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.skills.map((skill) => (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">{job.description}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" onClick={() => onApply?.(job)}>Apply Now</Button>
        <Button className="flex-1" to={`/jobs/${jobRouteId}`} variant="secondary">View Details</Button>
      </div>
    </article>
  )
}
