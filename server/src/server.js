const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes/api');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// HTTP cache headers for static-like GET responses
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET') return next();
  // Short cache for everything; CDN/browser revalidates
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

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