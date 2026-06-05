import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, ExternalLink, Loader2, MapPin, Newspaper, Send, Sparkles, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export function PressNewsPage() {
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api.pressNews()
      .then((payload) => {
        if (mounted) setNewsItems(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch(() => {
        if (mounted) setNewsItems([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const posts = newsItems
  const featuredPost = useMemo(() => posts.find((item) => item.featured) || posts[0], [posts])
  const otherPosts = posts.filter((item) => item._id !== featuredPost?._id)

  return (
    <main className="bg-[#f8fbff]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0057B8]">
            <Newspaper size={16} />
            Press / News
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-[#061333] sm:text-5xl">
            Cromgen Rozgar updates, announcements, and media notes.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
            Admin backend se press post update hote hi yahan latest image, title, and description automatically show hoga.
          </p>
        </div>

        {loading && (
          <div className="mt-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
              <Loader2 className="animate-spin" size={17} />
              Loading press posts
            </span>
          </div>
        )}

        {featuredPost && <FeaturedPressPost post={featuredPost} />}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {otherPosts.map((post) => <PressCard key={post._id || post.title} post={post} />)}
        </div>

        <section className="mt-10 overflow-hidden rounded-[8px] bg-gradient-to-r from-[#0057B8] to-[#ff8a00] p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Sparkles size={30} />
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">Media and partnership enquiries</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
                For announcements, interviews, partnership notes, or company information, contact the Cromgen Rozgar team.
              </p>
            </div>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[7px] bg-white px-6 text-sm font-black text-[#0057B8] shadow-lg shadow-slate-900/10" to="/contact">
              Contact Team <Send size={17} />
            </Link>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link className="inline-flex items-center gap-2 text-sm font-black text-[#0057B8]" to="/career-resources">
            View Career Resources <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeaturedPressPost({ post }) {
  return (
    <article className="mt-10 overflow-hidden rounded-[12px] border border-blue-100 bg-white shadow-xl shadow-blue-100/70">
      <div className="grid lg:grid-cols-[0.48fr_0.52fr]">
        <PressImage imageUrl={post.imageUrl} title={post.title} featured />
        <div className="flex flex-col justify-center p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff8a00]">{post.category || 'Company News'}</span>
            <MetaPill icon={CalendarDays} label={formatPressDate(post.publishedAt || post.createdAt)} />
          </div>
          <h2 className="mt-5 text-2xl font-black leading-tight text-[#061333] sm:text-4xl">{post.title}</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{post.excerpt || post.description}</p>
          <PressMeta post={post} />
          {post.sourceUrl && (
            <a className="mt-6 inline-flex w-fit items-center gap-2 rounded-[7px] bg-[#0057B8] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100" href={post.sourceUrl} rel="noreferrer" target="_blank">
              Read Source <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function PressCard({ post }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <PressImage imageUrl={post.imageUrl} title={post.title} />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff8a00]">{post.category || 'Company News'}</span>
          <span className="flex items-center gap-2 text-xs font-black text-slate-400">
            <CalendarDays size={15} />
            {formatPressDate(post.publishedAt || post.createdAt)}
          </span>
        </div>
        <h2 className="mt-5 text-xl font-black leading-7 text-[#061333]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{post.excerpt || post.description}</p>
        <PressMeta post={post} compact />
        {post.sourceUrl && (
          <a className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#0057B8]" href={post.sourceUrl} rel="noreferrer" target="_blank">
            {post.sourceName || 'Read more'} <ExternalLink size={15} />
          </a>
        )}
      </div>
    </article>
  )
}

function PressImage({ imageUrl, title, featured = false }) {
  if (imageUrl) {
    return <img className={`${featured ? 'h-72 sm:h-full' : 'h-48'} w-full object-cover`} src={imageUrl} alt={title} />
  }

  return (
    <div className={`${featured ? 'min-h-72' : 'h-48'} grid place-items-center bg-[linear-gradient(135deg,#eaf3ff,#fff4e6)]`}>
      <div className="grid h-20 w-20 place-items-center rounded-[16px] bg-white text-[#0057B8] shadow-lg shadow-blue-100">
        <Newspaper size={38} />
      </div>
    </div>
  )
}

function PressMeta({ post, compact = false }) {
  return (
    <div className={`mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500 ${compact ? '' : 'sm:text-sm'}`}>
      <MetaPill icon={UserRound} label={post.author || 'Cromgen Rozgar Team'} />
      <MetaPill icon={MapPin} label={post.location || 'India'} />
    </div>
  )
}

function MetaPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="text-[#0057B8]" size={15} />
      {label}
    </span>
  )
}

function formatPressDate(value) {
  if (!value) return '2026'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
