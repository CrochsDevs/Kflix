const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes/api');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '64kb' }));
app.use(morgan('dev'));

// Aggressive caching for static-ish endpoints, short for dynamic
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET') return next();
  const p = req.path;
  // Genres and trending are largely cacheable on the browser too
  if (p === '/genres') {
    res.set('Cache-Control', 'public, max-age=86400'); // 24h
  } else if (p === '/discover' && !req.query.search && !req.query.genre) {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5m
  } else {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
});

// Simple ETag for GET responses (CDN/browser revalidation)
app.set('etag', 'strong');
function etagBody(buf) {
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, 16);
}
// (etag auto-handled by express when set; compression must be before)

app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 KFLIX server listening on http://localhost:${config.port}`);
  });
}

start();