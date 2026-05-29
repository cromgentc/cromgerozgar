export function formatStateCountryLocation(value) {
  const parts = String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.join(', ')
}

export function buildStateCountryLocation(form = {}) {
  return [form.city, form.state, form.country].filter(Boolean).join(', ') || formatStateCountryLocation(form.location)
}
