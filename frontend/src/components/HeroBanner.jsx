import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { Button } from './Button'
import { SearchBar } from './SearchBar'
import { jobs, stats } from '../data/portalData'
import { getStoredUser } from '../routes/authRouting'
import heroIllustration from '../assets/enterprise-hiring-banner.png'

export function HeroBanner() {
  const user = getStoredUser()
  const isUserAccount = ['Candidate', 'users'].includes(user?.role)

  return (
    <section className="relative isolate overflow-hidden bg-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,#E0F2FE_0,transparent_34%),radial-gradient(circle_at_88%_18%,#F3E8FF_0,transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]" />
      <div className="absolute left-1/2 top-20 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(380px,0.97fr)] lg:px-8 lg:py-16 xl:gap-14">
        <motion.div
          className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:text-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur sm:text-sm">
            <BadgeCheck size={17} /> Enterprise recruitment platform
          </span>

          <h1 className="mt-6 text-balance text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl xl:text-6xl">
            Find Your Dream Job With Trusted Companies
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
            Search thousands of jobs, connect with top recruiters, and grow your career faster with a premium hiring platform built for modern teams.
          </p>

          <div className="mt-7">
            <SearchBar />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:flex">
            <Button className="w-full lg:w-auto" to="/jobs">
              Find Jobs <ArrowRight size={18} />
            </Button>
            {!isUserAccount && (
              <Button className="w-full lg:w-auto" to="/post-job" variant="secondary">
                Post a Job
              </Button>
            )}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                className="rounded-3xl border border-white bg-white/75 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.05 }}
                key={stat.label}
              >
                <p className="text-xl font-black text-slate-950 sm:text-2xl">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          <div className="relative rounded-[2rem] border border-white bg-white/65 p-3 shadow-2xl shadow-blue-100 backdrop-blur-xl sm:p-4">
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-white to-blue-50">
              <img
                alt="Enterprise job portal dashboard preview"
                className="aspect-[16/11] h-auto w-full object-contain p-2 sm:p-3"
                src={heroIllustration}
              />
            </div>

            <FloatingCard className="left-3 top-3 sm:left-5 sm:top-5" icon={Users} title="Candidate Match" value="94%" tone="blue" />
            <FloatingCard className="bottom-3 right-3 sm:bottom-5 sm:right-5" icon={TrendingUp} title="Hiring Growth" value="+28%" tone="teal" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-lg shadow-blue-100/60 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">{jobs[0].title}</p>
                  <p className="text-xs font-semibold text-slate-500">{jobs[0].company} · {jobs[0].workMode}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 shadow-lg shadow-blue-100/60 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">Recruiter Pipeline</p>
                  <p className="text-xs font-semibold text-slate-500">128 reviewed applications</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FloatingCard({ className, icon: Icon, title, value, tone }) {
  const toneClass = tone === 'teal' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      className={`absolute hidden max-w-[180px] rounded-2xl border border-white bg-white/90 p-3 shadow-xl shadow-blue-100 backdrop-blur md:block ${className}`}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-lg font-black text-slate-950">{value}</p>
          <p className="text-xs font-bold text-slate-500">{title}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-bold text-teal-700">
        <CheckCircle2 size={14} /> Verified signal
      </p>
    </motion.div>
  )
}
