import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, ClipboardCheck, Download, FileText, SearchCheck, Send, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '../components/Button'
import { FAQSection } from '../components/FAQSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { HeroBanner } from '../components/HeroBanner'
import { JobCard } from '../components/JobCard'
import { ReviewCard } from '../components/ReviewCard'
import { Section } from '../components/Section'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { createCategoryJobsPath, getJobsForCategory } from '../utils/categoryMatching'
import { createCompanyDetailPath } from '../utils/companyProfiles'
import { getCandidateProfileCompletion } from '../utils/candidateActivity'
import { decorateCategories } from '../utils/portalResources'

export function HomePage({ onApply }) {
  const user = getStoredUser()
  const isCandidate = user?.role === 'Candidate'
  const isRecruiter = user?.role === 'recruiter'
  const [liveJobs, setLiveJobs] = useState([])
  const [liveCompanies, setLiveCompanies] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let active = true

    api.jobListings('?sort=-createdAt')
      .then((payload) => {
        if (active) setLiveJobs(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setLiveJobs([])
      })

    api.companyProfiles()
      .then((payload) => {
        if (active) setLiveCompanies(Array.isArray(payload.data) ? payload.data : [])
      })

    api.listAll('categories', '?status=Active&sort=name')
      .then((payload) => {
        if (active) setCategories(decorateCategories(Array.isArray(payload.data) ? payload.data : []))
      })
      .catch(() => {
        if (active) setCategories([])
      })
      .catch(() => {
        if (active) setLiveCompanies([])
      })

    return () => {
      active = false
    }
  }, [])

  const categoryCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category.name] = getJobsForCategory(liveJobs, category.name).length
      return counts
    }, {})
  }, [liveJobs])
  const premiumJobs = useMemo(() => getLatestPremiumJobs(liveJobs), [liveJobs])
  const latestJobs = useMemo(() => premiumJobs.slice(0, 6), [premiumJobs])

  return (
    <>
      <HeroBanner />

      <AppDownloadPromo />

      <MobileHomeJobs jobs={latestJobs} onApply={onApply} />

      {liveCompanies.length >= 50 && (
        <Section className="bg-white md:hidden" title="Trusted companies hiring on CromGen Rozgar" subtitle="Verified recruiters with active openings.">
          <CompanyGrid companies={liveCompanies} compactMobile />
        </Section>
      )}

      <div className="md:hidden">
        <CareerLanes categories={categories} compactMobile categoryCounts={categoryCounts} />
      </div>

      <div className="hidden md:block">
        <CareerFocusBand />

        {liveCompanies.length >= 50 && (
          <Section className="bg-white" title="Trusted companies hiring on CromGen Rozgar" subtitle="Verified recruiter profiles with active openings and transparent role information.">
            <CompanyGrid companies={liveCompanies} />
          </Section>
        )}

        <Section className="bg-white" title="Latest Jobs" subtitle="Fresh verified openings from active recruiters, updated as new jobs are approved.">
          <LatestJobsGrid hasMore jobs={latestJobs} onApply={onApply} />
        </Section>

        <Section className="bg-white" title="How It Works">
          <ProcessGrid isCandidate={isCandidate} isRecruiter={isRecruiter} jobsCount={liveJobs.length} user={user} />
        </Section>

        <CareerLanes categories={categories} categoryCounts={categoryCounts} />

        {!isCandidate && <FeatureShowcase />}

        <TrustedByCandidates />

        <FAQSection />
      </div>
    </>
  )
}

