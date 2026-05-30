import { useRef } from 'react'
import {
  Banknote,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Database,
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

const trustedBrands = ['OYO', 'paytm', 'Nestle', 'HCL', 'bookmyshow', 'NYKAA']
const popularCategories = [
  ['Banking', Landmark],
  ['Work From Home', Home],
  ['HR', UsersRound],
  ['Sales', BriefcaseBusiness],
  ['Accounting', PercentSquare],
  ['Customer Support', Headphones],
  ['Event Management', CalendarCheck],
  ['IT', Globe2],
  ['SQL', Database],
  ['Oracle', Banknote],
  ['Graphic Design', Palette],
  ['Digital Marketing', Megaphone],
]
const trendingSkills = ['Accounting Jobs', 'Analytics Jobs', 'Animation Jobs', 'Architecture Jobs', 'Banking Jobs', 'BPO Jobs', 'Data Science Jobs', 'Java Jobs', 'Marketing Jobs']
const trendingJobs = ['Business Analyst Jobs', 'Digital Marketing Head Jobs', 'Engineering Manager Jobs', 'HR Head Jobs', 'Marketing Head Jobs', 'Marketing Manager Jobs']

export function HeroBanner() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="bg-[#004f9f] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-0 px-4 pb-0 pt-0 sm:px-6 sm:pt-0 lg:grid-cols-[0.82fr_1.18fr] lg:gap-0 lg:px-8 lg:pt-0">
          <div className="relative z-10 lg:-translate-y-8">
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-[46px]">
              India&apos;s <span className="text-[#ff8a00]">#1 platform</span>
            </h1>
            <p className="mt-3 inline-block border-b-4 border-[#3e9b28] pb-1 text-lg font-black text-slate-100 sm:text-xl">
              For fresher jobs, internships and courses
            </p>
            <p className="mt-6 max-w-lg text-base font-semibold leading-7 text-slate-200">
              Discover verified opportunities, trusted hiring teams, and role-ready career tools in one premium workspace.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ['Verified', 'Jobs only'],
                ['Fast', 'Apply flow'],
                ['Trusted', 'Recruiters'],
              ].map(([title, text]) => (
                <div className="rounded-[7px] border border-white/16 bg-white/10 p-4 shadow-lg shadow-blue-950/10" key={title}>
                  <p className="text-lg font-black text-white">{title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-100">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[300px] items-end self-end overflow-visible sm:min-h-[405px]">
            <div className="absolute inset-x-8 bottom-10 top-8 rounded-full bg-[#ff8a00]/10 blur-3xl" />
            <div className="absolute bottom-8 right-12 h-40 w-40 rounded-full bg-[#3e9b28]/14 blur-2xl" />
            <img
              alt="Professional woman and man holding laptop and resume"
              className="relative z-30 mx-auto h-[290px] w-full object-contain object-bottom sm:h-[395px]"
              src={professionalPair}
            />
          </div>
        </div>

        <div className="bg-[#003d7c]">
          <div className="mx-auto flex max-w-7xl items-center gap-10 overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
            <div className="shrink-0 border-l-4 border-[#ff8a00] pl-5">
              <p className="text-3xl font-black">10K+</p>
              <p className="text-sm font-black">Openings daily</p>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex w-max items-center gap-16 [animation:marquee_18s_linear_infinite]">
                {[...trustedBrands, ...trustedBrands].map((brand, index) => (
                  <span className="whitespace-nowrap text-3xl font-black tracking-tight text-white/50" key={`${brand}-${index}`}>
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-9 lg:px-8">
        <h2 className="text-lg font-black text-black sm:text-xl">Popular Categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {popularCategories.map(([label, Icon], index) => (
            <a
              className={`group h-12 items-center gap-2 rounded-[7px] border border-[#e5e7eb] bg-white px-2 text-xs font-semibold text-black transition hover:border-[#f1c7b6] hover:shadow-sm sm:flex sm:gap-3 sm:px-2.5 sm:text-sm ${index > 5 ? 'hidden' : 'flex'}`}
              href={`/jobs?category=${encodeURIComponent(label)}`}
              key={label}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] bg-[#fdebe3] text-[#8a4a2f] transition group-hover:bg-[#f9ded2] sm:h-10 sm:w-10">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
        <div className="mt-4 sm:hidden">
          <a
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[7px] border border-[#ff8a00] bg-white px-4 text-sm font-black text-[#ff8a00] shadow-sm transition active:scale-[0.99]"
            href="/industries"
          >
            More Categories
          </a>
        </div>

        <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-8">
          <TrendingChipRow title="Trending skills" items={trendingSkills} />
          <TrendingChipRow title="Trending Jobs in India" items={trendingJobs} />
        </div>
      </section>
    </section>
  )
}

function TrendingChipRow({ title, items }) {
  const scrollerRef = useRef(null)
  const scrollChips = (direction) => {
    scrollerRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    })
  }

  return (
    <div className="overflow-hidden rounded-[13px] bg-[#fafafa] shadow-[0_10px_28px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 sm:flex sm:items-center">
      <div className="flex w-full shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-black text-black sm:w-[156px] sm:border-b-0 sm:border-r sm:px-6 sm:py-5 sm:text-base">
        <span>{title}</span>
        <div className="flex items-center gap-2 sm:hidden">
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[#ff8a00] bg-white text-[#ff8a00] shadow-sm transition active:scale-95"
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollChips(-1)}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[#ff8a00] bg-white text-[#ff8a00] shadow-sm transition active:scale-95"
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollChips(1)}
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <button
        className="-ml-3 hidden h-8 w-8 shrink-0 place-items-center rounded-full border border-[#ff8a00] bg-white text-[#ff8a00] shadow-sm transition hover:bg-[#ff8a00] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/25 sm:grid"
        type="button"
        aria-label={`Previous ${title}`}
        onClick={() => scrollChips(-1)}
      >
        <ChevronLeft size={18} strokeWidth={2.4} />
      </button>
      <div ref={scrollerRef} className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 py-3 sm:gap-3 sm:px-3 sm:py-4">
        {items.map((item) => (
          <a className="shrink-0 rounded-full border border-[#d6d9df] bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-[#aeb4bf] hover:text-black sm:px-4" href={`/jobs?search=${encodeURIComponent(item)}`} key={item}>
            {item}
          </a>
        ))}
      </div>
      <button
        className="mr-3 hidden h-8 w-8 shrink-0 place-items-center rounded-full border border-[#ff8a00] bg-white text-[#ff8a00] shadow-sm transition hover:bg-[#ff8a00] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8a00]/25 sm:grid"
        type="button"
        aria-label={`Next ${title}`}
        onClick={() => scrollChips(1)}
      >
        <ChevronRight size={18} strokeWidth={2.4} />
      </button>
    </div>
  )
}
