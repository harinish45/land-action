# LandAction 🛡️

> **Autonomous Cadastral Intelligence, Land Due Diligence & Title Verification Platform**
> 
> *100% Free • Zero Credit Paywalls • 9 Integrated Products • MCP Server Active*

---

## Overview

**LandAction** is an open, autonomous land intelligence and due diligence platform for India. It provides a complete, 100% free alternative to commercial land platforms (such as LandLens), delivering comprehensive spatial screening across 33 statutory risk layers, 123 micro-tools, 25-year registered price trends, TNCDBR 2019 building feasibility, 50-year title lineage tracing, and an active **Model Context Protocol (MCP)** server for AI assistants (Claude, Cursor, Windsurf, ChatGPT).

---

## 🚀 Key Products & Features

### 1. LandAction One (One Map) — 33 Statutory Spatial GIS Layers
- **Interactive Spatial Screening across 7 Risk Groups**:
  - **Water & Flood Bodies (5 layers)**: Lakes, Tanks & Ponds (*Eri / Kulam*), 15m/50m river buffers under RSO 26(15), SWD stormwater drains, Pallikaranai marshlands, 100-year flood inundation zones.
  - **Coastal Regulation Zone / CRZ (3 layers)**: CRZ-I sensitive areas, CRZ-II urban coastal belts, High Tide Line (HTL) 200m/500m buffers.
  - **Heritage, ASI & Religious Lands (5 layers)**: ASI 100m Prohibited & 200m Regulated zones, HR&CE Hindu Religious & Charitable Endowments temple lands register, Tamil Nadu Waqf Board properties, listed heritage structures.
  - **Transport Corridors (4 layers)**: Chennai Metro Phase 2 alignments, NHAI National Highway buffers (40m/60m), Southern Railway 30m track setbacks, AAI Airport Obstacle Limitation Surfaces (OLS).
  - **Master Plan Land Use (10 layers)**: CMDA & DTCP 2nd Master Plan zoning (Primary Residential, Mixed Residential, Commercial, Institutional, Agricultural, OSR).
  - **Restrictive & Risk Zones (5 layers)**: 300m/500m Stone quarry safety buffers, Forest & Wildlife sanctuaries, Defence installation 500m perimeters, Solid waste landfill buffers.
  - **Utilities (1 layer)**: TANGEDCO 110kV/230kV/400kV high-tension powerline easements.
- **4 Basemap Switcher**: MapTiler/OSM Streets, Esri World Imagery (Satellite), OpenTopoMap (Terrain), and ISRO Bhuvan (Indian Satellite WMS).

### 2. Veritas AI Assistant
- Conversational real estate copilot trained on Tamil Nadu Land Laws, CMDA Master Plans, TNCDBR 2019, Registration Department guideline tables, and RERA court verdicts.
- Instant statutory citations and guidance for builders, advocates, buyers, and surveyors.

### 3. LandAction Minis (123 One-Question Tools)
- 123 specialized single-purpose calculators and legal checks, unlocked 100% free with 0 credits:
  - *Stamp Duty & Registration Fee Calculator* (7% Stamp Duty + 2% Reg Fee)
  - *Land Unit Converter* (Grounds, Cents, Acres, Sq.Ft, Gunthas, Bigha, Sq.M)
  - *Guideline Value Tariff Revision Inspector*
  - *FSI & Maximum Height Calculator*
  - *Patta Name Transfer Eligibility*
  - *Waterbody 15m Buffer Distance Calculator*

### 4. Verify My Land (33-Point Automated Due Diligence)
- Comprehensive title and spatial audit sheet by Survey Number (e.g., `112/5`, `163/2`, `42/2`).
- Computes an overall 0–100 Title Safety Index and generates an official, printable due diligence audit certificate.

### 5. PriceMap (25-Year Valuation History)
- Continuous tariff history from 2002 to 2026.
- Interactive SVG appreciation chart comparing government guideline values vs. actual registered SRO deeds.
- Total acquisition outlay and stamp duty calculator.

### 6. Build Scope (TNCDBR 2019 Feasibility Calculator)
- Rule 35 & 36 building regulations engine.
- Computes permissible Basic FSI, Premium FSI, Built-Up Area (BUA), setbacks, and parking requirements.
- Generates an SVG 2D cross-section building mass envelope.

