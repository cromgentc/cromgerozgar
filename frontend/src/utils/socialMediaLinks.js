import { useEffect, useState } from 'react'
import { api } from '../services/api'

export const defaultSocialLinks = []

export function useSocialMediaLinks() {
  const [links, setLinks] = useState(defaultSocialLinks)

  useEffect(() => {
    let mounted = true

    const loadLinks = () => {
      api
        .publicSocialLinks()
        .then((payload) => {
          if (mounted) setLinks(Array.isArray(payload.data) ? payload.data : defaultSocialLinks)
        })
        .catch(() => {
          if (mounted) setLinks(defaultSocialLinks)
        })
    }

    loadLinks()
    window.addEventListener('focus', loadLinks)
    window.addEventListener('social-media-links-updated', loadLinks)

    return () => {
      mounted = false
      window.removeEventListener('focus', loadLinks)
      window.removeEventListener('social-media-links-updated', loadLinks)
    }
  }, [])

  return links
}
