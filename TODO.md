# 📋 TODO & Master Plan — land-action

> **Project**: LandAction — Open Land Intelligence Platform for Tamil Nadu
> **Status**: 🟡 In Progress (~40%)
> **Last Updated**: 2026-10-30

---

## 🏗️ Architecture Overview
\\\
land-action/
├── server.js          # Express REST API server
├── mcp-server.js      # Model Context Protocol server
├── api/               # API route handlers
├── public/            # Frontend assets + JS
│   ├── js/onemap.js   # One Map integration
│   └── openapi.json   # OpenAPI spec
├── chrome-extension/  # Browser extension
│   └── content.js
├── src/               # Core business logic
├── scripts/           # Utility scripts
├── test/              # Smoke tests
└── docs/              # Documentation
\\\

---

## ✅ Completed Features
- [x] Express HTTP server with CORS
- [x] MCP server scaffolding (mcp-server.js)
- [x] OpenAPI spec (public/openapi.json)
- [x] Chrome extension content script
- [x] OneMap Tamil Nadu integration skeleton
- [x] Vercel + Render deployment configs
- [x] Smoke test runner (test/smoke.mjs)

---

## 🔧 In Progress
- [ ] Patta (chitta) data fetching from TNCDBR
- [ ] Encumbrance Certificate (EC) parser
- [ ] Land survey number → owner mapping
- [ ] MCP tool definitions (land_lookup, ec_fetch, survey_info)
- [ ] Chrome extension popup UI
- [ ] One Map overlay layers

---

## 🚀 Roadmap
### Phase 1 — Core Data Layer (Nov 2026)
- [ ] Integrate TNCDBR public APIs (Patta, EC, Survey)
- [ ] Implement caching layer (Redis/KV)
- [ ] Rate limiting + API key management
- [ ] Complete OpenAPI spec with all endpoints

### Phase 2 — MCP Server (Nov–Dec 2026)
- [ ] Define full MCP tool manifest
- [ ] Implement land_lookup tool
- [ ] Implement ec_certificate tool
- [ ] Implement survey_details tool
- [ ] Test with Claude Desktop / Gemini

### Phase 3 — Chrome Extension (Dec 2026)
- [ ] Extension popup with land search UI
- [ ] Right-click context menu for map overlays
- [ ] Highlight survey numbers on govt websites
- [ ] Save/export functionality

### Phase 4 — Production (Jan 2027)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] API documentation site (Swagger UI)
- [ ] Community contributions guide

---

## 🐛 Known Issues
- [ ] mcp-server.js is scaffolding only — no actual tools implemented
- [ ] chrome-extension content.js has no popup UI
- [ ] Missing .env.example for local setup

## 📎 References
- [TNCDBR Portal](https://www.tncdbr.tn.gov.in)
- [Tamil Nadu One Map](https://www.tnmap.tn.gov.in)
- [MCP Specification](https://spec.modelcontextprotocol.io)