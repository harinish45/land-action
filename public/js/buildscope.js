// LandAction - Build Scope Module: TNCDBR 2019 Feasibility & Development Potential Engine
(function() {
  'use strict';

  function initBuildScope() {
    setupEventListeners();
    calculateScope();
  }

  function setupEventListeners() {
    const inputs = [
      'bs-plot-area', 'bs-plot-unit', 'bs-road-width', 
      'bs-building-type', 'bs-premium-fsi', 'bs-plot-frontage'
    ];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculateScope);
        el.addEventListener('change', calculateScope);
      }
    });

    const resetBtn = document.getElementById('bs-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const areaEl = document.getElementById('bs-plot-area');
        if (areaEl) areaEl.value = '4800';
        const roadEl = document.getElementById('bs-road-width');
        if (roadEl) roadEl.value = '12';
        calculateScope();
      });
    }
  }

  function calculateScope() {
    const plotAreaRaw = parseFloat(document.getElementById('bs-plot-area')?.value || '4800');
    const plotUnit = document.getElementById('bs-plot-unit')?.value || 'sqft';
    const roadWidthM = parseFloat(document.getElementById('bs-road-width')?.value || '12'); // meters
    const buildingType = document.getElementById('bs-building-type')?.value || 'residential';
    const includePremiumFSI = document.getElementById('bs-premium-fsi')?.checked || false;
    const frontageM = parseFloat(document.getElementById('bs-plot-frontage')?.value || '15'); // meters

    // Convert plot area to sq.m and sq.ft
    let plotAreaSqft = plotAreaRaw;
    if (plotUnit === 'ground') plotAreaSqft = plotAreaRaw * 2400;
    else if (plotUnit === 'cents') plotAreaSqft = plotAreaRaw * 435.6;
    else if (plotUnit === 'sqm') plotAreaSqft = plotAreaRaw * 10.7639;
    const plotAreaSqm = plotAreaSqft / 10.7639;

    // TNCDBR 2019 Rule 35 & 36 FSI Matrix
    let basicFSI = 1.75;
    let maxFloors = "Stilt + 3 Floors";
    let maxHeightM = 12.0;
    let maxCoverage = 0.70; // 70%

    if (roadWidthM < 7.2) {
      basicFSI = 1.50;
      maxFloors = "Ground + 1 Floor";
      maxHeightM = 9.0;
    } else if (roadWidthM >= 7.2 && roadWidthM < 9.0) {
      basicFSI = 1.75;
      maxFloors = "Stilt + 3 Floors";
      maxHeightM = 12.0;
    } else if (roadWidthM >= 9.0 && roadWidthM < 12.0) {
      basicFSI = 2.00;
      maxFloors = "Stilt + 4 Floors";
      maxHeightM = 15.0;
    } else if (roadWidthM >= 12.0 && roadWidthM < 18.0) {
      basicFSI = 2.00;
      maxFloors = "Stilt + 5 Floors (Non-HRB up to 18.3m)";
      maxHeightM = 18.3;
    } else if (roadWidthM >= 18.0) {
      basicFSI = 2.00;
      maxFloors = "Multi-Storey / High Rise Building (HRB)";
      maxHeightM = 30.0;
    }

    // Commercial adjustment
    if (buildingType === 'commercial') {
      maxCoverage = 0.65;
      if (roadWidthM >= 12.0) basicFSI = 2.25;
    }

    // Premium FSI calculation (TNCDBR Rule 37)
    let premiumFSI = 0;
    if (includePremiumFSI) {
      if (roadWidthM >= 18.0) premiumFSI = 0.50;
      else if (roadWidthM >= 12.0) premiumFSI = 0.40;
      else if (roadWidthM >= 9.0) premiumFSI = 0.30;
      else premiumFSI = 0;
    }

    const totalFSI = basicFSI + premiumFSI;
    const totalBUASqft = Math.round(plotAreaSqft * totalFSI);
    const totalBUASqm = Math.round(plotAreaSqm * totalFSI);
    const footprintSqft = Math.round(plotAreaSqft * maxCoverage);

    // Setback calculations (TNCDBR Rule 35 Table)
    let frontSetbackM = 3.0;
    let rearSetbackM = 3.0;
    let sideSetbackM = 2.0;

    if (maxHeightM <= 9.0) {
      frontSetbackM = 1.5;
      rearSetbackM = 1.5;
      sideSetbackM = 1.0;
    } else if (maxHeightM <= 12.0) {
      frontSetbackM = 3.0;
      rearSetbackM = 2.5;
      sideSetbackM = 1.5;
    } else if (maxHeightM <= 18.3) {
      frontSetbackM = 4.5;
      rearSetbackM = 3.5;
      sideSetbackM = 3.0;
    } else {
      frontSetbackM = 7.0;
      rearSetbackM = 6.0;
      sideSetbackM = 5.0;
    }

    // Parking estimation (TNCDBR Rule 39)
    // 1 car park per 100 sq.m of residential; 1 car park per 50 sq.m of commercial
    const unitDiv = buildingType === 'commercial' ? 50 : 100;
    const carParks = Math.ceil(totalBUASqm / unitDiv);
    const twoWheelers = Math.ceil(carParks * 3);

    // OSR (Open Space Reservation) check: required if plot area > 3,000 sq.m (approx 32,291 sq.ft)
    const osrRequired = plotAreaSqm >= 3000;
    const osrAreaSqft = osrRequired ? Math.round(plotAreaSqft * 0.10) : 0;

    // Render results
    renderResults({
      plotAreaSqft,
      plotAreaSqm,
      roadWidthM,
      basicFSI,
      premiumFSI,
      totalFSI,
      totalBUASqft,
      totalBUASqm,
      footprintSqft,
      maxFloors,
      maxHeightM,
      frontSetbackM,
      rearSetbackM,
      sideSetbackM,
      carParks,
      twoWheelers,
      osrRequired,
      osrAreaSqft,
      buildingType
    });
  }

  function renderResults(data) {
    const resultContainer = document.getElementById('bs-results');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="scope-summary-grid">
        <div class="scope-metric-card highlight">
          <div class="metric-label">Max Permissible Built-Up Area</div>
          <div class="metric-val text-brand font-mono">${data.totalBUASqft.toLocaleString('en-IN')} <span class="metric-unit">sq.ft</span></div>
          <div class="metric-sub">${data.totalBUASqm.toLocaleString('en-IN')} sq.m (~${(data.totalBUASqft / 2400).toFixed(1)} Grounds BUA)</div>
        </div>
        <div class="scope-metric-card">
          <div class="metric-label">Effective FSI</div>
          <div class="metric-val font-mono">${data.totalFSI.toFixed(2)}</div>
          <div class="metric-sub">Basic: ${data.basicFSI.toFixed(2)} ${data.premiumFSI > 0 ? '+ Premium: ' + data.premiumFSI.toFixed(2) : '(Premium 0)'}</div>
        </div>
        <div class="scope-metric-card">
          <div class="metric-label">Permissible Height</div>
          <div class="metric-val font-mono">${data.maxHeightM}m</div>
          <div class="metric-sub">${data.maxFloors}</div>
        </div>
        <div class="scope-metric-card">
          <div class="metric-label">Ground Coverage</div>
          <div class="metric-val font-mono">${data.footprintSqft.toLocaleString('en-IN')} <span class="metric-unit">sq.ft</span></div>
          <div class="metric-sub">Max 70% of plot footprint</div>
        </div>
      </div>

      <div class="scope-detail-sections">
        <div class="scope-section">
          <h4><span class="icon">📐</span> TNCDBR 2019 Setback Requirements</h4>
          <div class="setback-grid">
            <div class="setback-chip">
              <span class="setback-dir">Front Setback (Abutting Road)</span>
              <span class="setback-val">${data.frontSetbackM}m (${(data.frontSetbackM * 3.28084).toFixed(1)} ft)</span>
            </div>
            <div class="setback-chip">
              <span class="setback-dir">Rear Setback</span>
              <span class="setback-val">${data.rearSetbackM}m (${(data.rearSetbackM * 3.28084).toFixed(1)} ft)</span>
            </div>
            <div class="setback-chip">
              <span class="setback-dir">Side Setback 1</span>
              <span class="setback-val">${data.sideSetbackM}m (${(data.sideSetbackM * 3.28084).toFixed(1)} ft)</span>
            </div>
            <div class="setback-chip">
              <span class="setback-dir">Side Setback 2</span>
              <span class="setback-val">${data.sideSetbackM}m (${(data.sideSetbackM * 3.28084).toFixed(1)} ft)</span>
            </div>
          </div>
        </div>

        <div class="scope-section">
          <h4><span class="icon">🚗</span> Statutory Parking Requirement (Rule 39)</h4>
          <div class="parking-summary">
            <div class="parking-box">
              <span class="p-title">Car Parking</span>
              <span class="p-count text-brand">${data.carParks} Slots</span>
              <span class="p-desc">Minimum 2.5m x 5.0m per slot</span>
            </div>
            <div class="parking-box">
              <span class="p-title">Two Wheeler Parking</span>
              <span class="p-count text-success">${data.twoWheelers} Slots</span>
              <span class="p-desc">Minimum 1.0m x 2.0m per slot</span>
            </div>
            <div class="parking-box">
              <span class="p-title">OSR Reservation (10%)</span>
              <span class="p-count ${data.osrRequired ? 'text-warning' : 'text-muted'}">${data.osrRequired ? data.osrAreaSqft.toLocaleString('en-IN') + ' sq.ft' : 'Exempt (< 3,000 sq.m)'}</span>
              <span class="p-desc">${data.osrRequired ? 'Mandatory gift deed to CMDA/Local Body' : 'Plot area below OSR threshold'}</span>
            </div>
          </div>
        </div>

        <div class="scope-section">
          <h4><span class="icon">🏢</span> Visual Building Mass Envelope (SVG Cross-Section)</h4>
          <div class="svg-envelope-container">
            ${renderBuildingEnvelopeSVG(data)}
          </div>
        </div>
      </div>
    `;
  }

  function renderBuildingEnvelopeSVG(data) {
    const width = 600;
    const height = 240;
    const groundY = 190;
    const roadWidthPx = Math.min(Math.max(data.roadWidthM * 7, 60), 160);
    const plotWidthPx = 360;

    const frontSbPx = data.frontSetbackM * 6;
    const rearSbPx = data.rearSetbackM * 6;
    const bldgWidthPx = Math.max(plotWidthPx - frontSbPx - rearSbPx, 80);
    const bldgHeightPx = Math.min(data.maxHeightM * 7, 130);
    const bldgX = 40 + roadWidthPx + frontSbPx;
    const bldgY = groundY - bldgHeightPx;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="envelope-svg">
        <defs>
          <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,103,37,0.3)" stroke-width="2" />
          </pattern>
        </defs>
        
        <!-- Ground Line -->
        <line x1="10" y1="${groundY}" x2="${width - 10}" y2="${groundY}" stroke="#64748b" stroke-width="3" />
        <text x="15" y="${groundY + 20}" fill="#94a3b8" font-size="11">Road Level (GL ±0.00)</text>

        <!-- Road -->
        <rect x="40" y="${groundY - 6}" width="${roadWidthPx}" height="8" fill="#334155" />
        <text x="${40 + roadWidthPx / 2}" y="${groundY - 12}" fill="#94a3b8" font-size="11" text-anchor="middle">Road (${data.roadWidthM}m)</text>

        <!-- Plot Boundaries -->
        <line x1="${40 + roadWidthPx}" y1="${groundY - 140}" x2="${40 + roadWidthPx}" y2="${groundY}" stroke="#ff6725" stroke-dasharray="4,4" stroke-width="2" />
        <line x1="${40 + roadWidthPx + plotWidthPx}" y1="${groundY - 140}" x2="${40 + roadWidthPx + plotWidthPx}" y2="${groundY}" stroke="#ff6725" stroke-dasharray="4,4" stroke-width="2" />
        <text x="${40 + roadWidthPx + plotWidthPx / 2}" y="${groundY + 25}" fill="#cbd5e1" font-size="11" text-anchor="middle">Plot Extent: ${data.plotAreaSqft.toLocaleString('en-IN')} sq.ft</text>

        <!-- Building Envelope -->
        <rect x="${bldgX}" y="${bldgY}" width="${bldgWidthPx}" height="${bldgHeightPx}" fill="url(#diagonalHatch)" stroke="#ff6725" stroke-width="2" rx="4" />
        <text x="${bldgX + bldgWidthPx / 2}" y="${bldgY + bldgHeightPx / 2 - 6}" fill="#ffedd5" font-size="12" font-weight="bold" text-anchor="middle">Permissible Envelope</text>
        <text x="${bldgX + bldgWidthPx / 2}" y="${bldgY + bldgHeightPx / 2 + 12}" fill="#ffedd5" font-size="10" text-anchor="middle">${data.totalBUASqft.toLocaleString('en-IN')} sq.ft Max BUA</text>

        <!-- Front Setback Dimension -->
        <line x1="${40 + roadWidthPx}" y1="${groundY - 20}" x2="${bldgX}" y2="${groundY - 20}" stroke="#38bdf8" stroke-width="1.5" />
        <text x="${40 + roadWidthPx + frontSbPx / 2}" y="${groundY - 26}" fill="#38bdf8" font-size="10" text-anchor="middle">FSB ${data.frontSetbackM}m</text>

        <!-- Rear Setback Dimension -->
        <line x1="${bldgX + bldgWidthPx}" y1="${groundY - 20}" x2="${40 + roadWidthPx + plotWidthPx}" y2="${groundY - 20}" stroke="#38bdf8" stroke-width="1.5" />
        <text x="${bldgX + bldgWidthPx + rearSbPx / 2}" y="${groundY - 26}" fill="#38bdf8" font-size="10" text-anchor="middle">RSB ${data.rearSetbackM}m</text>

        <!-- Height Dimension -->
        <line x1="${bldgX + bldgWidthPx + 15}" y1="${groundY}" x2="${bldgX + bldgWidthPx + 15}" y2="${bldgY}" stroke="#eab308" stroke-width="1.5" />
        <text x="${bldgX + bldgWidthPx + 22}" y="${bldgY + bldgHeightPx / 2}" fill="#eab308" font-size="11" text-anchor="start">Max ${data.maxHeightM}m</text>
      </svg>
    `;
  }

  window.LandActionBuildScope = {
    init: initBuildScope,
    calculate: calculateScope
  };
})();
