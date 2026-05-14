import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle, Minus, Plus, Search, Send, X } from 'lucide-react'
import { api } from '../services/api'

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.list('faqs', '?status=Active&sort=sortOrder%20-featured%20-createdAt&limit=100')
      .then((payload) => {
        if (active) setItems(Array.isArray(payload.data) ? payload.data : [])
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

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))], [items])
  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesQuery =
        !normalizedQuery ||
        item.question?.toLowerCase().includes(normalizedQuery) ||
        item.answer?.toLowerCase().includes(normalizedQuery) ||
        item.category?.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })
  }, [activeCategory, items, query])

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#E0F2FE_0,transparent_34%),radial-gradient(circle_at_bottom_right,#F3E8FF_0,transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] py-16 sm:py-20">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mx-auto max-w-3xl text-center" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Common Questions</h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Dynamic answers for candidates, recruiters, applications, payments, and platform support.
          </p>
        </motion.div>

        <div className="mt-8 rounded-[2rem] border border-white bg-white/80 p-4 shadow-xl shadow-blue-100/60 backdrop-blur-xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="flex min-h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm">
              <Search className="shrink-0 text-blue-600" size={18} />
              <input
                className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  setQuery(event.target.value)
                  setOpenIndex(0)
                }}
                placeholder="Search questions"
                value={query}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                    activeCategory === category ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-blue-600'
                  }`}
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setOpenIndex(0)
                  }}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map((item) => <div className="h-24 animate-pulse rounded-[1.6rem] bg-white ring-1 ring-slate-200" key={item} />)
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => (
                <FAQCard
                  isOpen={openIndex === index}
                  item={item}
                  key={item._id || `${item.category}-${item.question}`}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))
            ) : (
              <motion.div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <HelpCircle className="mx-auto text-blue-600" size={36} />
                <h3 className="mt-4 text-xl font-black text-slate-950">{items.length ? 'No questions found' : 'No FAQs published yet'}</h3>
                <p className="mt-2 text-sm text-slate-500">{items.length ? 'Try another keyword or switch FAQ category.' : 'Admin FAQs MongoDB me add karega to yaha automatically show hoga.'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="mt-8 rounded-[2rem] border border-blue-100 bg-white/85 p-5 text-center shadow-xl shadow-blue-100/50 backdrop-blur sm:p-6" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <p className="text-lg font-black text-slate-950">Still have questions?</p>
          <p className="mt-2 text-sm text-slate-500">Our support team can help with jobs, applications, recruiters, and account setup.</p>
          <button
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            onClick={() => setChatOpen(true)}
            type="button"
          >
            <MessageCircle size={18} />
            Contact Support
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}

function FAQCard({ item, isOpen, onClick }) {
  return (
    <motion.article className={`rounded-[1.6rem] bg-gradient-to-br p-px shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-100 ${isOpen ? 'from-blue-500 via-teal-400 to-violet-500' : 'from-slate-200 to-slate-200'}`} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>
      <div className="rounded-[1.55rem] bg-white/95 p-4 backdrop-blur sm:p-5">
        <button className="flex w-full items-center gap-4 text-left" onClick={onClick} type="button">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {isOpen ? <Minus size={19} /> : <Plus size={19} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{item.category || 'General'}</span>
            <span className="block text-base font-black text-slate-950 sm:text-lg">{item.question}</span>
          </span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-50 text-slate-500">
            <ChevronDown size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0, y: -6 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="overflow-hidden">
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 sm:ml-[60px]">{item.answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

function ChatModal({ onClose }) {
  return (
    <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <motion.div animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/20" exit={{ opacity: 0, scale: 0.96, y: 16 }} initial={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white"><MessageCircle size={20} /></span>
            <div>
              <h3 className="text-lg font-black text-slate-950">Support Chat</h3>
              <p className="text-sm font-semibold text-slate-500">Usually replies in a few minutes</p>
            </div>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={onClose} type="button" aria-label="Close chat"><X size={18} /></button>
        </div>
        <div className="grid gap-3 bg-slate-50 p-5">
          <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white p-4 text-sm font-semibold leading-6 text-slate-600 shadow-sm">Hi, welcome to Cromgen Rozgar support. How can we help you today?</div>
          <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-blue-600 p-4 text-sm font-semibold leading-6 text-white shadow-sm">I need help with my account or applications.</div>
        </div>
        <div className="flex gap-2 border-t border-slate-100 p-4">
          <input className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Type your message" />
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700" type="button" aria-label="Send message"><Send size={18} /></button>
        </div>
      </motion.div>
    </motion.div>
  )
}
