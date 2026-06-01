import { useRef } from 'react'
import {
  Banknote,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  Flame,
  Globe2,
  Headphones,
  Home,
  Landmark,
  Megaphone,
  Palette,
  PercentSquare,
  UsersRound,
} from 'lucide-react'
import professionalPair from '../assets/hero-professional-pair.png'
import { defaultHeroBrands, useSiteBranding } from '../utils/siteBranding'

const popularCategories = [
  ['Banking', Landmark, '2,450+', 'blue'],
  ['Work From Home', Home, '3,120+', 'orange'],
  ['HR', UsersRound, '1,850+', 'purple'],
  ['Sales', BriefcaseBusiness, '2,980+', 'green'],
  ['Accounting', PercentSquare, '1,670+', 'pink'],
  ['Customer Support', Headphones, '1,560+', 'amber'],
  ['Event Management', CalendarCheck, '980+', 'purple'],
  ['IT', Globe2, '4,520+', 'green'],
  ['SQL', Database, '2,210+', 'orange'],
  ['Oracle', Banknote, '1,180+', 'pink'],
  ['Graphic Design', Palette, '1,430+', 'blue'],
  ['Digital Marketing', Megaphone, '2,760+', 'amber'],
]
const trendingSkills = [
  ['React.js', Globe2, 'blue'],
  ['Node.js', BriefcaseBusiness, 'green'],
  ['Python', Code2, 'amber'],
  ['SQL', Database, 'orange'],
  ['Digital Marketing', Megaphone, 'purple'],
  ['HR Management', UsersRound, 'pink'],
]
const trendingJobs = [
  ['Business Analyst', TrendingJobIcon, '8,500+ Jobs', 'purple'],
  ['Digital Marketing', Megaphone, '6,200+ Jobs', 'orange'],
  ['Software Developer', Code2, '15,600+ Jobs', 'green'],
  ['HR Manager', UsersRound, '4,800+ Jobs', 'pink'],
  ['Sales Manager', BriefcaseBusiness, '7,200+ Jobs', 'blue'],
]

