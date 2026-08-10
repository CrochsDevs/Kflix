function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
  });
}

module.exports = { notFound, errorHandler };
