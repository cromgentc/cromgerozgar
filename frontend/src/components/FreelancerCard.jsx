import { MapPin, Star, UserRoundCheck } from 'lucide-react'
import { Button } from './Button'

export function FreelancerCard({ freelancer, onHire, onShortlist }) {
  return (
    <article className="group rounded-[7px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0057B8]/20 hover:shadow-xl hover:shadow-[#0057B8]/10">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[7px] bg-[#0057B8]/10 text-lg font-black text-[#0057B8]">
          {freelancer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black text-slate-950">{freelancer.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-[7px] bg-[#3E9B28]/10 px-2.5 py-1 text-xs font-black text-[#3E9B28]">
              <UserRoundCheck size={14} /> Verified
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-600">{freelancer.role}</p>
          <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
            <MapPin size={14} /> {freelancer.location} / {freelancer.experience}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">{freelancer.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {freelancer.skills.map((skill) => (
          <span className="rounded-[7px] bg-slate-100 px-3 py-1 text-xs font-black text-slate-600" key={skill}>{skill}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-[7px] bg-slate-50 p-3 text-center">
        <div>
          <p className="text-sm font-black text-slate-950">{freelancer.rate}</p>
          <p className="text-[11px] font-bold text-slate-400">Rate</p>
        </div>
        <div>
          <p className="inline-flex items-center justify-center gap-1 text-sm font-black text-slate-950"><Star className="fill-[#FF8A00] text-[#FF8A00]" size={14} /> {freelancer.rating}</p>
          <p className="text-[11px] font-bold text-slate-400">{freelancer.reviews} reviews</p>
        </div>
        <div>
          <p className="text-sm font-black text-slate-950">{freelancer.availability}</p>
          <p className="text-[11px] font-bold text-slate-400">Status</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button className="job-card-details-link" onClick={onShortlist} type="button">Shortlist</button>
        <Button onClick={onHire}>Hire Freelancer</Button>
      </div>
    </article>
  )
}
