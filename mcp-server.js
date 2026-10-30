#!/usr/bin/env node
/**
 * LandAction MCP Server (Stdio Transport)
 * Thin wrapper — all MCP logic lives in src/mcp/mcp-core.js, shared with the
 * HTTP transport, so the two can never drift apart.
 * Compatible with Claude Desktop, Cursor, Claude Code, Windsurf, ChatGPT.
 */
import readline from 'readline';
import { handleMcpRequest } from './src/mcp/mcp-core.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const response = handleMcpRequest(request);
    // Notifications (no id) get no response per JSON-RPC 2.0.
    if (response && request.id !== undefined) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    process.stderr.write(`Error handling MCP request: ${err.message}\n`);
    process.stdout.write(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' }
    }) + '\n');
  }
});

rl.on('close', () => process.exit(0));
