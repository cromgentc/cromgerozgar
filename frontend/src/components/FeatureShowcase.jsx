import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  FileUp,
  LayoutDashboard,
  ListChecks,
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
    accent: 'blue',
    stat: '86%',
    statLabel: 'Profile Completeness',
    trend: '12% this week',
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
    to: '/recruiter/recruiter-dashboard',
    image: employerImage,
    imageAlt: 'Recruiter hiring dashboard illustration',
    accent: 'green',
    stat: '42',
    statLabel: 'Active Openings',
    trend: '8% this week',
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
    <section className="relative overflow-hidden bg-[#f8fbff] py-8 sm:py-10">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-6 max-w-4xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/70 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-600">
            <Star size={15} /> Premium Hiring Experience
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#070d24] sm:text-3xl lg:text-4xl">
            Premium career and hiring workspaces
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Two focused product experiences designed for candidates and recruiters with clean workflows, modern dashboards, and trusted enterprise UI.
          </p>
        </motion.div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          {showcases.map((item, index) => (
            <ShowcaseCard item={item} index={index} key={item.title} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseCard({ item, index }) {
  const tone = getShowcaseTone(item.accent)

  return (
    <motion.article
      className={`group relative h-full overflow-hidden rounded-[8px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl ${tone.border} ${tone.shadow}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className={`absolute inset-0 ${tone.bg}`} />
      <div className="absolute right-8 top-8 grid grid-cols-6 gap-2 opacity-25">
        {Array.from({ length: 30 }).map((_, dotIndex) => <span className={`h-1 w-1 rounded-full ${tone.dot}`} key={dotIndex} />)}
      </div>
      <div className="relative grid min-h-[340px] gap-4 p-4 sm:p-5 xl:grid-cols-[0.92fr_0.74fr] xl:items-center">
        <div className="flex min-w-0 flex-col">
          <span className={`grid h-10 w-10 place-items-center rounded-[7px] text-white shadow-lg ${tone.iconBg} ${tone.iconShadow}`}>
            {index === 0 ? <BriefcaseBusiness size={18} /> : <UsersRound size={19} />}
          </span>
          <h3 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[#070d24] sm:text-[28px]">{item.title}</h3>
          <span className={`mt-3 block h-1 w-8 rounded-full ${tone.line}`} />
          <p className="mt-3 max-w-xs text-xs font-semibold leading-5 text-slate-600 sm:text-sm">{item.subtitle}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {item.features.map(([Icon, label]) => (
                <div className="flex min-h-10 min-w-0 items-center gap-2 rounded-[7px] border border-slate-200 bg-white/80 px-2.5 py-2 text-[11px] font-black leading-4 text-[#070d24] shadow-sm" key={label}>
                  <Icon className={`shrink-0 ${tone.text}`} size={15} />
                  <span className="min-w-0 whitespace-normal break-words">{label}</span>
                </div>
              ))}
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <Button className={`w-full min-h-10 px-4 text-xs font-black text-white shadow-lg sm:w-max ${tone.button} ${tone.iconShadow}`} to={item.to}>
              {item.cta} <ArrowRight size={15} />
            </Button>
            <div className={`inline-flex items-center gap-2 text-[11px] font-black leading-4 ${tone.text}`}>
              <CheckCircle2 size={14} /> Verified premium workflow
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px] min-w-0 overflow-visible">
          <div className={`absolute inset-6 rounded-full ${tone.glow} blur-2xl`} />
          <div className="relative ml-auto flex min-h-[200px] max-w-[280px] items-center justify-center overflow-hidden rounded-[8px] border border-slate-200 bg-white/80 p-2.5 shadow-xl shadow-slate-200/70 backdrop-blur">
            <img className="max-h-[188px] w-full object-contain transition duration-500 group-hover:scale-[1.03]" src={item.image} alt={item.imageAlt} />
          </div>
          <motion.div
            animate={{ y: [0, -7, 0] }}
            className={`absolute bottom-0 ${index === 0 ? 'left-4' : 'right-3'} min-w-[138px] rounded-[8px] border border-white bg-white/95 p-3 shadow-xl shadow-slate-200/80 backdrop-blur`}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-2.5">
              <span className={`grid h-10 w-10 place-items-center rounded-full border-[6px] ${tone.statRing}`}>
                <span className="h-4 w-4 rounded-full bg-white" />
              </span>
              <div>
                <p className="text-xl font-black text-[#070d24]">{item.stat}</p>
                <p className="mt-0.5 text-[10px] font-semibold leading-3 text-slate-600">{item.statLabel}</p>
              </div>
            </div>
            <p className={`mt-2 text-[10px] font-black ${tone.text}`}>↑ {item.trend}</p>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}

function getShowcaseTone(accent = 'blue') {
  if (accent === 'green') {
    return {
      bg: 'bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_34%),linear-gradient(135deg,#ffffff_0%,#effcf5_100%)]',
      border: 'border-emerald-200',
      button: 'bg-[#16a34a] hover:bg-[#12823d]',
      dot: 'bg-emerald-300',
      glow: 'bg-emerald-200/50',
      iconBg: 'bg-[#16a34a]',
      iconShadow: 'shadow-emerald-100',
      line: 'bg-[#16a34a]',
      shadow: 'hover:shadow-emerald-100',
      statRing: 'border-emerald-100 text-emerald-500',
      text: 'text-[#16a34a]',
    }
  }

  return {
    bg: 'bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.12),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f5f8ff_100%)]',
    border: 'border-blue-200',
    button: 'bg-[#2563eb] hover:bg-[#1d4ed8]',
    dot: 'bg-blue-300',
    glow: 'bg-blue-200/50',
    iconBg: 'bg-[#2563eb]',
    iconShadow: 'shadow-blue-100',
    line: 'bg-[#2563eb]',
    shadow: 'hover:shadow-blue-100',
    statRing: 'border-blue-100 text-blue-500',
    text: 'text-[#2563eb]',
  }
}
