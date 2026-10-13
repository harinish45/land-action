// LandAction - PriceMap Module: 25-Year Registered Price & Guideline Value Engine
(function() {
  'use strict';

  let currentParcel = null;
  let parcelsList = [];

  async function initPriceMap() {
    try {
      const resp = await fetch('/data/tn_registers.json');
      const data = await resp.json();
      parcelsList = data.sample_parcels || [];
      if (parcelsList.length > 0) {
        currentParcel = parcelsList[0];
      }
      setupControls();
      renderPriceMap();
    } catch (e) {
      console.error('Failed to init PriceMap', e);
    }
  }

  function setupControls() {
    const select = document.getElementById('pricemap-parcel-select');
    if (select) {
      select.innerHTML = parcelsList.map(p => 
        `<option value="${p.survey_number}">${p.survey_number} - ${p.village}, ${p.taluk} (₹${p.guideline_value.current_rate_sqft}/sqft)</option>`
      ).join('');

      select.addEventListener('change', (e) => {
        const found = parcelsList.find(p => p.survey_number === e.target.value);
        if (found) {
          currentParcel = found;
          renderPriceMap();
        }
      });
    }

    const calcBtn = document.getElementById('pricemap-calc-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', calculateValuation);
    }
  }

  function renderPriceMap() {
    if (!currentParcel) return;

    // 1. Overview Badges
    const badgeContainer = document.getElementById('pricemap-stats');
    if (badgeContainer) {
      const currentRate = currentParcel.guideline_value.current_rate_sqft;
      const marketRate = currentParcel.actual_market_data.recent_registered_rate;
      const history = currentParcel.guideline_value.history;
      const initialRate = history[0].rate_sqft;
      const years = history[history.length - 1].year - history[0].year;
      const cagr = ((Math.pow(currentRate / initialRate, 1 / years) - 1) * 100).toFixed(1);
      const ratio = (marketRate / currentRate).toFixed(2);

      badgeContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-title">Current Guideline Value</div>
          <div class="stat-value">₹${currentRate.toLocaleString('en-IN')} <span class="stat-unit">/ sq.ft</span></div>
          <div class="stat-sub">₹${(currentRate * 2400).toLocaleString('en-IN')} / Ground (2,400 sqft)</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-title">Registered Market Rate</div>
          <div class="stat-value">₹${marketRate.toLocaleString('en-IN')} <span class="stat-unit">/ sq.ft</span></div>
          <div class="stat-sub">Recent Sub-Registrar transactions</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">25-Yr Growth (CAGR)</div>
          <div class="stat-value">${cagr}% <span class="stat-unit">p.a.</span></div>
          <div class="stat-sub">₹${initialRate} (2002) ➔ ₹${currentRate} (2026)</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Market vs Guideline Premium</div>
          <div class="stat-value">${ratio}x</div>
          <div class="stat-sub">${Math.round((ratio - 1) * 100)}% premium over government guideline</div>
        </div>
      `;
    }

    // 2. Interactive SVG 25-Year Trend Chart
    renderChart();

    // 3. Registered Deeds Table
    renderTransactionsTable();
  }

  function renderChart() {
    const chartSvg = document.getElementById('pricemap-chart-svg');
    if (!chartSvg) return;

    const history = currentParcel.guideline_value.history;
    const padding = { top: 30, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 320;

    const maxRate = Math.max(...history.map(h => h.rate_sqft), currentParcel.actual_market_data.recent_registered_rate) * 1.15;
    const minYear = history[0].year;
    const maxYear = history[history.length - 1].year;

    const getX = (year) => padding.left + ((year - minYear) / (maxYear - minYear)) * (width - padding.left - padding.right);
    const getY = (val) => height - padding.bottom - (val / maxRate) * (height - padding.top - padding.bottom);

    // Points for Guideline Value
    const points = history.map(h => `${getX(h.year)},${getY(h.rate_sqft)}`).join(' ');

    // Area polygon
    const firstX = getX(history[0].year);
    const lastX = getX(history[history.length - 1].year);
    const zeroY = height - padding.bottom;
    const areaPoints = `${firstX},${zeroY} ${points} ${lastX},${zeroY}`;

    // Grid lines & Y Axis labels
    const ySteps = 5;
    let gridLinesSvg = '';
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxRate / ySteps) * i);
      const y = getY(val);
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="#71717a" font-size="11" text-anchor="end">₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}</text>
      `;
    }

    // X Axis labels
    let xLabelsSvg = '';
    history.forEach(h => {
      const x = getX(h.year);
      xLabelsSvg += `
        <text x="${x}" y="${height - 12}" fill="#94a3b8" font-size="11" text-anchor="middle">${h.year}</text>
        <line x1="${x}" y1="${height - padding.bottom}" x2="${x}" y2="${height - padding.bottom + 5}" stroke="#475569" />
      `;
    });

    // Market transaction points
    let marketPointsSvg = '';
    if (currentParcel.actual_market_data.transactions) {
      currentParcel.actual_market_data.transactions
        .filter(t => t.rate_sqft > 0)
        .forEach(t => {
          const mx = getX(t.year);
          const my = getY(t.rate_sqft);
          marketPointsSvg += `
            <g class="chart-point-market" data-tooltip="${t.doc_no}: ₹${t.rate_sqft}/sqft">
              <circle cx="${mx}" cy="${my}" r="6" fill="#10b981" stroke="#052e16" stroke-width="2" />
              <text x="${mx}" y="${my - 10}" fill="#34d399" font-size="10" font-weight="600" text-anchor="middle">₹${t.rate_sqft}</text>
            </g>
          `;
        });
    }

    // Interactive circles for guideline value
    let dotsSvg = '';
    history.forEach(h => {
      const cx = getX(h.year);
      const cy = getY(h.rate_sqft);
      dotsSvg += `
        <g class="chart-point-guideline" tabindex="0">
          <circle cx="${cx}" cy="${cy}" r="5" fill="#ff6725" stroke="#ffffff" stroke-width="2" />
          <text x="${cx}" y="${cy - 9}" fill="#ffedd5" font-size="11" font-weight="bold" text-anchor="middle">₹${h.rate_sqft}</text>
        </g>
      `;
    });

    chartSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chartSvg.innerHTML = `
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff6725" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#ff6725" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridLinesSvg}
      ${xLabelsSvg}
      <polygon points="${areaPoints}" fill="url(#chartGradient)" />
      <polyline points="${points}" fill="none" stroke="#ff6725" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${dotsSvg}
      ${marketPointsSvg}
    `;
  }

  function renderTransactionsTable() {
    const tableBody = document.getElementById('pricemap-tx-tbody');
    if (!tableBody) return;

    const txs = currentParcel.actual_market_data.transactions || [];
    if (txs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No registered transactions recorded.</td></tr>`;
      return;
    }

    tableBody.innerHTML = txs.map(t => `
      <tr>
        <td><strong>${t.doc_no}</strong><div class="text-xs text-muted">${t.date}</div></td>
        <td><span class="badge ${t.type.includes('Sale') ? 'badge-primary' : 'badge-neutral'}">${t.type}</span></td>
        <td>${t.area_sqft ? t.area_sqft.toLocaleString('en-IN') + ' sq.ft' : '-'}</td>
        <td class="font-mono">${t.consideration > 0 ? '₹' + (t.consideration / 100000).toFixed(2) + ' Lakhs' : 'Non-sale'}</td>
        <td class="font-mono font-bold text-success">${t.rate_sqft > 0 ? '₹' + t.rate_sqft.toLocaleString('en-IN') : 'N/A'}</td>
        <td class="text-sm">
          <div><span class="text-muted">Seller:</span> ${t.seller}</div>
          <div><span class="text-muted">Buyer:</span> ${t.buyer}</div>
        </td>
        <td><span class="badge badge-success">Verified SRO Deed</span></td>
      </tr>
    `).join('');
  }

  function calculateValuation() {
    if (!currentParcel) return;
    const areaInput = document.getElementById('pricemap-calc-area');
    const roadFactor = parseFloat(document.getElementById('pricemap-calc-road')?.value || '1.0');
    const area = parseFloat(areaInput?.value || '2400');

    const gRate = currentParcel.guideline_value.current_rate_sqft * roadFactor;
    const mRate = currentParcel.actual_market_data.recent_registered_rate * roadFactor;

    const gTotal = gRate * area;
    const mTotal = mRate * area;

    const stampDuty = mTotal * 0.07;
    const regFee = mTotal * 0.02;
    const totalOutlay = mTotal + stampDuty + regFee;

    const resultDiv = document.getElementById('pricemap-calc-result');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="valuation-summary-card">
          <div class="val-header">
            <h4>Valuation Breakdown (${area.toLocaleString('en-IN')} sq.ft)</h4>
            <span class="badge badge-primary">TN Guideline Revised 2026</span>
          </div>
          <div class="val-grid">
            <div class="val-item">
              <span class="val-label">Minimum Guideline Valuation</span>
              <span class="val-num">₹${(gTotal / 100000).toFixed(2)} Lakhs</span>
              <span class="val-sub">@ ₹${Math.round(gRate)}/sq.ft</span>
            </div>
            <div class="val-item highlight">
              <span class="val-label">Estimated Market Value</span>
              <span class="val-num">₹${(mTotal / 100000).toFixed(2)} Lakhs</span>
              <span class="val-sub">@ ₹${Math.round(mRate)}/sq.ft</span>
            </div>
            <div class="val-item">
              <span class="val-label">Stamp Duty (7%)</span>
              <span class="val-num">₹${Math.round(stampDuty).toLocaleString('en-IN')}</span>
              <span class="val-sub">Tamil Nadu Registration Act</span>
            </div>
            <div class="val-item">
              <span class="val-label">Registration Fee (2%)</span>
              <span class="val-num">₹${Math.round(regFee).toLocaleString('en-IN')}</span>
              <span class="val-sub">SRO Neelankarai SRO</span>
            </div>
          </div>
          <div class="val-total">
            <span>Total Acquisition Outlay (Value + Duties):</span>
            <span class="val-total-amount">₹${(totalOutlay / 100000).toFixed(2)} Lakhs</span>
          </div>
        </div>
      `;
    }
  }

  window.LandActionPriceMap = {
    init: initPriceMap,
    setParcel: (surveyNo) => {
      const p = parcelsList.find(x => x.survey_number === surveyNo);
      if (p) {
        currentParcel = p;
        const sel = document.getElementById('pricemap-parcel-select');
        if (sel) sel.value = surveyNo;
        renderPriceMap();
      }
    }
  };
})();
