import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const DATA_DIR = path.resolve(path.dirname(__filename), '..', '..', 'public', 'data');

const tnData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tn_registers.json'), 'utf8'));
const DISTRICTS = tnData.districts || [];

const VILLAGES = {};
for (const d of DISTRICTS) {
  VILLAGES[d.name] = {};
  for (const t of d.taluks) {
    VILLAGES[d.name][t] = [t + ' Village', t + ' East', t + ' West', t + ' North', t + ' South'];
  }
}

const FIRST_NAMES_M = ['Ramanathan','Venkatesan','Kumar','Rajesh','Suresh','Ramesh','Karthik','Arun','Vijay','Prakash','Mohan','Ravi','Ganesh','Kannan','Selvam','Murugan','Subramanian','Balaji','Sridhar','Rajendran'];
const LAST_NAMES_M = ['K','R','S','M','N','P','T','V','G','B','J','D','A','H','L','W'];
const FIRST_NAMES_F = ['Lakshmi','Kavitha','Vijaya','Saratha','Meena','Geetha','Priya','Anitha','Shanti','Uma','Malathi','Rani','Valli','Jayanthi','Sudha','Rekha','Pushpa','Padma','Kala','Thilagam'];
const LAST_NAMES_F = ['K','R','S','M','N','P','T','V','G','B','J','D','A','H','L','W'];
const RELATIONS = ['S/o','W/o','D/o','F/o','M/o'];
const CLASSIFICATIONS = [
  { name: 'Ryotwari Punjai (Dry Land)', ta: 'ரயத்துவாரி புஞ்சை', igr: 'Dry Land - Agricultural' },
  { name: 'Ryotwari Nanjai (Wet Land)', ta: 'ரயத்துவாரி நஞ்சை', igr: 'Wet Land - Irrigated' },
  { name: 'Manai (House Site)', ta: 'மனை', igr: 'Residential - House Site' },
  { name: 'Poramboke', ta: 'பொறம்போகே', igr: 'Government - Poramboke' },
  { name: 'Inam', ta: 'இனாம்', igr: 'Grant Land - Inam' }
];

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
function nextVal(seed) { return (seed * 1103515245 + 12345) | 0; }

export function getParcelInfo(query) {
  const raw = String(query || '').trim();
  const q = raw.toLowerCase();
  const matched = tnData.sample_parcels.find(p =>
    p.survey_number.toLowerCase().includes(q) ||
    p.village.toLowerCase().includes(q) ||
    p.patta_number.toLowerCase().includes(q) ||
    p.ulpin.toLowerCase().includes(q) ||
    p.owners.some(o => o.name.toLowerCase().includes(q))
  );
  if (matched) return matched;

  let district = 'Chennai', taluk = 'Sholinganallur', village = 'Karapakkam', surveyNumber = raw;
  const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 4) {
    district = parts[0]; taluk = parts[1]; village = parts[2]; surveyNumber = parts[3];
  } else if (parts.length === 3) {
    district = parts[0]; taluk = parts[1]; surveyNumber = parts[2];
    village = parts[1] + ' Village';
  } else if (parts.length === 2) {
    village = parts[0]; surveyNumber = parts[1];
  } else {
    surveyNumber = q;
  }
  return buildParcel({ district: district, taluk: taluk, village: village, surveyNumber: surveyNumber });
}

