import { useEffect, useState } from 'react'
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
import { companies, testimonials } from '../../data/portalData'
import heroImage from '../../assets/enterprise-hiring-banner.png'

const slides = [
  {
    title: 'Hire Top Talent Faster',
    subtitle: 'Explore recruiter workflows, applications, and hiring tools in one workspace.',
    primary: 'Post a Job',
    secondary: 'Explore Solutions',
    to: '/post-job',
  },
  {
    title: 'Manage Recruitment In One Place',
    subtitle: 'Track recruiter hiring activity, shortlist candidates, and collaborate with your hiring team effortlessly.',
    primary: 'Start Hiring',
    secondary: 'View Dashboard',
    to: '/recruiter-dashboard',
  },
  {
    title: 'Build Your Dream Team',
    subtitle: 'Showcase your hiring brand, access skilled professionals, and manage talent from across industries.',
    primary: 'Register Recruiter',
    secondary: 'Explore Candidates',
    to: '/recruiter-register',
  },
]

const features = [
  [Sparkles, 'AI Candidate Matching', 'Match skills, location, salary, and availability with hiring needs.'],
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
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 4500)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#E0F2FE_0,transparent_36%),radial-gradient(circle_at_90%_10%,#F3E8FF_0,transparent_34%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]">
        <div className="mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.45 }}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-blue-700 shadow-sm ring-1 ring-blue-100 backdrop-blur">
                  <Rocket size={17} /> Enterprise recruiter platform
                </span>
                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{slides[active].title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{slides[active].subtitle}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button to={slides[active].to}>{slides[active].primary}</Button>
                  <Button to="/recruiter#solutions" variant="secondary">{slides[active].secondary}</Button>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex items-center gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200" onClick={() => setActive((active + slides.length - 1) % slides.length)} type="button"><ArrowLeft size={18} /></button>
              <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200" onClick={() => setActive((active + 1) % slides.length)} type="button"><ArrowRight size={18} /></button>
              <div className="flex gap-2">
                {slides.map((slide, index) => <button className={`h-2.5 rounded-full transition-all ${active === index ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300'}`} key={slide.title} onClick={() => setActive(index)} type="button" />)}
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute inset-8 rounded-[2rem] bg-blue-200/40 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white bg-white/75 p-4 shadow-2xl shadow-blue-100 backdrop-blur-xl">
              <img className="aspect-[16/11] w-full object-contain" src={heroImage} alt="Recruiter dashboard preview" />
              <FloatingStat className="left-5 top-5" label="Candidate match" value="94%" />
              <FloatingStat className="bottom-5 right-5" label="Job performance" value="+32%" teal />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Trusted recruiter network</p>
          <div className="mt-6 flex animate-[marquee_18s_linear_infinite] gap-4 whitespace-nowrap">
            {[...companies, ...companies].map((company, index) => <span className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-600" key={`${company.name}-${index}`}>{company.badge} · {company.name}</span>)}
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
          {['10,000+ Recruiters', '1M+ Applications', '50K+ Hires', '95% Hiring Success'].map((stat) => (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={stat}>
              <p className="text-3xl font-black text-slate-950">{stat.split(' ')[0]}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">{stat.replace(stat.split(' ')[0], '')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Recruitment process" title="From recruiter profile to successful hire" />
          <div className="grid gap-5 lg:grid-cols-4">
            {processSteps.map(([Icon, title], index) => (
              <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm" key={title}>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><Icon size={22} /></div>
                <p className="mt-5 text-sm font-black text-blue-600">Step {index + 1}</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EmployerDashboardPreview />
      <EmployerTestimonials />
      <EmployerCTA />
    </>
  )
}

function FloatingStat({ className, label, value, teal = false }) {
  return (
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className={`absolute hidden rounded-2xl border border-white bg-white/90 p-3 shadow-xl shadow-blue-100 backdrop-blur md:block ${className}`}>
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
    <motion.article whileHover={{ y: -6 }} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white"><Icon size={22} /></div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
    </motion.article>
  )
}

function EmployerDashboardPreview() {
  const metrics = ['Total Jobs', 'Active Applications', 'Shortlisted Candidates', 'Interview Schedule', 'Hiring Analytics', 'Team Members']
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Dashboard preview" title="A complete hiring command center" />
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-5 shadow-xl shadow-blue-100">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric, index) => <div className="rounded-3xl bg-white p-5 shadow-sm" key={metric}><p className="text-2xl font-black text-slate-950">{index % 2 ? '248' : '42'}</p><p className="mt-1 text-sm font-bold text-slate-500">{metric}</p></div>)}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Candidate Table</h3>
              <div className="mt-4 grid gap-3">{['Neha Sharma · React Developer', 'Rohan Mehta · Growth Manager', 'Simran Kaur · Customer Success'].map((item) => <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600" key={item}>{item}</p>)}</div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Activity Feed</h3>
              <div className="mt-4 grid gap-3">{['12 new applications', '4 interviews scheduled', '2 offers pending'].map((item) => <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700" key={item}>{item}</p>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmployerTestimonials() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Recruiter testimonials" title="Recruiter reviews and success stories" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm" key={item.name}><CheckCircle2 className="text-teal-500" /><p className="mt-4 text-slate-600">{item.text}</p><p className="mt-5 font-black text-slate-950">{item.name}</p><p className="text-sm text-slate-500">{item.role}</p></div>)}
        </div>
      </div>
    </section>
  )
}

function EmployerCTA() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-teal-500 p-8 text-white shadow-xl shadow-blue-100 sm:p-10">
          <h2 className="text-3xl font-black sm:text-4xl">Start Hiring Smarter Today</h2>
          <p className="mt-3 max-w-2xl text-blue-50">Post jobs, connect with skilled professionals, and grow your team faster.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button to="/recruiter-register" variant="secondary">Register Recruiter</Button>
            <Button to="/post-job" variant="secondary">Post Your First Job</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
