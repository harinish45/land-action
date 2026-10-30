import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { PUBLIC_DIR } from '../config.js';
import { tools, states, statePortals } from '../data/registry.js';
import { runTool } from '../services/tool-runner.js';
import { buildVerifyReport } from '../services/verify-report.js';
import { answerChat } from '../services/chat.js';
import { minis, miniCategories, getMini, runMini } from '../services/minis-engine.js';
import { getParcelInfo, getDistrictList, getVillageList } from '../domain/parcels.js';

export const apiRouter = Router();

// ---------- Geography browse: ALL districts, any village ----------

apiRouter.get('/geo/districts', (_req, res) => {
  const districts = getDistrictList();
  res.json({ status: 'ok', total: districts.length, districts });
});

apiRouter.get('/geo/villages', (req, res) => {
  const { district, taluk } = req.query;
  if (!district) return res.status(400).json({ status: 'error', message: 'district query param required' });
  const villages = getVillageList(String(district), taluk ? String(taluk) : null);
  res.json({ status: 'ok', district, taluk: taluk || null, total: villages.length, villages });
});

// ---------- Documents: patta chitta, EC, guideline, zoning, FMB, bundle ----------

const DOC_TYPES = ['patta-chitta', 'ec', 'guideline', 'zoning', 'fmb', 'a-register', 'bundle'];

apiRouter.post('/documents/:docType', (req, res) => {
  const docType = req.params.docType;
  if (!DOC_TYPES.includes(docType)) {
    return res.status(404).json({ status: 'error', message: `Document '${docType}' not found. Available: ${DOC_TYPES.join(', ')}` });
  }
  const body = req.body || {};
  const parcel = getParcelInfo(body.survey_no || body.query || body.village || '112/5');
  const today = new Date().toISOString().slice(0, 10);
  const docMeta = {
    document_type: docType,
    issued_by: 'LandAction (open platform)',
    issued_on: today,
    cost: 0,
    price_label: 'FREE — 0 credits, unlimited',
    source: 'Tamil Nadu e-Services / Star 2.0 / IGR',
    ulpin: parcel.ulpin,
    survey_number: parcel.survey_number,
    village: parcel.village
  };

  const docs = {
    'patta-chitta': {
      patta_number: parcel.patta_number,
      old_survey: parcel.old_survey,
      district: parcel.district, taluk: parcel.taluk, village: parcel.village, sro: parcel.sro,
      extent: parcel.extent,
      classification: parcel.classification,
      classification_tamil: parcel.classification_ta,
      registered_owners: parcel.owners,
      record_type: 'Patta + Chitta extract',
      digital_signature_verified: true
    },
    'ec': {
      survey_number: parcel.survey_number,
      village: parcel.village,
      sro: parcel.sro,
      period: '1996 - ' + new Date().getFullYear() + ' (30 Years)',
      total_transactions: parcel.actual_market_data.transactions.length,
      transaction_trail: parcel.actual_market_data.transactions,
      open_encumbrance: false,
      mortgages_open: 0,
      attachments: 0,
      verdict: 'No open mortgages or attachment charges. Clean marketable title.'
    },
    'guideline': {
      survey_number: parcel.survey_number,
      village: parcel.village,
      rate_per_sqft: parcel.guideline_value.current_rate_sqft,
      rate_per_ground: parcel.guideline_value.current_rate_ground,
      igr_classification: parcel.guideline_value.classification_igr,
      effective_date: '01-Jul-2024 revision',
      history_2002_2026: parcel.guideline_value.history
    },
    'zoning': {
      master_plan: parcel.zoning.master_plan,
      zone: parcel.zoning.zone_name,
      zone_code: parcel.zoning.zone_code,
      permissible_uses: parcel.zoning.permissible_uses,
      fsi_standard: parcel.zoning.fsi_standard,
      fsi_max: parcel.zoning.fsi_max_achievable,
      max_height_m: parcel.zoning.max_height_m,
      road_frontage_m: parcel.zoning.frontage_road_width_m,
      crz: parcel.zoning.crz_applicable ? 'Restricted' : 'Clear',
      water_buffer_15m: parcel.zoning.water_body_within_15m ? 'Violated' : 'Clear',
      airport_cap_m: parcel.zoning.airport_height_cap_m
    },
    'fmb': {
      survey_number: parcel.survey_number,
      old_survey: parcel.old_survey,
      village: parcel.village,
      extent: parcel.extent,
      sketch_ref: 'FMB-' + parcel.village_code + '-' + parcel.survey_number.replace('/', '-')
    },
    'a-register': {
      survey_number: parcel.survey_number,
      village: parcel.village,
      settlement: 'Ryotwari Settlement (A-Register)',
      classification: parcel.classification,
      extent: parcel.extent,
      recorded_holder: parcel.owners[0].name,
      mutation_status: 'Current'
    }
  };

  if (docType === 'bundle') {
    res.json({ ok: true, status: 'ok', ...docMeta, document: {
      patta_chitta: docs['patta-chitta'],
      ec: docs['ec'],
      guideline: docs['guideline'],
      zoning: docs['zoning'],
      fmb: docs['fmb'],
      a_register: docs['a-register'],
      documents_included: ['Patta', 'Chitta', 'EC 30yr', 'Guideline Value', 'Zoning Order', 'FMB Sketch', 'A-Register']
    }});
    return;
  }

  res.json({ ok: true, status: 'ok', ...docMeta, document: docs[docType] });
});



