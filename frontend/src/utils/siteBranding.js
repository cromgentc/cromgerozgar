import { useEffect, useState } from 'react'
import { api } from '../services/api'

const BRANDING_STORAGE_KEY = 'siteBranding'
const BRANDING_EVENT = 'siteBrandingChanged'

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
  seoTitle: 'Cromgen Rozgar',
  seoDescription: 'A modern enterprise job portal for candidates, recruiters, HR teams, and growing companies.',
  seoKeywords: 'jobs, recruiter, hiring, candidates, cromgen rozgar',
}

export function applySiteBrandingMeta(branding = {}) {
  if (typeof document === 'undefined') return

  const next = { ...defaultSiteBranding, ...branding }
  document.title = next.seoTitle || next.siteName
  setMeta('description', next.seoDescription)
  setMeta('keywords', next.seoKeywords)

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
