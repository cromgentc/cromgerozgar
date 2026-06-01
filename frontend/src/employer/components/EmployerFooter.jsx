import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { api } from '../../services/api'
import { getStoredUser } from '../../routes/authRouting'
import { useSiteBranding } from '../../utils/siteBranding'
import { useSocialMediaLinks } from '../../utils/socialMediaLinks'
import { showMessageToast } from '../../utils/toast'

const loggedOutGroups = [
  {
    title: 'Start Hiring',
    links: [
      ['Register Recruiter', '/recruiter-register'],
      ['Recruiter Login', '/recruiter-login'],
      ['Post a Job', '/post-job'],
      ['Pricing', '/recruiter-pricing'],
    ],
  },
  {
    title: 'Platform',
    links: [
      ['AI Matching', '/recruiter#solutions'],
      ['Resume Database', '/recruiter#solutions'],
      ['Hiring Analytics', '/recruiter#solutions'],
      ['Recruiter Support', '/recruiter/support'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Recruiter Website', '/recruiter'],
      ['Contact', '/contact'],
      ['Resources', '/recruiter-resources'],
      ['Help Center', '/recruiter/support'],
    ],
  },
]

const loggedInGroups = [
  {
    title: 'Workspace',
    links: [
      ['Dashboard', '/recruiter-dashboard'],
      ['My Jobs', '/recruiter-jobs'],
      ['Applications', '/recruiter-applications'],
      ['Profile', '/recruiter-profile'],
    ],
  },
  {
    title: 'Hiring Tools',
    links: [
      ['Find Resume', '/recruiter-find-resume'],
      ['Talent Pool', '/recruiter-talent'],
      ['Interviews', '/recruiter-interviews'],
      ['Analytics', '/recruiter-analytics'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Pricing & Wallet', '/recruiter-pricing'],
      ['Team Workspace', '/recruiter-team'],
      ['Resources', '/recruiter-resources'],
      ['Support', '/recruiter/support'],
    ],
  },
]

const fallbackPolicyLinks = [
  ['Privacy', '/recruiter/privacy'],
  ['Terms', '/recruiter/terms'],
  ['Support Policy', '/recruiter/support'],
]

const trustItems = [
  [ShieldCheck, 'Verified hiring workflows'],
  [Database, 'Dynamic policy content'],
  [BarChart3, 'Pipeline analytics'],
]

export function EmployerFooter() {
  const branding = useSiteBranding()
  const socialLinks = useSocialMediaLinks()
  const user = getStoredUser()
  const isRecruiterLoggedIn = user?.role === 'recruiter'
  const [policyLinks, setPolicyLinks] = useState(fallbackPolicyLinks)
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const notify = (text) => {
    setMessage('')
    if (text) showMessageToast(text)
  }

  useEffect(() => {
    let mounted = true

    api
      .list('content-pages', '?frontendPlacement=Recruiter%20Frontend&status=Published&sort=category&limit=20')
      .then((payload) => {
        if (!mounted) return
        const pages = Array.isArray(payload.data) ? payload.data : []
        const links = pages
          .filter((page) => page.slug && page.title)
          .map((page) => [page.title, `/recruiter/${page.slug.replace(/^recruiter-/, '')}`])

        if (links.length) setPolicyLinks(links)
      })
      .catch(() => {
        if (mounted) setPolicyLinks(fallbackPolicyLinks)
      })

    return () => {
      mounted = false
    }
  }, [])

  const footerGroups = useMemo(() => [
    ...(isRecruiterLoggedIn ? loggedInGroups : loggedOutGroups),
    { title: 'Policy', links: policyLinks },
  ], [isRecruiterLoggedIn, policyLinks])

  const subscribe = async () => {
    if (!email.trim()) {
      notify('Business email required.')
      return
    }

    setSubmitting(true)
    notify('')
    try {
      await api.subscribeNewsletter({
        email,
        source: isRecruiterLoggedIn ? 'recruiter-footer-logged-in' : 'recruiter-footer-visitor',
        topics: ['Recruiter updates', 'Hiring insights', 'Policy updates'],
      })
      if (!isRecruiterLoggedIn) setEmail('')
      notify('Subscribed to recruiter updates.')
    } catch (error) {
      notify(error.message || 'Subscription failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-blue-600 via-teal-400 to-violet-500" />

        <div className="grid gap-8 py-10 lg:grid-cols-[1.05fr_1.95fr]">
          <div className="min-w-0">
            <Link className="flex min-w-0 items-center font-black text-slate-950" to="/recruiter">
              {branding.logoUrl ? (
                <img className="h-16 w-auto max-w-[240px] object-contain" src={branding.logoUrl} alt={branding.recruiterName || 'Rozgar Recruiter'} />
              ) : (
                <>
                  <span className="grid h-12 w-12 place-items-center"><BriefcaseBusiness size={23} /></span>
                  <span className="text-xl">{branding.recruiterName || 'Rozgar Recruiter'}</span>
                </>
              )}
            </Link>

            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-500">
              {isRecruiterLoggedIn
                ? `Welcome back${user?.name ? `, ${user.name}` : ''}. Continue managing jobs, candidates, wallet, and recruiter operations from one workspace.`
                : 'Premium hiring tools for recruiters who want structured job approvals, verified workflows, cleaner candidate pipelines, and better talent decisions.'}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {isRecruiterLoggedIn ? (
                <>
                  <FooterButton icon={ClipboardList} label="Open Dashboard" to="/recruiter-dashboard" />
                  <FooterButton icon={UsersRound} label="View Applications" to="/recruiter-applications" secondary />
                </>
              ) : (
                <>
                  <FooterButton icon={UserPlus} label="Register Recruiter" to="/recruiter-register" />
                  <FooterButton icon={LogIn} label="Recruiter Login" to="/recruiter-login" secondary />
                </>
              )}
            </div>

            <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-500">
              <p className="flex items-center gap-3"><Mail className="text-blue-600" size={18} /> {branding.recruiterEmail || 'recruiter@cromgenrozgar.com'}</p>
              <p className="flex items-center gap-3"><Phone className="text-blue-600" size={18} /> {branding.tollFreeNumber || '+91 98765 43210'}</p>
              <p className="flex items-center gap-3"><MessageCircle className="text-blue-600" size={18} /> Hiring support and account desk</p>
              {branding.showRecruiterFooterLocation !== false && (
                <p className="flex items-center gap-3"><MapPin className="text-blue-600" size={18} /> {branding.recruiterFooterLocation || 'New Delhi, India'}</p>
              )}
            </div>
            <SocialLinks links={socialLinks} />
          </div>

          <div className="grid gap-6">
            <div className="grid gap-3 md:grid-cols-3">
              {trustItems.map(([Icon, label]) => (
                <div className="rounded-[7px] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 shadow-sm" key={label}>
                  <Icon className="text-blue-600" size={20} />
                  <p className="mt-3 text-xs font-black uppercase leading-5 tracking-wide text-slate-600">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">{group.title}</h3>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
                    {group.links.map(([label, to]) => (
                      <Link className="transition hover:text-blue-600" key={`${group.title}-${label}`} to={to}>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[7px] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-950">
              {isRecruiterLoggedIn ? 'Recruiter operations digest' : 'Get recruiter hiring insights'}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {isRecruiterLoggedIn
                ? 'Approval updates, package reminders, policy changes, and pipeline notes.'
                : 'Monthly trends, sourcing ideas, recruiter productivity tips, and policy updates.'}
            </p>
            {message && <p className="mt-2 text-sm font-black text-teal-700">{message}</p>}
          </div>
          <div className="mt-4 flex min-w-0 gap-2 sm:mt-0">
            <input
              className="min-h-10 min-w-0 rounded-[7px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') subscribe()
              }}
              placeholder="Business email"
              type="email"
              value={email}
            />
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              onClick={subscribe}
              type="button"
            >
              <Send size={17} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center">
          <p>(c) 2026 Cromgen Rozgar Recruiter Portal. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {policyLinks.slice(0, 3).map(([label, to]) => <Link className="hover:text-blue-600" key={label} to={to}>{label}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterButton({ icon: Icon, label, secondary = false, to }) {
  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] border border-[#ff8a00] bg-[white] px-5 text-sm font-black text-black shadow-sm transition hover:border-[#ff8a00] hover:bg-[#fff4e6] hover:text-black"
      to={to}
    >
      <Icon size={17} /> {label}
    </Link>
  )
}

function SocialLinks({ links }) {
  const visibleLinks = links.filter((item) => item.url)
  if (!visibleLinks.length) return null

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {visibleLinks.map((item) => {
        const tone = getSocialTone(item.platform)
        return (
          <a
            aria-label={item.label || item.platform}
            className={`grid h-10 w-10 place-items-center rounded-[7px] transition ${tone}`}
            href={item.url}
            key={`${item.platform}-${item.url}`}
            rel="noreferrer"
            target="_blank"
            title={item.label || item.platform}
          >
            <SocialGlyph platform={item.platform} />
          </a>
        )
      })}
    </div>
  )
}

function SocialGlyph({ platform = '' }) {
  const key = platform.toLowerCase()
  if (key.includes('facebook')) return <span className="text-sm font-black">f</span>
  if (key.includes('instagram')) return <span className="text-sm font-black">◎</span>
  if (key.includes('linkedin')) return <span className="text-sm font-black">in</span>
  if (key.includes('youtube')) return <span className="text-sm font-black">▶</span>
  if (key.includes('twitter') || key === 'x') return <span className="text-sm font-black">X</span>
  if (key.includes('whatsapp')) return <MessageCircle size={18} />
  return <Share2 size={18} />
}

function getSocialTone(platform = '') {
  const key = platform.toLowerCase()
  if (key.includes('facebook')) return 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white'
  if (key.includes('instagram')) return 'bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white'
  if (key.includes('linkedin')) return 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white'
  if (key.includes('youtube')) return 'bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white'
  if (key.includes('twitter') || key === 'x') return 'bg-slate-900/10 text-slate-900 hover:bg-slate-900 hover:text-white'
  if (key.includes('whatsapp')) return 'bg-[#25D366]/10 text-[#1FA855] hover:bg-[#25D366] hover:text-white'
  return 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'
}
