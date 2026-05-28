import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  FileSearch,
  Handshake,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Rocket,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { api } from '../../services/api'
import { getStoredUser } from '../../routes/authRouting'
import heroImage from '../../assets/enterprise-hiring-banner.png'

const slides = [
  {
    badge: 'CromGen Rozgar Recruiter Portal',
    title: 'Hire Verified Talent Faster With CromGen Rozgar',
    subtitle: 'Post jobs, manage applications, shortlist candidates, and connect with skilled talent across India from one professional recruiter dashboard.',
    primary: 'Post a Job',
    secondary: 'View Candidates',
    metric: '94%',
    metricLabel: 'Candidate match',
    proof: ['Verified recruiter workflows', 'Live applicant tracking', 'Resume-ready talent pool'],
    to: '/post-job',
  },
  {
    badge: 'Pipeline control center',
    title: 'Manage Recruitment In One Place',
    subtitle: 'Track recruiter activity, shortlist candidates, and keep your hiring team aligned with clean pipeline visibility.',
    primary: 'Start Hiring',
    secondary: 'View Dashboard',
    metric: '+32%',
    metricLabel: 'Job performance',
    proof: ['Shortlist faster', 'Interview stage clarity', 'Team feedback tracking'],
    to: '/recruiter/recruiter-dashboard',
  },
  {
    badge: 'Talent brand builder',
    title: 'Build Your Dream Team',
    subtitle: 'Showcase your company, reach skilled professionals, and convert applications into reliable hires across industries.',
    primary: 'Register Recruiter',
    secondary: 'Explore Candidates',
    metric: '4x',
    metricLabel: 'Hiring reach',
    proof: ['Branded recruiter profile', 'Role-based discovery', 'Structured hiring flow'],
    to: '/recruiter-register',
  },
]

const features = [
  [Sparkles, 'Verified Talent Matching', 'Match skills, location, salary, and availability with hiring needs.'],
  [Database, 'Resume Database', 'Search qualified profiles and build reusable candidate pools.'],
  [ListChecks, 'Applicant Tracking', 'Move candidates through review, shortlist, interview, and offer stages.'],
  [MessageSquare, 'Team Collaboration', 'Keep recruiters and hiring managers aligned with shared feedback.'],
  [BarChart3, 'Hiring Analytics', 'Track job views, conversion rates, pipeline health, and hiring velocity.'],
  [UsersRound, 'Bulk Hiring', 'Run high-volume hiring campaigns with structured screening workflows.'],
]

const processSteps = [
  [LayoutDashboard, 'Create Recruiter Profile'],
  [BriefcaseBusiness, 'Post Job'],
  [FileSearch, 'Review Applications'],
  [Handshake, 'Hire Candidate'],
]