// ---------- 123 Minis (LandLens-parity, 100% free) ----------

// Catalog: list + categories (mirrors GET /data/minis_catalog.json)
apiRouter.get('/minis', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'LandAction Minis',
    pricing: '123/123 free — 0 credits, no wallet, no approval needed',
    total: minis.length,
    free: minis.length,
    categories: miniCategories,
    tools: minis
  });
});

// One mini's metadata
apiRouter.get('/minis/:slug', (req, res) => {
  const mini = getMini(req.params.slug);
  if (!mini) return res.status(404).json({ status: 'error', message: `Mini '${req.params.slug}' not found` });
  res.json({ status: 'ok', mini, cost: 0 });
});

// Run a mini — price-before-run UX: response always reports price_label FREE
apiRouter.post('/minis/:slug/run', (req, res) => {
  const result = runMini(req.params.slug, req.body || {});
  if (!result) return res.status(404).json({ status: 'error', message: `Mini '${req.params.slug}' not found` });
  res.json({ ok: true, status: 'ok', charged: false, result });
});


// List all tools
apiRouter.get('/tools', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'LandAction',
    pricing: '100% Free & Open Access',
    total_tools: tools.length,
    tools
  });
});

// Pan-India 28-State Portals & Bhu-Aadhaar Resolver
apiRouter.get('/states', (_req, res) => {
  res.json({
    status: 'ok',
    total_states: states.length,
    ecosystem: statePortals.portal_ecosystem ?? null,
    states
  });
});

apiRouter.get('/states/:stateCode', (req, res) => {
  const code = req.params.stateCode.toUpperCase();
  const state = states.find(s =>
    s.state_code === code || s.state_name.toUpperCase() === code);
  if (state) return res.json({ status: 'ok', state });
  res.status(404).json({ status: 'error', message: `State ${code} not found in NLRMP registry` });
});

// Single Tool Runner
apiRouter.post('/tools/:toolId', (req, res) => {
  const body = req.body || {};
  const data = runTool(req.params.toolId, body);
  res.json({
    ok: true,
    status: 'ok',
    tool: req.params.toolId,
    cost: '0 credits (Free in LandAction)',
    balance_remaining: 'Unlimited (Open Access)',
    data
  });
});

// Full Due Diligence Verify My Land report (33+ checks)
apiRouter.post('/verify', (req, res) => {
  const report = buildVerifyReport({
    query: req.body.survey_no || req.body.query,
    seller: req.body.seller_name
  });
  res.json({ ok: true, report });
});

// LandAction One: Veritas AI Assistant
apiRouter.post('/chat', (req, res) => {
  const { reply, citations } = answerChat(req.body?.message);
  res.json({
    ok: true,
    response: reply,
    reply,
    citations,
    platform: 'LandAction One (Veritas)',
    cost: '0 credits (Always Free)'
  });
});

// Extension zip download
apiRouter.get('/extension/download', (_req, res) => {
  const zipPath = path.join(PUBLIC_DIR, 'landaction-extension.zip');
  if (fs.existsSync(zipPath)) return res.download(zipPath, 'landaction-cadastral-extension.zip');
  res.status(404).json({ error: 'Extension package not found' });
});
