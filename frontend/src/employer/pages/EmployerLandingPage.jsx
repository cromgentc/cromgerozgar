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
  X,
} from 'lucide-react'
import { Button } from '../../components/Button'
import { FeatureShowcase } from '../../components/FeatureShowcase'
import { api } from '../../services/api'
import { getStoredUser } from '../../routes/authRouting'
import heroImage from '../../assets/enterprise-hiring-banner.png'
import femaleRecruiterImage from '../../assets/recruiter-female-single.png'

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
  const [videoTestimonials, setVideoTestimonials] = useState([])

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
        setVideoTestimonials(Array.isArray(data.videoTestimonials) ? data.videoTestimonials : [])
      })
      .catch(() => {
        if (!mounted) return
        setRecruiters([])
        setJobs([])
        setDocuments([])
        setVideoTestimonials([])
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
      <section className="relative overflow-hidden border-b border-[#b7ecf4] bg-[#e8fbff]">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,#7bd3e8_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_0.62fr_0.68fr] lg:px-8 lg:py-0">
          <div className="py-2 lg:py-4">
            <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-[#17466f] lg:text-[28px]">
              Recruit Right Candidate For Right Job
            </h1>
            <div className="mt-3 grid gap-1.5 text-sm font-medium text-slate-900">
              {[
                'Register and Post Jobs for Free Now!',
                'Over 2.5 Millions Verified Resume Database',
                'Unlimited Job Post & Hire Applicants Faster',
                'Search Professional CVs at Your Fingertips',
              ].map((item) => (
                <p className="flex items-center gap-3" key={item}>
                  <CheckCircle2 className="shrink-0 fill-[#1bc600] text-white" size={17} />
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button className="border border-[#ff8a00] bg-white !text-black shadow-none hover:bg-[#fff4e6] focus:ring-orange-100" to="/post-job">
                Post Jobs for Free
              </Button>
              <Button
                className="border border-[#ff8a00] bg-white !text-black shadow-none hover:bg-[#fff4e6] focus:ring-orange-100"
                to="/recruiter-find-resume"
                variant="secondary"
              >
                Search Resume
              </Button>
            </div>
          </div>

          <div className="relative hidden h-[410px] overflow-hidden lg:block">
            <img
              alt="Female recruiter using laptop"
              className="absolute bottom-0 left-1/2 h-[430px] w-[430px] max-w-none -translate-x-[46%] object-cover object-left-bottom drop-shadow-[0_18px_28px_rgba(23,70,111,0.18)]"
              src={femaleRecruiterImage}
              style={{
                WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
                maskImage: 'linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)',
              }}
            />
          </div>

          <div className="rounded-[7px] border border-slate-200 bg-white p-2.5 shadow-xl shadow-cyan-900/10 lg:my-3">
            <h2 className="border-b border-slate-200 pb-1.5 text-center text-sm font-black text-[#17466f]">Get a Call Back</h2>
            <div className="mt-2.5 grid gap-2">
              <input className="rounded-[5px] border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#4b74d7]" placeholder="Name" />
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
                <span>Hiring For :</span>
                <label className="inline-flex items-center gap-2"><input name="hiringFor" type="radio" /> Your Company</label>
                <label className="inline-flex items-center gap-2"><input name="hiringFor" type="radio" /> Your Consultancy</label>
              </div>
              <input className="rounded-[5px] border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#4b74d7]" placeholder="Company Name" />
              <input className="rounded-[5px] border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#4b74d7]" placeholder="Email ID" />
              <div className="grid grid-cols-[92px_1fr]">
                <select className="rounded-l-[5px] border border-r-0 border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#4b74d7]">
                  <option>IN (+91)</option>
                </select>
                <input className="rounded-r-[5px] border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#4b74d7]" placeholder="Mobile Number" />
              </div>
              <input className="rounded-[5px] border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#4b74d7]" placeholder="Your Location" />
              <button className="rounded-[5px] bg-[#ff8a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#e87900] focus:outline-none focus:ring-4 focus:ring-orange-100" type="button">
                Get a Call Back
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="hidden">
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

      <FeatureShowcase />

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

      <EmployerTestimonials testimonials={videoTestimonials} />
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

function EmployerTestimonials({ testimonials = [] }) {
  const [activeVideo, setActiveVideo] = useState(null)
  const videoTestimonials = testimonials.filter((item) => item.companyName).slice(0, 3)
  const visibleVideos = videoTestimonials.length ? videoTestimonials : [
    {
      companyName: 'K9HR Solutions',
      location: '150 Feet Ring Road, Rajkot, India',
      logoText: 'K9HR',
      tone: 'blue',
    },
    {
      companyName: 'Jobsahihai Manpower Solution',
      location: 'Sector 73, Noida, India',
      logoText: 'JS',
      tone: 'stone',
    },
  ]

  return (
    <section className="bg-gradient-to-b from-[#dff4f5] to-[#fff5ee] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center sm:relative">
          <h2 className="text-center text-2xl font-semibold text-[#1f3d68] sm:text-[28px]">
            Why Companies Choose Us
          </h2>
          <div className="absolute right-4 hidden items-center gap-3 sm:flex lg:right-8">
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white/60 text-slate-500 transition hover:border-[#ff8a00] hover:text-[#ff8a00]" type="button" aria-label="Previous video testimonial">
              <ArrowLeft size={16} />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-500 bg-white text-slate-700 transition hover:border-[#ff8a00] hover:text-[#ff8a00]" type="button" aria-label="Next video testimonial">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className={`grid gap-5 ${visibleVideos.length === 2 ? 'md:grid-cols-2 md:px-28' : 'md:grid-cols-3'}`}>
          {visibleVideos.map((item, index) => (
            <article className="overflow-hidden rounded-[6px] bg-white shadow-md shadow-slate-300/60" key={item._id || item.companyName}>
              <button className={`relative block h-[300px] w-full overflow-hidden bg-gradient-to-br ${getVideoToneClass(item.tone)} md:h-[300px]`} onClick={() => setActiveVideo(item)} type="button">
                {item.thumbnailUrl ? (
                  <img className="h-full w-full object-cover" src={item.thumbnailUrl} alt={`${item.companyName} video testimonial`} />
                ) : (
                  <>
                    <div className="absolute inset-x-0 top-0 mx-auto h-full w-[56%] bg-white/10" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.38),transparent_30%)]" />
                  </>
                )}
                <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff0033] text-white">
                    <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
                  </span>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-[4px] bg-white/90 px-5 py-3 text-center shadow-sm">
                  <p className="text-3xl font-black tracking-tight text-[#1d7fbf]">{item.logoText || getRecruiterInitials(item.companyName)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Solutions</p>
                </div>
                {index === 1 && <div className="absolute inset-y-0 left-0 w-28 bg-black/45" />}
              </button>
              <div className="bg-white px-4 py-4 text-center">
                <h3 className="text-lg font-normal text-[#333]">{item.companyName}</h3>
                <p className="mt-2 text-sm font-normal text-[#e33113]">{item.location}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            className="min-h-11 border border-blue-600 bg-white px-8 !text-blue-600 shadow-none hover:bg-blue-50"
            to="/recruiter-testimonials"
            variant="secondary"
          >
            View All Video Testimonials
          </Button>
        </div>
      </div>
      {activeVideo && <VideoTestimonialModal item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  )
}

function getVideoToneClass(tone = 'blue') {
  const tones = {
    amber: 'from-zinc-900 via-amber-950 to-zinc-800',
    blue: 'from-slate-900 via-slate-700 to-slate-950',
    slate: 'from-slate-950 via-slate-800 to-blue-950',
    stone: 'from-stone-950 via-stone-700 to-stone-900',
  }
  return tones[tone] || tones.blue
}

function VideoTestimonialModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <button className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 hover:text-[#ff8a00]" onClick={onClose} type="button" aria-label="Close video testimonial">
          <X size={20} />
        </button>
        <div className="aspect-video bg-slate-950">
          {item.videoUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              src={normalizeVideoEmbedUrl(item.videoUrl)}
              title={`${item.companyName} video testimonial`}
            />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-white">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ff0033]">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                </div>
                <h3 className="mt-5 text-2xl font-black">{item.companyName}</h3>
                <p className="mt-2 text-sm text-slate-300">Video URL backend mein add karte hi yahan play hoga.</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 text-center">
          <h3 className="text-xl font-semibold text-slate-900">{item.companyName}</h3>
          <p className="mt-1 text-sm text-[#e33113]">{item.location}</p>
        </div>
      </div>
    </div>
  )
}

function normalizeVideoEmbedUrl(url = '') {
  if (url.includes('youtube.com/embed/')) return url
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&?/]+)/)
  if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  return url
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





