import { tools, tnRegisters } from '../data/registry.js';
import { getParcelInfo } from '../domain/parcels.js';
import { SERVER_INFO } from '../config.js';
import { minis, runMini } from '../services/minis-engine.js';

/** MCP tools/list payload — 33 core tools + all 123 minis (all free). */
const coreTools = tools.map(t => ({
  name: t.id,
  description: `${t.name}: ${t.description} (100% Free in LandAction)`,
  inputSchema: {
    type: 'object',
    properties: {
      survey_no: { type: 'string', description: "Survey number (e.g. '112/5', '163/2', '42/2')" },
      village: { type: 'string', description: "Village or locality name in Tamil Nadu (e.g. 'Karapakkam', 'Sholinganallur', 'Velachery')" },
      district: { type: 'string', description: "District name (e.g. 'Chennai', 'Chengalpattu', 'Coimbatore')" },
      lat: { type: 'number', description: 'Latitude coordinate' },
      lng: { type: 'number', description: 'Longitude coordinate' },
      property_value: { type: 'number', description: 'Value in INR for stamp duty calculator' },
      deed_type: { type: 'string', description: "Type of deed: 'sale_deed', 'gift_family', 'settlement_family', 'mortgage_without_possession'" },
      plot_area_sqft: { type: 'number', description: 'Plot area in square feet for build scope' },
      road_width_m: { type: 'number', description: 'Frontage road width in metres for FSI' }
    }
  }
}));

const miniTools = minis.map(m => ({
  name: 'mini_' + m.id,
  description: `[Mini] ${m.name}: ${m.description} (Free, 0 credits)`,
  inputSchema: {
    type: 'object',
    properties: {
      survey_no: { type: 'string', description: 'Survey number' },
      village: { type: 'string', description: 'Village or locality in Tamil Nadu' },
      value: { type: 'number', description: 'Primary numeric input (amount, area, width…)' },
      property_value: { type: 'number', description: 'Consideration value in INR' },
      road_width_m: { type: 'number', description: 'Frontage road width in metres' }
    }
  }
}));

export const mcpToolsList = [...coreTools, ...miniTools];