export function EmployerLandingPage() {
  const user = getStoredUser()
  const isLoggedIn = Boolean(user?.email)
  const isRecruiterAccount = user?.role === 'recruiter'
  const [active, setActive] = useState(0)
  const [recruiters, setRecruiters] = useState([])
  const [jobs, setJobs] = useState([])
  const [documents, setDocuments] = useState([])
  const [recruiterTestimonials, setRecruiterTestimonials] = useState([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 4500)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true

    api
      .recruiterPage()
      .then((payload) => {
        if (!mounted) return
        const data = payload.data || {}
        setRecruiters(Array.isArray(data.recruiters) ? data.recruiters : [])
        setJobs(Array.isArray(data.jobs) ? data.jobs : [])
        setDocuments(Array.isArray(data.documents) ? data.documents : [])
        setRecruiterTestimonials(Array.isArray(data.testimonials) ? data.testimonials.filter((item) => item.name && item.text) : [])
      })
      .catch(() => {
        if (!mounted) return
        setRecruiters([])
        setJobs([])
        setDocuments([])
        setRecruiterTestimonials([])
      })
      .finally(() => {
        if (mounted) setTestimonialsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const activeSlideAction = getRecruiterSlideAction(slides[active], user)
  const networkStats = useMemo(() => [
    [`${recruiters.length.toLocaleString('en-IN')}+`, 'Recruiters'],
    [`${jobs.filter((job) => job.accountDepartmentStatus === 'Active' || job.approval === 'Approved').length.toLocaleString('en-IN')}+`, 'Active Jobs'],
    [`${jobs.reduce((total, job) => total + Number(job.applicationsCount || 0), 0).toLocaleString('en-IN')}+`, 'Applications'],
    [`${documents.filter((document) => document.status === 'Approved').length.toLocaleString('en-IN')}+`, 'Verified Documents'],
  ], [documents, jobs, recruiters.length])

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#0057B8]/10 bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FBFF_48%,#FFF7ED_100%)]">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <img className="h-full w-full object-cover object-left opacity-95" src={heroImage} alt="" aria-hidden="true" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#FFFFFF_0%,rgba(255,255,255,0.82)_24%,rgba(255,255,255,0.2)_58%,rgba(255,247,237,0.74)_100%)]" />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0057B8] to-transparent" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.8fr)] lg:px-8">
          <div className="min-w-0 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.45 }}>
                <span className="inline-flex items-center gap-2 rounded-[7px] border border-[#0057B8]/15 bg-white/90 px-4 py-2 text-sm font-black text-[#0057B8] shadow-sm shadow-[#0057B8]/10 backdrop-blur">
                  <Rocket size={17} /> {slides[active].badge}
                </span>
                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] text-slate-950 sm:text-5xl lg:text-6xl">{slides[active].title}</h1>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-600 sm:text-lg">{slides[active].subtitle}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button to={activeSlideAction.to}>{activeSlideAction.label}</Button>
                  <Button to="/recruiter-talent" variant="secondary">{slides[active].secondary}</Button>
                </div>
                <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
                  {['10,000+ Active Candidates', 'Pan India Hiring', 'Verified Recruiters', 'Fast Shortlisting'].map((item) => (
                    <span className="inline-flex min-h-12 items-center gap-2 rounded-[7px] border border-slate-200 bg-white/80 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur" key={item}>
                      <CheckCircle2 className="shrink-0 text-[#3E9B28]" size={17} /> {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-[7px] bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100" onClick={() => setActive((active + slides.length - 1) % slides.length)} type="button" aria-label="Previous recruiter hero slide"><ArrowLeft size={18} /></button>
              <button className="grid h-11 w-11 place-items-center rounded-[7px] bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-100" onClick={() => setActive((active + 1) % slides.length)} type="button" aria-label="Next recruiter hero slide"><ArrowRight size={18} /></button>
              <div className="flex items-center gap-2 rounded-[7px] bg-white/80 px-3 py-2 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                {slides.map((slide, index) => <button className={`h-2.5 rounded-[7px] transition-all ${active === index ? 'w-9 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`} key={slide.title} onClick={() => setActive(index)} type="button" aria-label={`Show ${slide.title}`} />)}
              </div>
            </div>
          </div>

          <div className="relative min-w-0 lg:min-h-[460px]">
            <div className="relative overflow-hidden rounded-[7px] border border-white/80 bg-white/75 p-3 shadow-2xl shadow-blue-100 backdrop-blur-xl lg:hidden">
              <img className="aspect-[16/11] w-full object-contain" src={heroImage} alt="Recruiter dashboard preview" />
            </div>
            <div className="hidden lg:block">
              <FloatingStat className="right-5 top-8" label={slides[active].metricLabel} value={slides[active].metric} />
              <FloatingStat className="bottom-16 left-2" label="Active pipeline" value="2.4k" teal />
              <div className="absolute bottom-5 right-8 w-80 rounded-[7px] border border-white/80 bg-white/90 p-4 shadow-2xl shadow-blue-100 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Hiring momentum</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{networkStats[2]?.[0] || '0+'}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-[7px] bg-[#0057B8] text-white">
                    <BarChart3 size={22} />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Applied', 'Interview', 'Hired'].map((stage, index) => (
                    <div className="rounded-[7px] bg-slate-50 p-2" key={stage}>
                      <span className={`block h-1.5 rounded-[7px] ${index === 0 ? 'bg-[#0057B8]' : index === 1 ? 'bg-[#FF8A00]' : 'bg-[#3E9B28]'}`} />
                      <p className="mt-2 text-[11px] font-black text-slate-500">{stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Hiring features" title="Enterprise tools for modern recruitment" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, text]) => <FeatureCard Icon={Icon} title={title} text={text} key={title} />)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {networkStats.map(([value, label]) => (
            <div className="rounded-[7px] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={label}>
              <p className="text-3xl font-black text-slate-950">{value}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Recruitment process" title="From recruiter profile to successful hire" />
          <div className="grid gap-5 lg:grid-cols-4">
            {processSteps.map(([Icon, title], index) => (
              <div className="relative rounded-[7px] border border-slate-200 bg-white p-6 shadow-sm" key={title}>
                <div className="grid h-12 w-12 place-items-center rounded-[7px] bg-blue-600 text-white"><Icon size={22} /></div>
                <p className="mt-5 text-sm font-black text-blue-600">Step {index + 1}</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EmployerTestimonials loading={testimonialsLoading} testimonials={recruiterTestimonials} />
      <EmployerCTA isLoggedIn={isLoggedIn} isRecruiterAccount={isRecruiterAccount} />
    </>
  )
}

function FloatingStat({ className, label, value, teal = false }) {
  return (
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className={`absolute hidden rounded-[7px] border border-white bg-white/90 p-3 shadow-xl shadow-blue-100 backdrop-blur md:block ${className}`}>
      <p className={`text-2xl font-black ${teal ? 'text-teal-600' : 'text-blue-600'}`}>{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </motion.div>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
    </div>
  )
}

function FeatureCard({ Icon, title, text }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="rounded-[7px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100">
      <div className="grid h-12 w-12 place-items-center rounded-[7px] bg-gradient-to-br from-blue-600 to-teal-400 text-white"><Icon size={22} /></div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
    </motion.article>
  )
}

function EmployerTestimonials({ loading, testimonials = [] }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const visibleTestimonials = testimonials.slice(0, 10)
  const activeItem = visibleTestimonials[activeTestimonial] || visibleTestimonials[0]
  const averageRating = testimonials.length
    ? (testimonials.reduce((total, testimonial) => total + Number(testimonial.rating || 5), 0) / testimonials.length).toFixed(1)
    : '0.0'

  useEffect(() => {
    if (visibleTestimonials.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % visibleTestimonials.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [visibleTestimonials.length])

  useEffect(() => {
    if (activeTestimonial >= visibleTestimonials.length) setActiveTestimonial(0)
  }, [activeTestimonial, visibleTestimonials.length])

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Recruiter testimonials</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Recruiter reviews and success stories</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Published recruiter and company feedback from MongoDB, curated for hiring teams evaluating the platform.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-[420px]">
            <TestimonialMetric label="Stories" value={testimonials.length} />
            <TestimonialMetric label="Featured" value={testimonials.filter((item) => item.featured).length} />
            <TestimonialMetric label="Rating" value={averageRating} />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div className="h-64 animate-pulse rounded-[7px] bg-white ring-1 ring-slate-200" key={item} />)}
          </div>
        ) : visibleTestimonials.length ? (
          <div className="overflow-hidden rounded-[7px] border border-slate-200 bg-white p-5 shadow-xl shadow-blue-100">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-stretch">
              <AnimatePresence mode="wait">
                <motion.article
                  animate={{ opacity: 1, x: 0 }}
                  className="flex min-h-[340px] flex-col rounded-[7px] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6"
                  exit={{ opacity: 0, x: -24 }}
                  initial={{ opacity: 0, x: 24 }}
                  key={activeItem._id || activeItem.name}
                  transition={{ duration: 0.32 }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-14 w-14 place-items-center rounded-[7px] bg-gradient-to-br from-blue-600 to-teal-400 text-base font-black text-white shadow-lg shadow-blue-100">
                        {getRecruiterInitials(activeItem.name)}
                      </span>
                      <div>
                        <p className="text-xl font-black text-slate-950">{activeItem.name}</p>
                        <p className="text-sm font-semibold text-slate-500">{activeItem.role || activeItem.company || 'Recruiter'}</p>
                      </div>
                    </div>
                    {activeItem.featured && <span className="rounded-[7px] bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">Featured</span>}
                  </div>
                  <div className="mt-7 flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span className={`text-xl ${index < Number(activeItem.rating || 5) ? 'text-amber-400' : 'text-slate-200'}`} key={index}>?</span>
                    ))}
                  </div>
                  <p className="mt-6 flex-1 text-lg font-semibold leading-8 text-slate-700">{activeItem.text}</p>
                  <div className="mt-6 rounded-[7px] bg-white/80 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Company</p>
                    <p className="mt-1 font-black text-slate-800">{activeItem.company || 'Cromgen Rozgar recruiter network'}</p>
                  </div>
                </motion.article>
              </AnimatePresence>

              <div className="flex flex-col justify-between rounded-[7px] bg-slate-50 p-4">
                <div className="grid gap-3">
                  {visibleTestimonials.slice(0, 5).map((item, index) => (
                    <button
                      className={`rounded-[7px] p-4 text-left transition ${activeTestimonial === index ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50'}`}
                      key={item._id || item.name}
                      onClick={() => setActiveTestimonial(index)}
                      type="button"
                    >
                      <p className="font-black">{item.name}</p>
                      <p className={`mt-1 text-xs font-semibold ${activeTestimonial === index ? 'text-blue-100' : 'text-slate-500'}`}>{item.company || item.role || 'Recruiter feedback'}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <button className="grid h-11 w-11 place-items-center rounded-[7px] bg-white text-slate-700 ring-1 ring-slate-200" onClick={() => setActiveTestimonial((activeTestimonial + visibleTestimonials.length - 1) % visibleTestimonials.length)} type="button"><ArrowLeft size={18} /></button>
                  <div className="flex gap-2">
                    {visibleTestimonials.map((item, index) => <button className={`h-2.5 rounded-[7px] transition-all ${activeTestimonial === index ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300'}`} key={item._id || item.name} onClick={() => setActiveTestimonial(index)} type="button" />)}
                  </div>
                  <button className="grid h-11 w-11 place-items-center rounded-[7px] bg-white text-slate-700 ring-1 ring-slate-200" onClick={() => setActiveTestimonial((activeTestimonial + 1) % visibleTestimonials.length)} type="button"><ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-teal-500" size={38} />
            <h3 className="mt-4 text-xl font-black text-slate-950">No recruiter testimonials published yet</h3>
            <p className="mt-2 text-sm text-slate-500">When admin adds Recruiter or Company testimonials in MongoDB, they will appear automatically in this professional carousel.</p>
          </div>
        )}
      </div>
    </section>
  )
}
function TestimonialMetric({ label, value }) {
  return (
    <div className="rounded-[7px] bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

function getRecruiterSlideAction(slide, user) {
  const isLoggedIn = Boolean(user?.email)
  const isRecruiterAccount = user?.role === 'recruiter'

  if (isRecruiterAccount) {
    if (slide.primary === 'Register Recruiter' || slide.primary === 'Start Hiring') {
      return { label: 'Open Recruiter Dashboard', to: '/recruiter-dashboard' }
    }
    return { label: slide.primary, to: slide.to }
  }

  if (isLoggedIn && slide.primary === 'Register Recruiter') {
    return { label: 'Go To Account', to: '/candidate-dashboard' }
  }

  return { label: slide.primary, to: slide.to }
}

function getRecruiterInitials(value) {
  return String(value || 'R')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function EmployerCTA({ isLoggedIn, isRecruiterAccount }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[7px] bg-gradient-to-r from-[#0057B8] via-[#0057B8] to-[#FF8A00] p-8 text-white shadow-xl shadow-[#0057B8]/20 sm:p-10">
          <h2 className="text-3xl font-black sm:text-4xl">Start Hiring Smarter Today</h2>
          <p className="mt-3 max-w-2xl text-blue-50">Post jobs, connect with skilled professionals, and grow your team faster.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isLoggedIn && <Button className="bg-white !text-black ring-0 hover:bg-blue-50" to="/recruiter-register" variant="secondary">Register Recruiter</Button>}
            {isRecruiterAccount && <Button className="bg-white !text-black ring-0 hover:bg-blue-50" to="/recruiter-dashboard" variant="secondary">Recruiter Dashboard</Button>}
            <Button className="border border-white/55 !bg-white/10 !text-white shadow-none ring-0 backdrop-blur-md hover:!bg-white/20" to="/post-job" variant="secondary">Post Your First Job</Button>
          </div>
        </div>
      </div>
    </section>
  )
}





