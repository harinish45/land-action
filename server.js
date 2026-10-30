import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './src/app.js';
import { PORT, IS_VERCEL, SERVER_INFO } from './src/config.js';

/**
 * Entry point. All behaviour lives in src/:
 *   src/app.js            wiring (routes, middleware, static)
 *   src/data/registry.js  JSON registers
 *   src/domain/           parcel resolution
 *   src/services/         tool runner, verify report, chat
 *   src/mcp/mcp-core.js   single MCP implementation (HTTP + SSE + stdio)
 */
const app = createApp();

export function start(port = PORT) {
  const server = app.listen(port, () => {
    console.log('=======================================================');
    console.log(` ${SERVER_INFO.name} - Open Land Intelligence (100% Free)`);
    console.log(` Web Server listening on: http://localhost:${port}`);
    console.log(` MCP Endpoint active at:  http://localhost:${port}/mcp`);
    console.log(` Health check:            http://localhost:${port}/health`);
    console.log('=======================================================');
  });

  // Graceful shutdown: finish in-flight requests, then exit.
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

// Auto-start only when run directly (node server.js), not when imported
// by tests or the Vercel handler (api/index.js).
const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && !IS_VERCEL) start();

export default app;
