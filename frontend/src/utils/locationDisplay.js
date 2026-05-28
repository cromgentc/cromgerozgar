export function formatStateCountryLocation(value) {
  const parts = String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) return parts.slice(-2).join(', ')
  return parts.join(', ')
}

export function buildStateCountryLocation(form = {}) {
  return [form.state, form.country].filter(Boolean).join(', ') || formatStateCountryLocation(form.location)
}
