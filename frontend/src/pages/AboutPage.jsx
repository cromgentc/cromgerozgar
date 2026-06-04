import { ArrowRight, BriefcaseBusiness, CheckCircle2, ShieldCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const values = [
  ['Verified hiring', 'We focus on cleaner job posts, recruiter checks, and transparent application workflows.'],
  ['Career access', 'Candidates and freelancers can discover opportunities, save work, apply, and track progress.'],
  ['Recruiter tools', 'Employers get structured posting, resume search, applications, analytics, and hiring support.'],
]

export function AboutPage() {
  return (
    <main className="bg-[#f8fbff]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0057B8]">
              <BriefcaseBusiness size={16} />
              About Us
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#061333] sm:text-5xl">
              Cromgen Rozgar connects talent, recruiters, and work opportunities.
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-600">
              Cromgen Rozgar is built for candidates, freelancers, recruiters, and hiring teams who need a trusted place to discover jobs, post openings, manage applications, and grow careers with clear workflows.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-[#0057B8] px-6 text-sm font-black text-white shadow-lg shadow-blue-100" to="/jobs">
                Find Jobs <ArrowRight size={17} />
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-[#ff8a00] px-6 text-sm font-black text-white shadow-lg shadow-orange-100" to="/recruiter">
                Start Hiring <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="grid gap-4">
              {[
                [UsersRound, 'Candidates & freelancers', 'Apply to jobs and projects with a cleaner career profile.'],
                [ShieldCheck, 'Verified ecosystem', 'Policies, support, and role-based workflows keep operations organized.'],
                [BriefcaseBusiness, 'Recruiter workspace', 'Post jobs, review applicants, search resumes, and manage hiring.'],
              ].map(([Icon, title, text]) => (
                <article className="rounded-[7px] bg-[#f8fbff] p-4" key={title}>
                  <Icon className="text-[#0057B8]" size={26} />
                  <h2 className="mt-3 text-lg font-black text-[#061333]">{title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map(([title, text]) => (
            <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70" key={title}>
              <CheckCircle2 className="text-[#ff8a00]" size={28} />
              <h2 className="mt-4 text-xl font-black text-[#061333]">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
