import { useMemo, useState } from 'react'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserCheck,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { FreelancerCard } from '../components/FreelancerCard'
import { useApiResource } from '../hooks/useApiResource'
import { getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'
import { featuredFreelancers } from '../data/marketplaceData'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Jobs', icon: BriefcaseBusiness },
  { label: 'Applications', icon: UsersRound },
  { label: 'Freelancers', icon: UserCheck },
  { label: 'Messages', icon: MessageCircle },
  { label: 'Payments', icon: CreditCard },
  { label: 'Company', icon: Building2 },
  { label: 'Settings', icon: Settings },
]

const fallbackApplications = [
  { id: 1, name: 'Neha Sharma', role: 'React Developer', status: 'Shortlisted', skills: ['React', 'Tailwind', 'API'], experience: '5 years', rate: 'INR 900/hr' },
  { id: 2, name: 'Rohan Mehta', role: 'Product Designer', status: 'Review', skills: ['Figma', 'UX', 'Mobile'], experience: '6 years', rate: 'INR 1,200/hr' },
  { id: 3, name: 'Simran Kaur', role: 'SEO Specialist', status: 'Interview', skills: ['SEO', 'Blogs', 'Research'], experience: '4 years', rate: 'INR 700/hr' },
]

const fallbackJobs = [
  { _id: 'demo-1', title: 'Senior React Engineer', status: 'Active', applicationsCount: 42, location: 'Remote', type: 'Full Time', budget: 'INR 80k' },
  { _id: 'demo-2', title: 'Product UI Designer', status: 'Active', applicationsCount: 18, location: 'Bengaluru', type: 'Freelance', budget: 'INR 45k' },
  { _id: 'demo-3', title: 'SEO Content Specialist', status: 'Closed', applicationsCount: 31, location: 'Mumbai', type: 'Part Time', budget: 'INR 25k' },
]

const conversations = [
  { name: 'Neha Sharma', status: 'Online', message: 'I can start the React dashboard this week.' },
  { name: 'Rohan Mehta', status: 'Offline', message: 'Shared product redesign portfolio.' },
  { name: 'Simran Kaur', status: 'Online', message: 'SEO article samples are attached.' },
]

const invoices = [
  { id: 'INV-1024', project: 'React Website Revamp', amount: 'INR 35,000', status: 'Paid' },
  { id: 'INV-1025', project: 'Product Landing Design', amount: 'INR 22,000', status: 'Pending' },
  { id: 'INV-1026', project: 'SEO Content Sprint', amount: 'INR 12,000', status: 'Draft' },
]

const activity = [
  'Neha Sharma shortlisted for React Website Revamp',
  'New application received for Product Designer role',
  'Invoice INV-1024 marked as paid',
  'Job performance report updated',
]

