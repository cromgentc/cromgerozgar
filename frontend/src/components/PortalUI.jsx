import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, LogIn, Mail, UserPlus, X } from 'lucide-react'
import { Button } from './Button'
import { api } from '../services/api'
import { getStoredUser } from '../routes/authRouting'

function getAppliedJobsKey(user) {
  return user?.id || user?.email ? `appliedJobs:${user.id || user.email}` : null
}

function saveAppliedJob(user, job) {
  const key = getAppliedJobsKey(user)
  if (!key) return

  const jobId = String(job._id || job.id)
  const current = JSON.parse(localStorage.getItem(key) || '[]')
  const next = current.some((item) => String(item._id || item.id) === jobId) ? current : [{ ...job, applicationStatus: 'New', appliedAt: new Date().toISOString() }, ...current]
  localStorage.setItem(key, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('candidateActivityChanged', { detail: { jobs: next } }))
}

export function ApplyModal({ job, onClose }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const submittedRef = useRef(false)
  const user = getStoredUser()
  const isCandidate = user?.role === 'Candidate'

  useEffect(() => {
    if (!job || !isCandidate || submittedRef.current) return

    submittedRef.current = true
    setStatus('loading')
    setMessage('Submitting your application...')

    const submit = async () => {
      const existing = await api.list('applications')
      const applications = existing.data || []
      const alreadyApplied = applications.some(
        (item) =>
          item.candidateEmail?.toLowerCase() === user.email?.toLowerCase() &&
          item.jobTitle === job.title &&
          item.company === job.company,
      )

      if (!alreadyApplied) {
        await api.createApplication({
          candidateName: user.name || 'Candidate',
          candidateEmail: user.email,
          jobTitle: job.title,
          company: job.company,
          status: 'New',
        })
      }
    }

    submit()
      .then(() => {
        saveAppliedJob(user, job)
        setStatus('success')
        setMessage('Application submitted successfully.')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(error.message || 'Application could not be submitted.')
      })
  }, [isCandidate, job, user])

  if (!job) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Apply to</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">{job.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{job.company} - {job.location}</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {isCandidate ? (
          <div className="mt-6 rounded-[1.5rem] bg-blue-50 p-5 text-center">
            {status === 'loading' ? (
              <Loader2 className="mx-auto animate-spin text-blue-600" size={34} />
            ) : (
              <CheckCircle2 className="mx-auto text-teal-500" size={36} />
            )}
            <h3 className="mt-4 text-xl font-black text-slate-950">{status === 'loading' ? 'Applying now' : status === 'error' ? 'Application failed' : 'Application sent'}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">{message}</p>
            {status !== 'loading' && <Button className="mt-5 w-full" onClick={onClose}>Done</Button>}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5 text-center">
            <UserPlus className="mx-auto text-blue-600" size={36} />
            <h3 className="mt-4 text-xl font-black text-slate-950">Login required</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Job apply karne ke liye candidate account se login karein. Agar account nahi hai to pehle register karein.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button to="/auth" variant="secondary"><LogIn size={18} /> Login</Button>
              <Button to="/auth"><UserPlus size={18} /> Register</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function Toast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const showToast = (event) => {
      setMessage(event.detail?.message || 'Action completed successfully.')
    }

    window.addEventListener('portalToast', showToast)
    return () => window.removeEventListener('portalToast', showToast)
  }, [])

  useEffect(() => {
    if (!message) return undefined

    const timer = window.setTimeout(() => setMessage(''), 3000)
    return () => window.clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-teal-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl shadow-teal-100">
      <CheckCircle2 className="text-teal-500" size={20} />
      {message}
    </div>
  )
}

export function SkeletonCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5" key={item}>
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
      <Mail className="mx-auto text-blue-500" size={34} />
      <h3 className="mt-4 text-xl font-bold text-slate-950">No matching jobs yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Adjust filters or save this search to get fresh matches in your inbox.</p>
      <Button className="mt-5">Save Search</Button>
    </div>
  )
}
