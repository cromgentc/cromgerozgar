import { motion } from 'framer-motion'
import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  FileUp,
  LayoutDashboard,
  ListChecks,
  Rocket,
  SearchCheck,
  Star,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { Button } from './Button'
import candidateImage from '../assets/candidate-career-hub.png'
import employerImage from '../assets/employer-hiring-suite.png'

const showcases = [
  {
    title: 'Candidate Career Hub',
    subtitle: 'Build your professional profile, apply for jobs, track applications, and grow your career with trusted companies.',
    cta: 'Explore Careers',
    to: '/candidate-dashboard',
    image: candidateImage,
    imageAlt: 'Candidate career dashboard illustration',
    accent: 'from-blue-500 via-sky-400 to-violet-500',
    glow: 'bg-blue-300/30',
    stat: '86%',
    statLabel: 'Profile complete',
    features: [
      [FileUp, 'Resume Upload'],
      [SearchCheck, 'Job Recommendations'],
      [ListChecks, 'Application Tracking'],
      [Star, 'Saved Jobs'],
      [Bell, 'Career Alerts'],
      [LayoutDashboard, 'Profile Dashboard'],
    ],
  },
  {
    title: 'Recruiter Hiring Suite',
    subtitle: 'Manage hiring workflows, post jobs, review applications, and recruit top talent efficiently.',
    cta: 'Start Hiring',
    to: '/recruiter-dashboard',
    image: employerImage,
    imageAlt: 'Recruiter hiring dashboard illustration',
    accent: 'from-teal-500 via-blue-500 to-violet-500',
    glow: 'bg-teal-300/30',
    stat: '42',
    statLabel: 'Active openings',
    features: [
      [BriefcaseBusiness, 'Post Jobs'],
      [ListChecks, 'Manage Applications'],
      [UserCheck, 'Candidate Shortlisting'],
      [ChartNoAxesCombined, 'Hiring Analytics'],
      [LayoutDashboard, 'Company Dashboard'],
      [UsersRound, 'Recruitment Pipeline'],
    ],
  },
]

export function FeatureShowcase() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-20">
      <div className="absolute left-0 top-12 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-10 max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Built for both sides of hiring</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Premium career and hiring workspaces
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Two focused product experiences designed for candidates and recruiters with clean workflows, modern dashboards, and trusted enterprise UI.
          </p>
        </motion.div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {showcases.map((item, index) => (
            <ShowcaseCard item={item} index={index} key={item.title} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseCard({ item, index }) {
  return (
    <motion.article
      className="group relative h-full rounded-[2rem] bg-gradient-to-br p-px shadow-xl shadow-blue-100/60 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${item.accent} opacity-50`} />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 backdrop-blur-xl sm:p-6">
        <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full ${item.glow} blur-3xl transition group-hover:scale-110`} />
        <div className="relative grid flex-1 gap-6 xl:grid-cols-[1fr_0.95fr] xl:items-center">
          <div className="flex min-w-0 flex-col">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              <Rocket size={14} /> Enterprise workspace
            </span>
            <h3 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{item.subtitle}</p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {item.features.map(([Icon, label]) => (
                <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-3 py-2 text-sm font-bold text-slate-600 shadow-sm" key={label}>
                  <Icon className="shrink-0 text-blue-600" size={17} />
                  <span className="min-w-0">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button className="w-full sm:w-auto" to={item.to}>{item.cta}</Button>
              <div className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-center text-sm font-bold text-teal-700 sm:flex-none">
                <CheckCircle2 size={18} /> Verified premium workflow
              </div>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className={`absolute inset-6 rounded-[2rem] ${item.glow} blur-2xl`} />
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-lg shadow-blue-100/60 sm:min-h-[320px]">
              <img className="max-h-[320px] w-full object-contain transition duration-500 group-hover:scale-[1.03]" src={item.image} alt={item.imageAlt} />
              <motion.div
                animate={{ y: [0, -7, 0] }}
                className="absolute bottom-4 left-4 rounded-2xl border border-white bg-white/90 p-3 shadow-xl shadow-blue-100 backdrop-blur"
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-xl font-black text-slate-950">{item.stat}</p>
                <p className="text-xs font-bold text-slate-500">{item.statLabel}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
