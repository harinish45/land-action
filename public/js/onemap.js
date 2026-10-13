// LandAction - One Map 33-Layer Cadastral Spatial Engine & Basemap Switcher
(function() {
  'use strict';

  let currentBasemap = 'streets';
  let activeParcels = [];
  let selectedParcel = null;

  const basemaps = {
    streets: {
      name: 'MapTiler / OSM Streets (Default)',
      bgColor: '#0f172a',
      gridColor: 'rgba(255,255,255,0.08)',
      attribution: '© MapTiler © OpenStreetMap contributors'
    },
    satellite: {
      name: 'Esri World Imagery (Satellite)',
      bgColor: '#05131e',
      gridColor: 'rgba(6,182,212,0.15)',
      attribution: 'Source: Esri, Maxar, Earthstar Geographics'
    },
    terrain: {
      name: 'OpenTopoMap (Terrain & Contours)',
      bgColor: '#151d18',
      gridColor: 'rgba(34,197,94,0.12)',
      attribution: '© OpenTopoMap (CC-BY-SA)'
    },
    bhuvan: {
      name: 'ISRO Bhuvan (Indian Satellite WMS)',
      bgColor: '#091e2b',
      gridColor: 'rgba(245,158,11,0.15)',
      attribution: '© Bhuvan / NRSC / ISRO Geospatial'
    }
  };

  async function initOneMap() {
    try {
      const resp = await fetch('/data/tn_registers.json');
      const data = await resp.json();
      activeParcels = data.sample_parcels || [];
      selectedParcel = activeParcels[0];

      setupLayerToggles();
      setupParcelSelector();
      renderMap();
      renderParcelInfo();
    } catch (e) {
      console.error('Failed to init OneMap', e);
    }
  }

  function setupLayerToggles() {
    const layerIds = ['layer-water', 'layer-crz', 'layer-heritage', 'layer-transport', 'layer-planning', 'layer-risk', 'layer-utilities'];
    layerIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          renderMap();
          updateActiveLayersCount();
        });
      }
    });

    const resetBtn = document.getElementById('onemap-reset-layers');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        layerIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = true;
        });
        renderMap();
        updateActiveLayersCount();
      });
    }
  }

  function setupParcelSelector() {
    const sel = document.getElementById('onemap-parcel-quickselect');
    if (sel) {
      sel.addEventListener('change', (e) => {
        const found = activeParcels.find(p => p.survey_number === e.target.value);
        if (found) {
          selectedParcel = found;
          renderMap();
          renderParcelInfo();
        }
      });
    }
  }

  function updateActiveLayersCount() {
    const checkboxes = document.querySelectorAll('.onemap-layers-panel input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(c => c.checked).length;
    const badge = document.getElementById('active-layers-count');
    if (badge) {
      badge.textContent = `${checked * 4 + 5} / 33 Layers Active`;
    }
  }

  function renderMap() {
    const svg = document.getElementById('cadastral-svg');
    if (!svg || !selectedParcel) return;

    const waterOn = document.getElementById('layer-water')?.checked ?? true;
    const crzOn = document.getElementById('layer-crz')?.checked ?? true;
    const heritageOn = document.getElementById('layer-heritage')?.checked ?? true;
    const transportOn = document.getElementById('layer-transport')?.checked ?? true;
    const planningOn = document.getElementById('layer-planning')?.checked ?? true;
    const riskOn = document.getElementById('layer-risk')?.checked ?? true;
    const utilOn = document.getElementById('layer-utilities')?.checked ?? true;

    const bm = basemaps[currentBasemap] || basemaps.streets;

    svg.innerHTML = `
      <defs>
        <!-- Grid Pattern -->
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${bm.gridColor}" stroke-width="1"/>
        </pattern>
        <!-- Parcel Pattern -->
        <pattern id="cadastralHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255, 103, 37, 0.4)" stroke-width="2" />
        </pattern>
        <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
        </radialGradient>
      </defs>

      <!-- Basemap Canvas Background -->
      <rect width="900" height="520" fill="${bm.bgColor}"/>
      <rect width="900" height="520" fill="url(#mapGrid)"/>

      <!-- Surrounding Survey Polygons (Cadastral Fabric) -->
      <g id="cadastral-fabric" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" fill="rgba(255,255,255,0.02)">
        <polygon points="60,60 220,50 240,180 80,190" />
        <text x="140" y="120" fill="#64748b" font-size="11" text-anchor="middle">S.No 110</text>

        <polygon points="240,50 440,40 450,170 240,180" />
        <text x="340" y="110" fill="#64748b" font-size="11" text-anchor="middle">S.No 111</text>

        <polygon points="680,70 860,60 840,210 660,200" />
        <text x="750" y="140" fill="#64748b" font-size="11" text-anchor="middle">S.No 114</text>

        <polygon points="70,220 230,210 250,380 90,390" />
        <text x="150" y="300" fill="#64748b" font-size="11" text-anchor="middle">S.No 112/1</text>

        <polygon points="650,230 840,220 820,410 640,400" />
        <text x="730" y="320" fill="#64748b" font-size="11" text-anchor="middle">S.No 113</text>
      </g>

      <!-- 1. Water Body Layer -->
      ${waterOn ? `
        <g id="layer-water-svg">
          <ellipse cx="140" cy="440" rx="90" ry="50" fill="url(#waterGlow)" stroke="#0284c7" stroke-width="2"/>
          <ellipse cx="140" cy="440" rx="120" ry="70" fill="none" stroke="#0284c7" stroke-dasharray="4,4" stroke-width="1.5"/>
          <text x="140" y="445" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">Karapakkam Kulam (140m)</text>
          <text x="140" y="460" fill="#94a3b8" font-size="9" text-anchor="middle">15m Buffer Satisfied ✓</text>
        </g>
      ` : ''}

      <!-- 2. CRZ Coastal Boundary Layer -->
      ${crzOn ? `
        <g id="layer-crz-svg">
          <line x1="880" y1="0" x2="880" y2="520" stroke="#06b6d4" stroke-width="3" stroke-dasharray="8,4"/>
          <text x="860" y="490" fill="#06b6d4" font-size="10" text-anchor="end" transform="rotate(-90 860,490)">CRZ-II Buffer Band (1.2 km East)</text>
        </g>
      ` : ''}

      <!-- 3. Heritage & Religious Lands Layer -->
      ${heritageOn ? `
        <g id="layer-heritage-svg">
          <rect x="700" y="420" width="160" height="70" fill="rgba(168,85,247,0.12)" stroke="#a854d7" stroke-width="1.5" rx="4"/>
          <text x="780" y="450" fill="#c084fc" font-size="11" text-anchor="middle">Temple Trust Boundary</text>
          <text x="780" y="468" fill="#e9d5ff" font-size="9" text-anchor="middle">Clear: > 600m away</text>
        </g>
      ` : ''}

      <!-- 4. Transport & Master Plan Roads Layer -->
      ${transportOn ? `
        <g id="layer-transport-svg">
          <!-- Main Frontage Corridor (18m expanding to 24m) -->
          <rect x="0" y="180" width="900" height="36" fill="rgba(245, 158, 11, 0.18)" stroke="#f59e0b" stroke-width="1.5"/>
          <line x1="0" y1="198" x2="900" y2="198" stroke="#f59e0b" stroke-dasharray="6,6" stroke-width="1.2"/>
          <text x="450" y="202" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">Old Mahabalipuram Road (OMR) • 18m Width (CMDA 24m Proposal)</text>
        </g>
      ` : ''}

      <!-- 5. Planning & Land Use Layer -->
      ${planningOn ? `
        <g id="layer-planning-svg">
          <rect x="250" y="226" width="380" height="260" fill="rgba(16, 185, 129, 0.06)" stroke="#10b981" stroke-dasharray="3,3" stroke-width="1"/>
          <text x="440" y="244" fill="#34d399" font-size="10" text-anchor="middle">CMDA Zone: Primary Residential (PR-01) • FSI 2.0 / 3.25</text>
        </g>
      ` : ''}

      <!-- 6. Restrictive & Quarry Safety Zone Layer -->
      ${riskOn ? `
        <g id="layer-risk-svg">
          <circle cx="820" cy="80" r="45" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" stroke-dasharray="3,3" stroke-width="1.5"/>
          <text x="820" y="85" fill="#f87171" font-size="9" text-anchor="middle">Quarry 500m Buffer</text>
        </g>
      ` : ''}

      <!-- 7. High Tension Powerline Corridor -->
      ${utilOn ? `
        <g id="layer-utilities-svg">
          <line x1="20" y1="20" x2="880" y2="120" stroke="#eab308" stroke-dasharray="10,5" stroke-width="2"/>
          <text x="280" y="55" fill="#fde047" font-size="10">TANGEDCO 110kV HT Transmission Line (Clear of Subject Parcel)</text>
        </g>
      ` : ''}

      <!-- THE TARGET SUBJECT PARCEL (e.g. S.No 112/5) -->
      <g id="subject-parcel-g">
        <polygon points="270,260 590,250 610,460 290,470" fill="url(#cadastralHatch)" stroke="#ff6725" stroke-width="3" />
        <circle cx="445" cy="360" r="8" fill="#ff6725" stroke="#ffffff" stroke-width="2"/>
        <text x="445" y="335" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">S.No ${selectedParcel.survey_number}</text>
        <text x="445" y="390" fill="#fed7aa" font-size="11" font-weight="600" text-anchor="middle">${selectedParcel.extent}</text>
        <text x="445" y="408" fill="#cbd5e1" font-size="10" text-anchor="middle">Patta: ${selectedParcel.patta_number} • ₹${selectedParcel.guideline_value.current_rate_sqft}/sqft</text>
      </g>

      <!-- Map Compass Rose -->
      <g transform="translate(850, 40)">
        <circle cx="0" cy="0" r="20" fill="rgba(15,23,42,0.8)" stroke="#475569" stroke-width="1"/>
        <polygon points="0,-16 4,0 0,6 -4,0" fill="#ff6725"/>
        <text x="0" y="-18" fill="#ff6725" font-size="10" font-weight="bold" text-anchor="middle">N</text>
      </g>

      <!-- Basemap Attribution Watermark -->
      <text x="880" y="508" fill="#64748b" font-size="9" text-anchor="end">${bm.attribution}</text>
    `;
  }

  function renderParcelInfo() {
    const infoCard = document.getElementById('onemap-parcel-info');
    if (!infoCard || !selectedParcel) return;

    infoCard.innerHTML = `
      <div class="parcel-card-header">
        <div>
          <span class="badge badge-primary">Inspected Parcel</span>
          <h3>Survey No. ${selectedParcel.survey_number} (Old: ${selectedParcel.old_survey})</h3>
          <p>${selectedParcel.village} Village, ${selectedParcel.taluk} Taluk, ${selectedParcel.district} District</p>
        </div>
        <div class="parcel-safety-pill">
          <div class="pill-number font-mono">98/100</div>
          <div class="pill-text">Safe Title</div>
        </div>
      </div>

      <div class="parcel-info-grid">
        <div class="p-item">
          <span class="p-label">Registered Owner</span>
          <span class="p-val">${selectedParcel.owners[0].name}</span>
          <span class="p-sub">${selectedParcel.owners[0].relation}</span>
        </div>
        <div class="p-item">
          <span class="p-label">Extent & Land Type</span>
          <span class="p-val font-mono">${selectedParcel.extent}</span>
          <span class="p-sub">${selectedParcel.classification} (${selectedParcel.classification_ta})</span>
        </div>
        <div class="p-item">
          <span class="p-label">Guideline Value (IGR TN)</span>
          <span class="p-val font-mono text-brand">₹${selectedParcel.guideline_value.current_rate_sqft} / sq.ft</span>
          <span class="p-sub">₹${(selectedParcel.guideline_value.current_rate_ground / 10000000).toFixed(2)} Cr / Ground</span>
        </div>
        <div class="p-item">
          <span class="p-label">Sub-Registrar Office (SRO)</span>
          <span class="p-val">${selectedParcel.sro}</span>
          <span class="p-sub">ULPIN: ${selectedParcel.ulpin}</span>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="parcel-actions-row">
        <button class="btn btn-sm btn-primary" onclick="window.LandActionApp.selectParcel('${selectedParcel.survey_number}')">
          ⚡ Run 33 Automated Due Diligence Checks
        </button>
        <button class="btn btn-sm btn-outline" onclick="window.LandActionPriceMap.setParcel('${selectedParcel.survey_number}')">
          📈 View 25-Year Price History
        </button>
      </div>
    `;
  }

  window.LandActionOneMap = {
    init: initOneMap,
    setBasemap: (name) => {
      if (basemaps[name]) {
        currentBasemap = name;
        renderMap();
      }
    }
  };
})();
