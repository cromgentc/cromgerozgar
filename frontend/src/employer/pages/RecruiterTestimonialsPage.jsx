import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { api } from '../../services/api'

const fallbackVideos = [
  {
    companyName: 'K9HR Solutions',
    location: '150 Feet Ring Road, Rajkot, India',
    logoText: 'K9HR',
    tone: 'blue',
  },
  {
    companyName: 'Jobsahihai Manpower Solution',
    location: 'Sector 73, Noida, India',
    logoText: 'JS',
    tone: 'stone',
  },
]

export function RecruiterTestimonialsPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    let mounted = true
    api
      .videoTestimonials()
      .then((payload) => {
        if (!mounted) return
        setVideos(Array.isArray(payload.data) ? payload.data.filter((item) => item.companyName) : [])
      })
      .catch(() => {
        if (mounted) setVideos([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const visibleVideos = videos.length ? videos : fallbackVideos

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#dff4f5] to-[#fff5ee] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center sm:relative">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1f3d68] sm:text-[30px]">Why Companies Choose Us</h1>
            <p className="mt-3 text-sm font-medium text-slate-600">Video testimonials from recruiter partners using CromGen Rozgar.</p>
          </div>
          <div className="absolute right-4 hidden items-center gap-3 sm:flex lg:right-8">
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 bg-white/60 text-slate-500 transition hover:border-[#ff8a00] hover:text-[#ff8a00]" type="button" aria-label="Previous video testimonial">
              <ArrowLeft size={16} />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-500 bg-white text-slate-700 transition hover:border-[#ff8a00] hover:text-[#ff8a00]" type="button" aria-label="Next video testimonial">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2].map((item) => <div className="h-[390px] animate-pulse rounded-[6px] bg-white shadow-md" key={item} />)}
          </div>
        ) : (
          <div className={`grid gap-5 ${visibleVideos.length === 2 ? 'md:grid-cols-2 md:px-28' : 'md:grid-cols-3'}`}>
            {visibleVideos.map((item, index) => (
              <VideoCard item={item} key={item._id || item.companyName} onPlay={() => setActiveVideo(item)} showSideShade={index > 0} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button className="min-h-11 border border-[#ff8a00] bg-white px-8 !text-black shadow-none hover:bg-[#fff4e6]" to="/recruiter" variant="secondary">
            Back To Recruiter Page
          </Button>
        </div>
      </div>

      {activeVideo && <VideoTestimonialModal item={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  )
}

function VideoCard({ item, onPlay, showSideShade = false }) {
  return (
    <article className="overflow-hidden rounded-[6px] bg-white shadow-md shadow-slate-300/60">
      <button className={`relative block h-[300px] w-full overflow-hidden bg-gradient-to-br ${getVideoToneClass(item.tone)} md:h-[300px]`} onClick={onPlay} type="button">
        {item.thumbnailUrl ? (
          <img className="h-full w-full object-cover" src={item.thumbnailUrl} alt={`${item.companyName} video testimonial`} />
        ) : (
          <>
            <div className="absolute inset-x-0 top-0 mx-auto h-full w-[56%] bg-white/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.38),transparent_30%)]" />
          </>
        )}
        <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff0033] text-white">
            <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
          </span>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-[4px] bg-white/90 px-5 py-3 text-center shadow-sm">
          <p className="text-3xl font-black tracking-tight text-[#1d7fbf]">{item.logoText || getInitials(item.companyName)}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Solutions</p>
        </div>
        {showSideShade && <div className="absolute inset-y-0 left-0 w-28 bg-black/40" />}
      </button>
      <div className="bg-white px-4 py-4 text-center">
        <h3 className="text-lg font-normal text-[#333]">{item.companyName}</h3>
        <p className="mt-2 text-sm font-normal text-[#e33113]">{item.location}</p>
      </div>
    </article>
  )
}

function VideoTestimonialModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <button className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 hover:text-[#ff8a00]" onClick={onClose} type="button" aria-label="Close video testimonial">
          <X size={20} />
        </button>
        <div className="aspect-video bg-slate-950">
          {item.videoUrl ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              src={normalizeVideoEmbedUrl(item.videoUrl)}
              title={`${item.companyName} video testimonial`}
            />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-white">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ff0033]">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                </div>
                <h3 className="mt-5 text-2xl font-black">{item.companyName}</h3>
                <p className="mt-2 text-sm text-slate-300">Video URL backend mein add karte hi yahan play hoga.</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 text-center">
          <h3 className="text-xl font-semibold text-slate-900">{item.companyName}</h3>
          <p className="mt-1 text-sm text-[#e33113]">{item.location}</p>
        </div>
      </div>
    </div>
  )
}

function getVideoToneClass(tone = 'blue') {
  const tones = {
    amber: 'from-zinc-900 via-amber-950 to-zinc-800',
    blue: 'from-slate-900 via-slate-700 to-slate-950',
    slate: 'from-slate-950 via-slate-800 to-blue-950',
    stone: 'from-stone-950 via-stone-700 to-stone-900',
  }
  return tones[tone] || tones.blue
}

function getInitials(value = '') {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

function normalizeVideoEmbedUrl(url = '') {
  if (url.includes('youtube.com/embed/')) return url
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&?/]+)/)
  if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  return url
}
