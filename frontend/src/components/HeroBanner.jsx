import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, Layers3, MapPin, Search } from 'lucide-react'
import { Button } from './Button'
import { SearchBar } from './SearchBar'
import { stats } from '../data/portalData'
import { getStoredUser } from '../routes/authRouting'

const heroSlides = [
  {
    badge: 'Verified career marketplace',
    title: 'Find work that moves your career forward',
    text: 'Explore verified jobs, trusted recruiters, flexible work modes, and profile-led hiring across India with CromGen Rozgar.',
    primaryMetric: '94%',
    primaryLabel: 'Candidate Match',
    secondaryMetric: '+28%',
    secondaryLabel: 'Hiring Growth',
  },
  {
    badge: 'Candidate career hub',
    title: 'Build your profile and track every application',
    text: 'Create a strong candidate profile, save matching roles, apply faster, and follow recruiter updates from one simple workspace.',
    primaryMetric: '5k+',
    primaryLabel: 'Active Candidates',
    secondaryMetric: '1k+',
    secondaryLabel: 'Hiring Teams',
  },
]

export function HeroBanner() {
  const user = getStoredUser()
  const isUserAccount = ['Candidate', 'users'].includes(user?.role)
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = heroSlides[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#F7FBFF_0%,#FFFFFF_48%,#F5F8FF_100%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-6 px-2 py-5 sm:min-h-[calc(100svh-76px)] sm:gap-12 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(450px,1.08fr)] lg:px-8 xl:gap-16">
        <motion.div
          key={slide.title}
          className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:text-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="rounded-[7px] border border-[#0057B8]/15 bg-gradient-to-br from-[#0057B8] via-[#0B6ED0] to-[#3E9B28] p-4 text-left text-white shadow-xl shadow-blue-100 sm:hidden">
            <span className="inline-flex items-center gap-2 rounded-[7px] bg-white/14 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide">
              <BadgeCheck size={14} /> Verified career marketplace
            </span>
            <h1 className="mt-3 text-2xl font-black leading-8 tracking-tight">
              Find work that moves your career forward
            </h1>
            <p className="mt-2 text-xs font-semibold leading-5 text-blue-50">
              Explore verified jobs, trusted recruiters, flexible work modes, and profile-led hiring across India with CromGen Rozgar.
            </p>
          </div>

          <div className="hidden sm:block">
            <span className="inline-flex max-w-full items-center gap-2 rounded-[7px] border border-[#0057B8]/15 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#0057B8] shadow-sm sm:px-4 sm:text-sm">
              <BadgeCheck size={17} /> {slide.badge}
            </span>

            <h1 className="mt-4 max-w-3xl text-balance text-2xl font-black tracking-tight text-slate-950 sm:mt-6 sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7 lg:mx-0">
              {slide.text}
            </p>
          </div>

          <div className="mt-5 max-w-3xl sm:mt-7">
            <SearchBar />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-black text-slate-600 sm:mt-5 lg:justify-start">
            {['Remote', 'Fresher', 'IT & Software', 'Sales', 'Work from home'].map((item) => (
              <a className="rounded-[7px] bg-[#0057B8]/7 px-3 py-2 text-[#0057B8] transition hover:bg-[#0057B8]/12" href={`/jobs?q=${encodeURIComponent(item)}`} key={item}>
                {item}
              </a>
            ))}
          </div>

          <div className="mt-5 hidden gap-3 sm:mt-6 sm:grid sm:grid-cols-2 lg:flex">
            <Button className="w-full lg:w-auto" to="/jobs">
              Find Jobs <ArrowRight size={18} />
            </Button>
            {!isUserAccount && (
              <Button className="hidden w-full sm:inline-flex lg:w-auto" to="/post-job" variant="secondary">
                Post a Job
              </Button>
            )}
          </div>

          <div className="mt-7 hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                className="rounded-[7px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0057B8]/10"
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

          <div className="mt-6 hidden justify-center gap-2 sm:flex lg:justify-start">
            {heroSlides.map((item, index) => (
              <button
                aria-label={`Show ${item.badge}`}
                className={`h-2.5 rounded-[7px] transition-all ${index === activeSlide ? 'w-9 bg-[#0057B8]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                key={item.badge}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </motion.div>

        <motion.div className="relative mx-auto hidden w-full max-w-2xl md:block lg:max-w-none" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.08 }}>
          <MarketplaceVisual slide={slide} />
        </motion.div>
      </div>
    </section>
  )
}

function MarketplaceVisual({ slide }) {
  const rows = [
    ['React Frontend Developer', 'Remote / INR 35k fixed', '92%'],
    ['Product Designer', 'Hybrid / Contract', '89%'],
    ['SEO Content Specialist', 'Remote / Ongoing', '86%'],
  ]

  return (
    <div className="relative">
      <div className="absolute -right-4 top-10 hidden w-40 rounded-[7px] border border-[#3E9B28]/20 bg-white p-4 shadow-xl shadow-slate-200 md:block">
        <p className="text-xs font-black uppercase tracking-wide text-[#3E9B28]">Verified</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{slide.primaryMetric}</p>
        <p className="text-xs font-bold text-slate-500">{slide.primaryLabel}</p>
      </div>
      <div className="absolute -left-4 bottom-12 hidden w-44 rounded-[7px] border border-[#FF8A00]/20 bg-white p-4 shadow-xl shadow-slate-200 md:block">
        <p className="text-xs font-black uppercase tracking-wide text-[#FF8A00]">Growth</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{slide.secondaryMetric}</p>
        <p className="text-xs font-bold text-slate-500">{slide.secondaryLabel}</p>
      </div>

      <div className="overflow-hidden rounded-[7px] border border-[#0057B8]/10 bg-white shadow-2xl shadow-[#0057B8]/14">
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FBFF] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0057B8]">Live marketplace board</p>
            <p className="mt-1 text-sm font-bold text-slate-500">Jobs, freelancers, and recruiter signals</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-white"><Layers3 size={20} /></span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[14rem_1fr]">
          <aside className="border-b border-slate-100 bg-white p-4 lg:border-b-0 lg:border-r">
            {['Recommended Jobs', 'Freelancers', 'Applications', 'Interviews'].map((item, index) => (
              <div className={`mb-2 rounded-[7px] px-3 py-3 text-sm font-black ${index === 0 ? 'bg-[#0057B8] text-white' : 'bg-slate-50 text-slate-600'}`} key={item}>{item}</div>
            ))}
            <div className="mt-4 rounded-[7px] bg-[#3E9B28]/10 p-3">
              <p className="text-xs font-black uppercase text-[#3E9B28]">Profile strength</p>
              <div className="mt-3 h-2 rounded-[7px] bg-white">
                <div className="h-full w-[82%] rounded-[7px] bg-[#3E9B28]" />
              </div>
            </div>
          </aside>

          <div className="p-5">
            <div className="grid gap-3 rounded-[7px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                <div className="flex min-h-11 items-center gap-3 rounded-[7px] bg-slate-50 px-3">
                  <Search className="text-[#0057B8]" size={17} />
                  <span className="text-sm font-bold text-slate-500">Search React, UI, Sales...</span>
                </div>
                <div className="flex min-h-11 items-center gap-3 rounded-[7px] bg-slate-50 px-3">
                  <MapPin className="text-[#0057B8]" size={17} />
                  <span className="text-sm font-bold text-slate-500">India</span>
                </div>
              </div>
              {rows.map(([title, meta, match]) => (
                <div className="grid gap-3 rounded-[7px] bg-[#F8FBFF] p-3 sm:grid-cols-[1fr_auto] sm:items-center" key={title}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-white text-[#0057B8] shadow-sm"><BriefcaseBusiness size={18} /></span>
                    <span>
                      <span className="block text-sm font-black text-slate-950">{title}</span>
                      <span className="text-xs font-bold text-slate-500">{meta}</span>
                    </span>
                  </div>
                  <span className="rounded-[7px] bg-[#3E9B28]/10 px-3 py-1 text-xs font-black text-[#3E9B28]">{match} match</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['10k+', 'Jobs'],
                ['5k+', 'Talent'],
                ['500+', 'Recruiters'],
              ].map(([value, label]) => (
                <div className="rounded-[7px] border border-slate-200 bg-white p-3 text-center" key={label}>
                  <p className="text-xl font-black text-[#0057B8]">{value}</p>
                  <p className="mt-1 text-[11px] font-black uppercase text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
