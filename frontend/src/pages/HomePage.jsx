import { motion } from 'framer-motion'
import { Building2, FileText, Send } from 'lucide-react'
import { Button } from '../components/Button'
import { FAQSection } from '../components/FAQSection'
import { FeatureShowcase } from '../components/FeatureShowcase'
import { HeroBanner } from '../components/HeroBanner'
import { JobCard } from '../components/JobCard'
import { Section } from '../components/Section'
import { TestimonialSlider } from '../components/TestimonialSlider'
import { categories, companies, jobs } from '../data/portalData'
import { getStoredUser } from '../routes/authRouting'

export function HomePage({ onApply }) {
  const user = getStoredUser()
  const isCandidate = user?.role === 'Candidate'

  return (
    <>
      <HeroBanner />

      <Section eyebrow="Categories" title="Featured Job Categories" subtitle="Explore high-growth roles across full-time, hybrid, remote, freelance, and AI operations hiring.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.02 }} key={category.name}>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${category.color}`}><Icon size={22} /></div>
                <h3 className="mt-4 font-bold text-slate-950">{category.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{category.jobs} open roles</p>
              </motion.div>
            )
          })}
        </div>
      </Section>

      <Section className="bg-white" eyebrow="Companies" title="Top Hiring Companies" subtitle="Verified employer profiles with active openings and transparent role information.">
        <CompanyGrid />
      </Section>

      <Section eyebrow="Latest" title="Latest Premium Job Openings" subtitle="Curated roles with salary, deadline, work mode, skills, and employer context.">
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => <JobCard featured job={job} key={job.id} onApply={onApply} />)}
        </div>
      </Section>

      <Section className="bg-white" eyebrow="Process" title="How It Works">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: FileText, title: 'Create a profile', text: 'Add skills, experience, resume, preferred locations, and work mode.' },
            { icon: Building2, title: 'Discover quality roles', text: 'Use advanced filters and company insights to shortlist relevant jobs.' },
            { icon: Send, title: 'Apply and track', text: 'Submit applications, save roles, and follow every status from your dashboard.' },
          ].map((step) => {
            const Icon = step.icon
            return (
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-blue-100" key={step.title}>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><Icon size={21} /></div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{step.text}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {!isCandidate && <FeatureShowcase />}

      <TestimonialSlider />

      <FAQSection />
    </>
  )
}

export function CompanyGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100" key={company.name}>
          <div className="flex items-start justify-between gap-4">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${company.accent} text-lg font-black text-white shadow-lg shadow-blue-100`}>{company.badge}</div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{company.rating} rating</span>
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-950">{company.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{company.industry} · {company.location}</p>
          <p className="mt-4 text-sm font-bold text-blue-600">{company.jobs} open jobs</p>
          <Button className="mt-5 w-full" to="/companies" variant="secondary">View Company</Button>
        </div>
      ))}
    </div>
  )
}
