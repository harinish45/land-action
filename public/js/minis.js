// LandAction Minis Hub — 123 one-question tools (100% free)
// UX parity: category tabs + search + card grid + price-before-run runner
// where the "price" is always FREE (0 credits).

window.MinisEngine = {
  tools: [],
  categories: [],
  activeCategory: 'all',

  esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  async init() {
    try {
      // Prefer the API (same source MCP uses); fall back to the static file.
      let data;
      try {
        const res = await fetch('/api/v1/minis');
        data = await res.json();
      } catch {
        data = await (await fetch('/data/minis_catalog.json')).json();
      }
      this.tools = data.tools;
      this.categories = data.categories;
      this.renderCategoryTabs();
      this.renderTools('all');
      this.bindEvents();
      const badge = document.getElementById('minis-count-badge');
      if (badge) badge.textContent = `${this.tools.length} Tools Free`;
    } catch (err) {
      console.error('Failed to load minis catalog:', err);
    }
  },

  renderCategoryTabs() {
    const wrap = document.getElementById('minis-category-filters');
    if (!wrap) return;
    const counts = {};
    this.tools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const tabs = ['all', ...this.categories];
    wrap.innerHTML = tabs.map(cat => {
      const label = cat === 'all' ? `All (${this.tools.length})` : `${cat} (${counts[cat] || 0})`;
      const active = cat === 'all' ? ' active' : '';
      return `<button class="minis-cat-tab${active}" data-mini-filter="${cat}">${label}</button>`;
    }).join('');
  },

  bindEvents() {
    // Delegate so tabs survive re-renders
    const wrap = document.getElementById('minis-category-filters');
    if (wrap && !wrap.dataset.bound) {
      wrap.dataset.bound = '1';
      wrap.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-mini-filter]');
        if (!tab) return;
        wrap.querySelectorAll('.minis-cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.getAttribute('data-mini-filter');
        this.renderTools(this.activeCategory,
          (document.getElementById('minis-search-input')?.value || '').toLowerCase().trim());
      });
    }

    const searchInput = document.getElementById('minis-search-input');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = '1';
      searchInput.addEventListener('input', (e) => {
        this.renderTools(this.activeCategory, e.target.value.toLowerCase().trim());
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
  },

  renderTools(category = 'all', searchQuery = '') {
    const grid = document.getElementById('minis-grid');
    if (!grid) return;

    let filtered = this.tools;
    if (category && category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery) ||
        t.description.toLowerCase().includes(searchQuery) ||
        t.id.toLowerCase().includes(searchQuery) ||
        t.category.toLowerCase().includes(searchQuery)
      );
    }

    const kindIcon = { calc: '🧮', zone: '🗺️', record: '📜', search: '🔎', doc: '📄', custom: '🙏' };

    grid.innerHTML = filtered.length ? filtered.map(t => `
      <div class="mini-tool-card" data-mini-id="${t.id}" onclick="window.MinisEngine.openMini('${t.id}')">
        <div>
          <div class="mini-tool-header">
            <div class="mini-icon">${kindIcon[t.kind] || '⚡'}</div>
            <span class="free-pill">Free</span>
          </div>
          <h4 style="font-size: 1.05rem; margin-bottom: 6px;">${t.name}</h4>
          <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">${t.description}</p>
          <span class="badge badge-xs badge-info">${t.category}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06);">
          <small style="color:#64748b; font-size: 0.75rem;">0 credits</small>
          <span style="font-size: 0.8rem; font-weight:700; color:var(--primary);">Run &rarr;</span>
        </div>
      </div>
    `).join('') : `
      <div style="grid-column:1/-1; text-align:center; padding:48px 16px; color:#94a3b8;">
        <div style="font-size:2rem; margin-bottom:8px;">🔎</div>
        <strong>No minis match "${searchQuery || category}"</strong>
        <p style="font-size:0.85rem; margin-top:6px;">Try another keyword — all 123 tools are free to run.</p>
      </div>`;
  },

  // ---- One-question runner with price-before-run (always FREE) ----
  openMini(slug) {
    const mini = this.tools.find(t => t.id === slug);
    if (!mini) return;
    const runner = document.getElementById('mini-calc-runner');
    if (!runner) return;

    runner.innerHTML = `
      <div class="mini-runner-head">
        <div>
          <span class="badge badge-xs badge-info">${mini.category}</span>
          <h4 style="margin:8px 0 4px;">${mini.name}</h4>
          <p class="text-xs text-muted" style="margin:0;">${mini.description}</p>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.MinisEngine.closeRunner()">✕ Close</button>
      </div>

      <div class="mini-price-before-run">
        <div class="price-line"><span>Price before this runs</span><strong class="price-free">FREE · 0 credits</strong></div>
        <div class="price-line"><span>Your balance</span><strong>Unlimited (no wallet needed)</strong></div>
        <div class="price-line"><span>If no record is found</span><strong>You are never charged (0 = 0)</strong></div>
      </div>

      <div class="mini-runner-form">
        <div class="form-group">
          <label>Survey No / Place / Query</label>
          <input type="text" id="mini-run-query" value="112/5" placeholder="e.g. 112/5, Karapakkam, or a value">
        </div>
        ${mini.kind === 'calc' ? `
        <div class="form-group">
          <label>Value (amount / area / width)</label>
          <input type="number" id="mini-run-value" value="1000000">
        </div>` : ''}
        <button class="btn btn-primary" id="mini-run-btn">Approve & Run (Free) ➔</button>
      </div>

      <div id="mini-run-result" class="mini-run-result" style="display:none;"></div>
    `;
    runner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.getElementById('mini-run-btn').addEventListener('click', () => this.runMini(slug));
  },

  closeRunner() {
    const runner = document.getElementById('mini-calc-runner');
    if (runner) runner.innerHTML = '';
  },

  async runMini(slug) {
    const btn = document.getElementById('mini-run-btn');
    const box = document.getElementById('mini-run-result');
    if (!box) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Running…'; }

    const body = {
      survey_no: document.getElementById('mini-run-query')?.value || '112/5',
      query: document.getElementById('mini-run-query')?.value || '',
      value: Number(document.getElementById('mini-run-value')?.value) || undefined,
      property_value: Number(document.getElementById('mini-run-value')?.value) || undefined
    };

    try {
      const res = await fetch(`/api/v1/minis/${slug}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || 'Run failed');
      const r = json.result;
      box.style.display = 'block';
      box.innerHTML = `
        <div class="mini-result-head">
          <span class="free-pill">Charged: ₹0</span>
          <span class="text-xs text-muted">Source: ${this.esc(r.source)} · as of ${this.esc(r.as_of)}</span>
        </div>
        <div class="mini-result-verdict">${this.esc(r.verdict)}</div>
        <table class="data-table mini-result-table">
          <tbody>${r.rows.map(([k, v]) => `<tr><td style="color:#94a3b8;">${this.esc(k)}</td><td><strong>${this.esc(v)}</strong></td></tr>`).join('')}</tbody>
        </table>
        <p class="text-xs text-muted" style="margin-top:10px;">${this.esc(r.note)}</p>
      `;
    } catch (err) {
      box.style.display = 'block';
      box.innerHTML = `<div class="mini-result-verdict" style="color:#f87171;">${this.esc(err.message)}</div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Approve & Run (Free) ➔'; }
    }
  }
};

// Legacy alias expected by app.js
window.LandActionMinis = window.MinisEngine;
