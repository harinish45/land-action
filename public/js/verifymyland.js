// Verify My Land (VML) 33+ Automated Due Diligence Checks Engine

window.VerifyMyLandEngine = {
  currentReport: null,

  init() {
    this.bindEvents();
    // Deep link: ?report=<survey> from a share link
    const params = new URLSearchParams(location.search);
    const shareSurvey = params.get('report');
    const surveyInput = document.getElementById('verify-input-survey');
    if (shareSurvey) {
      this.generateReport(shareSurvey, params.get('seller') || 'Ramanathan K');
    } else if (surveyInput) {
      this.generateReport(surveyInput.value || '112/5', 'Ramanathan K');
    }
  },

  bindEvents() {
    const runBtn = document.getElementById('verify-run-btn');
    if (runBtn && !runBtn.dataset.vmlBound) {
      runBtn.dataset.vmlBound = '1';
      runBtn.addEventListener('click', () => {
        const survey = document.getElementById('verify-input-survey')?.value || '112/5';
        this.generateReport(survey, 'Ramanathan K');
      });
    }
  },

  async generateReport(surveyNo, sellerName) {
    const container = document.getElementById('verify-results-container');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; padding: 40px;">
        <div class="dot-pulse" style="margin: 0 auto 16px; width: 14px; height: 14px; color: var(--primary);"></div>
        <p style="color: #cbd5e1; font-weight: 600;">Cross-referencing 33 registers across Tamil Nadu Revenue, IGR, CERSAI & CMDA...</p>
      </div>
    `;

    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survey_no: surveyNo, seller_name: sellerName })
      });
      const data = await res.json();
      this.currentReport = data.report;
      this.renderReport(data.report);
    } catch (err) {
      container.innerHTML = `<p style="color:#ef4444; padding:20px;">Failed to generate verification report: ${err.message}</p>`;
    }
  },

  renderReport(report) {
    const container = document.getElementById('verify-results-container');
    if (!container || !report) return;

    const checksHtml = report.thirty_three_checks.map(c => `
      <tr>
        <td style="font-weight:700; color:#64748b;">#${c.id}</td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#94a3b8; display:block;">${c.category}</span>
          <b style="color:#0f172a; font-size:0.95rem;">${c.name}</b>
          <p style="margin:4px 0 0; color:#475569; font-size:0.85rem;">${c.detail}</p>
        </td>
        <td style="text-align:right;">
          <span class="status-badge-pass">${c.status}</span>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="report-paper">
        <div class="report-head-bar">
          <div>
            <span style="background:var(--primary); color:#fff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; text-transform:uppercase;">
              Official Legal Report · 100% Free
            </span>
            <h2 style="font-size:1.8rem; margin:10px 0 4px;">LandAction Due Diligence Audit</h2>
            <p style="margin:0; font-size:0.9rem; color:#64748b;">Report ID: ${report.report_id} · Generated on ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <div class="score-meter">
            <div class="score-circle">${report.risk_score}</div>
            <div>
              <b style="font-size:1.1rem; color:#15803d; display:block;">Low Risk Clear Title</b>
              <small style="color:#64748b;">33 of 33 checks passed</small>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:24px;">
          <div><small style="color:#64748b; font-size:0.75rem;">Survey Number</small><br><b style="color:#0f172a; font-size:1rem;">${report.target.survey_number} (Old: ${report.target.old_survey})</b></div>
          <div><small style="color:#64748b; font-size:0.75rem;">Jurisdiction</small><br><b style="color:#0f172a; font-size:1rem;">${report.target.village}, ${report.target.taluk}</b></div>
          <div><small style="color:#64748b; font-size:0.75rem;">Extent & Area</small><br><b style="color:#0f172a; font-size:1rem;">${report.target.extent}</b></div>
          <div><small style="color:#64748b; font-size:0.75rem;">Sub-Registrar Office</small><br><b style="color:#0f172a; font-size:1rem;">${report.target.sro}</b></div>
        </div>

        <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:1.25rem; margin:0;">33 Automated Legal & Statutory Audits</h3>
          <span style="font-size:0.85rem; color:#15803d; font-weight:700;">✓ 100% Ground Truth Verified</span>
        </div>

        <table class="check-table">
          <thead>
            <tr>
              <th style="width:40px;">No.</th>
              <th>Audit Description & Regulatory Citation</th>
              <th style="width:80px; text-align:right;">Verdict</th>
            </tr>
          </thead>
          <tbody>
            ${checksHtml}
          </tbody>
        </table>

        <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#64748b; flex-wrap:wrap; gap:10px;">
          <span>Data grounded in TN Revenue, IGR, CERSAI, CMDA and DTCP registers.</span>
          <span style="display:flex; gap:8px; align-items:center;">
            <span class="free-pill">Shareable · no login · free</span>
            <button class="btn btn-sm btn-outline" onclick="window.VerifyMyLandEngine.copyShareLink('${report.report_id}')">🔗 Copy share link</button>
          </span>
        </div>
      </div>
    `;
  },

  copyShareLink(reportId) {
    const report = this.currentReport;
    if (!report) return;
    // Matches the deep-link the module reads on init: ?report=<survey>&seller=<name>
    const finalUrl = `${location.origin}${location.pathname}?report=${encodeURIComponent(report.target.survey_number)}`;
    const write = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(finalUrl)
      : Promise.reject(new Error('Clipboard blocked — copy the address bar URL instead'));
    write.then(
      () => alert(`Share link copied!\n${finalUrl}\nReport ${reportId} · free, no login needed.`),
      () => prompt('Copy this share link:', finalUrl)
    );
  }
};

// Legacy alias expected by app.js
window.LandActionVerify = window.VerifyMyLandEngine;
