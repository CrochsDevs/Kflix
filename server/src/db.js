const mongoose = require('mongoose');
const config = require('./config');

let connected = false;

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    connected = true;
    console.log('✅ MongoDB connected:', config.mongoUri.replace(/:[^:@/]+@/, ':***@'));
  } catch (err) {
    connected = false;
    console.warn('⚠️ MongoDB not available, falling back to local JSON store:', err.message);
    console.warn('   → Watchlist and history will be stored in server/data/*.json');
  }
}

function isConnected() {
  return connected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected };