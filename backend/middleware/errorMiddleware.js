function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

function errorHandler(err, req, res, next) {
  const isMulterError = err.name === 'MulterError'
  const statusCode = err.statusCode || (isMulterError ? 400 : (res.statusCode === 200 ? 500 : res.statusCode))
  const message = isMulterError && err.code === 'LIMIT_FILE_SIZE'
    ? 'Resume file is too large. Please upload a PDF up to 25 MB.'
    : err.message

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

module.exports = { errorHandler, notFound }