function AppDownloadPromo() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messageType, setMessageType] = useState('info')

  const submitAppLink = async (event) => {
    event.preventDefault()
    const mobile = phone.replace(/\D/g, '')

    if (mobile.length !== 10) {
      setMessageType('error')
      setMessage('Enter a valid 10 digit mobile number.')
      return
    }

    setSending(true)
    setMessage('')

    try {
      const payload = await api.sendWhatsappAppLink({ phone: mobile })
      setMessageType('success')
      setMessage(payload.message || 'Application link sent on WhatsApp.')
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || 'Application link could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-white px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[20px] border border-blue-100 bg-[#F5F4FF] shadow-sm sm:rounded-[24px] lg:grid-cols-[0.9fr_0.55fr_1.35fr] lg:items-center">
        <div className="p-5 sm:p-8">
          <h2 className="max-w-xs text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
            10M+ users are on the CromGen app
          </h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">Get real-time job updates & more!</p>

          <form className="mt-6 flex min-h-12 max-w-sm items-center overflow-hidden rounded-full border border-[#1F5BFF] bg-white shadow-sm" onSubmit={submitAppLink}>
            <span className="border-r border-slate-200 px-4 text-sm font-bold text-slate-950">+91</span>
            <input
              className="min-w-0 flex-1 px-3 text-sm font-semibold outline-none"
              inputMode="tel"
              aria-label="Mobile number"
              maxLength={10}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                if (message) setMessage('')
              }}
              value={phone}
            />
            <button className="mr-1 inline-flex min-h-10 items-center rounded-full bg-[#1F5BFF] px-5 text-sm font-black text-white disabled:opacity-60" disabled={sending} type="submit">
              {sending ? 'Sending' : 'Get link'}
            </button>
          </form>
          {message && (
            <p className={`mt-3 max-w-sm rounded-[7px] px-3 py-2 text-xs font-bold ${messageType === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <StoreBadge label="GET IT ON" name="Google Play" />
            <StoreBadge label="Download on the" name="App Store" />
          </div>
        </div>

        <div className="hidden justify-center p-5 sm:flex">
          <div className="rounded-[7px] border border-blue-100 bg-white p-3 text-center shadow-sm">
            <div className="grid h-24 w-24 grid-cols-7 gap-1 bg-white p-1">
              {Array.from({ length: 49 }).map((_, index) => (
                <span className={`${qrPattern.has(index) ? 'bg-slate-950' : 'bg-white'} rounded-[1px]`} key={index} />
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Scan to download</p>
          </div>
        </div>

        <div className="relative min-h-[230px] overflow-hidden px-4 pb-5 sm:min-h-[300px] sm:px-8 sm:pb-0">
          <div className="absolute bottom-0 left-4 hidden h-44 w-24 rounded-t-full border-4 border-slate-900 bg-white sm:block">
            <div className="absolute left-1/2 top-5 h-3 w-10 -translate-x-1/2 rounded-full bg-slate-900" />
          </div>

          <div className="absolute bottom-0 left-16 hidden h-36 w-24 border-l-4 border-slate-900 sm:block">
            <div className="absolute -left-5 top-0 h-7 w-7 rounded-full border-4 border-slate-900 bg-white" />
            <div className="absolute left-4 top-12 h-20 w-16 rounded-t-full border-4 border-b-0 border-slate-900" />
          </div>

          <div className="ml-auto mt-4 max-w-md rounded-[28px] border-[5px] border-slate-800 bg-white p-4 shadow-2xl shadow-blue-100 sm:mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-950">24 Recommended jobs</p>
                <p className="text-[10px] font-semibold text-slate-400">Based on your preferences</p>
              </div>
              <Link className="text-[11px] font-black text-[#1F5BFF]" to="/jobs">View All</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['LA', 'Senior Java Developer', 'Lava India', '4.8'],
                ['AC', 'Senior IT operations specialist', 'Accenture Global', '4.9'],
                ['AI', 'Senior Java Engineering lead', 'Asian Paints', '3.9'],
              ].map(([badge, title, company, rating]) => (
                <div className="rounded-[7px] border border-slate-100 bg-white p-3 shadow-lg shadow-slate-200/80" key={title}>
                  <span className="grid h-8 w-8 place-items-center rounded-[6px] bg-[#F1334C] text-[10px] font-black text-white">{badge}</span>
                  <p className="mt-3 line-clamp-2 text-[11px] font-black leading-4 text-slate-950">{title}</p>
                  <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">{company} · {rating}</p>
                  <p className="mt-2 text-[10px] text-slate-400">India · 4-6 year</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StoreBadge({ label, name }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-[6px] bg-black px-3 text-white">
      <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-white text-[10px] font-black text-black">{name === 'Google Play' ? 'G' : 'A'}</span>
      <span>
        <span className="block text-[8px] font-bold leading-3 text-white/80">{label}</span>
        <span className="block text-xs font-black leading-3">{name}</span>
      </span>
    </span>
  )
}

const qrPattern = new Set([
  0, 1, 2, 4, 5, 6, 7, 9, 12, 14, 16, 18, 20, 21, 22, 24, 25, 27, 30, 32, 34, 36, 37, 39, 41, 42, 44, 45, 48,
])

function MobileHomeJobs({ jobs = [], onApply }) {
  return (
    <section className="bg-slate-50 px-2 py-4 md:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">Recommended</p>
          <h2 className="text-lg font-black text-slate-950">Fresh jobs for you</h2>
        </div>
        <Link className="rounded-[7px] bg-blue-50 px-3 py-2 text-xs font-black text-blue-700" to="/jobs">View all</Link>
      </div>
      {jobs.length ? (
        <div className="grid grid-cols-2 gap-2">
          {jobs.slice(0, 4).map((job) => <JobCard denseMobile job={job} key={job._id || job.id} onApply={onApply} />)}
        </div>
      ) : (
        <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-4 text-sm font-semibold text-slate-500">
          No active jobs yet.
        </div>
      )}
    </section>
  )
}

function TrustedByCandidates() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.listAll('testimonials', '?status=Active&sort=-featured%20-createdAt')
      .then((payload) => {
        if (!active) return
        const testimonials = Array.isArray(payload.data) ? payload.data : []
        setItems(testimonials.filter((item) => item.name && item.text))
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visibleItems = items.slice(0, 3)

  return (
    <section className="bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Trusted By Candidates</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-500">
          Candidate feedback, success stories, and platform experiences shared by professionals using CromGen Rozgar.
        </p>
        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div className="h-44 animate-pulse rounded-[7px] bg-slate-100" key={item} />)}
          </div>
        ) : items.length ? (
          <>
            <div className="mt-8 grid gap-5 text-left md:grid-cols-3">
              {visibleItems.map((item) => <ReviewCard item={item} key={item._id || item.name} />)}
            </div>
            {items.length > 3 && (
              <Button className="mt-8" to="/candidate-reviews" variant="secondary">
                More Reviews
              </Button>
            )}
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            When admin adds candidate testimonials, they will appear here automatically.
          </p>
        )}
      </div>
    </section>
  )
}

function CareerFocusBand() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[7px] border border-[#0057B8]/10 bg-[#0057B8] p-7 text-white shadow-xl shadow-[#0057B8]/15 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[7px] bg-white/15"><Smartphone size={22} /></span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">Career workspace</p>
                <h2 className="mt-1 text-3xl font-black">One place for jobs, profiles, saves, and applications</h2>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-blue-50">
                  Build your candidate profile once, then use it to apply faster, track status, and stay ready for recruiter shortlisting.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Profile-led matching', 'Saved jobs', 'Application tracking'].map((item) => (
                <span className="rounded-[7px] bg-white/14 px-4 py-2 text-sm font-black text-white" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Verified Recruiters', 'Connect with companies using structured hiring workflows.'],
              ['Flexible Work Modes', 'Find remote, hybrid, full-time, contract, and freelance jobs.'],
            ].map(([title, text]) => (
              <div className="rounded-[7px] border border-slate-200 bg-white p-6 shadow-sm" key={title}>
                <Download className="text-[#0057B8]" size={24} />
                <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LatestJobsGrid({ hasMore = false, jobs: latestJobs, onApply }) {
  if (!latestJobs.length) {
    return (
      <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-10 text-center">
        <SearchCheck className="mx-auto text-blue-500" size={34} />
        <h3 className="mt-4 text-2xl font-black text-slate-950">No premium openings yet</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
          When recruiters post approved active jobs, the latest openings will appear here automatically.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {latestJobs.map((job) => <JobCard featured job={job} key={job._id || job.id} onApply={onApply} />)}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button to="/jobs" variant="primary">More Jobs</Button>
        </div>
      )}
    </>
  )
}

function CareerLanes({ categories = [], compactMobile = false, categoryCounts }) {
  const featured = categories.slice(0, 3)
  const remaining = categories.slice(3, 11)
  const mobileCategories = categories.slice(0, 4)

  return (
    <section className={`bg-slate-50 ${compactMobile ? 'py-6' : 'py-16 sm:py-20'}`}>
      <div className={`mx-auto max-w-7xl ${compactMobile ? 'px-2' : 'px-4 sm:px-6 lg:px-8'}`}>
        <div className={`${compactMobile ? 'mb-4' : 'mb-9'} grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end`}>
          <div>
            <h2 className={`${compactMobile ? 'text-xl' : 'text-3xl sm:text-4xl'} font-black tracking-tight text-slate-950`}>Choose a path. Find verified work faster.</h2>
            <p className={`${compactMobile ? 'mt-2 text-xs leading-5' : 'mt-3 text-sm leading-7'} max-w-2xl font-semibold text-slate-500`}>
              Explore categories built around Indian hiring demand, flexible work modes, and profile-led matching.
            </p>
          </div>
          <div className={`grid ${compactMobile ? 'grid-cols-3 gap-2' : 'gap-3 sm:grid-cols-3'}`}>
            {[
              ['12+', 'Categories'],
              ['Pan India', 'Hiring'],
              ['Remote', 'Flexible work'],
            ].map(([value, label]) => (
              <div className={`rounded-[7px] border border-slate-200 bg-white shadow-sm ${compactMobile ? 'p-2' : 'p-4'}`} key={label}>
                <p className={`${compactMobile ? 'text-sm' : 'text-xl'} font-black text-[#0057B8]`}>{value}</p>
                <p className={`${compactMobile ? 'text-[10px]' : 'text-xs'} mt-1 font-bold uppercase tracking-wide text-slate-400`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {categories.length ? compactMobile ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {mobileCategories.map((category, index) => (
                <CareerLaneCard
                  category={category}
                  compactMobile
                  count={categoryCounts[category.name] || 0}
                  featured={index < 3}
                  index={index}
                  key={category.name}
                />
              ))}
            </div>
            {categories.length > 4 && (
              <div className="mt-3 flex justify-center">
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-[7px] bg-[#0057B8] px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-100 transition hover:bg-[#004694]"
                  target="_blank"
                  to="/industries"
                >
                  More Industry
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              {featured.map((category, index) => <CareerLaneCard category={category} count={categoryCounts[category.name] || 0} featured index={index} key={category.name} />)}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {remaining.map((category, index) => <CareerLaneCard category={category} count={categoryCounts[category.name] || 0} index={index + featured.length} key={category.name} />)}
            </div>
            {categories.length > featured.length + remaining.length && (
              <div className="mt-8 text-center">
                <Button to="/industries" target="_blank" variant="secondary">More Industry</Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-xl font-black text-slate-950">No active categories yet</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">Add categories from admin to show them here.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function CareerLaneCard({ category, compactMobile = false, count, featured = false, index }) {
  const Icon = category.icon

  return (
    <motion.div
      className={`group overflow-hidden rounded-[7px] border bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#0057B8]/25 hover:shadow-xl hover:shadow-[#0057B8]/10 ${featured ? 'border-[#0057B8]/15' : 'border-slate-200'}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.025 }}
    >
      <Link className={`${compactMobile ? 'min-h-32 p-3' : featured ? 'min-h-44 p-6' : 'min-h-32 p-5'} block h-full`} to={createCategoryJobsPath(category)}>
        <div className="flex items-start justify-between gap-4">
          <div className={`grid place-items-center rounded-[7px] ${compactMobile ? `h-9 w-9 ${featured ? 'bg-[#0057B8] text-white' : category.color}` : featured ? 'h-14 w-14 bg-[#0057B8] text-white' : `h-12 w-12 ${category.color}`}`}>
            <Icon size={compactMobile ? 17 : featured ? 24 : 21} />
          </div>
          <span className={`rounded-[7px] bg-slate-50 font-black text-slate-500 ring-1 ring-slate-200 ${compactMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1 text-xs'}`}>
            {count} roles
          </span>
        </div>
        <h3 className={`${compactMobile ? 'mt-3 text-sm' : featured ? 'mt-6 text-xl' : 'mt-4 text-base'} font-black text-slate-950 group-hover:text-[#0057B8]`}>{category.name}</h3>
        <p className={`${compactMobile ? 'mt-1 line-clamp-2 text-xs leading-5' : 'mt-2 text-sm leading-6'} font-semibold text-slate-500`}>
          {featured ? getCareerLaneDescription(category.name) : `${count} open roles in ${category.name}`}
        </p>
      </Link>
    </motion.div>
  )
}

function getCareerLaneDescription(name) {
  const descriptions = {
    'IT & Software': 'Frontend, backend, full stack, QA, cloud, and product engineering roles.',
    'Sales & Marketing': 'Growth, field sales, digital marketing, CRM, and lead generation jobs.',
    'Customer Support': 'Voice, non-voice, success, helpdesk, and operations support openings.',
  }

  return descriptions[name] || `Verified openings and flexible work options in ${name}.`
}

function getLatestPremiumJobs(jobs = []) {
  return jobs
    .map((job) => ({ ...normalizeJob(job), premiumScore: getPremiumJobScore(job) }))
    .sort((a, b) => {
      const dateDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      if (dateDiff) return dateDiff
      return b.premiumScore - a.premiumScore
    })
}

function normalizeJob(job) {
  return {
    ...job,
    skills: Array.isArray(job.skills) ? job.skills : String(job.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
  }
}

function getPremiumJobScore(job) {
  const fields = [
    job.title,
    job.company,
    job.department,
    job.industry,
    job.location,
    job.salary,
    job.experience,
    job.type,
    job.workMode,
    job.deadline,
    job.description,
    ...(Array.isArray(job.skills) ? job.skills : []),
  ]
  const completed = fields.filter((value) => String(value || '').trim()).length
  const recruiterBoost = job.recruiterEmail ? 3 : 0
  const packageBoost = job.packageName ? 2 : 0
  return completed + recruiterBoost + packageBoost
}

function ProcessGrid({ isCandidate, isRecruiter, jobsCount, user }) {
  const profileCompletion = isCandidate ? getCandidateProfileCompletion(user) : { complete: false, missing: [] }
  const steps = getProcessSteps({ isCandidate, isRecruiter, jobsCount, profileCompletion })

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <div className="group rounded-[7px] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-100" key={step.title}>
            <div className="flex items-start justify-between gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-[7px] ${step.tone}`}>
                <Icon size={21} />
              </div>
              <span className="rounded-[7px] bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">Step {index + 1}</span>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950 group-hover:text-blue-700">{step.title}</h3>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-500">{step.text}</p>
            <div className="mt-5 rounded-[7px] bg-white p-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
              {step.metric}
            </div>
            <Button className="mt-5 w-full" to={step.to} variant={index === 0 ? 'primary' : 'secondary'}>{step.action}</Button>
          </div>
        )
      })}
    </div>
  )
}

function getProcessSteps({ isCandidate, isRecruiter, jobsCount, profileCompletion }) {
  if (isRecruiter) {
    return [
      {
        icon: ShieldCheck,
        title: 'Verify company workspace',
        text: 'Complete recruiter verification, documents, and company profile before accessing full hiring tools.',
        metric: 'Enterprise account review',
        action: 'Open Dashboard',
        to: '/recruiter-dashboard',
        tone: 'bg-blue-600 text-white',
      },
      {
        icon: FileText,
        title: 'Post approved jobs',
        text: 'Create structured job posts with salary, skills, location, package, and account department approval flow.',
        metric: `${jobsCount} live candidate-facing jobs`,
        action: 'Post a Job',
        to: '/post-job',
        tone: 'bg-teal-50 text-teal-700',
      },
      {
        icon: ClipboardCheck,
        title: 'Review applications',
        text: 'Track candidate activity, shortlist profiles, schedule interviews, and monitor hiring status from one workspace.',
        metric: 'Applications synced by recruiter',
        action: 'View Applications',
        to: '/recruiter-applications',
        tone: 'bg-violet-50 text-violet-700',
      },
    ]
  }

  if (isCandidate) {
    return [
      {
        icon: FileText,
        title: profileCompletion.complete ? 'Profile ready' : 'Complete your profile',
        text: profileCompletion.complete
          ? 'Your profile and resume are ready for job applications.'
          : `Finish required details before applying: ${profileCompletion.missing.slice(0, 4).join(', ')}${profileCompletion.missing.length > 4 ? '...' : ''}.`,
        metric: profileCompletion.complete ? 'Application-ready profile' : `${profileCompletion.missing.length} pending details`,
        action: profileCompletion.complete ? 'View Profile' : 'Complete Profile',
        to: '/candidate-profile',
        tone: 'bg-blue-600 text-white',
      },
      {
        icon: SearchCheck,
        title: 'Discover matching roles',
        text: 'Use search, category pages, company pages, and SEO-based recommendations to find relevant active openings.',
        metric: `${jobsCount} active jobs available`,
        action: 'Find Jobs',
        to: '/jobs',
        tone: 'bg-teal-50 text-teal-700',
      },
      {
        icon: Send,
        title: 'Apply and track',
        text: 'Apply once per job, avoid duplicate applications, and track every submitted job from your dashboard.',
        metric: 'Applied jobs dashboard',
        action: 'Track Applications',
        to: '/candidate-applied-jobs',
        tone: 'bg-violet-50 text-violet-700',
      },
    ]
  }

  return [
    {
      icon: FileText,
      title: 'Create a candidate profile',
      text: 'Register, add skills, experience, resume, preferred locations, salary, and work mode for better matching.',
      metric: 'Profile required before apply',
      action: 'Create Profile',
      to: '/auth',
      tone: 'bg-blue-600 text-white',
    },
    {
      icon: Building2,
      title: 'Discover verified openings',
      text: 'Browse live jobs, company profiles, categories, filters, and similar jobs powered by active MongoDB data.',
      metric: `${jobsCount} active jobs available`,
      action: 'Explore Jobs',
      to: '/jobs',
      tone: 'bg-teal-50 text-teal-700',
    },
    {
      icon: Send,
      title: 'Apply and monitor status',
      text: 'Submit applications, save roles, and track recruiter progress from a dedicated candidate dashboard.',
      metric: 'End-to-end application tracking',
      action: 'Candidate Login',
      to: '/auth',
      tone: 'bg-violet-50 text-violet-700',
    },
  ]
}

export function CompanyGrid({ compactMobile = false, companies = [] }) {
  const [showAllMobileCompanies, setShowAllMobileCompanies] = useState(false)
  const list = useMemo(() => companies, [companies])
  const visibleList = compactMobile
    ? (showAllMobileCompanies ? list.slice(0, 6) : list.slice(0, 4))
    : list.slice(0, 3)

  return (
    <div className={`grid ${compactMobile ? 'grid-cols-2 gap-2' : 'gap-5 md:grid-cols-2 lg:grid-cols-3'}`}>
      {list.length ? visibleList.map((company) => (
        <div className={`rounded-[7px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 ${compactMobile ? 'p-3' : 'p-6'}`} key={company.name}>
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className={`grid place-items-center rounded-[7px] bg-gradient-to-br ${company.accent} font-black text-white shadow-lg shadow-blue-100 ${compactMobile ? 'h-10 w-10 text-sm' : 'h-14 w-14 text-lg'}`}>{company.badge}</div>
            <span className={`rounded-[7px] bg-teal-50 font-black text-teal-700 ${compactMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1 text-xs'}`}>{company.rating} rating</span>
          </div>
          <h3 className={`font-black text-slate-950 ${compactMobile ? 'mt-3 truncate text-sm' : 'mt-5 text-lg'}`}>{company.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{company.industry} · {company.location || 'Location not added'}</p>
          <p className="mt-4 text-sm font-bold text-blue-600">{company.openJobs} open jobs</p>
          <Button className="mt-5 w-full" to={createCompanyDetailPath(company)} variant="secondary">View Company</Button>
        </div>
      )) : (
        <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
          No company profiles yet. Add companies from admin to show them here.
        </div>
      )}
      {compactMobile && list.length > 4 && (
        <div className="col-span-2 flex justify-center">
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-[7px] bg-[#0057B8] px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-100 transition hover:bg-[#004694]"
            onClick={() => setShowAllMobileCompanies((value) => !value)}
            type="button"
          >
            {showAllMobileCompanies ? 'Show Less' : 'More Companies'}
          </button>
        </div>
      )}
      {!compactMobile && list.length > 3 && (
        <div className="md:col-span-2 lg:col-span-3 text-center">
          <Button target="_blank" to="/companies" variant="secondary">More Companies</Button>
        </div>
      )}
    </div>
  )
}
