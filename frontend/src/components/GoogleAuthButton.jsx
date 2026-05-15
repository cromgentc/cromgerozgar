import { useEffect, useMemo, useRef, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { api } from '../services/api'

const googleScriptId = 'google-identity-services'

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()

  const existingScript = document.getElementById(googleScriptId)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = googleScriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export function GoogleAuthButton({ disabled = false, label = 'Continue with Google', onCredential }) {
  const buttonRef = useRef(null)
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const buttonId = useMemo(() => `google-btn-${Math.random().toString(36).slice(2)}`, [])

  useEffect(() => {
    let mounted = true

    api
      .googleAuthConfig()
      .then((payload) => {
        if (!mounted) return
        const config = payload.data || {}
        if (config.enabled && config.clientId) setClientId(config.clientId)
        else if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) setError('Google auth is not configured.')
      })
      .catch(() => {
        if (mounted && !import.meta.env.VITE_GOOGLE_CLIENT_ID) setError('Google auth is not configured.')
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!clientId) {
      setError('Google auth is not configured.')
      return undefined
    }

    let mounted = true

    loadGoogleScript()
      .then(() => {
        if (!mounted) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential?.(response.credential),
        })
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: buttonRef.current.offsetWidth || 360,
          })
        }
        setReady(true)
      })
      .catch(() => {
        if (mounted) setError('Google sign-in could not load.')
      })

    return () => {
      mounted = false
    }
  }, [clientId, onCredential])

  if (!clientId || error) {
    return (
      <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-400" disabled type="button">
        <Globe2 size={18} /> {error || label}
      </button>
    )
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      {!ready && (
        <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-black text-slate-600" disabled type="button">
          <Globe2 size={18} /> Loading Google...
        </button>
      )}
      <div className={ready ? 'grid min-h-11 place-items-center' : 'hidden'} id={buttonId} ref={buttonRef} />
    </div>
  )
}
