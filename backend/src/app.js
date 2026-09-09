const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');

const app = express();

const path = require('path');
const fs = require('fs');

// Enable CORS for local development ports, CLIENT_URL, and cloud domains (*.onrender.com, *.vercel.app)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// Master API Routes
app.use('/api/v1', apiRoutes);

// Optional Monolith Mode: Serve built frontend from frontend/dist if present
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root route for API-only deployment
  app.get('/', (req, res) => {
    res.json({
      name: 'EventPass Backend API',
      version: '1.0.0',
      status: 'active',
      documentation: '/api/v1/health',
    });
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

module.exports = app;
