import { Router } from 'express';
import { handleMcpRequest } from '../mcp/mcp-core.js';

export const mcpRouter = Router();

// HTTP JSON-RPC 2.0 transport
mcpRouter.post('/mcp', (req, res) => {
  const response = handleMcpRequest(req.body);
  res.json(response);
});

// SSE transport: endpoint event must reflect the actual host (was hardcoded
// to localhost, which broke every non-local deployment).
mcpRouter.get('/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || `localhost:${process.env.PORT || 3000}`;
  const endpointUrl = `${proto}://${host}/mcp`;
  res.write(`event: endpoint\ndata: ${endpointUrl}\n\n`);

  const keepAlive = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(keepAlive);
    res.end();
  });
});
