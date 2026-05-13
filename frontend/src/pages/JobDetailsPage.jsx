import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bookmark, Briefcase, CalendarDays, Copy, Mail, MapPin, MessageCircle, Monitor, Send, Share2, Wallet, X } from 'lucide-react'
import { Button } from '../components/Button'
import { JobCard } from '../components/JobCard'
import { jobs } from '../data/portalData'
import { useApiResource } from '../hooks/useApiResource'
import { api } from '../services/api'
import { canSaveJobs, isJobSaved, toggleSavedJob } from '../utils/savedJobs'

export function JobDetailsPage({ onApply }) {
  const { jobId } = useParams()
  const fallbackJob = jobs.find((item) => item.id === jobId) ?? jobs[0]
  const shouldFetchById = /^[a-f\d]{24}$/i.test(jobId)
  const { data: apiJob } = useApiResource(() => (shouldFetchById ? api.job(jobId) : Promise.resolve({ data: fallbackJob })), fallbackJob, [jobId])
  const job = apiJob || fallbackJob
  const [saved, setSaved] = useState(() => isJobSaved(job))
  const [shareOpen, setShareOpen] = useState(false)

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
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-xl font-black text-white shadow-lg shadow-blue-100">{job.companyLogo}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-600">{job.company}</p>
                <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-5xl">{job.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.featured && <span className="badge-blue">Featured</span>}
                  {job.urgent && <span className="badge-rose">Urgent hiring</span>}
                  <span className="badge-teal">{job.workMode}</span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [MapPin, job.location],
                [Wallet, job.salary],
                [Briefcase, job.experience],
                [Monitor, job.type],
                [CalendarDays, `Posted ${job.posted}`],
                [CalendarDays, `Deadline ${job.deadline}`],
              ].map(([Icon, text]) => (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600" key={text}>
                  <Icon className="mb-2 text-blue-600" size={20} /> {text}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {job.skills.map((item) => <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700" key={item}>{item}</span>)}
            </div>
            {[
              ['Job Description', [job.description]],
              ['Responsibilities', job.responsibilities],
              ['Requirements', job.requirements],
              ['Benefits', job.benefits],
              ['About Company', [job.aboutCompany]],
            ].map(([title, items]) => (
              <section className="mt-9" key={title}>
                <h2 className="text-2xl font-black text-slate-950">{title}</h2>
                <div className="mt-4 grid gap-3 text-slate-600">
                  {items.map((item) => <p className="rounded-2xl bg-slate-50 p-4 leading-7" key={item}>{item}</p>)}
                </div>
              </section>
            ))}
          </article>
          <aside className="h-max lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-blue-100/50">
              <h2 className="text-xl font-black text-slate-950">Apply for this role</h2>
              <p className="mt-2 text-sm text-slate-500">Submit your profile before {job.deadline}.</p>
              <Button className="mt-5 w-full" onClick={() => onApply(job)}>Apply Now</Button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button onClick={saveJob} variant={saved ? 'primary' : 'secondary'}><Bookmark fill={saved ? 'currentColor' : 'none'} size={17} /> {saved ? 'Saved' : 'Save'}</Button>
                <Button onClick={() => setShareOpen(true)} variant="secondary"><Share2 size={17} /> Share</Button>
              </div>
            </div>
            <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Similar Jobs</h2>
              <div className="mt-5 grid gap-4">
                {jobs.filter((item) => item.id !== job.id).slice(0, 2).map((item) => <JobCard job={item} key={item.id} onApply={onApply} />)}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {shareOpen && <ShareModal job={job} onClose={() => setShareOpen(false)} />}
    </section>
  )
}

function ShareModal({ job, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = `${job.title} at ${job.company}`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(`${text} - ${url}`)

  const copyLink = async () => {
    await navigator.clipboard?.writeText(url)
    setCopied(true)
  }

  const shareLinks = [
    ['WhatsApp', `https://wa.me/?text=${encodedText}`, MessageCircle],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, Share2],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Share2],
    ['X', `https://twitter.com/intent/tweet?text=${encodedText}`, Share2],
    ['Telegram', `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`, Send],
    ['Email', `mailto:?subject=${encodeURIComponent(text)}&body=${encodedText}`, Mail],
  ]

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Share job</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">{job.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{job.company}</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500" onClick={onClose} type="button" aria-label="Close share modal">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl bg-slate-50 p-2">
          <input className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-600 outline-none" readOnly value={url} />
          <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-bold text-white" onClick={copyLink} type="button">
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {shareLinks.map(([label, href, Icon]) => (
            <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700" href={href} key={label} rel="noreferrer" target="_blank">
              <Icon size={17} />
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
