import { useEffect, useState } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import { Button } from '../components/Button'
import { ReviewCard } from '../components/ReviewCard'
import { api } from '../services/api'

export function CandidateReviewsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.listAll('testimonials', '?status=Active&sort=-featured%20-createdAt')
      .then((payload) => {
        if (!active) return
        const testimonials = Array.isArray(payload.data) ? payload.data : []
        setItems(testimonials.filter((item) => item.name && item.text))
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button to="/" variant="secondary"><ArrowLeft size={17} /> Back Home</Button>
        <div className="mt-6 rounded-[7px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-6 shadow-sm sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-[7px] bg-blue-600 text-white">
            <Star fill="currentColor" size={22} />
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">Candidate Reviews</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500 sm:text-base">
            All published candidate feedback, success stories, and platform experiences from CromGen Rozgar.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div className="h-48 animate-pulse rounded-[7px] bg-slate-100" key={item} />)}
          </div>
        ) : items.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <ReviewCard item={item} key={item._id || item.name} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-[7px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">No reviews yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">When admin adds candidate testimonials, they will appear here automatically.</p>
          </div>
        )}
      </div>
    </section>
  )
}
