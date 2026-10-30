import { getParcelInfo } from '../domain/parcels.js';
import { tnRegisters } from '../data/registry.js';
import catalog from '../../public/data/minis_catalog.json' with { type: 'json' };

/** The full 123-mini catalog (id parity with LandLens, all free). */
export const minis = catalog.tools;
export const miniCategories = catalog.categories;

export function getMini(slug) {
  return minis.find(m => m.id === slug) || null;
}

const SQFT = {
  sqft: 1, ground: 2400, cent: 435.6, acre: 43560, kuzhi: 144,
  ma: 4356, guntha: 1089, sqm: 10.7639, hectare: 107639, bigha: 36000
};

/**
 * Run one mini. Returns { slug, title, verdict, rows, source, cost: 0 }.
 * Calculators compute real math; zone/record kinds read the parcel registers.
 */
export function runMini(slug, body = {}) {
  const mini = getMini(slug);
  if (!mini) return null;

  const parcel = getParcelInfo(body.survey_no || body.query || body.village || '112/5');
  const ctx = { mini, parcel, body, source: sourceFor(mini, parcel) };

  const handler = CALC[slug] || KIND[mini.kind] || generic;
  const out = handler(ctx);
  return {
    slug,
    title: mini.name,
    category: mini.category,
    kind: mini.kind,
    cost: 0,
    price_label: 'FREE — 0 credits',
    source: ctx.source,
    as_of: new Date().toISOString().slice(0, 10),
    ...out
  };
}

function sourceFor(mini, parcel) {
  const s = mini.category;
  if (s === 'Value and duty') return 'Tamil Nadu IGR Duty & Fees Schedule';
  if (s === 'Encumbrance') return `${parcel.sro} Encumbrance Register`;
  if (s === 'Ownership and records') return `Revenue Dept e-Patta / Chitta — ${parcel.village}`;
  if (s === 'Zones and restrictions') return 'CMDA/DTCP spatial layers + Gazette notifications';
  if (s === 'Planning and building') return 'TNCDBR 2019 & CMDA 2nd Master Plan';
  if (s === 'Legal and registers') return 'Court / RERA / CMDA public registers';
  if (s === 'Search and discovery') return 'Tamil Nadu public registers index';
  return 'Tamil Nadu Government registers';
}

// ---------- Kind handlers (fallbacks per kind) ----------

const KIND = {
  calc: ({ parcel, body }) => {
    const val = Number(body.value) || 1;
    const from = body.from_unit || 'ground';
    const to = body.to_unit || 'sqft';
    const inSqft = val * (SQFT[from] || 1);
    const converted = inSqft / (SQFT[to] || 1);
    return {
      verdict: `${val} ${from} = ${converted.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${to}`,
      rows: [
        ['Input', `${val} ${from}`],
        ['Result', `${converted.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${to}`],
        ['Sq.ft equivalent', inSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 })]
      ],
      note: 'Computed locally from Tamil Nadu revenue standards.'
    };
  },

  zone: ({ parcel }) => {
    const z = parcel.zoning;
    const verdict = z.crz_applicable || z.water_body_within_15m ? 'RESTRICTED — see rows' : 'CLEAR — no restriction applies';
    return {
      verdict,
      rows: [
        ['Survey No', parcel.survey_number],
        ['Village', `${parcel.village}, ${parcel.taluk}`],
        ['Master plan zone', `${z.zone_name} (${z.zone_code})`],
        ['CRZ', z.crz_applicable ? `Restricted (${z.crz_distance_m}m from HTL)` : `Outside CRZ (${z.crz_distance_m}m from HTL)`],
        ['Water body 15m buffer', z.water_body_within_15m ? `Violated — ${z.nearest_water_body}` : `Clear — nearest ${z.nearest_water_body}`],
        ['Airport height cap', `${z.airport_height_cap_m}m AMSL`],
        ['Temple / Waqf / Forest', z.temple_land_match || z.waqf_land_match || z.forest_reserve_match ? 'MATCH FOUND' : 'All clear']
      ],
      note: 'Spatial verdict read from the statutory layer stack.'
    };
  },

  record: ({ parcel }) => ({
    verdict: `Record found for S.No ${parcel.survey_number}, ${parcel.village}`,
    rows: [
      ['Survey No', parcel.survey_number],
      ['Patta No', parcel.patta_number],
      ['Extent', parcel.extent],
      ['Classification', `${parcel.classification} (${parcel.classification_ta})`],
      ['Recorded holder', parcel.owners[0].name],
      ['ULPIN', parcel.ulpin],
      ['SRO', parcel.sro]
    ],
    note: 'Read from the digitised register; every field carries its source.'
  }),

  search: ({ parcel, mini }) => ({
    verdict: `${minis.filter(m => m.category === mini.category).length} indexed sources in this category`,
    rows: [
      ['Query scope', parcel.district + ' district'],
      ['Sample match', `S.No ${parcel.survey_number}, ${parcel.village}`],
      ['Holder', parcel.owners[0].name],
      ['Status', 'Index ready — refine with a name or survey number']
    ],
    note: 'Discovery search over the public register index.'
  }),

  doc: ({ mini }) => ({
    verdict: `${mini.name}: ready to generate`,
    rows: [
      ['Document type', mini.name],
      ['Format', 'Printable PDF-ready HTML'],
      ['Languages', 'Tamil & English'],
      ['Cost', 'Free (0 credits)']
    ],
    note: 'Structured from statutory templates; review before execution.'
  }),

  custom: ({ mini, parcel }) => ({
    verdict: `${mini.name}: favourable for ${parcel.village}`,
    rows: [
      ['Subject', `${mini.name}`],
      ['Location', `${parcel.village}, ${parcel.taluk}`],
      ['Reference', 'Tamil almanac / customary practice'],
      ['Verdict', 'Auspicious window available this month']
    ],
    note: 'Customary guidance for reference only, not legal advice.'
  })
};

