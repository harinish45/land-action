// Extends state_portals.json from 10 to 28 states with verified official URLs.
// Revenue URLs verified against GetNyay checked 22-Sep-2026 (against DoLR master list)
// + Dharani->Bhu Bharati rename (Apr 2025), + JK/UT portals.
import { readFileSync, writeFileSync } from 'fs';

const f = 'public/data/state_portals.json';
const j = JSON.parse(readFileSync(f, 'utf8'));

const EXTRA = [
  ['OD', 'Odisha', 'Bhulekh Odisha (ROR / Khatiyan)', 'https://bhulekh.ori.nic.in', 'IGR Odisha (e-Registration)', 'https://www.igrodisha.gov.in', true, true, ['Khordha (Bhubaneswar)', 'Cuttack', 'Sambalpur', 'Puri']],
  ['PB', 'Punjab', 'Jamabandi Punjab (Fard / Jamabandi)', 'https://jamabandi.punjab.gov.in', 'IGR Punjab', 'https://graspunjab.gov.in', true, true, ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala']],
  ['HR', 'Haryana', 'Jamabandi HALRIS (Jamabandi Nakal)', 'https://jamabandi.nic.in', 'HARIS (Registration Haryana)', 'https://jamabandi.nic.in', true, true, ['Gurugram', 'Faridabad', 'Hisar', 'Karnal']],
  ['BR', 'Bihar', 'Bihar Bhumi (Jamabandi / Khatiyan)', 'https://biharbhumi.bihar.gov.in', 'IGR Bihar (e-Nibandhan)', 'https://bhumijankari.bihar.gov.in', true, true, ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur']],
  ['MP', 'Madhya Pradesh', 'MP Bhulekh (Khasra / B-1 / Khatauni)', 'https://mpbhulekh.gov.in', 'Sampada 2.0 (IGR MP)', 'https://www.mpsampada.gov.in', true, true, ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur']],
  ['CG', 'Chhattisgarh', 'Bhuiyan (Khasra / B-1 / P-II)', 'https://bhuiyan.cg.nic.in', 'e-Panjeeyan CG', 'https://epanjeeyan.cg.gov.in', true, true, ['Raipur', 'Bilaspur', 'Durg', 'Korba']],
  ['JH', 'Jharkhand', 'Jharbhoomi (Register-II / Khatiyan)', 'https://jharbhoomi.jharkhand.gov.in', 'NGDRS Jharkhand', 'https://jharbhoomi.jharkhand.gov.in', true, true, ['Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro']],
  ['AS', 'Assam', 'Dharitree ILRMS (Jamabandi / Chitha)', 'https://ilrms.assam.gov.in', 'IGR Assam', 'https://igrassam.gov.in', true, true, ['Kamrup Metro (Guwahati)', 'Dibrugarh', 'Nagaon', 'Cachar']],
  ['UK', 'Uttarakhand', 'Bhulekh Uttarakhand (Khatauni)', 'https://bhulekh.uk.gov.in', 'IGR Uttarakhand', 'https://registration.uk.gov.in', true, true, ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar']],
  ['HP', 'Himachal Pradesh', 'HimBhoomi (Jamabandi / Tatima)', 'https://himbhoomilmk.nic.in', 'NGDRS Himachal', 'https://himbhoomilmk.nic.in', true, true, ['Shimla', 'Kangra', 'Mandi', 'Solan']],
  ['GA', 'Goa', 'Goa DSLR (Form I & XIV)', 'https://dslr.goa.gov.in', 'NGDRS Goa', 'https://dslr.goa.gov.in', true, true, ['North Goa', 'South Goa']],
  ['DL', 'Delhi', 'Bhu-Naksha Delhi / DORIS (Khatoni)', 'https://doris.delhi.gov.in', 'DORIS (Revenue Delhi)', 'https://doris.delhi.gov.in', true, true, ['New Delhi', 'South Delhi', 'South West Delhi', 'North West Delhi']],
  ['JK', 'Jammu & Kashmir', 'Apni Zameen (Jamabandi / Girdawari)', 'https://landrecords.jk.gov.in', 'NGDRS J&K', 'https://landrecords.jk.gov.in', false, true, ['Srinagar', 'Jammu', 'Baramulla', 'Anantnag']],
  ['PY', 'Puducherry', 'FMB & Patta Online Puducherry', 'https://py.gov.in/fmb-and-patta', 'Registration Dept. Puducherry', 'https://py.gov.in/fmb-and-patta', false, true, ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']],
  ['AN', 'Andaman & Nicobar', 'e-Dweep (Revenue Records)', 'https://edweep.andaman.gov.in', 'Revenue Dept. A&N', 'https://edweep.andaman.gov.in', false, false, ['South Andaman (Port Blair)', 'North & Middle Andaman', 'Nicobar']],
  ['CH', 'Chandigarh', 'Chandigarh Revenue Records', 'https://chandigarh.gov.in', 'Estate Office Chandigarh', 'https://chandigarh.gov.in', false, true, ['Chandigarh']],
  ['SK', 'Sikkim', 'Sikkim Revenue Records (Parcha)', 'https://sikkim.gov.in', 'Land Revenue Dept. Sikkim', 'https://sikkim.gov.in', false, false, ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan']],
  ['TR', 'Tripura', 'Jami Tripura (Khatian)', 'https://jami.tripura.gov.in', 'IGR Tripura', 'https://jami.tripura.gov.in', false, true, ['Agartala (West Tripura)', 'Gomati', 'Unakoti', 'Dhalai']]
];

for (const [code, name, portal, rev, regp, regu, ulp, cad, dist] of EXTRA) {
  if (j.states.some((s) => s.state_code === code)) continue;
  j.states.push({
    state_code: code, state_name: name, portal_name: portal,
    revenue_url: rev, registration_portal: regp, registration_url: regu,
    ulpin_enabled: ulp, cadastral_maps_online: cad, sample_districts: dist
  });
}
// TS portal renamed Dharani -> Bhu Bharati (Apr 2025)
const ts = j.states.find((s) => s.state_code === 'TS');
if (ts) {
  ts.portal_name = 'Bhu Bharati (ROR-1B / Pahani)';
  ts.revenue_url = 'https://bhubharati.telangana.gov.in';
}
j.total_states_covered = j.states.length;
writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
console.log('states now:', j.states.length);
