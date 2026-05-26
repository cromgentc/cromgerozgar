const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function sanitizeMongoOperators(value) {
  if (!value || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    value.forEach(sanitizeMongoOperators)
    return value
  }

  for (const key of Object.keys(value)) {
    if (BLOCKED_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
      delete value[key]
      continue
    }

    sanitizeMongoOperators(value[key])
  }

  return value
}

function mongoSanitize(req, res, next) {
  sanitizeMongoOperators(req.body)
  sanitizeMongoOperators(req.params)
  sanitizeMongoOperators(req.query)
  next()
}

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET
  const unsafeSecrets = new Set(['', 'change-me', 'changeme', 'secret', 'password'])

  if (process.env.NODE_ENV === 'production' && secret && unsafeSecrets.has(String(secret).trim().toLowerCase())) {
    throw new Error('Set a strong JWT_SECRET before starting the API in production.')
  }
}

module.exports = { mongoSanitize, requireJwtSecret }
