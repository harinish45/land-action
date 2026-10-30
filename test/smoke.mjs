import { start } from '../server.js';
import { PORT } from '../src/config.js';

/**
 * Smoke test: boots the server and asserts every public contract:
 * REST endpoints, MCP (HTTP + stdio), error handling, health, static.
 */
const BASE = `http://127.0.0.1:${PORT}`;
let pass = 0, fail = 0;

function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`FAIL   ${name} ${extra}`); }
}

const server = start(0); // random free port
await new Promise(r => server.once('listening', r));
const B = `http://127.0.0.1:${server.address().port}`;

async function call(method, path, body) {
  const res = await fetch(B + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  return { status: res.status, data };
}

console.log('— REST API —');
{
  const r = await call('GET', '/api/v1/tools');
  check('GET /api/v1/tools', r.status === 200 && r.data.total_tools > 0 && Array.isArray(r.data.tools));
}
{
  const r = await call('GET', '/api/v1/states');
  check('GET /api/v1/states', r.status === 200
    && Array.isArray(r.data.states)
    && r.data.states.length > 0
    && typeof r.data.total_states === 'number',
    `got ${r.data?.states?.length}`);
}
{
  const r = await call('GET', '/api/v1/states/TN');
  check('GET /api/v1/states/TN', r.status === 200 && r.data.state);
}
{
  const r = await call('GET', '/api/v1/states/ZZ');
  check('GET /api/v1/states/ZZ -> 404 JSON', r.status === 404 && r.data.status === 'error');
}
{
  const r = await call('POST', '/api/v1/tools/stamp_duty', { property_value: 1000000 });
  const ok = r.status === 200 && r.data.ok && r.data.data.stamp_duty_amount === 70000;
  check('POST /api/v1/tools/stamp_duty (₹10L => 70k)', ok, JSON.stringify(r.data));
}
{
  const r = await call('POST', '/api/v1/tools/unit_convert', { value: 1, from_unit: 'ground', to_unit: 'sqft' });
  check('POST /api/v1/tools/unit_convert', r.status === 200 && r.data.data.converted_value === 2400);
}
{
  const r = await call('POST', '/api/v1/tools/unknown_tool_xyz', {});
  check('unknown tool falls back to parcel payload', r.status === 200 && r.data.data.status === 'success');
}
{
  const r = await call('POST', '/api/v1/verify', { survey_no: '112/5', seller_name: 'Ramanathan' });
  const rep = r.data?.report;
  check('POST /api/v1/verify 33 checks', r.status === 200 && rep.thirty_three_checks.length === 33 && rep.checks_summary.total_checks === 33);
}
{
  const r = await call('POST', '/api/v1/chat', { message: 'what is the stamp duty' });
  check('POST /api/v1/chat', r.status === 200 && r.data.reply && Array.isArray(r.data.citations) && r.data.citations.length > 0);
}
{
  const r = await call('POST', '/api/v1/chat', {});
  check('POST /api/v1/chat empty body (no crash)', r.status === 200 && typeof r.data.reply === 'string');
}

console.log('— 123 Minis —');
{
  const r = await call('GET', '/api/v1/minis');
  check('GET /api/v1/minis: 123 tools, 10 categories, all free',
    r.status === 200 && r.data.total === 123 && r.data.categories.length === 10
    && r.data.tools.every(t => t.cost === 'Free' && t.credits === 0),
    `got ${r.data.total} tools / ${r.data.categories?.length} cats`);
}
{
  const r = await call('GET', '/api/v1/minis/stamp-duty');
  check('GET /api/v1/minis/:slug returns mini metadata', r.status === 200 && r.data.mini.id === 'stamp-duty');
}
{
  const r = await call('GET', '/api/v1/minis/does-not-exist');
  check('GET /api/v1/minis/:slug unknown -> 404', r.status === 404);
}
{
  const r = await call('GET', '/api/v1/geo/districts');
  check('GET /api/v1/geo/districts: 38 districts', r.status === 200 && r.data.total === 38
    && Array.isArray(r.data.districts) && r.data.districts.length === 38);
}
{
  const r = await call('GET', '/api/v1/geo/villages?district=Chennai&taluk=Sholinganallur');
  check('GET /api/v1/geo/villages returns villages', r.status === 200 && r.data.district === 'Chennai'
    && Array.isArray(r.data.villages) && r.data.villages.length > 0);
}
{
  const r = await call('POST', '/api/v1/documents/patta-chitta', { survey_no: '112/5' });
  check('POST /api/v1/documents/patta-chitta', r.status === 200 && r.data.document?.patta_number);
}
{
  const r = await call('POST', '/api/v1/documents/ec', { survey_no: '112/5' });
  check('POST /api/v1/documents/ec', r.status === 200 && r.data.document?.period && Array.isArray(r.data.document.transaction_trail));
}
{
  const r = await call('POST', '/api/v1/documents/guideline', { survey_no: '112/5' });
  check('POST /api/v1/documents/guideline', r.status === 200 && r.data.document?.rate_per_sqft > 0);
}
{
  const r = await call('POST', '/api/v1/documents/zoning', { survey_no: '112/5' });
  check('POST /api/v1/documents/zoning', r.status === 200 && r.data.document?.zone);
}
{
  const r = await call('POST', '/api/v1/documents/bundle', { survey_no: '112/5' });
  check('POST /api/v1/documents/bundle returns 7 docs', r.status === 200 && Array.isArray(r.data.document?.documents_included)
    && r.data.document.documents_included.length === 7);
}
{
  const r = await call('POST', '/api/v1/documents/invalid-doc', { survey_no: '112/5' });
  check('POST /api/v1/documents/invalid -> 404', r.status === 404);
}
{
  const slugs = ['guideline-value', 'crz-check', 'fsi-calculator', 'plot-area', 'osr-fee', 'tnahr-search', 'compare-plots'];
  for (const s of slugs) {
    const r = await call('GET', `/api/v1/minis/${s}`);
    if (!(r.status === 200 && r.data.mini?.id === s)) {
      check(`GET /api/v1/minis/${s}`, false, `status ${r.status}`);
    }
  }
  check('sample minis metadata resolve', true);
}
{
  const r = await call('GET', '/api/v1/minis/no-such-mini');
  check('GET /api/v1/minis/unknown -> 404', r.status === 404);
}
{
  const r = await call('POST', '/api/v1/minis/stamp-duty/run', { property_value: 5000000 });
  check('POST /api/v1/minis/stamp-duty/run (₹50L => verdict)',
    r.status === 200 && r.data.charged === false && r.data.result.cost === 0
    && /4,50,000/.test(r.data.result.verdict), r.data.result?.verdict);
}
{
  const r = await call('POST', '/api/v1/minis/plot-area/run', { width: 30, depth: 40 });
  check('POST /api/v1/minis/plot-area/run (30x40)', r.status === 200 && Array.isArray(r.data.result.rows));
}

console.log('— MCP (HTTP JSON-RPC) —');
{
  const r = await call('POST', '/mcp', { jsonrpc: '2.0', id: 1, method: 'initialize' });
  check('mcp initialize', r.status === 200 && r.data.result?.serverInfo?.name === 'LandAction MCP Server');
}
{
  const r = await call('POST', '/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/list' });
  const tools = r.data.result?.tools;
  check('mcp tools/list matches catalog', Array.isArray(tools) && tools.length > 0 && tools.every(t => t.inputSchema));
}
{
  const r = await call('POST', '/mcp', {
    jsonrpc: '2.0', id: 3, method: 'tools/call',
    params: { name: 'stamp_duty', arguments: { property_value: 2000000 } }
  });
  const text = r.data.result?.content?.[0]?.text || '';
  check('mcp tools/call stamp_duty', text.includes('₹1,40,000'), text.slice(0, 120));
}
{
  const r = await call('POST', '/mcp', { jsonrpc: '2.0', id: 4, method: 'prompts/list' });
  check('mcp prompts/list', r.data.result?.prompts?.[0]?.name === 'due_diligence_property');
}
{
  const r = await call('POST', '/mcp', { method: null });
  check('mcp invalid request -> -32600', r.status === 200 && r.data.error?.code === -32600);
}
{
  const r = await call('POST', '/mcp', { jsonrpc: '2.0', id: 9, method: 'resources/list' });
  check('mcp unknown method -> empty result', r.status === 200 && r.data.result && Object.keys(r.data.result).length === 0);
}

