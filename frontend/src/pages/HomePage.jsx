import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, ClipboardCheck, FileText, SearchCheck, Send, ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { FAQSection } from '../components/FAQSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { HeroBanner } from '../components/HeroBanner'
import { JobCard } from '../components/JobCard'
import { Section } from '../components/Section'
import { TestimonialSlider } from '../components/TestimonialSlider'
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
  const latestJobs = useMemo(() => getLatestPremiumJobs(liveJobs).slice(0, 6), [liveJobs])

  return (
    <>
      <HeroBanner />

      <Section eyebrow="Categories" title="Featured Job Categories" subtitle="Explore high-growth roles across full-time, hybrid, remote, freelance, and AI operations hiring.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                className="group rounded-[1.5rem] border border-slate-200 bg-white/90 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.02 }}
                key={category.name}
              >
                <Link className="block h-full p-5" to={`/categories/${slugifyCategory(category.name)}`}>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${category.color}`}><Icon size={22} /></div>
                  <h3 className="mt-4 font-bold text-slate-950 group-hover:text-blue-700">{category.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{categoryCounts[category.name] || 0} open roles</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </Section>

      <Section className="bg-white" eyebrow="Companies" title="Top Hiring Companies" subtitle="Verified recruiter profiles with active openings and transparent role information.">
        <CompanyGrid liveJobs={liveJobs} />
      </Section>

      <Section eyebrow="Latest" title="Latest Premium Job Openings" subtitle="Curated roles with salary, deadline, work mode, skills, and recruiter context.">
        <LatestJobsGrid jobs={latestJobs} onApply={onApply} />
      </Section>

      <Section className="bg-white" eyebrow="Process" title="How It Works">
        <ProcessGrid isCandidate={isCandidate} isRecruiter={isRecruiter} jobsCount={liveJobs.length} user={user} />
      </Section>

      {!isCandidate && <FeatureShowcase />}

      <TestimonialSlider />

      <FAQSection />
    </>
  )
}

function LatestJobsGrid({ jobs: latestJobs, onApply }) {
  if (!latestJobs.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
        <SearchCheck className="mx-auto text-blue-500" size={34} />
        <h3 className="mt-4 text-2xl font-black text-slate-950">No premium openings yet</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-500">
          Recruiter jab approved active jobs post karega, latest openings yaha automatically show honge.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {latestJobs.map((job) => <JobCard featured job={job} key={job._id || job.id} onApply={onApply} />)}
    </div>
  )
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
          <div className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-100" key={step.title}>
            <div className="flex items-start justify-between gap-4">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${step.tone}`}>
                <Icon size={21} />
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">Step {index + 1}</span>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950 group-hover:text-blue-700">{step.title}</h3>
            <p className="mt-3 min-h-16 text-sm leading-6 text-slate-500">{step.text}</p>
            <div className="mt-5 rounded-2xl bg-white p-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
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

export function CompanyGrid({ liveJobs = [] }) {
  const [liveCompanies, setLiveCompanies] = useState([])

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

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {list.length ? list.map((company) => (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={company.name}>
          <div className="flex items-start justify-between gap-4">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${company.accent} text-lg font-black text-white shadow-lg shadow-blue-100`}>{company.badge}</div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{company.rating} rating</span>
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-950">{company.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{company.industry} · {company.location || 'Location not added'}</p>
          <p className="mt-4 text-sm font-bold text-blue-600">{company.openJobs} open jobs</p>
          <Button className="mt-5 w-full" to={`/companies/${slugifyCompany(company.name)}`} variant="secondary">View Company</Button>
        </div>
      )) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
          No active hiring companies yet. Approved jobs will automatically create company profiles here.
        </div>
      )}
    </div>
  )
}
