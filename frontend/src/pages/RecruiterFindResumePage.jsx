import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, Download, FileText, Mail, Search, Sparkles, UsersRound } from 'lucide-react'
import { Button } from '../components/Button'
import { jobs } from '../data/portalData'
import { api } from '../services/api'
import { DashboardShell, Panel } from './CandidateDashboard'

const fallbackResumes = [
  { name: 'Neha Sharma', email: 'neha@example.com', phone: '9000000001', role: 'React Developer', skills: ['React', 'Tailwind', 'API', 'TypeScript'], experience: '4 years', location: 'Bengaluru', resumeUrl: '', source: 'Lead Resume', status: 'Active' },
  { name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9000000002', role: 'Marketing Manager', skills: ['SEO', 'Google Ads', 'Analytics', 'Meta Ads'], experience: '6 years', location: 'Mumbai', resumeUrl: '', source: 'Lead Resume', status: 'Shortlisted' },
  { name: 'Simran Kaur', email: 'simran@example.com', phone: '9000000003', role: 'Customer Success Specialist', skills: ['CRM', 'Communication', 'Retention', 'SLA'], experience: '3 years', location: 'Delhi NCR', resumeUrl: '', source: 'Lead Resume', status: 'Active' },
  { name: 'Aditya Rao', email: 'aditya@example.com', phone: '9000000004', role: 'Data Collection Lead', skills: ['Excel', 'Quality Audit', 'Research', 'Reporting'], experience: '5 years', location: 'Hyderabad', resumeUrl: '', source: 'Admin Upload', status: 'Active' },
]

export function RecruiterFindResumePage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [resumes, setResumes] = useState(fallbackResumes)

  useEffect(() => {
    let ignore = false

    Promise.all([api.list('resumes'), api.list('candidates')])
      .then(([resumePayload, candidatePayload]) => {
        if (ignore) return

        const uploaded = Array.isArray(resumePayload.data) ? resumePayload.data : []
        const leads = Array.isArray(candidatePayload.data)
          ? candidatePayload.data.map((candidate) => ({ ...candidate, source: 'Lead Resume' }))
          : []
        const next = [...uploaded, ...leads]

        if (next.length) setResumes(next)
      })
      .catch(() => {
        if (!ignore) setResumes(fallbackResumes)
      })

    return () => {
      ignore = true
    }
  }, [])

  const matchingJobs = useMemo(() => {
    const search = normalize(query)
    if (!search) return jobs

    return jobs.filter((job) => normalize([job.title, job.company, job.department, job.location, ...(job.skills || [])].join(' ')).includes(search))
  }, [query])

  const rankedResumes = useMemo(() => rankResumes(resumes, matchingJobs, query), [matchingJobs, query, resumes])
  const searchedResumes = useMemo(() => {
    if (!normalize(query)) return rankedResumes
    return rankedResumes.filter((resume) => resume.score > 0 || resume.queryMatch)
  }, [query, rankedResumes])
  const visibleResumes = useMemo(() => {
    if (activeFilter === 'best') return searchedResumes.filter((resume) => resume.score >= 2)
    if (activeFilter === 'lead') return searchedResumes.filter((resume) => resume.source === 'Lead Resume')
    if (activeFilter === 'jobs') return searchedResumes.filter((resume) => resume.score > 0)
    return searchedResumes
  }, [activeFilter, searchedResumes])

  const bestMatches = searchedResumes.filter((resume) => resume.score >= 2)
  const leadResumes = searchedResumes.filter((resume) => resume.source === 'Lead Resume')

  return (
    <DashboardShell title="Find Resume" subtitle="Search by job title, company, location, or skills and review matching resumes for that role.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <FilterMetric active={activeFilter === 'all'} icon={FileText} label="Available Resumes" onClick={() => setActiveFilter('all')} value={String(searchedResumes.length)} />
        <FilterMetric active={activeFilter === 'jobs'} icon={BriefcaseBusiness} label="Matched Jobs" onClick={() => setActiveFilter('jobs')} value={String(matchingJobs.length)} />
        <FilterMetric active={activeFilter === 'best'} icon={Sparkles} label="Best Matches" onClick={() => setActiveFilter('best')} value={String(bestMatches.length)} />
        <FilterMetric active={activeFilter === 'lead'} icon={UsersRound} label="Lead Resumes" onClick={() => setActiveFilter('lead')} value={String(leadResumes.length)} />
      </div>

      <div className="mt-6 grid gap-6">
        <Panel title="Resume Results">
          <label className="mb-5 flex items-center gap-3 rounded-[7px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Search className="text-blue-600" size={18} />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveFilter('all')
                }}
                placeholder="Search job, skill, company..."
                value={query}
              />
            </label>
          <div className="grid gap-3">
            {visibleResumes.length ? visibleResumes.map((resume) => (
              <div className="grid gap-4 rounded-[7px] bg-slate-50 p-4 xl:grid-cols-[1fr_auto] xl:items-center" key={`${resume.email}-${resume.name}`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-slate-950">{resume.name}</p>
                    <span className="rounded-[7px] bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{resume.matchLabel}</span>
                    <span className="rounded-[7px] bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{resume.source || 'Resume'}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{resume.role || 'Candidate'} - {resume.experience || 'Experience not added'}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Mail size={15} /> {resume.email || 'Email not added'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {normalizeSkills(resume.skills).map((skill) => (
                      <span className="rounded-[7px] bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200" key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button variant="secondary">View Resume</Button>
                  <Button>
                    <Download size={17} />
                    Download
                  </Button>
                </div>
              </div>
            )) : (
              <p className="rounded-[7px] bg-slate-50 p-5 text-sm font-semibold text-slate-500">No resumes found for this search.</p>
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}

function FilterMetric({ active, icon: Icon, label, onClick, value }) {
  return (
    <button
      className={`rounded-[7px] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 ${
        active ? 'border-blue-200 bg-blue-50 shadow-blue-100' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="text-blue-600" size={24} />
      <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </button>
  )
}

function rankResumes(items, matchedJobs, query) {
  const jobTerms = matchedJobs
    .flatMap((job) => [job.title, job.department, job.company, job.location, ...(job.skills || [])])
    .map(normalize)
    .filter(Boolean)
  const queryTerm = normalize(query)

  return items
    .map((resume) => {
      const resumeText = normalize([resume.name, resume.role, resume.location, resume.experience, ...normalizeSkills(resume.skills)].join(' '))
      const queryMatch = Boolean(queryTerm && resumeText.includes(queryTerm))
      const score = jobTerms.reduce((total, term) => total + (resumeText.includes(term) ? 1 : 0), 0) + (queryMatch ? 2 : 0)

      return {
        ...resume,
        score,
        queryMatch,
        matchLabel: score >= 3 ? 'Strong match' : score >= 1 ? 'Good match' : 'Related profile',
      }
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}

function normalize(value = '') {
  return String(value).toLowerCase().trim()
}

function normalizeSkills(skills = []) {
  if (Array.isArray(skills)) return skills.filter(Boolean)
  return String(skills)
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
}