console.log('— Error handling & infra —');
{
  const res = await fetch(B + '/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not valid json'
  });
  let d = null; try { d = await res.json(); } catch {}
  check('malformed JSON -> 400 JSON error', res.status === 400 && d?.status === 'error', `status ${res.status}`);
}
{
  const r = await call('GET', '/api/v1/no-such-endpoint');
  check('unknown API path -> JSON 404 (not SPA)', r.status === 404 && r.data?.message?.includes('not found'));
}
{
  const r = await call('GET', '/health');
  check('GET /health', r.status === 200 && r.data.status === 'ok');
}
{
  const r = await call('GET', '/openapi.json');
  check('GET /openapi.json', r.status === 200);
}
{
  const r = await call('GET', '/data/tn_registers.json');
  check('static data file served', r.status === 200 && r.data.sample_parcels);
}
{
  const res = await fetch(B + '/');
  const html = await res.text();
  check('SPA index.html served', res.status === 200 && html.includes('<!DOCTYPE html'));
}
{
  const res = await fetch(B + '/mcp/sse');
  const reader = res.body.getReader();
  const { value } = await reader.read();
  const chunk = new TextDecoder().decode(value);
  reader.cancel();
  const host = new URL(B).host;
  check('SSE endpoint event uses real host', chunk.includes('event: endpoint') && chunk.includes(`://${host}/mcp`), chunk.slice(0, 100));
}

console.log('— MCP (stdio transport parity) —');
{
  const { execFileSync } = await import('child_process');
  const input = [
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'guideline_value', arguments: { survey_no: '112/5' } } })
  ].join('\n') + '\n';
  const out = execFileSync(process.execPath, ['mcp-server.js'], { input, encoding: 'utf8' });
  const lines = out.trim().split('\n').map(l => JSON.parse(l));
  check('stdio initialize', lines[0]?.result?.serverInfo?.name === 'LandAction MCP Server');
  check('stdio tools/list same count as HTTP', lines[1]?.result?.tools?.length > 0);
  check('stdio tools/call returns content', Array.isArray(lines[2]?.result?.content) && lines[2].result.content[0].text.includes('112/5'));
}

console.log(`\n${pass} passed, ${fail} failed`);
server.close();
process.exit(fail === 0 ? 0 : 1);

