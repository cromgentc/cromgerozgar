import { Star } from 'lucide-react'

export function ReviewCard({ item }) {
  return (
    <article className="rounded-[7px] border border-slate-200 bg-slate-50 p-6 text-left shadow-sm">
      <div className="mb-4 flex items-center gap-1 text-amber-400">
        {Array.from({ length: Math.max(1, Math.min(5, Number(item.rating || 5))) }).map((_, index) => (
          <Star fill="currentColor" key={index} size={17} />
        ))}
      </div>
      <p className="text-sm font-semibold leading-7 text-slate-600">"{item.text}"</p>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="font-black text-slate-950">{item.name}</p>
        <p className="mt-1 text-sm font-bold text-blue-600">{[item.role, item.company].filter(Boolean).join(' / ') || 'Candidate'}</p>
      </div>
    </article>
  )
}
