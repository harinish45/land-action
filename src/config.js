import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

/** Absolute project root (src/ is one level below root). */
export const ROOT = path.resolve(path.dirname(__filename), '..');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const DATA_DIR = path.join(PUBLIC_DIR, 'data');

export const PORT = Number(process.env.PORT) || 3000;
export const IS_VERCEL = process.env.VERCEL === '1';
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const SERVER_INFO = Object.freeze({
  name: 'LandAction MCP Server',
  version: '1.0.0',
  description: 'Open Land Intelligence for Tamil Nadu - 156 tools, 100% Free',
  protocolVersion: '2024-11-05'
});
