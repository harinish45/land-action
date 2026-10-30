// Audits DOM wiring: every getElementById used by public/js/*.js must exist
// as an id in public/index.html (or be created at runtime), and every module
// app.js calls must be exported.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const html = readFileSync('public/index.html', 'utf8');
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

const runtimeCreated = new Set([
  'mini-run-query', 'mini-run-value', 'mini-run-btn', 'mini-run-result',
  'generic-tool-title', 'generic-tool-desc'
]);

const missing = [];
for (const f of readdirSync('public/js')) {
  if (!f.endsWith('.js')) continue;
  const src = readFileSync(join('public/js', f), 'utf8');
  for (const m of src.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)) {
    const id = m[1];
    if (!htmlIds.has(id) && !runtimeCreated.has(id)) missing.push(`${f}: #${id}`);
  }
}

if (missing.length) {
  console.log('MISSING DOM IDS (' + missing.length + '):');
  [...new Set(missing)].forEach(m => console.log('  ' + m));
} else {
  console.log('All getElementById targets exist in index.html OK');
}

const appSrc = readFileSync('public/js/app.js', 'utf8');
const called = [...appSrc.matchAll(/window\.([A-Za-z]+)\.(init|switchTo)/g)].map(m => m[1]);
const exported = new Set();
for (const f of readdirSync('public/js')) {
  if (!f.endsWith('.js')) continue;
  const src = readFileSync(join('public/js', f), 'utf8');
  for (const m of src.matchAll(/window\.([A-Za-z]+) *=/g)) exported.add(m[1]);
}
const missingModules = [...new Set(called)].filter(n => !exported.has(n));
console.log(missingModules.length
  ? 'MISSING MODULES called by app.js: ' + missingModules.join(', ')
  : 'All modules referenced by app.js are exported OK');

process.exit(missing.length || missingModules.length ? 1 : 0);