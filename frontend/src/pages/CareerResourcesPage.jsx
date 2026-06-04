import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, CheckCircle2, FileText, HelpCircle, Lightbulb, MapPin, Search, ShieldCheck, UsersRound, X } from 'lucide-react'
import { Button } from '../components/Button'
import { api } from '../services/api'

const resourceCards = [
  {
    icon: Search,
    title: 'Job Search Guide',
    text: 'Find active jobs faster with better keywords, city filters, and skill-focused searches.',
    to: '/jobs',
    tone: 'blue',
  },
  {
    icon: FileText,
    title: 'Resume & Application Tips',
    text: 'Prepare a clear profile, upload the right documents, and apply with confidence.',
    to: '/candidate-dashboard',
    tone: 'orange',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Recruiter Resources',
    text: 'Post jobs, manage applications, shortlist talent, and understand hiring workflows.',
    to: '/recruiter',
    tone: 'green',
  },
  {
    icon: UsersRound,
    title: 'Freelancer Resources',
    text: 'Browse projects, build trust, and apply to freelance work with the right profile.',
    to: '/freelancer',
    tone: 'purple',
  },
]

const checklist = [
  'Keep profile details, location, skills, and experience updated.',
  'Upload a clean resume with phone, email, skills, and recent work history.',
  'Apply only to relevant jobs or projects where your skills match.',
  'Track saved jobs, applications, interviews, and recruiter responses.',
]

export function CareerResourcesPage() {
  const [faqs, setFaqs] = useState([])
  const [careerJobs, setCareerJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    Promise
      .all([
        api.faqs().catch(() => ({ data: [] })),
        api.careerJobs().catch(() => ({ data: [] })),
      ])
      .then(([faqPayload, jobsPayload]) => {
        if (!mounted) return
        const faqItems = Array.isArray(faqPayload.data) ? faqPayload.data : []
        const jobItems = Array.isArray(jobsPayload.data) ? jobsPayload.data : []
        setFaqs(faqItems.filter((item) => item.question && item.answer && item.status === 'Active').slice(0, 6))
        setCareerJobs(jobItems.filter((item) => item.title && item.status === 'Active'))
      })

    return () => {
      mounted = false
    }
  }, [])

  const filteredFaqs = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return faqs
    return faqs.filter((item) => (
      item.question?.toLowerCase().includes(value)
      || item.answer?.toLowerCase().includes(value)
      || item.category?.toLowerCase().includes(value)
    ))
  }, [faqs, query])
  const filteredCareerJobs = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return careerJobs
    return careerJobs.filter((job) => (
      job.title?.toLowerCase().includes(value)
      || job.department?.toLowerCase().includes(value)
      || job.location?.toLowerCase().includes(value)
      || job.skills?.join(' ')?.toLowerCase().includes(value)
    ))
  }, [careerJobs, query])
  const totalVacancies = careerJobs.reduce((total, job) => total + Math.max(Number(job.openings || 1), 1), 0)

  return (
    <main className="bg-[#f8fbff]">
      <section className="relative overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute left-8 top-24 hidden h-28 w-28 bg-[radial-gradient(circle,#0b5cff_1.5px,transparent_1.5px)] bg-[length:20px_20px] opacity-20 lg:block" />
        <div className="pointer-events-none absolute right-10 top-64 hidden h-28 w-28 bg-[radial-gradient(circle,#ff8a00_1.5px,transparent_1.5px)] bg-[length:20px_20px] opacity-20 lg:block" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0057B8]">
              <BookOpenCheck size={16} />
              Career Resources
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#061333] sm:text-5xl">
              Guides to help you move faster in your career
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Practical resources for candidates, freelancers, and recruiters using Cromgen Rozgar.
            </p>
            <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] border border-blue-100 bg-white p-4 shadow-sm">
                <p className="text-3xl font-black text-[#0057B8]">{totalVacancies}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Cromgen Rozgar Vacancy</p>
              </div>
              <div className="rounded-[8px] border border-orange-100 bg-white p-4 shadow-sm">
                <p className="text-3xl font-black text-[#ff8a00]">{careerJobs.length}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Active Career Posts</p>
              </div>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/70">
              <Search className="shrink-0 text-[#0057B8]" size={20} />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search help topics"
                value={query}
              />
            </div>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {resourceCards.map((card) => <ResourceCard card={card} key={card.title} />)}
          </div>

          <section className="mt-8 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8a00]">Cromgen Rozgar Hiring</p>
                <h2 className="mt-1 text-2xl font-black text-[#061333]">Current vacancies</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">{totalVacancies} vacancy available across {careerJobs.length} active posts.</p>
              </div>
              <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0057B8]" to="/contact">
                HR Support <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredCareerJobs.length ? filteredCareerJobs.map((job) => (
                <CareerJobCard job={job} key={job._id || job.title} onApply={() => setActiveJob(job)} />
              )) : (
                <div className="rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center lg:col-span-2">
                  <BriefcaseBusiness className="mx-auto text-[#0057B8]" size={34} />
                  <h3 className="mt-3 text-lg font-black text-slate-950">No Cromgen Rozgar vacancies right now</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Admin Website Content mein Career Job Post add karte hi yahan show hoga.</p>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
              <div className="grid h-14 w-14 place-items-center rounded-[8px] bg-orange-50 text-[#ff8a00]">
                <Lightbulb size={28} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#061333]">Career checklist</h2>
              <div className="mt-5 grid gap-3">
                {checklist.map((item) => (
                  <div className="flex gap-3 rounded-[7px] bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600" key={item}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#0057B8]" size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="bg-[#0057B8] text-white" to="/jobs">Find Jobs <ArrowRight size={17} /></Button>
                <Button className="recruiter-video-testimonial-btn" to="/contact" variant="secondary">Get Support</Button>
              </div>
            </section>

            <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff8a00]">Dynamic FAQ</p>
                  <h2 className="mt-1 text-2xl font-black text-[#061333]">Popular questions</h2>
                </div>
                <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0057B8]" to="/faqs">
                  View all <ArrowRight size={17} />
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {filteredFaqs.length ? filteredFaqs.map((item) => (
                  <article className="rounded-[7px] border border-slate-100 bg-[#f8fbff] p-4" key={item._id || item.question}>
                    <div className="flex gap-3">
                      <HelpCircle className="mt-1 shrink-0 text-[#0057B8]" size={18} />
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{item.question}</h3>
                        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{item.answer}</p>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-[7px] bg-slate-50 p-5 text-center">
                    <ShieldCheck className="mx-auto text-[#0057B8]" size={28} />
                    <p className="mt-3 text-sm font-black text-slate-900">No matching resources found</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">Try another keyword or open the full FAQ page.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
      {activeJob && <CareerApplyModal job={activeJob} onClose={() => setActiveJob(null)} />}
    </main>
  )
}

function CareerJobCard({ job, onApply }) {
  const skills = Array.isArray(job.skills) ? job.skills.slice(0, 4) : []

  return (
    <article className="rounded-[8px] border border-slate-200 bg-[#f8fbff] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0057B8]">{job.department || 'Cromgen Rozgar'}</p>
          <h3 className="mt-2 text-xl font-black text-[#061333]">{job.title}</h3>
        </div>
        <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff8a00]">
          {Math.max(Number(job.openings || 1), 1)} vacancy
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2">
        <p className="flex items-center gap-2"><MapPin size={16} className="text-[#0057B8]" /> {job.location || 'India'}</p>
        <p>{job.workMode || 'Hybrid'} / {job.type || 'Full Time'}</p>
        {job.experience && <p>Experience: {job.experience}</p>}
        {job.salary && <p>Salary: {job.salary}</p>}
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{job.description}</p>
      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200" key={skill}>{skill}</span>)}
        </div>
      )}
      <button className="recruiter-video-testimonial-btn mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-5 text-sm font-black" onClick={onApply} type="button">
        Apply Now <ArrowRight size={17} />
      </button>
    </article>
  )
}

function CareerApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    try {
      await api.create('support-messages', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'Career Applicant',
        subject: `Career Application: ${job.title}`,
        message: [
          `Career application for ${job.title}`,
          `Department: ${job.department || 'Cromgen Rozgar'}`,
          `Location: ${job.location || 'India'}`,
          `Applicant message: ${form.message || 'Not added'}`,
        ].join('\n'),
        source: 'career-resources',
        status: 'Open',
      })
      setStatus('Application submitted successfully.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      setStatus(error.message || 'Application could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <button className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200" onClick={onClose} type="button" aria-label="Close application form">
          <X size={20} />
        </button>
        <div className="bg-gradient-to-r from-[#0057B8] to-[#ff8a00] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-50">Apply for</p>
          <h2 className="mt-2 pr-10 text-2xl font-black">{job.title}</h2>
          <p className="mt-2 text-sm font-semibold text-blue-50">{job.department || 'Cromgen Rozgar'} / {job.location || 'India'}</p>
        </div>
        <form className="grid gap-3 p-6" onSubmit={submit}>
          <input className="input" onChange={(event) => update('name', event.target.value)} placeholder="Full name" required value={form.name} />
          <input className="input" onChange={(event) => update('email', event.target.value)} placeholder="Email address" required type="email" value={form.email} />
          <input className="input" onChange={(event) => update('phone', event.target.value)} placeholder="Phone number" value={form.phone} />
          <textarea className="input min-h-28" onChange={(event) => update('message', event.target.value)} placeholder="Short message / experience" value={form.message} />
          {status && <p className="rounded-[7px] bg-blue-50 p-3 text-sm font-black text-[#0057B8]">{status}</p>}
          <button className="recruiter-video-testimonial-btn inline-flex min-h-11 items-center justify-center rounded-[7px] px-5 text-sm font-black" disabled={submitting} type="submit">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ResourceCard({ card }) {
  const Icon = card.icon
  const tone = getTone(card.tone)

  return (
    <Link className={`group rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl ${tone.border}`} to={card.to}>
      <span className={`grid h-14 w-14 place-items-center rounded-[8px] ${tone.bg} ${tone.text}`}>
        <Icon size={27} />
      </span>
      <h2 className="mt-5 text-xl font-black text-[#061333]">{card.title}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{card.text}</p>
      <span className={`mt-5 inline-flex items-center gap-2 text-sm font-black ${tone.text}`}>
        Open resource <ArrowRight className="transition group-hover:translate-x-1" size={17} />
      </span>
    </Link>
  )
}

function getTone(tone = 'blue') {
  const tones = {
    blue: { bg: 'bg-blue-50', border: 'hover:border-blue-200', text: 'text-[#0057B8]' },
    green: { bg: 'bg-emerald-50', border: 'hover:border-emerald-200', text: 'text-[#109d62]' },
    orange: { bg: 'bg-orange-50', border: 'hover:border-orange-200', text: 'text-[#ff8a00]' },
    purple: { bg: 'bg-violet-50', border: 'hover:border-violet-200', text: 'text-[#6d37dc]' },
  }
  return tones[tone] || tones.blue
}