export function EmployerDashboard() {
  const user = getStoredUser()
  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [freelancerQuery, setFreelancerQuery] = useState('')
  const { data } = useApiResource(() => api.employerDashboard(user?.email), { metrics: {}, jobs: [], applications: [], shortlistedApplications: [] }, [user?.email])

  const metrics = data.metrics || {}
  const jobs = Array.isArray(data.jobs) && data.jobs.length ? data.jobs : fallbackJobs
  const applications = Array.isArray(data.applications) && data.applications.length ? data.applications : fallbackApplications
  const shortlistedApplications = Array.isArray(data.shortlistedApplications) ? data.shortlistedApplications : []

  const freelancers = useMemo(() => {
    const term = freelancerQuery.toLowerCase().trim()
    if (!term) return featuredFreelancers
    return featuredFreelancers.filter((item) => [item.name, item.role, item.location, ...item.skills].join(' ').toLowerCase().includes(term))
  }, [freelancerQuery])

  const stats = [
    { label: 'Posted Jobs', value: metrics.totalJobs ?? jobs.length, icon: BriefcaseBusiness, trend: '+12%' },
    { label: 'Active Jobs', value: jobs.filter((job) => ['Open', 'Active'].includes(job.status || job.accountDepartmentStatus)).length, icon: FilePlus2, trend: '+8%' },
    { label: 'Applications', value: metrics.activeApplications ?? applications.length, icon: UsersRound, trend: '+24%' },
    { label: 'Shortlisted', value: metrics.shortlistedCandidates ?? shortlistedApplications.length, icon: Star, trend: '+16%' },
    { label: 'Hired Talent', value: 8, icon: ShieldCheck, trend: '+5%' },
    { label: 'Pending Review', value: applications.filter((item) => ['New', 'Review'].includes(item.status)).length, icon: CheckCircle2, trend: 'Today' },
  ]

  return (
    <div className="min-h-screen bg-[#EEF3FA] text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white xl:block">
        <RecruiterSidebar />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setSidebarOpen(false)} type="button" />
          <div className="relative h-full w-72 bg-white shadow-2xl">
            <RecruiterSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="xl:pl-72">
        <RecruiterTopbar onMenu={() => setSidebarOpen(true)} user={user} />
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
          <section className="rounded-[7px] border border-white bg-white p-5 shadow-sm shadow-slate-200/80 lg:p-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_420px] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-[7px] bg-[#0057B8]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0057B8]">
                  <ShieldCheck size={15} /> Recruiter Command Center
                </div>
                <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                  Control hiring, shortlisting, chat, and payments from one premium dashboard.
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-500">
                  Enterprise workspace for active jobs, candidate pipelines, freelancer discovery, interviews, milestones, invoices, and company profile management.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => setJobModalOpen(true)}><FilePlus2 size={18} /> Post New Job</Button>
                  <a className="job-card-details-link px-5" href="#freelancers"><Search size={17} /> Search Freelancers</a>
                </div>
              </div>
              <div className="rounded-[7px] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">Pipeline Health</p>
                    <p className="mt-3 text-5xl font-black">84%</p>
                  </div>
                  <div className="grid h-16 w-16 place-items-center rounded-[7px] bg-white/10">
                    <UsersRound size={30} />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[46, 72, 58, 92].map((height, index) => (
                    <span className="self-end rounded-[7px] bg-[#0057B8]" key={index} style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {stats.map((item) => <MetricCard key={item.label} {...item} />)}
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.25fr_0.75fr]">
            <Panel action={<Button onClick={() => setJobModalOpen(true)}>Post Job</Button>} title="Dashboard Overview">
              <div className="grid gap-4 lg:grid-cols-2">
                <RecentActivity />
                <QuickActions onPost={() => setJobModalOpen(true)} />
              </div>
            </Panel>
            <Panel title="Performance Snapshot">
              <div className="grid gap-3 sm:grid-cols-2">
                {['12.4k profile views', '428 applications', '34% shortlist rate', '18h avg response'].map((item) => (
                  <div className="rounded-[7px] border border-slate-200 bg-slate-50 p-4" key={item}>
                    <p className="text-lg font-black text-slate-950">{item.split(' ')[0]}</p>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">{item.replace(item.split(' ')[0], '').trim()}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
            <Panel title="Job Management">
              <JobManagement jobs={jobs} onPost={() => setJobModalOpen(true)} />
            </Panel>
            <Panel title="Candidate Management">
              <CandidateManagement applications={applications} />
            </Panel>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[0.95fr_1.05fr]" id="freelancers">
            <Panel title="Freelancer Search">
              <label className="mb-4 flex min-h-12 items-center gap-3 rounded-[7px] border border-slate-200 bg-slate-50 px-4">
                <Search className="text-[#0057B8]" size={18} />
                <input className="w-full bg-transparent text-sm font-semibold outline-none" onChange={(event) => setFreelancerQuery(event.target.value)} placeholder="Search skill, category, location, rating, hourly rate" value={freelancerQuery} />
              </label>
              <div className="grid gap-4">
                {freelancers.slice(0, 2).map((freelancer) => (
                  <FreelancerCard
                    freelancer={freelancer}
                    key={freelancer.id}
                    onHire={() => toast(`${freelancer.name} invited to job`)}
                    onShortlist={() => toast(`${freelancer.name} saved`)}
                  />
                ))}
              </div>
            </Panel>
            <Panel title="Messages / Chat">
              <ChatPreview />
            </Panel>
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[1fr_1fr]">
            <Panel title="Payments / Hiring">
              <PaymentsPanel />
            </Panel>
            <Panel title="Company Profile">
              <CompanyProfile user={user} totalJobs={metrics.totalJobs ?? jobs.length} />
            </Panel>
          </section>

          <section className="mt-5">
            <Panel title="Settings">
              <SettingsPanel />
            </Panel>
          </section>
        </div>
      </main>
      {jobModalOpen && <PostJobModal onClose={() => setJobModalOpen(false)} />}
    </div>
  )
}

function RecruiterSidebar({ onClose }) {
  return (
    <aside className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <Link className="flex items-center gap-3" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-sm font-black text-white">CR</span>
          <span>
            <span className="block text-base font-black text-slate-950">CromGen Rozgar</span>
            <span className="block text-xs font-bold text-slate-500">Recruiter Workspace</span>
          </span>
        </Link>
        {onClose && <button className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 xl:hidden" onClick={onClose} type="button"><X size={18} /></button>}
      </div>
      <nav className="mt-8 grid gap-1">
        {navItems.map(({ icon: Icon, label }, index) => (
          <a className={`flex min-h-11 items-center gap-3 rounded-[7px] px-3 text-sm font-black transition ${index === 0 ? 'border border-slate-200 bg-slate-50 text-[#0057B8]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0057B8]'}`} href={`#${label.toLowerCase()}`} key={label}>
            <Icon size={18} /> {label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-[7px] border border-[#0057B8]/15 bg-[#0057B8]/5 p-4">
        <p className="text-sm font-black text-slate-950">Need faster hiring?</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Invite verified freelancers and track every milestone in one place.</p>
        <Link className="job-card-details-link mt-4 w-full" to="/post-job">Post Job</Link>
      </div>
    </aside>
  )
}

function RecruiterTopbar({ onMenu, user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button className="grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-700 xl:hidden" onClick={onMenu} type="button">
          <Menu size={20} />
        </button>
        <label className="hidden min-h-11 flex-1 items-center gap-3 rounded-[7px] border border-slate-200 bg-slate-50 px-4 md:flex">
          <Search className="text-[#0057B8]" size={18} />
          <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Search jobs, candidates, freelancers, invoices..." />
          <SlidersHorizontal size={17} className="text-slate-400" />
        </label>
        <button className="relative grid h-11 w-11 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-600" type="button">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#FF8A00]" />
        </button>
        <button className="flex min-h-11 items-center gap-3 rounded-[7px] border border-slate-200 bg-white px-2.5 text-left" type="button">
          <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-[#0057B8] text-xs font-black text-white">{getInitials(user?.name || 'Recruiter')}</span>
          <span className="hidden sm:block">
            <span className="block text-sm font-black text-slate-950">{user?.name || 'Recruiter'}</span>
            <span className="block text-xs font-bold text-slate-500">Recruiter workspace</span>
          </span>
          <ChevronDown className="hidden text-slate-400 sm:block" size={16} />
        </button>
      </div>
    </header>
  )
}

function MetricCard({ icon: Icon, label, trend, value }) {
  return (
    <article className="rounded-[7px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0057B8]/10">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8]/10 text-[#0057B8]"><Icon size={20} /></span>
        <span className="rounded-[7px] bg-[#3E9B28]/10 px-2.5 py-1 text-xs font-black text-[#2F7D1F]">{trend}</span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
    </article>
  )
}

function Panel({ action, children, title }) {
  return (
    <section className="rounded-[7px] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function RecentActivity() {
  return (
    <div className="rounded-[7px] border border-slate-200">
      {activity.map((item, index) => (
        <div className="flex items-start gap-3 border-b border-slate-100 p-4 last:border-b-0" key={item}>
          <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[7px] bg-[#0057B8]/10 text-xs font-black text-[#0057B8]">{index + 1}</span>
          <p className="text-sm font-bold leading-6 text-slate-600">{item}</p>
        </div>
      ))}
    </div>
  )
}

function QuickActions({ onPost }) {
  const items = [
    { label: 'Post new job', icon: FilePlus2, onClick: onPost },
    { label: 'Review applications', icon: UsersRound },
    { label: 'Open messages', icon: MessageCircle },
    { label: 'Check payments', icon: WalletCards },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, label, onClick }) => (
        <button className="flex min-h-24 flex-col items-start justify-between rounded-[7px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#0057B8]/30 hover:bg-white hover:shadow-md hover:shadow-[#0057B8]/10" key={label} onClick={onClick} type="button">
          <Icon className="text-[#0057B8]" size={20} />
          <span className="font-black text-slate-800">{label}</span>
        </button>
      ))}
    </div>
  )
}

function JobManagement({ jobs, onPost }) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-3 rounded-[7px] border border-slate-200 bg-slate-50 px-4">
          <Search className="text-[#0057B8]" size={17} />
          <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Search and filter jobs" />
        </label>
        <Button onClick={onPost}>Post Job</Button>
      </div>
      <div className="overflow-x-auto rounded-[7px] border border-slate-200">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>{['Job title', 'Type', 'Location', 'Budget', 'Applications', 'Status', 'Actions'].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {jobs.map((job) => (
              <tr className="transition hover:bg-slate-50" key={job._id || job.title}>
                <td className="px-4 py-4 font-black text-slate-950">{job.title}</td>
                <td className="px-4 py-4 font-bold text-slate-600">{job.type || '-'}</td>
                <td className="px-4 py-4 font-bold text-slate-600">{job.location || '-'}</td>
                <td className="px-4 py-4 font-bold text-slate-600">{job.budget || '-'}</td>
                <td className="px-4 py-4 font-black text-[#0057B8]">{job.applicationsCount || 0}</td>
                <td className="px-4 py-4"><StatusBadge status={job.status || job.accountDepartmentStatus || 'Active'} /></td>
                <td className="px-4 py-4"><button className="grid h-9 w-9 place-items-center rounded-[7px] border border-slate-200 bg-white text-slate-600" type="button"><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CandidateManagement({ applications }) {
  return (
    <div className="grid gap-3">
      {applications.map((candidate) => (
        <article className="rounded-[7px] border border-slate-200 bg-white p-4" key={candidate.id || candidate._id || candidate.candidateEmail}>
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[7px] bg-[#0057B8]/10 font-black text-[#0057B8]">{getInitials(candidate.name || candidate.candidateName || 'Candidate')}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{candidate.name || candidate.candidateName || 'Candidate'}</p>
                  <p className="text-sm font-bold text-slate-500">{candidate.role || candidate.jobTitle || 'Applicant'} / {candidate.experience || 'Experience not added'} / {candidate.rate || 'Rate not added'}</p>
                </div>
                <StatusBadge status={candidate.status || 'Review'} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(candidate.skills || ['Communication', 'Remote Work']).map((skill) => <span className="rounded-[7px] bg-slate-100 px-3 py-1 text-xs font-black text-slate-600" key={skill}>{skill}</span>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="job-card-details-link px-4" type="button"><FileText size={16} /> Resume</button>
                <Button onClick={() => toast('Candidate shortlisted')}>Shortlist</Button>
                <button className="rounded-[7px] border border-rose-200 bg-white px-4 py-2 text-sm font-black text-rose-700" type="button">Reject</button>
                <button className="rounded-[7px] border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700" type="button">Hire</button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ChatPreview() {
  const [selected, setSelected] = useState(conversations[0])
  return (
    <div className="grid overflow-hidden rounded-[7px] border border-slate-200 lg:grid-cols-[260px_1fr]">
      <div className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
        {conversations.map((item) => (
          <button className={`mb-2 w-full rounded-[7px] p-3 text-left ${selected.name === item.name ? 'bg-white shadow-sm' : 'hover:bg-white/70'}`} key={item.name} onClick={() => setSelected(item)} type="button">
            <p className="font-black text-slate-900">{item.name}</p>
            <p className={`mt-1 text-xs font-black ${item.status === 'Online' ? 'text-[#3E9B28]' : 'text-slate-400'}`}>{item.status}</p>
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-black text-slate-950">{selected.name}</p>
            <p className="text-xs font-bold text-[#3E9B28]">{selected.status}</p>
          </div>
          <MessageCircle className="text-[#0057B8]" />
        </div>
        <div className="grid gap-3">
          <p className="max-w-[82%] rounded-[7px] bg-slate-100 p-3 text-sm font-semibold text-slate-600">{selected.message}</p>
          <p className="ml-auto max-w-[82%] rounded-[7px] bg-[#0057B8] p-3 text-sm font-semibold text-white">Thanks, I will review and share next steps.</p>
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input py-3" placeholder="Type a message..." />
          <Button>Send</Button>
        </div>
      </div>
    </div>
  )
}

function PaymentsPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-[7px] bg-slate-950 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-wide text-blue-200">Hiring Budget</p>
        <p className="mt-3 text-4xl font-black">INR 1.2L</p>
        <div className="mt-5 grid gap-2">
          {['Advance paid', 'Milestone pending', 'Final release'].map((item, index) => (
            <div className="rounded-[7px] bg-white/10 p-3 text-sm font-black" key={item}>{index + 1}. {item}</div>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        {invoices.map((invoice) => (
          <div className="flex items-center justify-between rounded-[7px] border border-slate-200 bg-slate-50 p-3" key={invoice.id}>
            <div>
              <p className="font-black text-slate-950">{invoice.id}</p>
              <p className="text-xs font-bold text-slate-500">{invoice.project}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">{invoice.amount}</p>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompanyProfile({ totalJobs, user }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[170px_1fr]">
      <div className="grid min-h-40 place-items-center rounded-[7px] border border-[#0057B8]/15 bg-[#0057B8]/5">
        <span className="grid h-24 w-24 place-items-center rounded-[7px] bg-[#0057B8] text-2xl font-black text-white">{getInitials(user?.name || 'Company')}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['Company name', user?.name || 'CromGen Hiring Partner'],
          ['Website', 'https://company.example'],
          ['Location', 'India'],
          ['Team size', '51-200'],
          ['Posted jobs', totalJobs],
          ['Verification', 'Verified recruiter'],
        ].map(([label, value]) => (
          <div className="rounded-[7px] border border-slate-200 bg-slate-50 p-3" key={label}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value}</p>
          </div>
        ))}
        <Button className="sm:col-span-2">Edit Company Profile</Button>
      </div>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[
        ['Profile settings', 'Name, email, phone, and recruiter identity.'],
        ['Password change', 'Security password and access control.'],
        ['Notifications', 'Email, chat, shortlist, and payment alerts.'],
        ['Account settings', 'Billing and workspace preferences.'],
      ].map(([title, text]) => (
        <label className="flex items-center justify-between gap-4 rounded-[7px] border border-slate-200 bg-slate-50 p-4" key={title}>
          <span>
            <span className="block font-black text-slate-950">{title}</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">{text}</span>
          </span>
          <input className="h-5 w-5 accent-[#0057B8]" defaultChecked type="checkbox" />
        </label>
      ))}
      <Button className="md:col-span-2"><Settings size={18} /> Save Settings</Button>
    </div>
  )
}

function PostJobModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[7px] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#0057B8]">Post / Edit Job</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Create a hiring brief</h2>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Job title" />
          <input className="input" placeholder="Category" />
          <input className="input" placeholder="Budget" />
          <input className="input" placeholder="Experience" />
          <textarea className="input min-h-32 md:col-span-2" placeholder="Job description" />
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button className="job-card-details-link flex-1" onClick={onClose} type="button">Cancel</button>
          <Button className="flex-1" onClick={() => { toast('Job draft saved'); onClose() }}>Save Job</Button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const normalized = String(status || 'Active')
  const good = ['Active', 'Paid', 'Approved', 'Shortlisted', 'Verified recruiter'].includes(normalized)
  const warn = ['Pending', 'Review', 'Draft', 'Interview'].includes(normalized)
  return <span className={`inline-flex rounded-[7px] px-3 py-1 text-xs font-black ${good ? 'bg-[#3E9B28]/10 text-[#2F7D1F]' : warn ? 'bg-[#FF8A00]/10 text-[#B65F00]' : 'bg-slate-100 text-slate-600'}`}>{normalized}</span>
}

function getInitials(value) {
  return String(value || 'R').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function toast(message) {
  window.dispatchEvent(new CustomEvent('portalToast', { detail: { message } }))
}
