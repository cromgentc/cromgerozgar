import { useEffect, useState } from 'react'
import { api } from '../services/api'

const BRANDING_STORAGE_KEY = 'siteBranding'
const BRANDING_EVENT = 'siteBrandingChanged'
export const defaultHeroBrands = ['OYO', 'paytm', 'Nestle', 'HCL', 'bookmyshow', 'NYKAA']

export const defaultSiteBranding = {
  siteName: 'Cromgen Rozgar',
  adminName: 'Rozgar Admin',
  recruiterName: 'Rozgar Recruiter',
  logoUrl: '/cromgen-rozgar-logo.png',
  faviconUrl: '/cromgen-rozgar-favicon.png',
  tollFreeNumber: '+91 98765 43210',
  recruiterEmail: 'recruiter@cromgenrozgar.com',
  recruiterFooterLocation: 'New Delhi, India',
  showRecruiterFooterLocation: true,
  heroBrandNames: defaultHeroBrands,
  seoTitle: 'Cromgen Rozgar',
  seoDescription: 'A modern enterprise job portal for candidates, recruiters, HR teams, and growing companies.',
  seoKeywords: 'jobs, recruiter, hiring, candidates, cromgen rozgar',
  appDownloadTitle: 'Download the Cromgen Rozgar App',
  playStoreLink: 'https://play.google.com/store',
  appStoreLink: '',
  appRating: '4.4',
  appReviews: '42K Reviews',
  appDownloads: '50L+',
}

export function applySiteBrandingMeta(branding = {}) {
  if (typeof document === 'undefined') return

  const next = { ...defaultSiteBranding, ...branding }
  document.title = next.seoTitle || next.siteName
  setMeta('description', next.seoDescription)
  setMeta('keywords', next.seoKeywords)
  setMeta('author', next.siteName)
  setMetaProperty('og:type', 'website')
  setMetaProperty('og:site_name', next.siteName)
  setMetaProperty('og:title', next.seoTitle || next.siteName)
  setMetaProperty('og:description', next.seoDescription)
  setMetaProperty('og:image', absoluteUrl(next.logoUrl))
  setMetaProperty('og:url', getCurrentCanonicalUrl())
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', next.seoTitle || next.siteName)
  setMeta('twitter:description', next.seoDescription)
  setMeta('twitter:image', absoluteUrl(next.logoUrl))
  setCanonical(getCurrentCanonicalUrl())

  if (next.faviconUrl) {
    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = next.faviconUrl
  }
}

export function normalizeSiteBranding(branding = {}) {
  return {
    ...defaultSiteBranding,
    ...branding,
    logoUrl: branding.logoUrl || defaultSiteBranding.logoUrl,
    faviconUrl: branding.faviconUrl || defaultSiteBranding.faviconUrl,
    heroBrandNames: normalizeHeroBrands(branding.heroBrandNames),
  }
}

export function publishSiteBranding(branding = {}) {
  const next = normalizeSiteBranding(branding)
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next))
  applySiteBrandingMeta(next)
  window.dispatchEvent(new CustomEvent(BRANDING_EVENT, { detail: next }))
  return next
}

export function useSiteBranding() {
  const [branding, setBranding] = useState(() => getCachedBranding())

  useEffect(() => {
    let mounted = true
    const applyNext = (nextBranding) => {
      const next = normalizeSiteBranding(nextBranding)
      setBranding(next)
      applySiteBrandingMeta(next)
    }

    const onBrandingChanged = (event) => {
      if (!mounted) return
      applyNext(event.detail || getCachedBranding())
    }

    const onStorage = (event) => {
      if (event.key === BRANDING_STORAGE_KEY && mounted) applyNext(getCachedBranding())
    }

    window.addEventListener(BRANDING_EVENT, onBrandingChanged)
    window.addEventListener('storage', onStorage)

    api
      .publicSiteBranding()
      .then((payload) => {
        if (!mounted) return
        const setting = payload.data
        const saved = setting?.value || {}
        const next = normalizeSiteBranding({ ...getCachedBranding(), ...saved })
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next))
        setBranding(next)
        applySiteBrandingMeta(next)
      })
      .catch(() => {
        if (mounted) applySiteBrandingMeta(getCachedBranding())
      })

    return () => {
      mounted = false
      window.removeEventListener(BRANDING_EVENT, onBrandingChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return branding
}

function getCachedBranding() {
  try {
    return normalizeSiteBranding(JSON.parse(localStorage.getItem(BRANDING_STORAGE_KEY) || 'null') || {})
  } catch {
    return defaultSiteBranding
  }
}

function normalizeHeroBrands(value) {
  const list = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/\r?\n|,/)
      .map((item) => item.trim())

  const cleaned = [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))]
  return cleaned.length ? cleaned : defaultHeroBrands
}

function setMeta(name, content) {
  if (!content) return
  let meta = document.querySelector(`meta[name='${name}']`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  meta.content = content
}

function setMetaProperty(property, content) {
  if (!content) return
  let meta = document.querySelector(`meta[property='${property}']`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function setCanonical(href) {
  if (!href) return
  let link = document.querySelector("link[rel='canonical']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function absoluteUrl(value = '') {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (typeof window === 'undefined') return value
  return `${window.location.origin}${value.startsWith('/') ? value : `/${value}`}`
}

function getCurrentCanonicalUrl() {
  if (typeof window === 'undefined') return 'https://www.cromgenrozgar.in/'
  return `${window.location.origin}${window.location.pathname}`
}
