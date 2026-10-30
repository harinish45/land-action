const BASE = 'http://127.0.0.1:3000';
let pass = 0, fail = 0;

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, data };
}

function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`FAIL   ${name} ${extra}`); }
}

console.log('— POST endpoints —');

{
  const r = await post('/api/v1/verify', { survey_no: '112/5', seller_name: 'Ramanathan K' });
  check('POST /api/v1/verify', r.status === 200 && r.data.ok && r.data.report?.thirty_three_checks?.length === 33, JSON.stringify(r.data).slice(0,200));
}

{
  const r = await post('/api/v1/chat', { message: 'what is the stamp duty' });
  check('POST /api/v1/chat', r.status === 200 && r.data.reply && Array.isArray(r.data.citations));
}

{
  const r = await post('/api/v1/tools/stamp_duty', { property_value: 1000000 });
  check('POST /api/v1/tools/stamp_duty', r.status === 200 && r.data.data?.stamp_duty_amount === 70000);
}

{
  const r = await post('/api/v1/tools/unit_convert', { value: 1, from_unit: 'ground', to_unit: 'sqft' });
  check('POST /api/v1/tools/unit_convert', r.status === 200 && r.data.data?.converted_value === 2400);
}

{
  const r = await post('/api/v1/minis/stamp-duty/run', { property_value: 5000000 });
  check('POST /api/v1/minis/stamp-duty/run', r.status === 200 && r.data.charged === false && /4,50,000/.test(r.data.result.verdict), r.data.result?.verdict);
}

{
  const r = await post('/api/v1/minis/plot-area/run', { width: 30, depth: 40 });
  check('POST /api/v1/minis/plot-area/run', r.status === 200 && Array.isArray(r.data.result.rows));
}

{
  const r = await post('/api/v1/minis/crz-check/run', { survey_no: '112/5' });
  check('POST /api/v1/minis/crz-check/run', r.status === 200 && r.data.result.cost === 0);
}

{
  const r = await post('/api/v1/minis/osr-fee/run', { plot_area_sqft: 4800 });
  check('POST /api/v1/minis/osr-fee/run', r.status === 200 && Array.isArray(r.data.result.rows));
}

{
  const r = await post('/api/v1/minis/compare-plots/run', { compare_to: '163/2' });
  check('POST /api/v1/minis/compare-plots/run', r.status === 200 && Array.isArray(r.data.result.rows));
}

{
  const r = await post('/api/v1/minis/no-such-mini/run', {});
  check('POST /api/v1/minis/unknown/run -> 404', r.status === 404);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
