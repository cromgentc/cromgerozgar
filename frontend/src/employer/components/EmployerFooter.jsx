import { Link } from 'react-router-dom'
import { BriefcaseBusiness, Mail, MapPin, MessageCircle, Send, Share2 } from 'lucide-react'

const footerGroups = {
  Solutions: ['AI Matching', 'Applicant Tracking', 'Resume Database', 'Hiring Analytics'],
  Recruiter: ['Post Jobs', 'Recruiter Profile', 'Team Members', 'Pricing'],
  Candidates: ['Talent Pool', 'Saved Profiles', 'Shortlists', 'Interviews'],
  Resources: ['Hiring Guide', 'Blog', 'Help Center', 'Case Studies'],
  Support: ['Contact', 'Live Chat', 'Documentation', 'System Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'Compliance'],
}

export function EmployerFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-blue-600 via-teal-400 to-violet-500" />
        <div className="grid gap-10 py-10 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link className="flex items-center gap-3 font-black text-slate-950" to="/recruiter">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 text-white"><BriefcaseBusiness size={23} /></span>
              <span className="text-xl">Rozgar Recruiter</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">Premium hiring tools for recruiters that want faster sourcing, cleaner workflows, and better talent decisions.</p>
            <div className="mt-5 grid gap-3 text-sm text-slate-500">
              <p className="flex items-center gap-3"><Mail className="text-blue-600" size={18} /> recruiter@cromgenrozgar.com</p>
              <p className="flex items-center gap-3"><MessageCircle className="text-blue-600" size={18} /> Chat with hiring support</p>
              <p className="flex items-center gap-3"><MapPin className="text-blue-600" size={18} /> New Delhi, India</p>
            </div>
            <div className="mt-5 flex gap-2">
              {[Share2, Send, MessageCircle].map((Icon, index) => <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600" key={index}><Icon size={18} /></span>)}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(footerGroups).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">{title}</h3>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
                  {links.map((link) => <Link className="hover:text-blue-600" key={link} to="/recruiter">{link}</Link>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-950">Get recruiter hiring insights</p>
            <p className="text-sm text-slate-500">Monthly trends, sourcing ideas, and recruiter productivity tips.</p>
          </div>
          <div className="mt-4 flex gap-2 sm:mt-0">
            <input className="min-w-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500" placeholder="Business email" />
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white" type="button"><Send size={17} /></button>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500">© 2026 Cromgen Rozgar Recruiter Portal. All rights reserved.</p>
      </div>
    </footer>
  )
}