function buildParcel({ district, taluk, village, surveyNumber }) {
  const seed = hashStr(district + '|' + taluk + '|' + village + '|' + surveyNumber);
  let s = seed;
  const next = () => { s = nextVal(s); return Math.abs(s); };
  const pick = (arr) => arr[next() % arr.length];
  const isMale = next() % 2 === 0;
  const fname = pick(isMale ? FIRST_NAMES_M : FIRST_NAMES_F);
  const lname = pick(isMale ? LAST_NAMES_M : LAST_NAMES_F);
  const relation = pick(RELATIONS);
  const classification = pick(CLASSIFICATIONS);
  const extentAcres = (0.25 + (next() % 500) / 100).toFixed(2);
  const sqft = Number(extentAcres) * 43560;
  const grounds = sqft / 2400;
  const rateSqft = 500 + (next() % 9500);
  const pattaNo = 'P-' + (1000 + (next() % 90000));
  const dCode = district.substring(0,2).toUpperCase();
  const ulpin = 'TN-' + dCode + '-' + taluk.substring(0,3).toUpperCase() + '-' + village.substring(0,3).toUpperCase() + '-' + surveyNumber.replace('/', '-');

  const owners = [{
    name: fname + ' ' + lname,
    name_ta: '',
    share: '100%',
    relation: relation + ' ' + fname,
    address: 'No. ' + (1 + (next() % 200)) + ', Main Road, ' + village + ', ' + district
  }];

  const history = [];
  let baseRate = rateSqft * 0.3;
  for (let y = 2002; y <= 2026; y += 5) {
    baseRate = baseRate * (1.15 + (next() % 20) / 100);
    history.push({ year: y, rate_sqft: Math.round(baseRate) });
  }

  const txCount = 1 + (next() % 6);
  const transactions = [];
  for (let i = 0; i < txCount; i++) {
    const year = 2000 + (next() % 27);
    const types = ['Sale Deed', 'Gift Deed', 'Mortgage', 'Settlement Deed', 'Release Deed'];
    const type = pick(types);
    const area = Math.round(sqft * (0.5 + (next() % 100) / 100));
    const consideration = type === 'Mortgage' ? 0 : Math.round(area * (rateSqft * (0.8 + next() % 40 / 100)));
    transactions.push({
      year: year,
      doc_no: 'Doc ' + (100 + (next() % 9900)) + '/' + year,
      type: type,
      date: (1 + (next() % 28)) + '-' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][next() % 12] + '-' + year,
      area_sqft: area,
      consideration: consideration,
      rate_sqft: consideration > 0 ? Math.round(consideration / area) : 0,
      buyer: (next() % 2 === 0 ? fname : pick(FIRST_NAMES_M)) + ' ' + lname,
      seller: owners[0].name
    });
  }

  const COASTAL_DISTRICTS = ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Villupuram', 'Cuddalore', 'Nagapattinam', 'Thanjavur', 'Pudukkottai', 'Ramanathapuram', 'Thoothukudi', 'Tirunelveli', 'Kanyakumari'];
  const crz = COASTAL_DISTRICTS.includes(district) && next() % 3 === 0;
  return {
    survey_number: surveyNumber,
    old_survey: (1 + (next() % 200)) + '/' + pick(['A','B','C','D']),
    district: district,
    taluk: taluk,
    village: village,
    village_code: 'V-' + dCode + '-' + taluk.substring(0,3).toUpperCase() + '-' + (100 + (next() % 900)),
    sro: district + ' SRO',
    lat: 8 + (next() % 1200) / 100,
    lng: 77 + (next() % 1000) / 100,
    extent: extentAcres + ' Acres (' + Math.round(sqft).toLocaleString() + ' sq.ft / ' + grounds.toFixed(2) + ' Grounds)',
    classification: classification.name,
    classification_ta: classification.ta,
    patta_number: pattaNo,
    ulpin: ulpin,
    owners: owners,
    guideline_value: {
      current_rate_sqft: rateSqft,
      current_rate_ground: Math.round(rateSqft * 2400),
      classification_igr: classification.igr,
      history: history
    },
    actual_market_data: {
      recent_registered_rate: Math.round(rateSqft * (1.2 + next() % 60 / 100)),
      sales_count_5yrs: txCount,
      transactions: transactions
    },
    zoning: {
      master_plan: district + ' Master Plan',
      zone_code: 'PR-' + (1 + (next() % 9)),
      zone_name: pick(['Primary Residential Zone','Mixed Residential Zone','Commercial Zone','Agricultural Zone','Industrial Zone']),
      permissible_uses: ['Residential','Agriculture','Small Scale Industry'],
      fsi_standard: 1.5 + (next() % 20) / 100,
      fsi_premium_eligible: next() % 2 === 0,
      fsi_max_achievable: 2.0 + (next() % 30) / 100,
      frontage_road_width_m: 6 + (next() % 24),
      proposed_road_widening_m: 12 + (next() % 24),
      max_height_m: 12 + (next() % 48),
      airport_height_cap_m: 45 + (next() % 55),
      crz_applicable: crz,
      crz_distance_m: 500 + (next() % 2000),
      water_body_within_15m: next() % 5 === 0,
      nearest_water_body: pick(['Kulam','Lake','Canal','River']) + ' (' + Math.floor(50 + next() % 500) + 'm away)',
      temple_land_match: next() % 10 === 0,
      waqf_land_match: next() % 15 === 0,
      forest_reserve_match: next() % 20 === 0,
      cersai_open_charge: next() % 4 === 0,
      court_litigation: []
    }
  };
}

export function getVillageList(district, taluk) {
  if (!VILLAGES[district]) return [];
  if (taluk && VILLAGES[district][taluk]) return VILLAGES[district][taluk];
  return Object.values(VILLAGES[district]).flat();
}

export function getDistrictList() {
  return DISTRICTS.map(d => ({ code: d.code, name: d.name, taluks: d.taluks }));
}

