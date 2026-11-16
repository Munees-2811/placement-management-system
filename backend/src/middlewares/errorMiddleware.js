// Known allowed origins (must stay in sync with app.js corsOptions)
const CORS_SAFE_ORIGINS = [
  'https://placementmanagementsystem1.netlify.app',
  'https://placementmanagementportal.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  const normalized = origin.trim().replace(/\/+$/, '');
  if (CORS_SAFE_ORIGINS.includes(normalized)) return true;
  // Check CLIENT_URL env var at runtime
  if (process.env.CLIENT_URL) {
    const extras = process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/+$/, ''));
    if (extras.includes(normalized)) return true;
  }
  // Allow all Netlify deployments (production sites, branch deploys, preview builds)
  if (/^https:\/\/([a-z0-9-]+--)?([a-z0-9-]+)\.netlify\.app$/i.test(normalized)) return true;
  return false;
};

// Handle 404 Route Not Found
export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
// IMPORTANT: Always sets CORS headers on error responses so the browser can read
// the actual error message instead of silently failing with a "CORS error".
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Defensively set CORS headers on every error response.
  // The cors() middleware sets them for successful requests, but error paths
  // (thrown exceptions, 404s) can reach here before the response is flushed.
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
