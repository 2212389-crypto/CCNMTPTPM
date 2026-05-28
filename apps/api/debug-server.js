// Simple test server for debugging
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('=== DEBUG INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('=================');

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Manager API - Debug Mode',
    status: 'running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    port: PORT
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    debug: true
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log(`🌐 Available at: http://localhost:${PORT}`);
});