### 7. Legal Opinion (50-Year Title Trace)
- Continuous title chain from 1975 to 2026.
- Scrutinizes parent deeds, partition deeds, and registered mortgage discharge receipts.
- Madras High Court & City Civil Court search verification with advocate digital seal.

### 8. Property Tracker (24/7 Cadastral Mutation Radar)
- Continuous watch for unauthorized SRO deeds, Tamil Nilam patta mutations, and court attachments.
- Live telemetry stream simulation and instant WhatsApp/Email alert previews.

### 9. Deal Room (Transaction Workspace)
- 7-milestone collaborative transaction workflow (Token Advance, Title Clearance, DGPS Survey, Sale Agreement, Bank NOC, SRO Conveyance, Patta Mutation).
- Encrypted document vault for parent title deeds, ECs, and computerized pattas.

### 10. Pan-India 28-State Bhu-Aadhaar & ULPIN Resolver
- Resolves land records and official state portals across India:
  - Tamil Nadu: *Anytime Anywhere e-Services (Patta Chitta) & Star 2.0*
  - Karnataka: *Bhoomi & Kaveri Online*
  - Maharashtra: *MahaBhumi (7/12 & 8A) & iSARITA*
  - Andhra Pradesh: *MeeBhoomi & CARD*
  - Telangana: *Dharani Portal*
  - Gujarat: *AnyROR & gARVI*
  - Rajasthan: *Apna Khata & E-Panjiyan*
  - Uttar Pradesh: *UP Bhulekh & IGRSUP*
  - West Bengal: *Banglarbhumi & WBREGI*
  - Kerala: *E-Rekha & PEARL*

---

## 🔌 Model Context Protocol (MCP) Server

LandAction implements the official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification, allowing any AI coding agent or LLM client to query Indian cadastral records, calculate stamp duties, and verify land legality.

### Transports Supported
1. **Stdio Transport**: `node mcp-server.js` (for Claude Desktop, Cursor, Claude Code, Windsurf)
2. **HTTP JSON-RPC 2.0 Transport**: `POST http://localhost:3000/mcp`
3. **SSE (Server-Sent Events) Transport**: `GET http://localhost:3000/mcp/sse`

### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "landaction": {
      "command": "node",
      "args": ["c:/Documents/Projects/LAND ACTION/mcp-server.js"]
    }
  }
}
```

### Cursor IDE Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "landaction": {
      "url": "http://localhost:3000/mcp/sse"
    }
  }
}
```

### Claude Code CLI
```bash
claude mcp add landaction node "c:/Documents/Projects/LAND ACTION/mcp-server.js"
```

### Example cURL Query
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "landaction_search_parcel",
      "arguments": { "query": "112/5" }
    }
  }'
```

---

## 🧩 Chrome Extension for Google Maps & Google Earth

A Chrome Extension (Manifest V3) is bundled in the `chrome-extension/` directory.

### Installation
1. Open Chrome or Brave and go to `chrome://extensions`
2. Enable **Developer mode** in the upper-right corner.
3. Click **Load unpacked** and select the `chrome-extension/` folder.
4. Open [Google Maps](https://maps.google.com) — the LandAction Cadastral HUD will appear automatically, showing latitude, longitude, revenue village, and one-click direct title verification!

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, CORS, JSON-RPC 2.0, SSE
- **Frontend**: Vanilla CSS (Tailored Design System, Dark Mode, Micro-animations), Vanilla JavaScript, SVG Vector Graphics
- **Data & GIS**: Tamil Nadu Registration Department guideline valuation tables, Revenue Department patta records, CMDA 2nd Master Plan zoning, TNCDBR 2019 rules, Pan-India NLRMP state portals
- **Protocols**: Model Context Protocol (MCP 2024-11-05), Chrome Extension Manifest V3

---

## 📦 Getting Started

### Prerequisites
- Node.js v18 or later

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/harinish45/land-action.git
cd land-action

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser at `http://localhost:3000`.

---

## 📄 License

MIT License. Open source and 100% free for everyone.
