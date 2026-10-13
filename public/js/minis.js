// LandAction Minis Hub & Calculators Engine

window.MinisEngine = {
  tools: [],

  async init() {
    try {
      const res = await fetch('/data/tools_catalog.json');
      const data = await res.json();
      this.tools = data.tools;
      this.renderTools('all');
      this.bindEvents();
    } catch (err) {
      console.error('Failed to load tools catalog:', err);
    }
  },

  bindEvents() {
    // Filter chips
    const filterChips = document.querySelectorAll('[data-mini-filter]');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-mini-filter');
        this.renderTools(cat);
      });
    });

    // Minis search input
    const searchInput = document.getElementById('minis-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.renderTools('all', query);
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        }
      });
    });

    // Calculator triggers
    this.bindCalculators();
  },

  renderTools(category = 'all', searchQuery = '') {
    const grid = document.getElementById('minis-cards-grid');
    if (!grid) return;

    let filtered = this.tools;
    if (category !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery) || 
        t.description.toLowerCase().includes(searchQuery) ||
        t.id.toLowerCase().includes(searchQuery)
      );
    }

    grid.innerHTML = filtered.map(t => `
      <div class="mini-tool-card" onclick="window.MinisEngine.openModal('${t.id}')">
        <div>
          <div class="mini-tool-header">
            <div class="mini-icon">⚡</div>
            <span class="free-pill">Free</span>
          </div>
          <h4 style="font-size: 1.05rem; margin-bottom: 6px;">${t.name}</h4>
          <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">${t.description}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06);">
          <small style="color:#64748b; font-size: 0.75rem;">code: ${t.id}</small>
          <span style="font-size: 0.8rem; font-weight:700; color:var(--primary);">Launch &rarr;</span>
        </div>
      </div>
    `).join('');
  },

  openModal(toolId) {
    const modal = document.getElementById(`modal-${toolId}`) || document.getElementById('modal-generic-runner');
    if (modal) {
      // populate generic runner if specific modal not defined
      if (modal.id === 'modal-generic-runner') {
        const title = document.getElementById('generic-tool-title');
        const desc = document.getElementById('generic-tool-desc');
        const toolObj = this.tools.find(t => t.id === toolId);
        if (title && toolObj) title.textContent = toolObj.name;
        if (desc && toolObj) desc.textContent = toolObj.description;
        modal.setAttribute('data-current-tool', toolId);
      }
      modal.classList.add('open');
    }
  },

  bindCalculators() {
    // 1. Stamp Duty Calculator
    const calcStampBtn = document.getElementById('btn-calc-stamp');
    if (calcStampBtn) {
      calcStampBtn.addEventListener('click', () => {
        const val = Number(document.getElementById('stamp-prop-val').value) || 5000000;
        const deedType = document.getElementById('stamp-deed-type').value;
        let stampPct = 7.0;
        let regPct = 2.0;
        let note = "Standard Sale Deed under TN Stamp Schedule";

        if (deedType === 'settlement_family') {
          stampPct = 1.0;
          regPct = 1.0;
          note = "Concessional family settlement (max cap applicable)";
        } else if (deedType === 'gift_family') {
          stampPct = 2.0;
          regPct = 1.0;
          note = "Family gift deed concession";
        }

        const stampAmt = (val * stampPct) / 100;
        const regAmt = (val * regPct) / 100;
        const total = stampAmt + regAmt;

        document.getElementById('stamp-result-box').innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div><small style="color:#64748b;">Stamp Duty (${stampPct}%)</small><br><b style="font-size:1.15rem; color:#f8fafc;">₹${stampAmt.toLocaleString('en-IN')}</b></div>
            <div><small style="color:#64748b;">Registration Fee (${regPct}%)</small><br><b style="font-size:1.15rem; color:#f8fafc;">₹${regAmt.toLocaleString('en-IN')}</b></div>
          </div>
          <div style="padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
            <small style="color:#10b981;">Total Government Charges (${stampPct + regPct}%):</small>
            <div style="font-size:1.4rem; font-weight:800; color:#10b981;">₹${total.toLocaleString('en-IN')}</div>
            <small style="color:#94a3b8; font-size:0.75rem;">${note}</small>
          </div>
        `;
      });
    }

    // 2. Unit Converter
    const calcUnitBtn = document.getElementById('btn-calc-unit');
    if (calcUnitBtn) {
      calcUnitBtn.addEventListener('click', () => {
        const val = Number(document.getElementById('unit-val').value) || 1;
        const from = document.getElementById('unit-from').value;
        const to = document.getElementById('unit-to').value;

        const sqftFactors = {
          sqft: 1,
          ground: 2400,
          cent: 435.6,
          acre: 43560,
          kuzhi: 144,
          ma: 4356,
          guntha: 1089,
          sqm: 10.7639
        };

        const inSqft = val * (sqftFactors[from] || 1);
        const result = inSqft / (sqftFactors[to] || 1);

        document.getElementById('unit-result-box').innerHTML = `
          <div style="text-align:center;">
            <span style="font-size:1.6rem; font-weight:800; color:#38bdf8;">${result.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${to.toUpperCase()}</span>
            <p style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">Equivalent to ${inSqft.toLocaleString('en-IN')} Square Feet</p>
          </div>
        `;
      });
    }

    // 3. Guideline Value Quick Modal Lookup
    const calcGvBtn = document.getElementById('btn-calc-gv');
    if (calcGvBtn) {
      calcGvBtn.addEventListener('click', () => {
        const village = document.getElementById('gv-village-select').value;
        const rate = village === 'sholinganallur' ? 5200 : village === 'velachery' ? 7500 : 4850;
        const groundRate = rate * 2400;

        document.getElementById('gv-result-box').innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div><small style="color:#64748b;">Guideline Rate per Sq.ft</small><br><b style="font-size:1.3rem; color:#ff8c53;">₹${rate.toLocaleString('en-IN')}</b></div>
            <div><small style="color:#64748b;">Guideline Rate per Ground</small><br><b style="font-size:1.3rem; color:#ff8c53;">₹${(groundRate/10000000).toFixed(2)} Cr</b></div>
          </div>
          <div style="margin-top:10px; font-size:0.8rem; color:#cbd5e1;">Effective Date: July 2024 · Sub-Registrar Office Verified · 0 Credits (Free)</div>
        `;
      });
    }
  }
};
