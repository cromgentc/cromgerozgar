import { useState } from 'react'
import { Eye, Send } from 'lucide-react'
import { Button } from '../components/Button'
import { api } from '../services/api'

const initialForm = {
  title: '',
  company: '',
  department: '',
  location: '',
  salary: '',
  experience: '',
  type: 'Full Time',
  workMode: 'Hybrid',
  skills: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  deadline: '',
}

export function PostJobPage() {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setMessage('Submitting...')

    try {
      await api.createJob({
        ...form,
        companyLogo: form.company.slice(0, 2).toUpperCase(),
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        benefits: form.benefits.split('\n').filter(Boolean),
        posted: 'Today',
        status: 'Open',
        approval: 'Pending',
      })
      setForm(initialForm)
      setMessage('Job submitted successfully to MongoDB.')
    } catch (error) {
      setMessage(`Backend unavailable: ${error.message}`)
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-blue-100/50 backdrop-blur sm:p-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Post a Premium Job</h1>
          <p className="mt-3 text-slate-500">Create a MongoDB-backed job opening with role, skills, deadline, and hiring details.</p>
          <form className="mt-8 grid gap-6" onSubmit={submit}>
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Role Basics</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" onChange={(e) => update('title', e.target.value)} placeholder="Job title" required value={form.title} />
                <input className="input" onChange={(e) => update('company', e.target.value)} placeholder="Company name" required value={form.company} />
                <input className="input" onChange={(e) => update('department', e.target.value)} placeholder="Department" value={form.department} />
                <input className="input" onChange={(e) => update('location', e.target.value)} placeholder="Location" required value={form.location} />
              </div>
            </section>
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Compensation & Work</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" onChange={(e) => update('salary', e.target.value)} placeholder="Salary range" value={form.salary} />
                <input className="input" onChange={(e) => update('experience', e.target.value)} placeholder="Experience" value={form.experience} />
                <select className="input" onChange={(e) => update('type', e.target.value)} value={form.type}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Freelance</option></select>
                <select className="input" onChange={(e) => update('workMode', e.target.value)} value={form.workMode}><option>Hybrid</option><option>Remote</option><option>On-site</option></select>
                <input className="input sm:col-span-2" onChange={(e) => update('deadline', e.target.value)} placeholder="Application deadline" value={form.deadline} />
              </div>
            </section>
            <input className="input" onChange={(e) => update('skills', e.target.value)} placeholder="Skills tags input, comma separated" value={form.skills} />
            <textarea className="input min-h-32" onChange={(e) => update('description', e.target.value)} placeholder="Description" required value={form.description} />
            <textarea className="input min-h-32" onChange={(e) => update('responsibilities', e.target.value)} placeholder="Responsibilities, one per line" value={form.responsibilities} />
            <textarea className="input min-h-32" onChange={(e) => update('requirements', e.target.value)} placeholder="Requirements, one per line" value={form.requirements} />
            <textarea className="input min-h-32" onChange={(e) => update('benefits', e.target.value)} placeholder="Benefits, one per line" value={form.benefits} />
            {message && <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" variant="secondary"><Eye size={18} /> Preview Job</Button>
              <button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 hover:bg-teal-600" type="submit"><Send size={18} /> Submit Job</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
