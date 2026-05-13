import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { testimonials } from '../data/portalData'

export function TestimonialSlider() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [])

  const item = testimonials[active]

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Testimonials</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Trusted By Recruiters And Candidates
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Real feedback from hiring teams and professionals using the platform.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4 shadow-xl shadow-blue-100/60 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.article
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[1.75rem] border border-white bg-white/85 p-6 text-center shadow-sm backdrop-blur sm:p-10"
              exit={{ opacity: 0, x: -40 }}
              initial={{ opacity: 0, x: 40 }}
              key={item.name}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                <Quote size={26} />
              </div>
              <div className="mt-5 flex justify-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => <Star fill="currentColor" key={star} size={18} />)}
              </div>
              <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-700">“{item.text}”</p>
              <p className="mt-6 text-xl font-black text-slate-950">{item.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{item.role}</p>
            </motion.article>
          </AnimatePresence>

          <div className="mt-5 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                aria-label={`Show testimonial from ${testimonial.name}`}
                className={`h-2.5 rounded-full transition-all ${active === index ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-blue-300'}`}
                key={testimonial.name}
                onClick={() => setActive(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
