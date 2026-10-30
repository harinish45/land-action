import { SERVER_INFO, NODE_ENV } from '../config.js';

/** Basic security headers (no new dependencies). */
export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

/** Compact access log; silent for static assets in production. */
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (NODE_ENV === 'production' && res.statusCode < 400 && !req.path.startsWith('/api') && req.path !== '/mcp') return;
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}

/** JSON 404 for unknown API routes (instead of falling through to the SPA). */
export function apiNotFound(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    hint: 'See GET /api/v1/tools for the tool catalog, POST /mcp for JSON-RPC.'
  });
}

/** Central error handler: always JSON, 500 without leaking stack traces. */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    status: 'error',
    message: err.message || 'Internal server error'
  };
  if (err.type === 'entity.parse.failed') {
    payload.status = 'error';
    payload.message = 'Invalid JSON body';
  }
  if (status >= 500) {
    console.error('[error]', err);
    if (NODE_ENV !== 'production') payload.stack = err.stack;
  }
  res.status(status === 400 && err.type === 'entity.parse.failed' ? 400 : status).json(payload);
}

/** GET /health — liveness/readiness for Render, Vercel and monitors. */
export function healthHandler(_req, res) {
  res.json({
    status: 'ok',
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    uptime_s: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
}
