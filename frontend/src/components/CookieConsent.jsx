import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'

const consentKey = 'inseetCookieConsent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(localStorage.getItem(consentKey) !== 'accepted')
  }, [])

  const acceptCookies = () => {
    localStorage.setItem(consentKey, 'accepted')
    setVisible(false)
  }

  const closeBanner = () => setVisible(false)

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[7px] border border-blue-100 bg-white p-4 shadow-2xl shadow-slate-300/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] bg-blue-50 text-blue-700">
            <Cookie size={20} />
          </span>
          <div>
            <p className="font-black text-slate-950">Cookies Notice</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              We use cookies to keep sessions secure, remember preferences, and improve the INSEET experience.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={closeBanner} type="button" aria-label="Close cookies notice">
            <X size={17} />
          </button>
          <button className="min-h-10 rounded-[7px] bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700" onClick={acceptCookies} type="button">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
