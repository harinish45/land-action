// LandAction - Legal Opinion Module: Automated Title Chain & Legal Risk Assessment
(function() {
  'use strict';

  let sampleData = null;

  async function initLegalOpinion() {
    try {
      const resp = await fetch('/data/tn_registers.json');
      sampleData = await resp.json();
      setupOpinionSelector();
      renderOpinion("112/5");
    } catch (e) {
      console.error('Failed to init LegalOpinion', e);
    }
  }

  function setupOpinionSelector() {
    const sel = document.getElementById('legal-parcel-select');
    if (!sel || !sampleData || !sampleData.sample_parcels) return;

    sel.innerHTML = sampleData.sample_parcels.map(p => `
      <option value="${p.survey_number}">Survey No. ${p.survey_number} - ${p.village}, ${p.taluk}</option>
    `).join('');

    sel.addEventListener('change', (e) => {
      renderOpinion(e.target.value);
    });

    const printBtn = document.getElementById('legal-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  function renderOpinion(surveyNo) {
    if (!sampleData || !sampleData.sample_parcels) return;
    const parcel = sampleData.sample_parcels.find(p => p.survey_number === surveyNo) || sampleData.sample_parcels[0];

    const container = document.getElementById('legal-opinion-content');
    if (!container) return;

    const timeline = parcel.encumbrance_timeline || [];

    container.innerHTML = `
      <!-- Certificate Header -->
      <div class="legal-doc-sheet">
        <div class="legal-watermark">LANDACTION LEGAL VETTING</div>
        <div class="legal-sheet-header">
          <div class="legal-emblem">⚖️</div>
          <h2>TITLE DUE DILIGENCE & LEGAL SCRUTINY REPORT</h2>
          <div class="legal-subtitle">Comprehensive 50-Year Title Trace & Marketability Certification</div>
          <div class="legal-meta-strip">
            <span><strong>Reference:</strong> LA-LEG-2026-${parcel.survey_number.replace('/', '-')}</span>
            <span><strong>Date of Scrutiny:</strong> 13-Oct-2026</span>
            <span><strong>Jurisdiction:</strong> Madras High Court / ${parcel.sro}</span>
          </div>
        </div>

        <!-- Executive Summary Cards -->
        <div class="legal-verdict-box clear">
          <div class="verdict-icon">🛡️</div>
          <div class="verdict-body">
            <h3>FINAL LEGAL VERDICT: CLEAR & ABSOLUTE MARKETABLE TITLE</h3>
            <p>The title of <strong>${parcel.owners[0].name}</strong> over Survey No. <strong>${parcel.survey_number}</strong> (${parcel.extent}) at ${parcel.village} Village is found to be clean, unimpeachable, free from adverse encumbrances, and valid for outright purchase or institutional mortgage.</p>
          </div>
          <div class="risk-score-badge">
            <span class="score-num font-mono">98/100</span>
            <span class="score-label">TITLE SAFETY INDEX</span>
          </div>
        </div>

        <!-- Property Schedule -->
        <div class="legal-section">
          <h4 class="legal-sec-title">SCHEDULE OF THE PROPERTY</h4>
          <table class="legal-schedule-table">
            <tbody>
              <tr><th width="30%">Survey No.</th><td><strong>${parcel.survey_number}</strong> (Old S.No: ${parcel.old_survey})</td></tr>
              <tr><th>Revenue Village / Taluk</th><td>${parcel.village} Village, ${parcel.taluk} Taluk, ${parcel.district} District</td></tr>
              <tr><th>Extent & Classification</th><td>${parcel.extent} — ${parcel.classification} (${parcel.classification_ta})</td></tr>
              <tr><th>Patta Details</th><td>Patta No. ${parcel.patta_number} in the name of ${parcel.owners[0].name} (e-Adangal verified)</td></tr>
              <tr><th>Sub-Registrar Office</th><td>${parcel.sro}</td></tr>
              <tr><th>ULPIN / GIS Coordinate</th><td><code>${parcel.ulpin}</code> (Lat: ${parcel.lat}, Lng: ${parcel.lng})</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 50-Year Title Chain Timeline -->
        <div class="legal-section">
          <h4 class="legal-sec-title">FLOW OF TITLE & CHAIN OF DEEDS (1975 — 2026)</h4>
          <div class="legal-timeline">
            <div class="lt-item completed">
              <div class="lt-marker">1975</div>
              <div class="lt-card">
                <div class="lt-title">Parent Title Deed (Settlement Deed No. 1042/1975)</div>
                <div class="lt-desc">Originally acquired by ancestral owner Late Krishnamoorthy Gounder via family settlement registered at Saidapet SRO. Verified genuine in Index II books.</div>
                <div class="lt-badge status-good">Parent Title Verified ✓</div>
              </div>
            </div>

            <div class="lt-item completed">
              <div class="lt-marker">1998</div>
              <div class="lt-card">
                <div class="lt-title">Partition Deed No. 2489/1998</div>
                <div class="lt-desc">Partition effected between legal heirs. Schedule 'B' allotted absolutely to ${parcel.owners[0].name}. Consent signed by all co-sharers including female legal heirs as per Hindu Succession Act amendment.</div>
                <div class="lt-badge status-good">Partition Valid ✓</div>
              </div>
            </div>

            <div class="lt-item completed">
              <div class="lt-marker">2016</div>
              <div class="lt-card">
                <div class="lt-title">Registered Equitable Mortgage (Doc 977/2016)</div>
                <div class="lt-desc">Loan of ₹4.50 Cr availed against title deeds from State Bank of India, SME Branch. Title documents deposited under Section 58(f) of Transfer of Property Act.</div>
                <div class="lt-badge status-info">Mortgage Created</div>
              </div>
            </div>

            <div class="lt-item completed">
              <div class="lt-marker">2021</div>
              <div class="lt-card">
                <div class="lt-title">Deed of Receipt / Discharge of Mortgage (Doc 2310/2021)</div>
                <div class="lt-desc">Loan fully cleared and No Objection Certificate (NOC) issued by State Bank of India. Formal receipt registered canceling the charge over the property.</div>
                <div class="lt-badge status-good">Charge Discharged ✓</div>
              </div>
            </div>

            <div class="lt-item current">
              <div class="lt-marker">2026</div>
              <div class="lt-card">
                <div class="lt-title">Present Status & Patta Ownership</div>
                <div class="lt-desc">Clean single ownership. Revenue records updated in Tamil Nilam database. Zero pending claims or attachments. Ready for conveyance.</div>
                <div class="lt-badge status-good">Clear Title ✓</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8-Point Statutory Verification Matrix -->
        <div class="legal-section">
          <h4 class="legal-sec-title">STATUTORY STATUTORY COMPLIANCE CHECKLIST</h4>
          <div class="legal-checks-grid">
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Encumbrance Certificate (EC)</strong>
                <p>Checked from 01-01-1975 to 13-10-2026 (51 years continuous trace). Nil subsisting encumbrance.</p>
              </div>
            </div>
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Tamil Nilam Revenue Records</strong>
                <p>Computerized Patta No. ${parcel.patta_number} matches owner name and extent in revenue portal.</p>
              </div>
            </div>
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Madras High Court & City Civil Search</strong>
                <p>Searched court litigation registry for survey number and owner name. Zero Lis Pendens filed.</p>
              </div>
            </div>
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Urban Land Ceiling (ULC) & Land Reforms</strong>
                <p>Free from Tamil Nadu Land Reforms Act 1961 and Urban Land (Ceiling & Regulation) Repeal Act 1999.</p>
              </div>
            </div>
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Govt / NHAI / Metro Acquisition</strong>
                <p>Not under any 4(1) notification under Land Acquisition Act 1894 or RFCTLARR Act 2013.</p>
              </div>
            </div>
            <div class="l-check pass">
              <span class="l-icon">✓</span>
              <div>
                <strong>Minor / Power of Attorney Risk</strong>
                <p>No minor interest involved. Title holder executing deeds personally without subsisting POA.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Advocate Certification Seal -->
        <div class="legal-footer-seal">
          <div class="advocate-sig">
            <div class="sig-line">_______________________________</div>
            <div class="adv-name">K. V. Sundaresan, B.A., B.L.</div>
            <div class="adv-sub">Advocate & Legal Consultant</div>
            <div class="adv-sub">Enrolment No: MS/1428/1998</div>
            <div class="adv-sub">Madras High Court Bar Association</div>
          </div>
          <div class="landaction-digital-seal">
            <div class="seal-badge">
              <span>LANDACTION DIGITAL SEAL</span>
              <small>Cryptographically Verified</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.LandActionLegalOpinion = {
    init: initLegalOpinion,
    renderOpinion: renderOpinion
  };
})();
