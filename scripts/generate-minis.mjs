// Generates public/data/minis_catalog.json — the full 123 one-question tools,
// slug-for-slug parity with LandLens's catalog (all free, 0 credits).
// Kinds: calc (real math) | zone (spatial check) | record (register lookup)
//        | search (discovery) | doc (documents/drafting) | custom (customary)
import { writeFileSync } from 'fs';

// [slug, name, category, kind, description]
const M = [
  // Location and parcel (13)
  ['guideline-value', 'Guideline value', 'Location and parcel', 'calc', 'Official registration rate at a point, dated to its revision, per sq.ft and per ground.'],
  ['zone-check', 'Zone check', 'Location and parcel', 'zone', 'Master plan zone at a plot with permissible uses and restrictions.'],
  ['water-story', 'Waterways', 'Location and parcel', 'zone', 'Lakes, tanks, canals and drains near a pin with buffer distances.'],
  ['planning-authority', 'Planning authority', 'Location and parcel', 'record', 'Which authority (CMDA / DTCP / LPA) plans a place.'],
  ['sro-finder', 'Sub-registrar office', 'Location and parcel', 'record', 'The SRO that registers deeds for a village, with address and contact.'],
  ['radius-discovery', 'Every parcel within 1 km', 'Location and parcel', 'search', 'All parcels within 1 km of a point with survey numbers and extents.'],
  ['guideline-value-survey', 'Guideline value by survey number', 'Location and parcel', 'calc', 'Guideline rate looked up by survey number instead of a pin.'],
  ['parcel-at-pin', 'Which survey number is this pin?', 'Location and parcel', 'record', 'Resolve a lat/lng pin to its revenue survey number and village.'],
  ['digipin', 'DIGIPIN, the digital address of a spot', 'Location and parcel', 'calc', 'The national DIGIPIN code for any point.'],
  ['pincode', 'Pincode and post office of a spot', 'Location and parcel', 'record', 'Postal pincode and post office serving a point.'],
  ['elevation', 'Height and slope of a plot', 'Location and parcel', 'zone', 'Elevation above mean sea level and slope percentage of a plot.'],
  ['soil-type', 'Soil under a plot', 'Location and parcel', 'zone', 'Soil classification under a point with suitability notes.'],
  ['geo-insights', 'Terrain and land-science profile', 'Location and parcel', 'zone', 'Terrain, geology and land-science profile of an area.'],
  // Ownership and records (18)
  ['land-record', 'Land record', 'Ownership and records', 'record', 'Patta, chitta and land classification for a survey number.'],
  ['land-record-by-patta', 'Land record by patta number', 'Ownership and records', 'record', 'Reverse lookup: patta number to survey, extent and holder.'],
  ['fmb', 'FMB sketch', 'Ownership and records', 'record', 'Field Measurement Book sketch reference for a survey number.'],
  ['village-map', 'FMB village map with survey numbers', 'Ownership and records', 'record', 'Village cadastral map listing all survey numbers.'],
  ['subdivision-list', 'Subdivisions', 'Ownership and records', 'record', 'All sub-divisions of a survey number (112/1 … 112/9).'],
  ['land-quality', 'Land class and tax', 'Ownership and records', 'record', 'Land classification (punjai/nanjai) and tax rate for a survey.'],
  ['patta-analyzer', 'Patta analyzer', 'Ownership and records', 'record', 'Full patta readout: holder, share, extent, classification, mutation status.'],
  ['plot-owner', 'Owner of a survey, from the register copy', 'Ownership and records', 'record', 'Recorded owner of a survey from the register copy.'],
  ['owner-at-point', 'Who owns the land at this pin', 'Ownership and records', 'record', 'Owner of the parcel containing a lat/lng point.'],
  ['neighbours', 'Who owns the plots next door', 'Ownership and records', 'record', 'Owners of parcels adjacent to a survey number.'],
  ['adangal', 'Crop and cultivation record of a survey', 'Ownership and records', 'record', 'Adangal: crop, cultivation and area details for a survey.'],
  ['certificate-verify', 'Verify a patta or TSLR certificate', 'Ownership and records', 'record', 'Check a patta/TSLR certificate against the digitised register.'],
  ['survey-history', 'Survey number history (UDR and town survey)', 'Ownership and records', 'record', 'What an old survey number became after UDR resurvey or town survey.'],
  ['old-survey-to-new', 'Old survey number to new', 'Ownership and records', 'record', 'Convert a pre-UDR survey number to its current number.'],
  ['new-survey-to-old', 'New survey number to old', 'Ownership and records', 'record', 'Convert a current survey number to its pre-UDR number.'],
  ['village-xray', 'X-ray of a village', 'Ownership and records', 'search', 'How a village is cut up: surveys, government vs private, land types.'],
  ['revenue-directory', 'District, taluk and village directory', 'Ownership and records', 'search', 'Full district/taluk/village revenue directory of Tamil Nadu.'],
  ['sro-directory', 'Browse the sub registrar office directory', 'Ownership and records', 'search', 'Directory of every SRO in Tamil Nadu with contact details.'],
  // Encumbrance (6)
  ['ec', 'Encumbrance certificate', 'Encumbrance', 'record', 'Full EC trail for a survey over the period the office holds.'],
  ['ec-availability', 'EC availability: years and offices for a village', 'Encumbrance', 'record', 'How many years of EC a village has, and which offices hold them.'],
  ['ec-analyzer', 'EC analyzer', 'Encumbrance', 'record', 'Read an EC: chain of title, mortgages, attachments and gaps.'],
  ['certified-copy', 'Certified copy of a deed', 'Encumbrance', 'doc', 'Request/read the certified copy of a registered deed by doc number.'],
  ['cersai-check', 'Mortgages on CERSAI', 'Encumbrance', 'record', 'Open charges on the national mortgage registry for a party/survey.'],
  ['document-records', 'Every record from a deed', 'Encumbrance', 'record', 'From one deed: EC of all its surveys, patta, FMB and certified copies.'],
  // Value and duty (11)
  ['stamp-duty', 'Stamp duty', 'Value and duty', 'calc', 'Stamp duty and registration fee for a consideration and deed type.'],
  ['capital-gains', 'Capital gains', 'Value and duty', 'calc', 'Capital gains tax on a land sale with indexation.'],
  ['unit-converter', 'Unit converter', 'Value and duty', 'calc', 'Grounds, cents, acres, guntha, bigha, sq.ft, sq.m conversions.'],
  ['price-converter', 'Land rate converter', 'Value and duty', 'calc', 'Convert rates between sq.ft, sq.m, cent, ground, acre.'],
  ['building-value', 'Building value calculator', 'Value and duty', 'calc', 'Guideline building value from plinth area and floor count.'],
  ['composite-value', 'Composite value for flats on a street', 'Value and duty', 'calc', 'Composite guideline value for flats on a street (land + structure).'],
  ['locality-value', 'Where a street sits in its locality', 'Value and duty', 'calc', 'A street rate relative to its locality median.'],
  ['vacant-land-tax', 'Vacant land tax on an assessment', 'Value and duty', 'calc', 'Vacant land tax payable on an assessment number.'],
  ['tax-bill-lookup', 'Look up a Chennai tax bill', 'Value and duty', 'record', 'Chennai corporation property tax bill by assessment number.'],
  ['chennai-utility', 'Chennai property tax, water or power at a pin', 'Value and duty', 'record', 'Property tax, water and power dues for a Chennai pin.'],
  ['utility-dues', 'Property tax and water dues', 'Value and duty', 'record', 'Pending property tax and water dues for a property.'],
  // Zones and restrictions (27)
  ['crz-check', 'CRZ coastal zone check', 'Zones and restrictions', 'zone', 'Whether a plot falls in CRZ-I/II/III with distance from the High Tide Line.'],
  ['water-body-check', 'Water body and lake check', 'Zones and restrictions', 'zone', 'Water bodies near a plot with the 15m PWD buffer verdict.'],
  ['flood-zone-check', 'Flood zone check', 'Zones and restrictions', 'zone', '100-year flood inundation zone status for a point.'],
  ['ramsar-site-check', 'Ramsar site and Pallikaranai marsh check', 'Zones and restrictions', 'zone', 'Proximity to Ramsar wetlands and the Pallikaranai marsh.'],
  ['reserve-forest-check', 'Reserve forest check', 'Zones and restrictions', 'zone', 'Whether a survey is on the reserve forest list.'],
  ['eco-sensitive-zone-check', 'Eco-sensitive zone check', 'Zones and restrictions', 'zone', 'Distance to the eco-sensitive buffer of parks and sanctuaries.'],
  ['asi-monument-check', 'ASI monument zone check', 'Zones and restrictions', 'zone', 'ASI prohibited (100m) and regulated (200m) zones around a monument.'],
  ['haca-check', 'HACA hill area check', 'Zones and restrictions', 'zone', 'Hill Area Conservation Authority overlay on a plot.'],
  ['ht-line-check', 'High tension line distance check', 'Zones and restrictions', 'zone', 'Distance to the nearest HT power line corridor with the safe buffer.'],
  ['railway-line-check', 'Railway line distance check', 'Zones and restrictions', 'zone', 'Distance to railway track with the 30m setback verdict.'],
  ['quarry-check', 'Quarry distance check', 'Zones and restrictions', 'zone', 'Distance to stone quarries with 300m/500m safety buffers.'],
  ['airport-zone-check', 'Airport height zone check', 'Zones and restrictions', 'zone', 'AAI colour zoning around an airport and the height rules there.'],
  ['airport-height', 'Maximum building height near an airport', 'Zones and restrictions', 'calc', 'The height a building may rise to under airport funnel rules.'],
  ['airport-noc-issued', 'Airport height clearances already granted near a plot', 'Zones and restrictions', 'record', 'Height NOCs already granted near a plot.'],
  ['road-widening-check', 'Road widening check', 'Zones and restrictions', 'zone', 'Proposed road widening reservation affecting a plot.'],
  ['land-acquisition-check', 'Is my land under acquisition', 'Zones and restrictions', 'zone', 'Pending or notified land acquisition on a survey.'],
  ['slum-area-check', 'Is this land in a mapped slum area', 'Zones and restrictions', 'zone', 'Mapped slum area status for a point.'],
  ['slum-areas-by-ward', 'Mapped slum areas in a corporation, zone or ward', 'Zones and restrictions', 'search', 'Slum areas mapped inside a ward or zone.'],
  ['aquifer-zone-check', 'Aquifer recharge area check', 'Zones and restrictions', 'zone', 'Whether a plot is in a mapped aquifer recharge zone.'],
  ['redhills-catchment-check', 'Redhills catchment check', 'Zones and restrictions', 'zone', 'Inside the Redhills reservoir catchment area.'],
  ['forest-claim', 'Is this survey on the forest list', 'Zones and restrictions', 'zone', 'Forest department claim over a survey number.'],
  ['waqf-land', 'Is this survey waqf land', 'Zones and restrictions', 'zone', 'TN Waqf Board listing for a survey number.'],
  ['temple-land', 'Temple land', 'Zones and restrictions', 'zone', 'HR&CE temple land register match for a survey.'],
  ['temple-lands-by-name', 'Lands of a temple, by temple name', 'Zones and restrictions', 'search', 'All lands recorded to a temple by its name.'],
  ['waqf-lands-by-name', 'Lands of a waqf institution, by name', 'Zones and restrictions', 'search', 'All lands of a Waqf institution by name.'],
  ['bhoodan-land', 'Is this survey Bhoodan land', 'Zones and restrictions', 'zone', 'Bhoodan (gift land) listing for a survey number.'],
  ['industrial-park-check', 'Is this land in an industrial park', 'Zones and restrictions', 'zone', 'Industrial park estate boundaries on a plot.'],
  // Planning and building (17)
  ['fsi-calculator', 'FSI calculator', 'Planning and building', 'calc', 'Permissible FSI from road width, use and plot type.'],
  ['building-rule-calc', 'Building rule calculators', 'Planning and building', 'calc', 'Setbacks, height, parking and FAR under TNCDBR 2019.'],
  ['plot-layout', 'How many plots a land can be cut into', 'Planning and building', 'calc', 'Plot count at a chosen size with internal road and rules.'],
  ['osr-fee', 'OSR fee for a layout or sub-division', 'Planning and building', 'calc', 'Open space reservation fee in rupees, or land to be gifted.'],
  ['road-width', 'Road width at a plot', 'Planning and building', 'calc', 'Road width measured from the cadastral map at the frontage.'],
  ['plot-area', 'Plot area from its sides', 'Planning and building', 'calc', 'Area of a plot from its side lengths and frontage.'],
  ['first-sale-uds', 'First sale flat', 'Planning and building', 'calc', 'Undivided share of land in a first-sale flat.'],
  ['planning-map', 'Find the master plan sheet for a place', 'Planning and building', 'record', 'Which master plan sheet covers a place.'],
  ['cmda-land-use-check', 'CMDA land use zone at a plot', 'Planning and building', 'zone', 'CMDA master plan land use classification at a plot.'],
  ['master-plan-zone-check', 'Master plan zone at a plot', 'Planning and building', 'zone', 'Master plan zone code and permissible uses at a plot.'],
  ['cba-check', 'Continuous Building Area check', 'Planning and building', 'zone', 'CBA overlay and its effect on development.'],
  ['approval-search', 'Approvals on a survey number', 'Planning and building', 'record', 'Planning approvals granted on a survey number.'],
  ['approvals-at-location', 'Approvals at a location', 'Planning and building', 'record', 'Planning approvals near a lat/lng point.'],
  ['approvals-by-street-or-name', 'Approvals by street, address or name', 'Planning and building', 'record', 'Approvals searched by street, address or project name.'],
  ['layout-lookup', 'Approved layouts near a plot', 'Planning and building', 'record', 'Approved layouts within reach of a plot.'],
  ['street-profile', 'Street width in Coimbatore and Salem', 'Planning and building', 'calc', 'Street widths from the Coimbatore/Salem street database.'],
  ['compare-plots', 'Compare two to four plots', 'Planning and building', 'calc', 'Side-by-side comparison of 2–4 plots on rate, zone and access.'],
  // Legal and registers (15)
  ['court-cases-by-name', 'Court cases in a name', 'Legal and registers', 'search', 'Court cases involving a person or company by name.'],
  ['revenue-court', 'Revenue court cases on a survey', 'Legal and registers', 'record', 'RDO/Tahsildar revenue court proceedings on a survey.'],
  ['civil-court', 'Case by CNR number', 'Legal and registers', 'record', 'A court case by CNR: parties, status, next hearing, judge.'],
  ['rera-project', 'Look up a RERA registered project', 'Legal and registers', 'record', 'RERA project registration with filings and status.'],
  ['rera-check', 'Search RERA agents, orders and regularisations', 'Legal and registers', 'search', 'RERA agents, complaint orders and judgements by name or number.'],
  ['seller-check', 'Seller background check', 'Legal and registers', 'search', 'Open web, court, RERA and CMDA findings for a seller name.'],
  ['promoter-dossier', 'Builder background', 'Legal and registers', 'search', 'Developer track record: projects, approvals, delays, cases.'],
  ['name-match', 'Are these the same person?', 'Legal and registers', 'calc', 'Probabilistic identity match between two name spellings.'],
  ['glossary', 'What a land term means', 'Legal and registers', 'record', 'Plain-language meaning of a Tamil Nadu land term.'],
  ['statutory-form', 'Find a form, rule or checklist', 'Legal and registers', 'record', 'Statutory form, rule text or compliance checklist by name.'],
  ['igr-classification', 'How the registration department classes a survey', 'Legal and registers', 'record', 'IGR classification of a survey for valuation purposes.'],
  ['live-tracker', 'Where a live topic stands today', 'Legal and registers', 'record', 'Current status of a live topic (case, approval, acquisition).'],
  ['muhurtham-dates', 'Muhurtham dates for registration', 'Legal and registers', 'custom', 'Auspicious registration dates in a window from the Tamil calendar.'],
  ['property-panchangam', 'Property panchangam for a day', 'Legal and registers', 'custom', 'Day panchangam: raahu kaalam, nakshatram, thithi and SRO open status.'],
  ['manaiyadi', 'Manaiyadi Sastram verdict', 'Legal and registers', 'custom', 'Manaiyadi Sastram share verdict for an ancestral property.'],
  ['cmda-check', 'Search the CMDA registers', 'Legal and registers', 'record', 'Search CMDA approval registers by survey, street or project.'],
  ['cmda-register', 'Search the CMDA file registers', 'Legal and registers', 'record', 'Search CMDA file registers for a building or layout file number.'],
  ['ppa-approval', 'Search planning permission approvals', 'Legal and registers', 'record', 'Search PPAs granted by CMDA/DTCP for a place or applicant.'],
  // Search and discovery (8)
  ['owner-search', 'Every plot in a name', 'Search and discovery', 'search', 'All parcels recorded in one owner name across the state.'],
  ['ancestral-search', "Trace an ancestor's land", 'Search and discovery', 'search', "Trace an ancestor's parcels from name and native place."],
  ['area-discovery', 'Every parcel in a village', 'Search and discovery', 'search', 'Sweep a village for parcels matching extent and zone filters.'],
  ['tnahr-search', 'Search the historical archives', 'Search and discovery', 'search', 'Search 450,000+ digitised settlement registers, GOs and gazettes.'],
  ['commercial-lookup', 'Commercial connection lookup', 'Search and discovery', 'search', 'Chennai commercial electricity and GST register by name or GSTIN.'],
  ['ground-watch', 'Ground Watch', 'Search and discovery', 'search', 'Watch a topic and get notified when the ground truth changes.'],
  ['sales-watch', 'Sales Watch', 'Search and discovery', 'search', 'Watch registered sales in an area as deeds are filed.'],
  ['industrial-parks', 'Industrial parks and vacant plots', 'Search and discovery', 'search', 'Industrial parks with vacant plots and utilities status.'],
  // Documents and drafting (3)
  ['deed-drafter', 'Draft a deed or agreement', 'Documents and drafting', 'doc', 'Draft a sale deed, agreement or gift deed from structured inputs.'],
  ['document-translation', 'Document translation, Tamil and English', 'Documents and drafting', 'doc', 'Translate a Tamil or English property document keeping structure.'],
  ['rent-receipts', 'Rent receipts and invoices', 'Documents and drafting', 'doc', 'Generate rent receipts and invoices for a tenancy.'],
  // Customary (2)
  ['plot-vastu', 'Vastu score of a plot', 'Customary', 'custom', 'Vastu verdict for a plot from facing, shape and road layout.'],
  ['home-vastu', 'Vastu score of a house', 'Customary', 'custom', 'Vastu score of a house from facing and room layout.'],
];

const seen = new Set();
const tools = M.map(([slug, name, category, kind, description]) => {
  if (seen.has(slug)) throw new Error('duplicate slug: ' + slug);
  seen.add(slug);
  return {
    id: slug, name, category, kind, cost: 'Free', credits: 0, description,
    input_params: kind === 'calc' ? ['value', 'unit'] : ['survey_no', 'village', 'district']
  };
});

if (tools.length !== 123) {
  console.error(`Expected 123 minis, got ${tools.length}`);
  process.exit(1);
}

const catalog = {
  platform: 'LandAction',
  pricing_model: '100% Free — 0 credits on all 123 minis',
  total_tools: 123,
  free_tools: 123,
  categories: [...new Set(tools.map(t => t.category))],
  tools
};

writeFileSync(
  new URL('../public/data/minis_catalog.json', import.meta.url),
  JSON.stringify(catalog, null, 2)
);
console.log(`Wrote ${tools.length} minis across ${catalog.categories.length} categories`);




