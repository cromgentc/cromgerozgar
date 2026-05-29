export function showToast(message, type = 'success', options = {}) {
  if (!message || typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent('portalToast', {
    detail: {
      message,
      type,
      ...options,
    },
  }))
}

export function getToastType(message = '') {
  const text = String(message).toLowerCase()
  if (
    text.includes('failed')
    || text.includes('error')
    || text.includes('required')
    || text.includes('missing')
    || text.includes('invalid')
    || text.includes('unavailable')
    || text.includes('could not')
    || text.includes('not found')
    || text.includes('please ')
    || text.includes('only ')
  ) {
    return 'error'
  }

  if (
    text.includes('processing')
    || text.includes('uploading')
    || text.includes('submitting')
    || text.includes('checking')
  ) {
    return 'info'
  }

  return 'success'
}

export function showMessageToast(message, options = {}) {
  showToast(message, options.type || getToastType(message), options)
}
