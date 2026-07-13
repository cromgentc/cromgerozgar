import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BriefcaseBusiness, ClipboardCheck, CreditCard, Database, FileText, Headphones, LifeBuoy, LockKeyhole, RefreshCw, Scale, ShieldCheck, UserCog, UserRoundCheck } from 'lucide-react'
import { SupportChatButton } from '../components/SupportChat'
import { api } from '../services/api'

const defaultPages = {
  privacy: {
    slug: 'privacy',
    category: 'Privacy',
    title: 'Privacy Policy',
    subtitle: 'How INSEET handles candidate, recruiter, application, and hiring data.',
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
    subtitle: 'How INSEET handles recruiter, company, document, package, and hiring workflow data.',
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
  'freelancer-privacy': {
    slug: 'freelancer-privacy',
    category: 'Privacy',
    frontendPlacement: 'Freelancer Frontend',
    title: 'Freelancer Privacy Policy',
    subtitle: 'How INSEET handles freelancer profile, portfolio, project, proposal, and payout support data.',
    sections: [
      { heading: 'Freelancer Data We Collect', body: 'We collect freelancer account details, profile information, skills, portfolio data, project activity, proposal history, and support messages needed to operate freelancer workflows.' },
      { heading: 'How Freelancer Data Is Used', body: 'Freelancer data is used to show profiles to companies, support project discovery, manage proposals, verify activity, improve recommendations, and keep the marketplace secure.' },
      { heading: 'Freelancer Controls', body: 'Freelancers can update profile details, manage portfolio information, review project activity, and contact support for account or privacy-related requests.' },
    ],
  },
  'freelancer-terms': {
    slug: 'freelancer-terms',
    category: 'Terms',
    frontendPlacement: 'Freelancer Frontend',
    title: 'Freelancer Terms Of Service',
    subtitle: 'Platform rules for freelancer accounts, project discovery, proposals, communication, and professional conduct.',
    sections: [
      { heading: 'Profile Responsibility', body: 'Freelancers must provide accurate profile, skill, portfolio, contact, and availability details. Misleading information may be reviewed or removed.' },
      { heading: 'Projects And Proposals', body: 'Freelancers are responsible for submitting genuine proposals, maintaining professional communication, and respecting project requirements shared by clients or recruiters.' },
      { heading: 'Marketplace Usage', body: 'Freelancer access, project visibility, shortlisting, support workflows, and account actions are governed by platform policies and verification status.' },
    ],
  },
  'freelancer-support': {
    slug: 'freelancer-support',
    category: 'Support',
    frontendPlacement: 'Freelancer Frontend',
    title: 'Freelancer Support Policy',
    subtitle: 'Support guidance for freelancer profile setup, project listings, proposals, account access, and marketplace workflows.',
    sections: [
      { heading: 'Profile Support', body: 'Freelancers can contact support for profile completion, portfolio updates, skill corrections, login issues, and account-related help.' },
      { heading: 'Project Support', body: 'Support can help route questions about project discovery, proposal visibility, shortlisted opportunities, and marketplace communication workflows.' },
      { heading: 'Response Workflow', body: 'Support requests are reviewed based on account status, project context, and available details. Keep your freelancer profile updated for faster resolution.' },
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

    api.contentPages(`?${params.toString()}`)
      .then((payload) => {
        if (!active) return
        const item = Array.isArray(payload.data) ? payload.data[0] : null
        setPage(item?.status === 'Published' ? item : null)
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
  }, [resolvedSlug, placement])

  const content = page || fallback
  const sections = useMemo(() => Array.isArray(content.sections) && content.sections.length ? content.sections : fallback.sections, [content.sections, fallback.sections])
  const theme = getPolicyTheme(content)

  return (
    <section className="bg-white px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[8px] border border-slate-100 bg-white shadow-sm">
        <div className={`relative overflow-hidden ${theme.heroBg} px-6 py-9 sm:px-10 sm:py-11`}>
          <div className="absolute right-8 top-8 grid grid-cols-5 gap-2 opacity-30">
            {Array.from({ length: 25 }).map((_, index) => <span className={`h-1.5 w-1.5 rounded-full ${theme.dotClass}`} key={index} />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <span className={`inline-flex items-center gap-2 rounded-[3px] px-3 py-2 text-xs font-black uppercase text-white ${theme.badgeBg}`}>
                <theme.BadgeIcon size={15} /> {content.category || 'Platform'}
              </span>
              <h1 className="mt-7 text-4xl font-black tracking-tight text-[#071129] sm:text-5xl">{content.title}</h1>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-[#071129]/75">{content.subtitle}</p>
            </div>
            <div className="relative flex flex-col items-end gap-4">
              <PolicyIllustration theme={theme} />
              <span className={`inline-flex items-center gap-2 rounded-[7px] bg-white px-4 py-2 text-xs font-black ${theme.textClass} shadow-sm`}>
                <RefreshCw size={13} /> {loading ? 'Loading latest policy...' : `Updated ${formatDate(content.updatedAt || content.effectiveDate)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-slate-100 p-5 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-5">
            {sections.map((section, index) => (
              <article className="grid gap-5 rounded-[7px] border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[90px_1fr] sm:p-7" key={`${section.heading}-${index}`}>
                <span className={`grid h-20 w-20 place-items-center rounded-[8px] ${theme.iconBg} ${theme.textClass}`}>
                  <PolicySectionIcon category={content.category} index={index} />
                </span>
                <div>
                  <span className={`rounded-[3px] px-2 py-1 text-xs font-black ${theme.softBg} ${theme.textClass}`}>{String(index + 1).padStart(2, '0')}</span>
                  <h2 className="mt-3 text-xl font-black text-[#071129]">{section.heading}</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-[#071129]/75">{section.body}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="grid h-max gap-5">
            <div className="rounded-[7px] border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`grid h-12 w-12 place-items-center rounded-[7px] ${theme.iconBg} ${theme.textClass}`}>
                <Headphones size={22} />
              </span>
              <h2 className="mt-4 text-lg font-black text-[#071129]">Need Help?</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#071129]/70">For account, privacy, terms, or support questions, contact the INSEET team.</p>
              <div className="mt-5 grid gap-3">
                <SupportChatButton className="!bg-[#ff8a00] text-white shadow-lg shadow-orange-100 hover:!bg-[#e87500]" />
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] border border-[#ff8a00] bg-white px-5 py-2.5 text-sm font-black text-[#ff8a00] transition hover:-translate-y-0.5 hover:bg-orange-50" to="/jobs">
                  <BriefcaseBusiness size={16} /> Browse Jobs
                </Link>
              </div>
            </div>
            <div className={`rounded-[7px] ${theme.sidebarBg} p-5`}>
              <ShieldCheck className={theme.textClass} size={22} />
              <p className="mt-4 text-sm font-semibold leading-7 text-[#071129]">Enterprise policy content is editable from MongoDB through the content page resource.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function PolicyIllustration({ theme }) {
  const Icon = theme.HeroIcon

  return (
    <div className={`relative grid h-36 w-36 place-items-center rounded-full ${theme.illustrationBg}`}>
      <span className={`absolute h-24 w-24 rotate-45 rounded-[7px] ${theme.badgeBg} opacity-20`} />
      <span className={`relative grid h-24 w-24 place-items-center rounded-[22px] ${theme.badgeBg} text-white shadow-xl ${theme.buttonShadow}`}>
        <Icon size={48} strokeWidth={1.8} />
      </span>
    </div>
  )
}

function PolicySectionIcon({ category, index }) {
  const normalizedCategory = String(category || '').toLowerCase()
  const icons = normalizedCategory.includes('term')
    ? [UserRoundCheck, BriefcaseBusiness, CreditCard]
    : normalizedCategory.includes('support')
      ? [LifeBuoy, Headphones, ShieldCheck]
      : [Database, RefreshCw, UserCog]
  const Icon = icons[index % icons.length] || FileText
  return <Icon size={32} strokeWidth={1.9} />
}

function getPolicyTheme(content = {}) {
  const category = String(content.category || '').toLowerCase()
  const slug = String(content.slug || '').toLowerCase()
  const isTerms = category.includes('term') || slug.includes('terms')
  const isSupport = category.includes('support') || slug.includes('support')

  if (isTerms) {
    return {
      BadgeIcon: Scale,
      HeroIcon: ClipboardCheck,
      badgeBg: 'bg-[#6d37dc]',
      borderClass: 'border-[#6d37dc]',
      buttonBg: '!bg-[#6d37dc]',
      buttonShadow: 'shadow-violet-100',
      dotClass: 'bg-[#6d37dc]',
      heroBg: 'bg-[radial-gradient(circle_at_78%_30%,rgba(109,55,220,0.16),transparent_27%),linear-gradient(135deg,#fbf8ff_0%,#f4edff_100%)]',
      iconBg: 'bg-violet-50',
      illustrationBg: 'bg-violet-100/60',
      sidebarBg: 'bg-violet-50',
      softBg: 'bg-violet-50',
      textClass: 'text-[#6d37dc]',
    }
  }

  if (isSupport) {
    return {
      BadgeIcon: LifeBuoy,
      HeroIcon: Headphones,
      badgeBg: 'bg-[#0f9f6e]',
      borderClass: 'border-[#0f9f6e]',
      buttonBg: '!bg-[#0f9f6e]',
      buttonShadow: 'shadow-emerald-100',
      dotClass: 'bg-[#0f9f6e]',
      heroBg: 'bg-[radial-gradient(circle_at_78%_30%,rgba(15,159,110,0.16),transparent_27%),linear-gradient(135deg,#f6fffb_0%,#eafff5_100%)]',
      iconBg: 'bg-emerald-50',
      illustrationBg: 'bg-emerald-100/60',
      sidebarBg: 'bg-emerald-50',
      softBg: 'bg-emerald-50',
      textClass: 'text-[#0f9f6e]',
    }
  }

  return {
    BadgeIcon: LockKeyhole,
    HeroIcon: LockKeyhole,
    badgeBg: 'bg-[#1269f2]',
    borderClass: 'border-[#1269f2]',
    buttonBg: '!bg-[#1269f2]',
    buttonShadow: 'shadow-blue-100',
    dotClass: 'bg-[#1269f2]',
    heroBg: 'bg-[radial-gradient(circle_at_78%_30%,rgba(18,105,242,0.14),transparent_27%),linear-gradient(135deg,#f3f9ff_0%,#eaf5ff_100%)]',
    iconBg: 'bg-blue-50',
    illustrationBg: 'bg-blue-100/60',
    sidebarBg: 'bg-blue-50',
    softBg: 'bg-blue-50',
    textClass: 'text-[#1269f2]',
  }
}

function formatDate(value) {
  if (!value) return 'recently'
  return new Date(value).toLocaleDateString()
}
