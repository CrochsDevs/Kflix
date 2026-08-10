const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { connectDB } = require('./db');
const apiRoutes = require('./routes/api');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
  // Don't block startup on MongoDB — fall back to local store if it's down
  connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 KFLIX server listening on http://localhost:${config.port}`);
  });
}

start();