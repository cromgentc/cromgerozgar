import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, ClipboardCheck, Download, FileText, SearchCheck, Send, ShieldCheck, Smartphone, Star } from 'lucide-react'
import { Button } from '../components/Button'
import { FAQSection } from '../components/FAQSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { HeroBanner } from '../components/HeroBanner'
import { JobCard } from '../components/JobCard'
import { Section } from '../components/Section'
import { categories } from '../data/portalData'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { getJobsForCategory, slugifyCategory } from '../utils/categoryMatching'
import { buildCompanyProfiles, slugifyCompany } from '../utils/companyProfiles'
import { getCandidateProfileCompletion } from '../utils/candidateActivity'

export function HomePage({ onApply }) {
  const user = getStoredUser()
  const isCandidate = user?.role === 'Candidate'
  const isRecruiter = user?.role === 'recruiter'
  const [liveJobs, setLiveJobs] = useState([])

  useEffect(() => {
    let active = true

    api.jobs('?sort=-createdAt&limit=100')
      .then((payload) => {
        if (active) setLiveJobs(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setLiveJobs([])
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

      <AppDownloadPromo />

      <MobileHomeJobs jobs={latestJobs} onApply={onApply} />

      <Section className="bg-white md:hidden" title="Trusted companies hiring on CromGen Rozgar" subtitle="Verified recruiters with active openings.">
        <CompanyGrid compactMobile liveJobs={liveJobs} />
      </Section>

      <div className="md:hidden">
        <CareerLanes compactMobile categoryCounts={categoryCounts} />
      </div>

      <div className="hidden md:block">
        <CareerFocusBand />

        <Section className="bg-white" title="Trusted companies hiring on CromGen Rozgar" subtitle="Verified recruiter profiles with active openings and transparent role information.">
          <CompanyGrid liveJobs={liveJobs} />
        </Section>

        <SponsoredCompaniesShowcase liveJobs={liveJobs} />

        <Section className="bg-white" title="How It Works">
          <ProcessGrid isCandidate={isCandidate} isRecruiter={isRecruiter} jobsCount={liveJobs.length} user={user} />
        </Section>

        <CareerLanes categoryCounts={categoryCounts} />

        {!isCandidate && <FeatureShowcase />}

        <TrustedByCandidates />

        <FAQSection />
      </div>
    </>
  )
}

function AppDownloadPromo() {
  return (
    <section className="bg-white px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[20px] border border-blue-100 bg-[#F5F4FF] shadow-sm sm:rounded-[24px] lg:grid-cols-[0.9fr_0.55fr_1.35fr] lg:items-center">
        <div className="p-5 sm:p-8">
          <h2 className="max-w-xs text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
            10M+ users are on the CromGen app
          </h2>
          <p className="mt-3 text-sm font-semibold text-slate-600">Get real-time job updates & more!</p>

          <form className="mt-6 flex min-h-12 max-w-sm items-center overflow-hidden rounded-full border border-[#1F5BFF] bg-white shadow-sm" onSubmit={(event) => event.preventDefault()}>
            <span className="border-r border-slate-200 px-4 text-sm font-bold text-slate-950">+91</span>
            <input className="min-w-0 flex-1 px-3 text-sm font-semibold outline-none" inputMode="tel" aria-label="Mobile number" />
            <button className="mr-1 inline-flex min-h-10 items-center rounded-full bg-[#1F5BFF] px-5 text-sm font-black text-white" type="submit">
              Get link
            </button>
          </form>

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
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.list('testimonials', '?status=Active&sort=-featured,-createdAt&limit=6')
      .then((payload) => {
        if (!active) return
        const testimonials = Array.isArray(payload.data) ? payload.data : []
        setItems(testimonials.filter((item) => {
          if (!item.name || !item.text) return false
          if (item.frontendPlacement) return item.frontendPlacement === 'Users Frontend'
          return !['Recruiter', 'Company'].includes(item.type)
        }))
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Trusted By Candidates</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-500">
          Candidate feedback, success stories, and platform experiences shared by professionals using CromGen Rozgar.
        </p>
        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div className="h-44 animate-pulse rounded-[7px] bg-slate-100" key={item} />)}
          </div>
        ) : items.length ? (
          <div className="mt-8 grid gap-5 text-left md:grid-cols-3">
            {items.map((item) => (
              <article className="rounded-[7px] border border-slate-200 bg-slate-50 p-6 shadow-sm" key={item._id || item.name}>
                <div className="mb-4 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: Math.max(1, Math.min(5, Number(item.rating || 5))) }).map((_, index) => (
                    <Star fill="currentColor" key={index} size={17} />
                  ))}
                </div>
                <p className="text-sm font-semibold leading-7 text-slate-600">"{item.text}"</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="font-black text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm font-bold text-blue-600">{[item.role, item.company].filter(Boolean).join(' / ') || 'Candidate'}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            When admin adds candidate testimonials, they will appear here automatically.
          </p>
        )}
      </div>
    </section>
  )
}

function CareerFocusBand() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[7px] border border-[#0057B8]/10 bg-[#0057B8] p-7 text-white shadow-xl shadow-[#0057B8]/15 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[7px] bg-white/15"><Smartphone size={22} /></span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">Career workspace</p>
                <h2 className="mt-1 text-3xl font-black">One place for jobs, profiles, saves, and applications</h2>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-blue-50">
                  Build your candidate profile once, then use it to apply faster, track status, and stay ready for recruiter shortlisting.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Profile-led matching', 'Saved jobs', 'Application tracking'].map((item) => (
                <span className="rounded-[7px] bg-white/14 px-4 py-2 text-sm font-black text-white" key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Verified Recruiters', 'Connect with companies using structured hiring workflows.'],
              ['Flexible Work Modes', 'Find remote, hybrid, full-time, contract, and freelance jobs.'],
            ].map(([title, text]) => (
              <div className="rounded-[7px] border border-slate-200 bg-white p-6 shadow-sm" key={title}>
                <Download className="text-[#0057B8]" size={24} />
                <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SponsoredCompaniesShowcase({ liveJobs = [] }) {
  const [liveCompanies, setLiveCompanies] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  useEffect(() => {
    let active = true

    api.companies('?sort=-createdAt&limit=100')
      .then((payload) => {
        if (active) setLiveCompanies(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setLiveCompanies([])
      })

    return () => {
      active = false
    }
  }, [])

  const companies = useMemo(() => {
    const profiles = buildCompanyProfiles(liveJobs, liveCompanies)
    const source = profiles.length ? profiles : sponsoredCompanyFallback
    return source.slice(0, 8).map((company, index) => ({
      ...company,
      rating: company.rating || sponsoredCompanyFallback[index % sponsoredCompanyFallback.length].rating,
      reviews: company.reviews || sponsoredCompanyFallback[index % sponsoredCompanyFallback.length].reviews,
      tags: company.tags?.length ? company.tags : getCompanyTags(company, index),
    }))
  }, [liveCompanies, liveJobs])

  const visibleFilters = ['All', 'IT Services', 'Technology', 'Healthcare & Life Sciences', 'Manufacturing & Production', 'BFSI', 'BPM']
  const extraFilters = ['Customer Success', 'Finance']
  const filters = showMoreFilters ? [...visibleFilters, ...extraFilters] : visibleFilters
  const filteredCompanies = useMemo(
    () => companies.filter((company) => companyMatchesSponsoredFilter(company, activeFilter)),
    [activeFilter, companies],
  )

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Sponsored companies</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Fresh opportunities for ambitious professionals with verified recruiters, reviews, and active hiring context.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <button
              className={`sponsored-company-filter rounded-full border px-4 py-2 text-xs font-semibold transition ${
                activeFilter === filter
                  ? 'border-slate-950 bg-slate-50 text-slate-950'
                  : 'border-blue-200 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700'
              }`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              type="button"
            >
              {filter}
            </button>
          ))}
          <button
            className="sponsored-company-filter rounded-full px-4 py-2 text-xs font-black text-slate-700 hover:text-blue-700"
            onClick={() => setShowMoreFilters((value) => !value)}
            type="button"
          >
            {showMoreFilters ? 'Show less' : '+2 more'}
          </button>
        </div>

        <div className="relative mt-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCompanies.map((company, index) => (
              <Link
                className="sponsored-company-card group min-h-[213px] rounded-[18px] border border-slate-200 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200"
                key={`${company.name}-${index}`}
                to={`/companies/${slugifyCompany(company.name)}`}
              >
                <CompanyLogo company={company} index={index} />
                <h3 className="mt-4 truncate text-base font-black text-slate-950 group-hover:text-blue-700">{company.name}</h3>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 font-black text-slate-700">
                    <Star className="text-amber-400" fill="currentColor" size={14} />
                    {company.rating || '4.0'}
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span>{company.reviews || `${Math.max(4, Number(company.openJobs || 1) * 26)} reviews`}</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {company.tags.slice(0, 3).map((tag) => (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600" key={tag}>{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
            {!filteredCompanies.length && (
              <div className="rounded-[18px] border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500 sm:col-span-2 lg:col-span-4">
                No sponsored companies found for {activeFilter}.
              </div>
            )}
          </div>

          <button
            aria-label="Next sponsored companies"
            className="sponsored-company-arrow absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-200 transition hover:border-blue-200 hover:text-blue-700 lg:grid"
            type="button"
          >
            <ChevronRight size={21} />
          </button>
        </div>

        <div className="mt-9 flex justify-center">
          <Link className="sponsored-company-link rounded-full border border-blue-600 px-6 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-600 hover:text-white" to="/companies">
            View all companies
          </Link>
        </div>
      </div>
    </section>
  )
}

function CompanyLogo({ company, index }) {
  const colors = ['bg-red-50 text-red-700', 'bg-amber-50 text-amber-700', 'bg-emerald-50 text-emerald-700', 'bg-blue-50 text-blue-700', 'bg-violet-50 text-violet-700', 'bg-slate-950 text-white']
  const initials = String(company.badge || company.name || 'CO').slice(0, 3).toUpperCase()

  if (company.logoUrl || company.logo) {
    return (
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-[8px] border border-slate-200 bg-white p-2">
        <img className="h-full w-full object-contain" src={company.logoUrl || company.logo} alt={company.name} />
      </span>
    )
  }

  return (
    <span className={`mx-auto grid h-12 w-12 place-items-center rounded-[8px] border border-slate-200 text-sm font-black ${colors[index % colors.length]}`}>
      {initials}
    </span>
  )
}

const sponsoredCompanyFallback = [
  { name: 'KPI Partners', rating: '3.7', reviews: '181 reviews', tags: ['Product', 'Corporate', 'Emerging Technologies'], badge: 'KPI' },
  { name: 'ORA Group', rating: '3.9', reviews: '11 reviews', tags: ['Real Estate', 'Engineering & Construction'], badge: 'ORA' },
  { name: 'AGS Health', rating: '4.0', reviews: '3.4K+ reviews', tags: ['Software Product', 'Analytics / KPO / Research', 'B2B'], badge: 'AGS' },
  { name: 'Lenovo', rating: '4.0', reviews: '776 reviews', tags: ['Consumer Electronics & Appliances', 'Product', 'Foreign MNC'], badge: 'LEN' },
  { name: 'Foundever', rating: '3.4', reviews: '2.6K+ reviews', tags: ['BPO/KPO', 'BPO / Call Centre', 'BPM / BPO'], badge: 'FND' },
  { name: 'Okta', rating: '2.3', reviews: '28 reviews', tags: ['Hardware & Networking', 'Software Product'], badge: 'OKT' },
  { name: 'NTT DATA, Inc.', rating: '3.9', reviews: '3.5K+ reviews', tags: ['IT Services & Consulting', 'Foreign MNC', 'Private'], badge: 'NTT' },
  { name: 'Alithya', rating: '4.7', reviews: '4 reviews', tags: ['IT Services & Consulting'], badge: 'ALI' },
]

function getCompanyTags(company, index) {
  const industry = company.industry || sponsoredCompanyFallback[index % sponsoredCompanyFallback.length].tags[0]
  const type = company.openJobs ? `${company.openJobs} open jobs` : 'Verified recruiter'
  return [industry, type, 'Hiring now']
}

function companyMatchesSponsoredFilter(company, filter) {
  if (filter === 'All') return true

  const searchable = [
    company.name,
    company.industry,
    company.location,
    ...(company.tags || []),
    ...(company.jobs || []).flatMap((job) => [job.title, job.department, job.category, job.industry, job.description, ...(job.skills || [])]),
  ].join(' ').toLowerCase()

  const aliases = {
    'IT Services': ['it services', 'it ', 'software', 'cloud', 'consulting', 'hardware', 'networking', 'saas'],
    Technology: ['technology', 'software', 'product', 'cloud', 'hardware', 'electronics', 'analytics', 'engineering'],
    'Healthcare & Life Sciences': ['health', 'healthcare', 'medical', 'life sciences', 'pharma', 'hospital'],
    'Manufacturing & Production': ['manufacturing', 'production', 'factory', 'engineering', 'construction', 'industrial'],
    BFSI: ['bfsi', 'bank', 'banking', 'finance', 'financial', 'fintech', 'insurance'],
    BPM: ['bpm', 'bpo', 'kpo', 'call centre', 'call center', 'customer success', 'support'],
    'Customer Success': ['customer success', 'support', 'crm', 'retention'],
    Finance: ['finance', 'financial', 'fintech', 'banking', 'insurance', 'bfsi'],
  }

  return (aliases[filter] || [filter.toLowerCase()]).some((term) => searchable.includes(term))
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
      <div className="grid gap-5 lg:grid-cols-2">
        {latestJobs.map((job) => <JobCard featured job={job} key={job._id || job.id} onApply={onApply} />)}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button to="/jobs" variant="primary">More Jobs</Button>
        </div>
      )}
    </>
  )
}

function CareerLanes({ compactMobile = false, categoryCounts }) {
  const [showAllMobileCategories, setShowAllMobileCategories] = useState(false)
  const featured = categories.slice(0, 3)
  const remaining = categories.slice(3)
  const mobileCategories = showAllMobileCategories ? categories : categories.slice(0, 4)

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

        {compactMobile ? (
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
              <button
                className="mt-3 min-h-10 w-full rounded-[7px] border border-blue-200 bg-white px-4 py-2 text-xs font-black text-[#0057B8] shadow-sm transition hover:border-[#0057B8] hover:bg-blue-50"
                onClick={() => setShowAllMobileCategories((value) => !value)}
                type="button"
              >
                {showAllMobileCategories ? 'Show Less' : `More ${categories.length - 4}`}
              </button>
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
          </>
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
      <Link className={`${compactMobile ? 'min-h-32 p-3' : featured ? 'min-h-44 p-6' : 'min-h-32 p-5'} block h-full`} to={`/categories/${slugifyCategory(category.name)}`}>
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

export function CompanyGrid({ compactMobile = false, liveJobs = [] }) {
  const [liveCompanies, setLiveCompanies] = useState([])
  const [showAllMobileCompanies, setShowAllMobileCompanies] = useState(false)

  useEffect(() => {
    let active = true

    api.companies('?sort=-createdAt&limit=100')
      .then((payload) => {
        if (active) setLiveCompanies(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (active) setLiveCompanies([])
      })

    return () => {
      active = false
    }
  }, [])

  const list = useMemo(() => buildCompanyProfiles(liveJobs, liveCompanies).slice(0, 6), [liveCompanies, liveJobs])
  const visibleList = compactMobile && !showAllMobileCompanies ? list.slice(0, 4) : list

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
          <Button className="mt-5 w-full" to={`/companies/${slugifyCompany(company.name)}`} variant="secondary">View Company</Button>
        </div>
      )) : (
        <div className="rounded-[7px] border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
          No active hiring companies yet. Approved jobs will automatically create company profiles here.
        </div>
      )}
      {compactMobile && list.length > 4 && (
        <button
          className="col-span-2 min-h-10 rounded-[7px] border border-blue-200 bg-white px-4 py-2 text-xs font-black text-[#0057B8] shadow-sm transition hover:border-[#0057B8] hover:bg-blue-50"
          onClick={() => setShowAllMobileCompanies((value) => !value)}
          type="button"
        >
          {showAllMobileCompanies ? 'Show Less' : `More ${list.length - 4}`}
        </button>
      )}
    </div>
  )
}