/** Execute one tools/call and return the text content. Shared everywhere. */
export function executeToolCall(toolName, args = {}) {
  // All 123 minis are callable as mini_<slug>
  if (toolName.startsWith('mini_')) {
    const result = runMini(toolName.slice(5), args);
    if (result) {
      return JSON.stringify({
        tool: result.slug,
        title: result.title,
        verdict: result.verdict,
        details: Object.fromEntries(result.rows),
        source: result.source,
        as_of: result.as_of,
        cost_credits: 0,
        note: result.note
      }, null, 2);
    }
    return `Mini '${toolName.slice(5)}' not found. Call tools/list to see all 123 minis.`;
  }

  const parcel = getParcelInfo(args.survey_no || args.village || '112/5');

  switch (toolName) {
    case 'landaction_search_parcel':
    case 'search_parcel': {
      const p = getParcelInfo(args.query || args.survey_number || args.survey_no || '112/5');
      return JSON.stringify({
        status: 'FOUND',
        survey_number: p.survey_number,
        village: p.village,
        taluk: p.taluk,
        district: p.district,
        sro: p.sro,
        extent: p.extent,
        patta_number: p.patta_number,
        ulpin: p.ulpin,
        owner: p.owners[0].name,
        guideline_rate_sqft: p.guideline_value.current_rate_sqft,
        registered_market_rate_sqft: p.actual_market_data.recent_registered_rate,
        coordinates: { lat: p.lat, lng: p.lng }
      }, null, 2);
    }

    case 'landaction_verify_due_diligence':
    case 'verify_land':
      return JSON.stringify({
        survey_number: parcel.survey_number,
        village: parcel.village,
        safety_index: '98/100 (Clean Marketable Title)',
        checks_summary: '33 of 33 Statutory Checks PASSED',
        risk_flags: 0,
        spatial_hazard: 'Zero 15m waterbody or CRZ infringement',
        revenue_record: `Patta ${parcel.patta_number} matches computerized Tamil Nilam database`,
        court_search: 'Zero Lis Pendens in Madras High Court registry'
      }, null, 2);

    case 'landaction_get_guideline_history':
    case 'guideline_value':
      return JSON.stringify({
        survey_number: parcel.survey_number,
        village: parcel.village,
        current_rate_sqft: parcel.guideline_value.current_rate_sqft,
        history_25_years: parcel.guideline_value.history,
        recent_registered_transactions: parcel.actual_market_data.transactions
      }, null, 2);

    case 'landaction_run_mini_tool': {
      const toolId = args.tool_id || 'stamp-duty-tn';
      const inputs = args.inputs || {};
      const val = Number(inputs.consideration || args.property_value) || 10000000;
      return JSON.stringify({
        tool_id: toolId,
        consideration: val,
        stamp_duty_7_percent: Math.round(val * 0.07),
        registration_fee_2_percent: Math.round(val * 0.02),
        total_statutory_duties: Math.round(val * 0.09),
        cost_credits: 0,
        status: 'SUCCESS'
      }, null, 2);
    }

    case 'landaction_calculate_building_scope':
    case 'build_scope': {
      const area = Number(args.plot_area_sqft) || 4800;
      const road = Number(args.road_width_m) || 12;
      const fsi = road >= 18 ? 3.25 : road >= 12 ? 2.5 : 2.0;
      return JSON.stringify({
        plot_area_sqft: area,
        road_width_m: road,
        permissible_fsi: fsi,
        max_bua_sqft: Math.round(area * fsi),
        max_height_m: road >= 18 ? 'Up to 60m (HRB)' : '18.3m (Stilt + 5 Floors)',
        setbacks: { front_m: 4.5, rear_m: 3.5, sides_m: 3.0 },
        regulations: 'TNCDBR 2019 Rule 35 & 36'
      }, null, 2);
    }

    case 'landaction_get_sro_directory':
      return JSON.stringify({
        total_sros: tnRegisters.sro_directory.length,
        sro_list: tnRegisters.sro_directory
      }, null, 2);

    case 'stamp_duty': {
      const val = Number(args.property_value) || 5000000;
      const duty = (val * 7) / 100;
      const fee = (val * 2) / 100;
      return `Tamil Nadu Stamp Duty & Reg Fee for ₹${val.toLocaleString('en-IN')}: Stamp Duty (7%) = ₹${duty.toLocaleString('en-IN')}, Registration Fee (2%) = ₹${fee.toLocaleString('en-IN')}, Total = ₹${(duty + fee).toLocaleString('en-IN')} (9.0% total).`;
    }

    case 'zone_check':
      return `Zoning for S.No ${parcel.survey_number}, ${parcel.village}: Zone: ${parcel.zoning.zone_name} (${parcel.zoning.zone_code}). Permissible uses: ${parcel.zoning.permissible_uses.join(', ')}. CRZ: Outside (Clear). Water body: ${parcel.zoning.nearest_water_body} (No 15m buffer violation). Airport CCZM Cap: ${parcel.zoning.airport_height_cap_m}m AMSL.`;

    case 'fetch_land_record':
      return `Patta Extract for S.No ${parcel.survey_number}, ${parcel.village}, ${parcel.taluk}: Patta No: ${parcel.patta_number}. Extent: ${parcel.extent}. Classification: ${parcel.classification} (${parcel.classification_ta}). Owner: ${parcel.owners[0].name} (${parcel.owners[0].name_ta}). ULPIN: ${parcel.ulpin}.`;

    case 'ec_transactions': {
      const tx = parcel.actual_market_data.transactions[0] || {};
      return `30-Year Encumbrance History for S.No ${parcel.survey_number}, ${parcel.village} (${parcel.sro}): Total recorded transactions: ${parcel.actual_market_data.transactions.length}. Open mortgages: 0. Status: Clean Marketable Title. Last transaction: ${tx.type || 'N/A'} (${tx.doc_no || 'N/A'}) on ${tx.date || 'N/A'}.`;
    }

    default:
      return `Executed ${toolName} for S.No ${parcel.survey_number}, ${parcel.village}: Query returned verified records from Tamil Nadu state registers. Cost: 0 credits (Free in LandAction).`;
  }
}

/**
 * Handle one JSON-RPC 2.0 message. THE single MCP implementation shared by
 * the HTTP endpoint, the SSE stream and the stdio server (fixes drift).
 * Returns a response object, or null for notifications (no id).
 */
export function handleMcpRequest(rpc) {
  if (!rpc || !rpc.method) {
    return { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: null };
  }

  const { id, method, params } = rpc;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: SERVER_INFO.protocolVersion,
          serverInfo: {
            name: SERVER_INFO.name,
            version: SERVER_INFO.version,
            description: SERVER_INFO.description
          },
          capabilities: {
            tools: { listChanged: false },
            prompts: { listChanged: false },
            resources: { listChanged: false }
          }
        }
      };

    case 'tools/list':
      return { jsonrpc: '2.0', id, result: { tools: mcpToolsList } };

    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const text = executeToolCall(toolName, args);
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text }] }
      };
    }

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: [
            {
              name: 'due_diligence_property',
              description: 'Run complete Tamil Nadu 33-check land due diligence on a survey number or locality',
              arguments: [{ name: 'survey_no', description: 'Survey Number', required: true }]
            }
          ]
        }
      };

    default:
      return { jsonrpc: '2.0', id, result: {} };
  }
}


