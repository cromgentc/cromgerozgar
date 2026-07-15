import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Bookmark, BriefcaseBusiness, Building2, ClipboardCheck, Code2, Download, FileText, Quote, SearchCheck, Send, ShieldCheck, Star, Target, ThumbsUp, TrendingUp, UserRoundCheck, UsersRound } from 'lucide-react'
import { Button } from '../components/Button'
import { HeroBanner } from '../components/HeroBanner'
import { JobCard } from '../components/JobCard'
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

      <MobileHomeJobs jobs={latestJobs} onApply={onApply} />

      {liveCompanies.length >= 50 && (
        <Section className="bg-white md:hidden" title="Trusted companies hiring on INSEET" subtitle="Verified recruiters with active openings.">
          <CompanyGrid companies={liveCompanies} compactMobile />
        </Section>
      )}

      <div className="hidden md:block">
        <CareerFocusBand />

        {liveCompanies.length >= 50 && (
          <Section className="bg-white" title="Trusted companies hiring on INSEET" subtitle="Verified recruiter profiles with active openings and transparent role information.">
            <CompanyGrid companies={liveCompanies} />
          </Section>
        )}

        <LatestJobsSection hasMore jobs={latestJobs} onApply={onApply} />

        <TrustedByCandidates />

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
            10M+ users are on the INSEET app
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
  const testimonials = [
    {
      name: 'Komal Singh',
      role: 'Sales Executive',
      quote: 'The candidate dashboard is easy to use and keeps everything organized. I never miss any updates now.',
      avatar: 'KS',
      accent: 'blue',
      Icon: BriefcaseBusiness,
    },
    {
      name: 'Sonia Dutta',
      role: 'Digital Marketing Executive',
      quote: 'I created my profile once and started applying to better matched roles quickly. The experience is smooth and time-saving.',
      avatar: 'SD',
      accent: 'green',
      Icon: TrendingUp,
    },
    {
      name: 'Mohit Chawla',
      role: 'Backend Developer',
      quote: 'Recruiter updates and clean job details helped me stay confident during the hiring process. Highly recommended!',
      avatar: 'MC',
      accent: 'orange',
      Icon: Code2,
    },
  ]
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const stats = [
    [UsersRound, '10,000+', 'Happy Candidates', 'blue'],
    [ShieldCheck, '95%', 'Success Rate', 'green'],
    [BriefcaseBusiness, '500+', 'Top Companies', 'orange'],
    [ThumbsUp, '4.8/5', 'Average Rating', 'purple'],
  ]
  const visibleTestimonials = testimonials.map((_, index) => testimonials[(activeTestimonial + index) % testimonials.length])

  useEffect(() => {
    if (isPaused || testimonials.length < 2) return undefined

    const sliderTimer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 3200)

    return () => window.clearInterval(sliderTimer)
  }, [isPaused, testimonials.length])

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_52%,#fff4e6_100%)] py-10 sm:py-12">
      <div className="absolute -left-5 top-3 text-[96px] font-black leading-none text-blue-100/60">“</div>
      <div className="absolute right-12 top-8 hidden grid-cols-6 gap-2 opacity-40 lg:grid">
        {Array.from({ length: 24 }).map((_, index) => <span className="h-1 w-1 rounded-full bg-blue-200" key={index} />)}
      </div>
      <div className="absolute -right-24 bottom-6 h-48 w-48 rounded-full bg-orange-100/60" />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">Testimonials</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Trusted by Candidates</h2>
        <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-[#ff8a00]" />
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
          Real feedback, success stories, and platform experiences shared by professionals using <span className="font-black text-blue-600">INSEET.</span>
        </p>

        <div className="mt-6 overflow-hidden" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="grid gap-4 text-left lg:grid-cols-3"
            initial={{ opacity: 0, x: 26 }}
            key={activeTestimonial}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {visibleTestimonials.map(({ Icon, accent, avatar, name, quote, role }) => (
              <article className="rounded-[12px] border border-blue-100 bg-white/90 p-4 shadow-lg shadow-blue-100/50 backdrop-blur" key={name}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`grid h-14 w-14 place-items-center rounded-full text-base font-black ${getCandidateAccentClasses(accent).avatar}`}>
                    {avatar}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                    <ShieldCheck size={15} /> Verified Candidate
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[#ffb000]">
                  {Array.from({ length: 5 }).map((_, index) => <Star className="fill-current" key={index} size={15} />)}
                  <span className="ml-2 text-sm font-black text-slate-800">5.0</span>
                  <Quote className="ml-auto text-blue-100" size={24} />
                </div>
                <p className="mt-4 min-h-[72px] text-sm font-semibold leading-6 text-slate-700">{quote}</p>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 place-items-center rounded-[12px] ${getCandidateAccentClasses(accent).icon}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-950">{name}</h3>
                      <p className="text-xs font-bold text-slate-500">{role}</p>
                      <p className="mt-0.5 text-xs font-black text-blue-600">INSEET Candidate</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map(({ name }, index) => (
              <button
                aria-label={`Show ${name} testimonial`}
                className={`h-2.5 rounded-full transition-all ${activeTestimonial === index ? 'w-8 bg-[#ff8a00]' : 'w-2.5 bg-blue-200 hover:bg-blue-400'}`}
                key={name}
                onClick={() => setActiveTestimonial(index)}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[12px] border border-blue-100 bg-white/90 p-3 shadow-lg shadow-blue-100/50 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-4">
            {stats.map(([Icon, value, label, accent]) => (
              <div className="flex items-center justify-center gap-3 border-slate-200 md:border-r md:last:border-r-0" key={label}>
                <span className={`grid h-11 w-11 place-items-center rounded-full ${getCandidateAccentClasses(accent).icon}`}>
                  <Icon size={20} />
                </span>
                <div className="text-left">
                  <p className="text-xl font-black text-slate-950">{value}</p>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="text-blue-600" size={18} />
          Your career journey is important. We're here to help you succeed.
        </p>
      </div>
    </section>
  )
}

function getCandidateAccentClasses(accent) {
  const accents = {
    blue: {
      avatar: 'bg-blue-100 text-blue-700',
      icon: 'bg-blue-100 text-blue-700',
    },
    green: {
      avatar: 'bg-emerald-100 text-emerald-700',
      icon: 'bg-emerald-100 text-emerald-700',
    },
    orange: {
      avatar: 'bg-orange-100 text-[#ff8a00]',
      icon: 'bg-orange-100 text-[#ff8a00]',
    },
    purple: {
      avatar: 'bg-violet-100 text-violet-700',
      icon: 'bg-violet-100 text-violet-700',
    },
  }
  return accents[accent] || accents.blue
}

function CareerFocusBand() {
  return (
    <section className="bg-[#f7fbff] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.88fr_1.45fr]">
          <div className="relative overflow-hidden rounded-[7px] bg-[#0057B8] p-5 text-white shadow-xl shadow-blue-100 sm:p-6">
            <div className="absolute -right-10 top-16 h-28 w-28 rounded-full border-[18px] border-white/10" />
            <div className="absolute bottom-8 left-10 grid grid-cols-6 gap-2 opacity-20">
              {Array.from({ length: 24 }).map((_, index) => <span className="h-1.5 w-1.5 rounded-full bg-white" key={index} />)}
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/15 ring-1 ring-white/15"><BriefcaseBusiness size={24} /></span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-blue-100">Career workspace</p>
            <h2 className="mt-3 max-w-lg text-2xl font-black leading-tight sm:text-3xl">One place for jobs, profiles, saves, and applications</h2>
            <span className="mt-4 block h-0.5 w-12 rounded-full bg-[#ff8a00]" />
            <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-blue-50">
              Build your candidate profile once, then use it to apply faster, track status, and stay ready for recruiter shortlisting.
            </p>
            <div className="relative mt-6 rounded-[7px] border border-white/20 bg-white p-3 text-slate-900 shadow-xl shadow-blue-950/20">
              <div className="grid gap-3 sm:grid-cols-[90px_1fr_120px]">
                <div className="rounded-[7px] bg-[#0057B8] p-2 text-[11px] font-bold text-white">
                  {['Overview', 'Applied Jobs', 'Saved Jobs', 'Applications', 'Profile'].map((item) => <p className="py-1" key={item}>{item}</p>)}
                </div>
                <div className="rounded-[7px] bg-slate-50 p-3">
                  <p className="text-xs font-black">Welcome back, Rahul</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-[7px] bg-white p-2 shadow-sm">
                      <p className="text-xs font-bold text-slate-500">Profile Strength</p>
                      <p className="mt-1 text-xl font-black text-emerald-600">85%</p>
                    </div>
                    <div className="rounded-[7px] bg-white p-2 shadow-sm">
                      <p className="text-xs font-bold text-slate-500">Recent Applications</p>
                      <p className="mt-1 text-xl font-black text-[#0057B8]">12</p>
                    </div>
                  </div>
                </div>
                <div className="hidden rounded-[7px] bg-slate-50 p-2 text-[11px] font-bold text-slate-600 sm:block">
                  <p className="font-black text-slate-950">Recommended Jobs</p>
                  {['UX Designer', 'Frontend Developer', 'Product Manager'].map((item) => <p className="mt-2 rounded-[7px] bg-white px-2 py-1.5 shadow-sm" key={item}>{item}</p>)}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {['Profile-led matching', 'Saved jobs', 'Application tracking'].map((item) => (
                <span className="rounded-[7px] bg-white/14 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/10" key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              [ShieldCheck, 'Verified Recruiters', 'Connect with trusted companies and genuine hiring teams.', 'bg-blue-50 text-[#0057B8]'],
              [BriefcaseBusiness, 'Flexible Work Modes', 'Find full-time, part-time, remote, hybrid, contract, and freelance jobs that fit your lifestyle.', 'bg-green-50 text-[#21a943]'],
              [Send, 'Fast Apply', 'Apply faster using your saved profile and resume with one click.', 'bg-orange-50 text-[#ff8a00]'],
              [Bookmark, 'Saved Jobs', 'Bookmark jobs that interest you and apply when you are ready.', 'bg-violet-50 text-[#6d37dc]'],
              [TrendingUp, 'Application Tracking', 'Track your applications and get real-time updates at every step.', 'bg-cyan-50 text-cyan-600'],
              [Target, 'Smart Matching', 'Get job recommendations based on your skills, experience and preferences.', 'bg-pink-50 text-pink-600'],
            ].map(([Icon, title, text, tone]) => (
              <article className="rounded-[7px] border border-slate-200 bg-white p-4 shadow-lg shadow-blue-100/40 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={title}>
                <span className={`grid h-12 w-12 place-items-center rounded-[13px] ${tone}`}>
                  <Icon size={24} strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
                <span className={`mt-3 block h-0.5 w-10 rounded-full ${title.includes('Recruiters') ? 'bg-[#0057B8]' : title.includes('Modes') ? 'bg-[#21a943]' : title.includes('Apply') ? 'bg-[#ff8a00]' : title.includes('Saved') ? 'bg-[#6d37dc]' : title.includes('Tracking') ? 'bg-cyan-500' : 'bg-pink-500'}`} />
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LatestJobsSection({ hasMore = false, jobs: latestJobs, onApply }) {
  return (
    <section className="bg-[#fbfaf7] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Latest Jobs</h2>
          <span className="mx-auto mt-2 block h-1 w-14 rounded-full bg-[#178955]" />
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
            Fresh verified openings from active recruiters, updated as new jobs are approved.
          </p>
        </div>
        <LatestJobsGrid hasMore={hasMore} jobs={latestJobs} onApply={onApply} />
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
      <div className="grid gap-6 lg:grid-cols-2">
        {latestJobs.slice(0, 2).map((job) => <JobCard homeLatest job={job} key={job._id || job.id} onApply={onApply} />)}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button className="min-h-10 bg-[#178955] px-5 text-xs font-black shadow-lg shadow-emerald-100 hover:bg-[#126f45]" to="/jobs" variant="primary">More Jobs</Button>
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
