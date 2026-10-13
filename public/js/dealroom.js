// LandAction - Deal Room Module: Transaction Workspace, Milestone Escrow & Vault
(function() {
  'use strict';

  const defaultDeal = {
    title: "Acquisition of 8.71 Grounds (Karapakkam S.No 112/5)",
    dealId: "DR-2026-0842",
    buyer: "Vanguard Realty Ventures LLP",
    seller: "Ramanathan K",
    totalConsideration: 135483840, // 13.54 Cr
    escrowDeposit: 20000000, // 2 Cr
    targetClosingDate: "28-Nov-2026",
    milestones: [
      { id: 1, name: "Letter of Intent & Token Advance (₹25L)", status: "completed", date: "02-Oct-2026", parties: "Buyer & Seller" },
      { id: 2, name: "50-Yr Legal Due Diligence & Title Clearance", status: "completed", date: "10-Oct-2026", parties: "Senior Advocate" },
      { id: 3, name: "DGPS Physical Survey & FMB Demarcation", status: "completed", date: "12-Oct-2026", parties: "Licensed Surveyor" },
      { id: 4, name: "Draft Agreement for Sale Vetting", status: "in-progress", date: "18-Oct-2026", parties: "Legal Counsel" },
      { id: 5, name: "Bank NOC & Loan Approval / Escrow Funding", status: "pending", date: "04-Nov-2026", parties: "Lending Bank" },
      { id: 6, name: "Final Conveyance Execution at Neelankarai SRO", status: "pending", date: "24-Nov-2026", parties: "Sub-Registrar" },
      { id: 7, name: "Tamil Nilam Patta Mutation & EB Meter Transfer", status: "pending", date: "10-Dec-2026", parties: "Zonal Tahsildar" }
    ],
    documents: [
      { name: "Parent Title Deed (Doc 1042/1975).pdf", size: "8.4 MB", type: "Settlement Deed", status: "Verified" },
      { name: "Partition Deed (Doc 2489/1998).pdf", size: "12.1 MB", type: "Family Partition", status: "Verified" },
      { name: "Bank Discharge Receipt (Doc 2310/2021).pdf", size: "3.2 MB", type: "Mortgage NOC", status: "Verified" },
      { name: "Encumbrance Certificate (1975-2026).pdf", size: "18.5 MB", type: "Continuous EC", status: "Verified" },
      { name: "Computerized Patta No. P-4821.pdf", size: "1.1 MB", type: "Tamil Nilam Revenue", status: "Verified" },
      { name: "DGPS Field Demarcation Report.dwg", size: "4.8 MB", type: "Cadastral Survey", status: "Under Review" }
    ]
  };

  function initDealRoom() {
    renderDealRoom();
    setupEventListeners();
  }

  function setupEventListeners() {
    const uploadBtn = document.getElementById('dealroom-upload-btn');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('dealroom-file-input');
        if (fileInput) fileInput.click();
      });
    }

    const fileInput = document.getElementById('dealroom-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          defaultDeal.documents.push({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: 'Uploaded Deed',
            status: 'Processing OCR'
          });
          renderDealRoom();
        }
      });
    }
  }

  function renderDealRoom() {
    const container = document.getElementById('dealroom-content');
    if (!container) return;

    const completedCount = defaultDeal.milestones.filter(m => m.status === 'completed').length;
    const progressPercent = Math.round((completedCount / defaultDeal.milestones.length) * 100);

    container.innerHTML = `
      <!-- Deal Header -->
      <div class="deal-header-card">
        <div class="deal-title-strip">
          <div>
            <div class="deal-id-tag font-mono">${defaultDeal.dealId}</div>
            <h3 class="deal-title">${defaultDeal.title}</h3>
            <div class="deal-parties-meta">
              <span><strong>Buyer:</strong> ${defaultDeal.buyer}</span>
              <span class="sep">•</span>
              <span><strong>Seller:</strong> ${defaultDeal.seller}</span>
              <span class="sep">•</span>
              <span><strong>Target Close:</strong> ${defaultDeal.targetClosingDate}</span>
            </div>
          </div>
          <div class="deal-value-box">
            <div class="dv-label">Transaction Value</div>
            <div class="dv-amount font-mono text-brand">₹${(defaultDeal.totalConsideration / 10000000).toFixed(2)} Cr</div>
            <div class="dv-escrow text-success">Escrow Locked: ₹${(defaultDeal.escrowDeposit / 10000000).toFixed(2)} Cr</div>
          </div>
        </div>

        <!-- Progress Tracker Bar -->
        <div class="deal-progress-container">
          <div class="deal-progress-header">
            <span>Transaction Completion Progress</span>
            <span class="font-mono font-bold text-brand">${progressPercent}% (${completedCount}/${defaultDeal.milestones.length} Milestones)</span>
          </div>
          <div class="deal-progress-bar">
            <div class="deal-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout: Milestones vs Document Vault -->
      <div class="deal-grid">
        <!-- Left: Milestones Timeline -->
        <div class="deal-milestones-column">
          <div class="column-card">
            <h4><span class="icon">🏁</span> Transaction Milestones & Escrow Triggers</h4>
            <div class="milestones-stream">
              ${defaultDeal.milestones.map((m, i) => `
                <div class="milestone-row ${m.status}">
                  <div class="m-status-icon">
                    ${m.status === 'completed' ? '✓' : m.status === 'in-progress' ? '⏳' : '○'}
                  </div>
                  <div class="m-content">
                    <div class="m-top">
                      <span class="m-name">${m.name}</span>
                      <span class="badge ${m.status === 'completed' ? 'badge-success' : m.status === 'in-progress' ? 'badge-warning' : 'badge-neutral'}">
                        ${m.status.toUpperCase()}
                      </span>
                    </div>
                    <div class="m-meta">
                      <span><strong>Responsible:</strong> ${m.parties}</span>
                      <span><strong>Target:</strong> ${m.date}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Secure Document Vault -->
        <div class="deal-vault-column">
          <div class="column-card">
            <div class="vault-header">
              <h4><span class="icon">🔒</span> Encrypted Cadastral & Legal Vault</h4>
              <button class="btn btn-sm btn-primary" id="dealroom-upload-btn-inner" onclick="document.getElementById('dealroom-file-input').click()">
                + Upload Document
              </button>
            </div>
            <div class="vault-list">
              ${defaultDeal.documents.map(d => `
                <div class="vault-doc-item">
                  <div class="doc-icon">📄</div>
                  <div class="doc-info">
                    <div class="doc-name font-mono">${d.name}</div>
                    <div class="doc-sub">${d.type} • ${d.size}</div>
                  </div>
                  <div class="doc-status">
                    <span class="badge ${d.status === 'Verified' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.LandActionDealRoom = {
    init: initDealRoom
  };
})();
