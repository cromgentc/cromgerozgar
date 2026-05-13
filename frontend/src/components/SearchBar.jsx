import { MapPin, Search } from 'lucide-react'
import { Button } from './Button'

export function SearchBar({ compact = false }) {
  return (
    <div className={`grid gap-3 rounded-[2rem] border border-white/80 bg-white/85 p-3 shadow-2xl shadow-blue-100/70 backdrop-blur-xl ring-1 ring-slate-200/80 ${compact ? 'lg:grid-cols-[1fr_1fr_0.7fr_auto]' : 'lg:grid-cols-[1.2fr_0.8fr_0.7fr_auto]'}`}>
      <label className="flex min-h-14 items-center gap-3 rounded-full bg-slate-50 px-4 text-slate-500">
        <Search className="shrink-0 text-blue-600" size={20} />
        <input className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" placeholder="Job title, skill, or company" />
      </label>
      <label className="flex min-h-14 items-center gap-3 rounded-full bg-slate-50 px-4 text-slate-500">
        <MapPin className="shrink-0 text-teal-500" size={20} />
        <input className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" placeholder="Location" />
      </label>
      <select className="min-h-14 rounded-full bg-slate-50 px-4 text-sm font-semibold text-slate-600 outline-none">
        <option>All job types</option>
        <option>Full Time</option>
        <option>Part Time</option>
        <option>Contract</option>
        <option>Freelance</option>
      </select>
      <Button className="min-h-14 px-7">Find Jobs</Button>
    </div>
  )
}
