import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, LifeBuoy, LockKeyhole, Scale, ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { SupportChatButton } from '../components/SupportChat'
import { api } from '../services/api'

const defaultPages = {
  privacy: {
    slug: 'privacy',
    category: 'Privacy',
    title: 'Privacy Policy',
    subtitle: 'How Cromgen Rozgar handles candidate, recruiter, application, and hiring data.',
    sections: [
      { heading: 'Data We Collect', body: 'We collect account details, profile information, resumes, job applications, recruiter documents, payment and wallet activity, and platform usage data needed to operate hiring workflows.' },
      { heading: 'How We Use Data', body: 'Data is used to verify accounts, match candidates with jobs, process applications, help recruiters manage hiring, improve platform security, and send relevant hiring insights when users subscribe.' },
      { heading: 'User Control', body: 'Users can update profile data, manage application activity, unsubscribe from updates, and request support for privacy-related account actions.' },
    ],
  },
  terms: {
    slug: 'terms',
    category: 'Terms',
    title: 'Terms of Service',
    subtitle: 'Platform rules for candidates, recruiters, administrators, job posts, applications, and payments.',
    sections: [
      { heading: 'Account Responsibility', body: 'Users must provide accurate registration, profile, company, and document information. Duplicate or misleading identity details may be rejected or suspended.' },
      { heading: 'Jobs And Applications', body: 'Recruiter job posts may require account department approval before becoming visible to candidates. Candidates can apply once per job and must maintain a complete profile and resume.' },
      { heading: 'Payments And Packages', body: 'Recruiter packages, wallet coins, and job posting limits are governed by the selected plan and account verification status.' },
    ],
  },
  support: {
    slug: 'support',
    category: 'Support',
    title: 'Support Center',
    subtitle: 'Get help with accounts, recruiter verification, job applications, packages, wallet, and platform operations.',
    sections: [
      { heading: 'Candidate Support', body: 'For profile completion, resume upload, duplicate applications, saved jobs, and application status tracking, contact support with your registered email.' },
      { heading: 'Recruiter Support', body: 'For document verification, GST/PAN validation, job approval, package activation, wallet coins, and candidate activity, contact the account department.' },
      { heading: 'Response Workflow', body: 'Support requests are reviewed based on priority, account status, and available verification data. Keep your account information updated for faster resolution.' },
    ],
  },
  'recruiter-privacy': {
    slug: 'recruiter-privacy',
    category: 'Privacy',
    frontendPlacement: 'Recruiter Frontend',
    title: 'Recruiter Privacy Policy',
    subtitle: 'How Cromgen Rozgar handles recruiter, company, document, package, and hiring workflow data.',
    sections: [
      { heading: 'Recruiter Data We Collect', body: 'We collect company profile details, recruiter contact information, verification documents, job posts, package activity, wallet records, and hiring workflow data.' },
      { heading: 'How Recruiter Data Is Used', body: 'Recruiter data is used for account verification, job approval, candidate pipeline management, package activation, billing support, and platform security.' },
      { heading: 'Recruiter Controls', body: 'Recruiters can update profile details, manage job posts, review package activity, and contact support for data or verification concerns.' },
    ],
  },
  'recruiter-terms': {
    slug: 'recruiter-terms',
    category: 'Terms',
    frontendPlacement: 'Recruiter Frontend',
    title: 'Recruiter Terms Of Service',
    subtitle: 'Hiring platform rules for recruiter accounts, job posts, verification, payments, and candidate handling.',
    sections: [
      { heading: 'Account And Company Verification', body: 'Recruiters must provide accurate company, GST, PAN, address, contact, and hiring information. Incomplete or misleading submissions may be rejected.' },
      { heading: 'Job Posting Rules', body: 'Job posts may require admin or account department approval before becoming visible. Recruiters are responsible for accurate salary, location, role, and application details.' },
      { heading: 'Packages And Hiring Usage', body: 'Recruiter packages, wallet coins, and posting limits are controlled by the selected plan and current account status.' },
    ],
  },
  'recruiter-support': {
    slug: 'recruiter-support',
    category: 'Support',
    frontendPlacement: 'Recruiter Frontend',
    title: 'Recruiter Support Policy',
    subtitle: 'Support guidance for recruiter verification, packages, wallet, job approval, and hiring operations.',
    sections: [
      { heading: 'Verification Support', body: 'Recruiters can contact support for GST, PAN, offer letter, company profile, or document review issues.' },
      { heading: 'Job And Candidate Support', body: 'Support can help with job approval status, rejected post remarks, applications, shortlists, and candidate workflow concerns.' },
      { heading: 'Package Support', body: 'For package activation, wallet coins, billing records, or plan access issues, recruiters should contact the account department with registered business email details.' },
    ],
  },
}

export function ContentPage({ placement = 'Users Frontend', slug }) {
  const { pageSlug } = useParams()
  const resolvedSlug = slug || pageSlug || 'support'
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const fallback = defaultPages[resolvedSlug] || defaultPages.support

  useEffect(() => {
    let active = true
    setLoading(true)

    const params = new URLSearchParams({ slug: resolvedSlug, status: 'Published', limit: '1' })
    if (placement) params.set('frontendPlacement', placement)

    api.list('content-pages', `?${params.toString()}`)
      .then((payload) => {
        if (!active) return
        const item = Array.isArray(payload.data) ? payload.data[0] : null
        setPage(item || null)
      })
      .catch(() => {
        if (active) setPage(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [resolvedSlug])

  const content = page || fallback
  const Icon = getPageIcon(content.category)
  const sections = useMemo(() => Array.isArray(content.sections) && content.sections.length ? content.sections : fallback.sections, [content.sections, fallback.sections])

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6 shadow-xl shadow-blue-100/50 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white">
                <Icon size={25} />
              </div>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-blue-600">{content.category || 'Platform'}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{content.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{content.subtitle}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 text-sm font-black text-slate-600 ring-1 ring-white">
              {loading ? 'Loading latest policy...' : `Updated ${formatDate(content.updatedAt || content.effectiveDate)}`}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4">
            {sections.map((section, index) => (
              <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm" key={`${section.heading}-${index}`}>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Section {index + 1}</span>
                <h2 className="mt-4 text-2xl font-black text-slate-950">{section.heading}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{section.body}</p>
              </article>
            ))}
          </div>

          <aside className="h-max rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Need Help?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">For account, privacy, terms, or support questions, contact the Cromgen Rozgar team.</p>
            <div className="mt-5 grid gap-3">
              <SupportChatButton />
              <Button to="/jobs" variant="secondary">Browse Jobs</Button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <ShieldCheck className="text-teal-600" size={21} />
              <p className="mt-3 text-sm font-black text-slate-700">Enterprise policy content is editable from MongoDB through the content page resource.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function getPageIcon(category) {
  if (category === 'Privacy') return LockKeyhole
  if (category === 'Terms') return Scale
  if (category === 'Support') return LifeBuoy
  return FileText
}

function formatDate(value) {
  if (!value) return 'recently'
  return new Date(value).toLocaleDateString()
}
