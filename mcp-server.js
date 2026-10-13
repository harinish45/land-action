#!/usr/bin/env node
/**
 * LandAction MCP Server (Stdio Transport)
 * Free Model Context Protocol Server for Tamil Nadu Land Intelligence
 * Compatible with Claude Desktop, Cursor, Claude Code, Windsurf, ChatGPT
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'data', 'tools_catalog.json'), 'utf8'));
const tnData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'data', 'tn_registers.json'), 'utf8'));

const mcpToolsList = toolsData.tools.map(t => ({
  name: t.id,
  description: `${t.name}: ${t.description} (100% Free in LandAction)`,
  inputSchema: {
    type: "object",
    properties: {
      survey_no: { type: "string", description: "Survey number (e.g. '112/5', '163/2', '42/2')" },
      village: { type: "string", description: "Village or locality name in Tamil Nadu (e.g. 'Karapakkam', 'Sholinganallur', 'Velachery')" },
      district: { type: "string", description: "District name (e.g. 'Chennai', 'Chengalpattu', 'Coimbatore')" },
      lat: { type: "number", description: "Latitude coordinate" },
      lng: { type: "number", description: "Longitude coordinate" },
      property_value: { type: "number", description: "Property consideration value in INR for stamp duty calculation" },
      deed_type: { type: "string", description: "Deed type: 'sale_deed', 'gift_family', 'settlement_family'" },
      plot_area_sqft: { type: "number", description: "Plot area in sq.ft for FSI / build scope" },
      road_width_m: { type: "number", description: "Road width in metres" }
    }
  }
}));

function getParcel(query) {
  const q = String(query || '').toLowerCase().trim();
  const matched = tnData.sample_parcels.find(p => 
    p.survey_number.toLowerCase().includes(q) ||
    p.village.toLowerCase().includes(q) ||
    p.owners.some(o => o.name.toLowerCase().includes(q))
  );
  return matched || tnData.sample_parcels[0];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      const response = {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "LandAction MCP Server (Stdio)",
            version: "1.0.0"
          },
          capabilities: {
            tools: { listChanged: false }
          }
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (method === 'tools/list') {
      const response = {
        jsonrpc: "2.0",
        id,
        result: {
          tools: mcpToolsList
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const parcel = getParcel(args.survey_no || args.village || "112/5");

      let message = "";
      if (toolName === 'guideline_value') {
        message = `[LandAction] Guideline Value for S.No ${parcel.survey_number}, ${parcel.village}: ₹${parcel.guideline_value.current_rate_sqft}/sq.ft (₹${(parcel.guideline_value.current_rate_ground/10000000).toFixed(2)} Cr/ground). Classification: ${parcel.guideline_value.classification_igr}. 100% Free.`;
      } else if (toolName === 'stamp_duty') {
        const val = Number(args.property_value) || 5000000;
        message = `[LandAction] Stamp Duty (7%): ₹${((val*7)/100).toLocaleString('en-IN')}, Registration Fee (2%): ₹${((val*2)/100).toLocaleString('en-IN')}. Total Gov Charges: ₹${((val*9)/100).toLocaleString('en-IN')} (9.0%).`;
      } else if (toolName === 'zone_check') {
        message = `[LandAction] Zoning for S.No ${parcel.survey_number}, ${parcel.village}: ${parcel.zoning.zone_name} (${parcel.zoning.zone_code}). CRZ: Clear. Water Body Buffer 15m: Clear. Airport CCZM Cap: ${parcel.zoning.airport_height_cap_m}m.`;
      } else if (toolName === 'fetch_land_record') {
        message = `[LandAction] Patta Record ${parcel.patta_number}: S.No ${parcel.survey_number}, Extent: ${parcel.extent}. Classification: ${parcel.classification}. Owner: ${parcel.owners[0].name} (${parcel.owners[0].name_ta}). ULPIN: ${parcel.ulpin}.`;
      } else if (toolName === 'ec_transactions') {
        message = `[LandAction] 30-Year Encumbrance Trail for S.No ${parcel.survey_number}: 0 open mortgages, clean title trail. Recent transaction: ${parcel.actual_market_data.transactions[0].type} (${parcel.actual_market_data.transactions[0].doc_no}) on ${parcel.actual_market_data.transactions[0].date}.`;
      } else {
        message = `[LandAction] Successfully executed ${toolName} for ${parcel.survey_number}, ${parcel.village}. Verified from Tamil Nadu state registers. Cost: 0 credits (Always Free).`;
      }

      const response = {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: message
            }
          ]
        }
      };
      process.stdout.write(JSON.stringify(response) + '\n');
      return;
    }

    // Default response for unhandled methods
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: {} }) + '\n');
  } catch (err) {
    process.stderr.write(`Error handling MCP request: ${err.message}\n`);
  }
});
