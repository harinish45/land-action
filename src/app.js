import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PUBLIC_DIR } from './config.js';
import {
  securityHeaders, requestLogger, apiNotFound, errorHandler, healthHandler
} from './http/middleware.js';
import { apiRouter } from './http/routes-api.js';
import { mcpRouter } from './http/routes-mcp.js';

/**
 * Application factory — pure wiring, no side effects (no listen()).
 * Used by server.js locally and by api/index.js on Vercel.
 */
export function createApp() {
  const app = express();

  app.use(securityHeaders);
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(requestLogger);
  app.use(express.static(PUBLIC_DIR));

  app.get('/health', healthHandler);

  // OpenAPI spec for ChatGPT Actions & Custom GPTs
  app.get('/openapi.json', (_req, res) => {
    const openApiPath = path.join(PUBLIC_DIR, 'openapi.json');
    if (!fs.existsSync(openApiPath)) {
      return res.status(404).json({ error: 'OpenAPI spec not found' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(openApiPath);
  });

  app.use('/api/v1', apiRouter);
  app.use(mcpRouter);

  // Unknown API paths must 404 as JSON, never fall through to the SPA.
  app.use('/api', apiNotFound);

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });

  app.use(errorHandler);
  return app;
}
