import { ArrowRight, CalendarDays, Newspaper, Send, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const newsItems = [
  ['Platform Update', 'Career Resources now supports Cromgen Rozgar internal vacancies with direct applications.'],
  ['Recruiter Tools', 'Recruiter workspace includes job posting, application tracking, resume search, and hiring analytics.'],
  ['Freelancer Network', 'Freelancers can explore projects, apply with skills, and manage opportunities through dedicated workflows.'],
]

export function PressNewsPage() {
  return (
    <main className="bg-[#f8fbff]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0057B8]">
            <Newspaper size={16} />
            Press / News
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-[#061333] sm:text-5xl">
            Cromgen Rozgar updates, announcements, and media notes.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
            Follow product updates, hiring features, platform improvements, and public announcements from Cromgen Rozgar.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {newsItems.map(([category, title], index) => (
            <article className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70" key={title}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff8a00]">{category}</span>
                <span className="flex items-center gap-2 text-xs font-black text-slate-400">
                  <CalendarDays size={15} />
                  2026
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black leading-7 text-[#061333]">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                {index === 0
                  ? 'A cleaner career page helps users discover Cromgen Rozgar hiring posts and apply directly.'
                  : index === 1
                    ? 'Recruiters can manage hiring operations with structured tools and verified workflows.'
                    : 'Dedicated freelancer journeys support project discovery and independent work opportunities.'}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-10 overflow-hidden rounded-[8px] bg-gradient-to-r from-[#0057B8] to-[#ff8a00] p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Sparkles size={30} />
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">Media and partnership enquiries</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
                For announcements, interviews, partnership notes, or company information, contact the Cromgen Rozgar team.
              </p>
            </div>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-white px-6 text-sm font-black text-[#0057B8] shadow-lg shadow-slate-900/10" to="/contact">
              Contact Team <Send size={17} />
            </Link>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0057B8]" to="/career-resources">
            View Career Resources <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  )
}
