import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { Button } from '../components/Button'
import { ReviewCard } from '../components/ReviewCard'
import { api } from '../services/api'

const PAGE_SIZE = 10

export function CandidateReviewsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(Number(searchParams.get('page')) || 1, 1)
  const totalPages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const visibleItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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

  useEffect(() => {
    if (!loading && currentPage > totalPages) {
      setSearchParams(totalPages > 1 ? { page: String(totalPages) } : {}, { replace: true })
    }
  }, [currentPage, loading, setSearchParams, totalPages])

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages)
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            All published candidate feedback, success stories, and platform experiences from INSEET.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div className="h-48 animate-pulse rounded-[7px] bg-slate-100" key={item} />)}
          </div>
        ) : items.length ? (
          <>
            <div className="mt-8 flex flex-col justify-between gap-3 rounded-[7px] border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600 sm:flex-row sm:items-center">
              <span>Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, items.length)} of {items.length} reviews</span>
              <span>Page {safePage} of {totalPages}</span>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => <ReviewCard item={item} key={item._id || item.name} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button className="rounded-[7px] bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} type="button">
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    className={`grid h-10 min-w-10 place-items-center rounded-[7px] px-3 text-sm font-black ${page === safePage ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
                    key={page}
                    onClick={() => goToPage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
                <button className="rounded-[7px] bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)} type="button">
                  Next
                </button>
              </div>
            )}
          </>
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
