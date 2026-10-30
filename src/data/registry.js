import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../config.js';

/**
 * Data layer: single place that reads the JSON registers. Loaded once at
 * startup, shared by REST routes, MCP transports and the stdio server.
 */
function readJson(name, fallback = null) {
  const file = path.join(DATA_DIR, name);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (fallback !== null) return fallback;
    throw new Error(`Failed to load data file ${name}: ${err.message}`);
  }
}

export const tnRegisters = readJson('tn_registers.json');
export const toolsCatalog = readJson('tools_catalog.json');
export const statePortals = readJson('state_portals.json', { states: [] });

export const tools = toolsCatalog.tools ?? [];
export const states = statePortals.states ?? [];