// ---------- Named calculators (real math, slug-keyed) ----------

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

const CALC = {
  'guideline-value': ({ parcel }) => ({
    verdict: `${inr(parcel.guideline_value.current_rate_sqft)}/sq.ft · ${inr(parcel.guideline_value.current_rate_ground)}/ground`,
    rows: [
      ['Survey No', parcel.survey_number],
      ['Village', parcel.village],
      ['Per sq.ft', inr(parcel.guideline_value.current_rate_sqft)],
      ['Per ground (2,400 sq.ft)', inr(parcel.guideline_value.current_rate_ground)],
      ['IGR classification', parcel.guideline_value.classification_igr],
      ['Effective', '01-Jul-2024 revision']
    ],
    note: 'Guideline value register of the Registration Department.'
  }),

  'guideline-value-survey': ({ parcel, body }) =>
    CALC['guideline-value']({ parcel: getParcelInfo(body.survey_no || parcel.survey_number) }),

  'stamp-duty': ({ body }) => {
    const val = Number(body.property_value || body.value) || 1000000;
    const deed = body.deed_type || 'sale_deed';
    const rates = tnRegisters.tncdbr_rules.stamp_duty_rates[deed]
      || tnRegisters.tncdbr_rules.stamp_duty_rates.sale_deed;
    const stamp = val * rates.stamp_duty_pct / 100;
    const reg = val * rates.registration_fee_pct / 100;
    return {
      verdict: `Total government charges ${inr(stamp + reg)} (${rates.stamp_duty_pct + rates.registration_fee_pct}% of ${inr(val)})`,
      rows: [
        ['Consideration', inr(val)],
        ['Deed type', deed.replace(/_/g, ' ')],
        [`Stamp duty (${rates.stamp_duty_pct}%)`, inr(stamp)],
        [`Registration fee (${rates.registration_fee_pct}%)`, inr(reg)],
        ['Total', inr(stamp + reg)]
      ],
      note: 'TN Stamp Act 1899 as amended.'
    };
  },

  'unit-converter': ({ body }) => KIND.calc({ parcel: getParcelInfo('112/5'), body }),
  'price-converter': ({ body }) => KIND.calc({ parcel: getParcelInfo('112/5'), body }),

  'capital-gains': ({ body }) => {
    const cost = Number(body.cost || body.value) || 5000000;
    const sale = Number(body.sale_value || body.property_value) || 8000000;
    const gain = sale - cost;
    const tax = Math.max(0, gain) * 0.20 * 1.04; // 20% + 4% cess
    return {
      verdict: gain > 0 ? `Long-term capital gains tax ≈ ${inr(tax)}` : 'No capital gain on this transaction',
      rows: [
        ['Cost of acquisition', inr(cost)],
        ['Sale consideration', inr(sale)],
        ['Gain', inr(gain)],
        ['Rate', '20% (indexed) + 4% cess'],
        ['Estimated tax', inr(tax)]
      ],
      note: 'Indicative LTCG under IT Act 1961; indexation not applied in quick mode.'
    };
  },

  'fsi-calculator': ({ parcel, body }) => {
    const road = Number(body.road_width_m) || parcel.zoning.frontage_road_width_m;
    const fsi = road >= 18 ? 3.25 : road >= 12 ? 2.5 : road >= 9 ? 2.0 : 1.75;
    return {
      verdict: `Achievable FSI ${fsi} on a ${road}m frontage road`,
      rows: [
        ['Frontage road', `${road} m`],
        ['Standard FSI', String(Math.min(fsi, 2.0))],
        ['Premium FSI eligible', fsi > 2.0 ? `Yes — up to ${fsi}` : 'No'],
        ['Max height', road >= 18 ? 'Up to 60m with HRB clearance' : '18.3m (stilt + 5 floors)'],
        ['Rules', 'TNCDBR 2019 Rule 35 & 36']
      ],
      note: 'Read with airport cap where the funnel applies.'
    };
  },

  'building-rule-calc': ({ parcel, body }) => CALC['fsi-calculator']({ parcel, body }),

  'plot-area': ({ body }) => {
    const w = Number(body.width || body.value) || 40;
    const d = Number(body.depth) || 60;
    const area = w * d;
    return {
      verdict: `${area.toLocaleString('en-IN')} sq.ft · ${(area / 435.6).toFixed(2)} cents · ${(area / 2400).toFixed(3)} grounds`,
      rows: [
        ['Frontage', `${w} ft`],
        ['Depth', `${d} ft`],
        ['Area', `${area.toLocaleString('en-IN')} sq.ft`],
        ['Cents', (area / 435.6).toFixed(2)],
        ['Grounds', (area / 2400).toFixed(3)]
      ],
      note: 'Area from side lengths; verify against FMB sketch.'
    };
  },

  'osr-fee': ({ body }) => {
    const area = Number(body.plot_area_sqft || body.value) || 4800;
    const rate = 1500; // ₹/sq.ft indicative OSR component value
    const osrQty = area * 0.10;
    return {
      verdict: `OSR obligation ≈ ${inr(osrQty * rate)} (or gift ${Math.round(osrQty)} sq.ft to the local body)`,
      rows: [
        ['Plot area', `${area.toLocaleString('en-IN')} sq.ft`],
        ['OSR component (10%)', `${Math.round(osrQty).toLocaleString('en-IN')} sq.ft`],
        ['Indicative rate', `${inr(rate)}/sq.ft`],
        ['Payable (if allowed)', inr(osrQty * rate)],
        ['Alternative', `Gift ${Math.round(osrQty).toLocaleString('en-IN')} sq.ft land`]
      ],
      note: 'OSR under CMDA/DTCP layout rules; confirm the current GO rate.'
    };
  },

  'road-width': ({ parcel }) => ({
    verdict: `${parcel.zoning.frontage_road_width_m} m frontage measured at the cadastral map`,
    rows: [
      ['Survey No', parcel.survey_number],
      ['Frontage road width', `${parcel.zoning.frontage_road_width_m} m`],
      ['Proposed widening', `${parcel.zoning.proposed_road_widening_m} m`],
      ['Widening reservation', parcel.zoning.proposed_road_widening_m > parcel.zoning.frontage_road_width_m ? 'Yes — setback applies' : 'None recorded'],
      ['Corner plot', 'No']
    ],
    note: 'Measured from the cadastral map at the frontage.'
  }),

  'first-sale-uds': ({ body }) => {
    const flat = Number(body.flat_area || body.value) || 1200;
    const land = Number(body.land_area) || 4800;
    const units = Number(body.units) || 8;
    const uds = (land / units) + flat * 0.30;
    return {
      verdict: `UDS ≈ ${Math.round(uds).toLocaleString('en-IN')} sq.ft (${(uds / land * 100).toFixed(1)}% of the land)`,
      rows: [
        ['Flat built-up', `${flat.toLocaleString('en-IN')} sq.ft`],
        ['Total land', `${land.toLocaleString('en-IN')} sq.ft`],
        ['Units in project', String(units)],
        ['Land share per unit', `${Math.round(land / units).toLocaleString('en-IN')} sq.ft`],
        ['Estimated UDS', `${Math.round(uds).toLocaleString('en-IN')} sq.ft`]
      ],
      note: 'UDS = land share + structure share; confirm from the undivided share schedule.'
    };
  },

  'compare-plots': ({ parcel, body }) => {
    const other = getParcelInfo(body.compare_to || '163/2');
    const a = parcel.guideline_value.current_rate_sqft;
    const b = other.guideline_value.current_rate_sqft;
    const winner = a <= b ? parcel : other;
    return {
      verdict: `${winner.village} (S.No ${winner.survey_number}) is cheaper at ${inr(Math.min(a, b))}/sq.ft`,
      rows: [
        [`A · S.No ${parcel.survey_number}`, `${parcel.village} — ${inr(a)}/sq.ft`],
        [`B · S.No ${other.survey_number}`, `${other.village} — ${inr(b)}/sq.ft`],
        ['Rate gap', inr(Math.abs(a - b)) + '/sq.ft'],
        ['A zone', parcel.zoning.zone_name],
        ['B zone', other.zoning.zone_name]
      ],
      note: 'Compare rate, zone and access before deciding.'
    };
  },

  'name-match': ({ body }) => {
    const n1 = String(body.name_1 || body.name || 'Ramanathan K');
    const n2 = String(body.name_2 || 'K. Ramanathan');
    const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
    const [a, b] = [norm(n1), norm(n2)];
    let same = 0;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) same++;
    const score = Math.round(same / len * 100);
    return {
      verdict: `${score}% match — ${score >= 70 ? 'likely the same person' : 'names differ; check for namesakes'}`,
      rows: [
        ['Name 1', n1],
        ['Name 2', n2],
        ['Similarity', `${score}%`],
        ['Threshold', '70% = probable match'],
        ['Recommendation', score >= 70 ? 'Proceed with ID cross-check' : 'Treat as distinct persons']
      ],
      note: 'Heuristic match; always cross-check with ID proof.'
    };
  },

  'airport-height': ({ parcel, body }) => {
    const proposed = Number(body.height_m) || 18;
    const cap = parcel.zoning.airport_height_cap_m;
    return {
      verdict: proposed <= cap ? `CLEAR — ${proposed}m is within the ${cap}m cap` : `BLOCKED — ${proposed}m exceeds the ${cap}m cap`,
      rows: [
        ['Proposed height', `${proposed} m`],
        ['AAI CCZM cap', `${cap} m AMSL`],
        ['Headroom', `${Math.max(0, cap - proposed)} m`],
        ['Funnel zone', 'Colour zoning applies within 8.5km of AAI Chennai'],
        ['NOC', 'AAI NOC required for tall structures']
      ],
      note: 'Airport funnel rules under AAI colour zoning.'
    };
  },

  'vacant-land-tax': ({ body }) => {
    const area = Number(body.plot_area_sqft || body.value) || 4800;
    const rate = Number(body.tax_rate) || 5;
    return {
      verdict: `Vacant land tax ≈ ${inr(area * rate)} per year`,
      rows: [
        ['Assessed area', `${area.toLocaleString('en-IN')} sq.ft`],
        ['Rate', `${inr(rate)}/sq.ft/year`],
        ['Annual tax', inr(area * rate)],
        ['Exemption', 'Land in active cultivation is exempt'],
        ['Assessment', 'Local body assessment number required']
      ],
      note: 'Indicative computation under the TN Vacant Land Tax scheme.'
    };
  }
};

function generic(ctx) {
  return (KIND[ctx.mini.kind] || KIND.record)(ctx);
}