export function HeroBanner() {
  const branding = useSiteBranding()
  const trustedBrands = Array.isArray(branding.heroBrandNames) && branding.heroBrandNames.length
    ? branding.heroBrandNames
    : defaultHeroBrands

  return (
    <section className="overflow-hidden bg-white">
      <div className="bg-[#004f9f] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-0 px-4 pb-0 pt-5 sm:px-6 sm:pt-0 lg:grid-cols-[0.82fr_1.18fr] lg:gap-0 lg:px-8 lg:pt-0">
          <div className="relative z-10 lg:-translate-y-8">
            <h1 className="max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-[46px]">
              India&apos;s <span className="text-[#ff8a00]">#1 platform</span>
            </h1>
            <p className="mt-2 inline-block border-b-4 border-[#3e9b28] pb-1 text-sm font-black text-slate-100 sm:mt-3 sm:text-xl">
              For fresher jobs, internships and courses
            </p>
            <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-slate-200 sm:mt-6 sm:text-base sm:leading-7">
              Discover verified opportunities, trusted hiring teams, and role-ready career tools in one premium workspace.
            </p>
            <div className="mt-5 grid max-w-xl grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
              {[
                ['Verified', 'Jobs only'],
                ['Fast', 'Apply flow'],
                ['Trusted', 'Recruiters'],
              ].map(([title, text]) => (
                <div className="rounded-[7px] border border-white/16 bg-white/10 p-2.5 shadow-lg shadow-blue-950/10 sm:p-4" key={title}>
                  <p className="text-sm font-black text-white sm:text-lg">{title}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-100 sm:text-xs">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[230px] items-end self-end overflow-visible sm:min-h-[405px]">
            <div className="absolute inset-x-8 bottom-10 top-8 rounded-full bg-[#ff8a00]/10 blur-3xl" />
            <div className="absolute bottom-8 right-12 h-40 w-40 rounded-full bg-[#3e9b28]/14 blur-2xl" />
            <img
              alt="Professional woman and man holding laptop and resume"
              className="relative z-30 mx-auto h-[230px] w-full object-contain object-bottom sm:h-[395px]"
              src={professionalPair}
            />
          </div>
        </div>

        <div className="bg-[#003d7c]">
          <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-hidden px-4 py-3 sm:gap-10 sm:px-6 sm:py-5 lg:px-8">
            <div className="shrink-0 border-l-4 border-[#ff8a00] pl-3 sm:pl-5">
              <p className="text-2xl font-black sm:text-3xl">10K+</p>
              <p className="text-xs font-black sm:text-sm">Openings daily</p>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex w-max items-center gap-10 [animation:marquee_18s_linear_infinite] sm:gap-16">
                {[...trustedBrands, ...trustedBrands].map((brand, index) => (
                  <span className="whitespace-nowrap text-xl font-black tracking-tight text-white/50 sm:text-3xl" key={`${brand}-${index}`}>
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ff8a00]">Explore Opportunities</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Popular Job Categories</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            Explore top job categories and find the right opportunities that match your skills and interests.
          </p>
          <span className="mx-auto mt-4 block h-1 w-14 rounded-full bg-[#ff8a00]" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
          {popularCategories.map(([label, Icon, count, tone]) => (
            <a
              className="group rounded-[8px] border border-slate-200 bg-[white] p-3 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-[#ff8a00]/35 hover:shadow-lg hover:shadow-slate-200/70 sm:p-4"
              href={`/jobs?q=${encodeURIComponent(label)}`}
              key={label}
              style={{ minHeight: '112px' }}
            >
              <span className={`grid h-10 w-10 place-items-center rounded-[10px] sm:h-11 sm:w-11 ${getCategoryTone(tone).soft}`}>
                <Icon size={20} strokeWidth={2.1} />
              </span>
              <h3 className="mt-3 text-sm font-black leading-5 text-slate-950 sm:text-base">{label}</h3>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className={`text-[11px] font-black sm:text-xs ${getCategoryTone(tone).text}`}>{count} Jobs</p>
                <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-[#ff8a00] shadow-sm transition group-hover:border-[#ff8a00] group-hover:bg-[#ff8a00] group-hover:text-white">
                  <ChevronRight size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 space-y-4 sm:mt-7">
          <TrendingChipRow accent="blue" icon={Flame} subtitle="Top in-demand skills right now" title="Trending Skills" items={trendingSkills} />
          <TrendingChipRow accent="orange" icon={RocketIcon} subtitle="Most hiring job roles across top companies" title="Trending Jobs in India" items={trendingJobs} withCounts />
        </div>

        <div className="mt-6 overflow-hidden rounded-[9px] border border-slate-200 bg-[white] text-slate-950 shadow-lg shadow-slate-200/60">
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
            <div className="hidden h-14 w-20 place-items-center rounded-[12px] bg-orange-50 text-[#ff8a00] sm:grid">
              <BriefcaseBusiness size={34} />
            </div>
            <div>
              <h3 className="text-lg font-black sm:text-xl">Ready to find your next opportunity?</h3>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
                Explore thousands of verified jobs from top companies and take the next step in your career.
              </p>
            </div>
            <a className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-black shadow-sm hover:bg-[#fff4e6]" href="/industries">
              Explore All Categories <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </section>
  )
}

function TrendingChipRow({ accent = 'blue', icon: Icon, items, subtitle, title, withCounts = false }) {
  const scrollerRef = useRef(null)
  const scrollChips = (direction) => {
    scrollerRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    })
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-[white] p-2.5 shadow-sm shadow-slate-200/50 sm:flex sm:items-center sm:gap-2">
      <div className="flex w-full shrink-0 items-center justify-between gap-3 px-1 py-1.5 text-sm font-black text-black sm:w-[245px] sm:px-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${getCategoryTone(accent === 'orange' ? 'orange' : 'blue').soft}`}>
            <Icon size={21} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black leading-5 text-slate-950 sm:text-base">{title}</span>
            <span className="mt-0.5 block text-xs font-semibold leading-4 text-slate-500">{subtitle}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[#ff8a00] bg-[white] text-[#ff8a00] shadow-sm transition active:scale-95"
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollChips(-1)}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[#ff8a00] bg-[white] text-[#ff8a00] shadow-sm transition active:scale-95"
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollChips(1)}
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <button
        className="hidden h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-[white] text-slate-400 shadow-sm transition hover:border-[#ff8a00] hover:text-[#ff8a00] sm:grid"
        type="button"
        aria-label={`Previous ${title}`}
        onClick={() => scrollChips(-1)}
      >
        <ChevronLeft size={18} strokeWidth={2.4} />
      </button>
      <div ref={scrollerRef} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1.5 sm:px-2">
        {items.map(([item, ItemIcon, count, tone]) => (
          <a className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[7px] bg-[white] px-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:text-[#ff8a00] hover:shadow-md" href={`/jobs?q=${encodeURIComponent(item)}`} key={item}>
            <span className={`grid h-7 w-7 place-items-center rounded-[7px] ${getCategoryTone(tone).soft}`}>
              <ItemIcon size={16} />
            </span>
            <span>
              <span className="block whitespace-nowrap">{item}</span>
              {withCounts && <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">{count}</span>}
            </span>
          </a>
        ))}
      </div>
      <button
        className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff8a00] text-white shadow-sm transition hover:bg-[#e87500] sm:grid"
        type="button"
        aria-label={`Next ${title}`}
        onClick={() => scrollChips(1)}
      >
        <ChevronRight size={18} strokeWidth={2.4} />
      </button>
    </div>
  )
}

function getCategoryTone(tone) {
  const tones = {
    blue: { soft: 'bg-blue-50 text-blue-600', text: 'text-blue-600' },
    orange: { soft: 'bg-orange-50 text-[#ff8a00]', text: 'text-[#ff8a00]' },
    purple: { soft: 'bg-violet-50 text-violet-600', text: 'text-violet-600' },
    green: { soft: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600' },
    pink: { soft: 'bg-pink-50 text-pink-600', text: 'text-pink-600' },
    amber: { soft: 'bg-amber-50 text-amber-600', text: 'text-amber-600' },
  }
  return tones[tone] || tones.blue
}

function TrendingJobIcon(props) {
  return <TrendingUpIconShape {...props} />
}

function RocketIcon(props) {
  return <Megaphone {...props} />
}

function TrendingUpIconShape({ size = 18 }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M4 17l5-5 4 4 7-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M15 8h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}
