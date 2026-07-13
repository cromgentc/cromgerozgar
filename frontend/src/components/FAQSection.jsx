import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronDown, HelpCircle, MessageCircle, Minus, Plus, Search, Send, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export function FAQSection({ fullPage = false }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.faqs()
      .then((payload) => {
        if (!active) return
        const faqs = Array.isArray(payload.data) ? payload.data : []
        setItems(faqs.filter((item) => item.question && item.answer && item.status === 'Active'))
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

  const visibleFaqs = fullPage ? filteredFaqs : filteredFaqs.slice(0, 8)

  return (
    <section className={`relative overflow-hidden bg-[#f8fbff] ${fullPage ? 'min-h-screen py-4 sm:py-6' : 'py-12 sm:py-16'}`}>
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {fullPage && (
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-[7px] px-4 text-xs font-black text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5"
            style={{ backgroundColor: '#0057B8' }}
            to="/"
          >
            <ArrowLeft size={15} />
            Back Home
          </Link>
        )}

        <motion.div className={`${fullPage ? 'mt-4' : ''} overflow-hidden rounded-[10px] border border-blue-100 bg-white shadow-sm shadow-blue-100/60`} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <div className="grid items-center gap-5 px-4 py-5 text-center sm:px-7 sm:py-7 lg:grid-cols-[1fr_0.34fr] lg:text-left">
            <div>
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-[9px] bg-blue-50 text-blue-600 lg:mx-0">
                <HelpCircle size={24} />
              </div>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-[#ff8a00]">Help Center</p>
              <h2 className="mx-auto mt-2 max-w-3xl text-2xl font-black tracking-tight text-slate-950 sm:text-4xl lg:mx-0">
                {fullPage ? 'Frequently Asked Questions' : 'Common Questions'}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500 lg:mx-0">
                {fullPage ? 'Find quick answers for jobs, applications, recruiters, payments, documents, and account support.' : 'Dynamic answers for candidates, recruiters, applications, payments, and platform support.'}
              </p>
              <label className="mx-auto mt-5 flex h-11 max-w-2xl items-center gap-3 rounded-[7px] border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm lg:mx-0">
                <Search className="shrink-0 text-blue-600" size={18} />
                <input
                  className="w-full bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setOpenIndex(0)
                  }}
                  placeholder="Search questions, topics, or support"
                  value={query}
                />
              </label>
            </div>
            <div className="hidden h-44 lg:block">
              <div className="relative h-full">
                <div className="absolute bottom-0 right-0 h-32 w-56 rounded-[14px] bg-gradient-to-br from-blue-50 to-orange-50" />
                <div className="absolute bottom-4 right-10 grid h-24 w-28 place-items-center rounded-[10px] bg-[#0057B8] text-white shadow-xl shadow-blue-100">
                  <MessageCircle size={44} />
                </div>
                <div className="absolute right-0 top-1 grid h-16 w-16 place-items-center rounded-full bg-white text-[#ff8a00] shadow-lg ring-4 ring-orange-50">
                  <ShieldCheck size={30} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[10px] border border-blue-100 bg-white p-3 shadow-sm shadow-blue-100/60 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-base font-black text-slate-950">FAQ Categories</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{filteredFaqs.length} questions found</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-orange-50 text-[#ff8a00]">
                <HelpCircle size={18} />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {categories.map((category) => (
                <button
                  className="flex min-h-10 items-center justify-between rounded-[7px] border px-3 text-left text-xs font-black transition hover:border-[#ff8a00] hover:text-[#ff8a00]"
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setOpenIndex(0)
                  }}
                  style={activeCategory === category ? { borderColor: '#ff8a00', backgroundColor: '#fff7ed', color: '#111827' } : { borderColor: '#e2e8f0', backgroundColor: 'transparent', color: '#475569' }}
                  type="button"
                >
                  <span className="truncate">{category}</span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeCategory === category ? '#ff8a00' : '#cbd5e1' }} />
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  [1, 2, 3].map((item) => <div className="h-20 animate-pulse rounded-[10px] bg-white ring-1 ring-slate-200" key={item} />)
                ) : filteredFaqs.length > 0 ? (
                  visibleFaqs.map((item, index) => (
                    <FAQCard
                      isOpen={openIndex === index}
                      item={item}
                      key={item._id || `${item.category}-${item.question}`}
                      onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    />
                  ))
                ) : (
                  <motion.div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                    <HelpCircle className="mx-auto text-blue-600" size={34} />
                    <h3 className="mt-4 text-xl font-black text-slate-950">{items.length ? 'No questions found' : 'No FAQs published yet'}</h3>
                    <p className="mt-2 text-sm text-slate-500">{items.length ? 'Try another keyword or switch FAQ category.' : 'When admin adds FAQs in MongoDB, they will appear here automatically.'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!fullPage && filteredFaqs.length > visibleFaqs.length && (
              <div className="mt-6 flex justify-center">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[7px] px-5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
                  style={{ backgroundColor: '#0057B8' }}
                  target="_blank"
                  to="/faqs"
                >
                  More FAQ
                </Link>
              </div>
            )}
          </div>
        </div>

        <motion.div className="mt-5 rounded-[10px] border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/60 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <div>
            <p className="text-lg font-black text-slate-950">Still have questions?</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Our support team can help with jobs, applications, recruiters, and account setup.</p>
          </div>
          <button
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[7px] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:mt-0"
            onClick={() => setChatOpen(true)}
            style={{ backgroundColor: '#0057B8' }}
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

export function FAQPage() {
  return <FAQSection fullPage />
}

function FAQCard({ item, isOpen, onClick }) {
  return (
    <motion.article className="rounded-[10px] border border-blue-100 bg-white shadow-sm shadow-blue-100/50 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100" layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>
      <div className="p-3 sm:p-4">
        <button className="flex w-full items-center gap-4 text-left" onClick={onClick} type="button">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px]"
            style={isOpen ? { backgroundColor: '#0057B8', color: '#fff' } : { backgroundColor: '#eff6ff', color: '#0057B8' }}
          >
            {isOpen ? <Minus size={19} /> : <Plus size={19} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-1 inline-flex rounded-[6px] bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#ff8a00]">{item.category || 'General'}</span>
            <span className="block text-sm font-black text-slate-950 sm:text-base">{item.question}</span>
          </span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] bg-slate-50 text-slate-500">
            <ChevronDown size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0, y: -6 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="overflow-hidden">
              <p className="mt-3 rounded-[7px] bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-600 sm:ml-[56px]">{item.answer}</p>
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
      <motion.div animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg overflow-hidden rounded-[7px] bg-white shadow-2xl shadow-slate-900/20" exit={{ opacity: 0, scale: 0.96, y: 16 }} initial={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-blue-600 text-white"><MessageCircle size={20} /></span>
            <div>
              <h3 className="text-lg font-black text-slate-950">Support Chat</h3>
              <p className="text-sm font-semibold text-slate-500">Usually replies in a few minutes</p>
            </div>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={onClose} type="button" aria-label="Close chat"><X size={18} /></button>
        </div>
        <div className="grid gap-3 bg-slate-50 p-5">
          <div className="max-w-[82%] rounded-[7px] rounded-t-[7px]l-md bg-white p-4 text-sm font-semibold leading-6 text-slate-600 shadow-sm">Hi, welcome to INSEET support. How can we help you today?</div>
          <div className="ml-auto max-w-[82%] rounded-[7px] rounded-t-[7px]r-md bg-blue-600 p-4 text-sm font-semibold leading-6 text-white shadow-sm">I need help with my account or applications.</div>
        </div>
        <div className="flex gap-2 border-t border-slate-100 p-4">
          <input className="min-w-0 flex-1 rounded-[7px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Type your message" />
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-[7px] bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700" type="button" aria-label="Send message"><Send size={18} /></button>
        </div>
      </motion.div>
    </motion.div>
  )
}
