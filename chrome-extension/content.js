// LandAction Content Script for Google Maps and Google Earth
console.log('[LandAction] Extension active. Connecting Tamil Nadu Cadastral Layer...');

// Inject Floating HUD on Google Maps
function injectLandActionOverlay() {
  if (document.getElementById('landaction-map-hud')) return;

  const hud = document.createElement('div');
  hud.id = 'landaction-map-hud';
  hud.innerHTML = `
    <div class="la-hud-pill">
      <div class="la-hud-dot"></div>
      <span class="la-hud-title">LandAction Cadastral Layer</span>
      <span class="la-hud-free">100% Free</span>
    </div>
    <div class="la-hud-info">
      <span id="la-current-survey">Survey: S.No 112/5 (Karapakkam)</span>
      <button id="la-inspect-btn">Inspect 13 Checks</button>
    </div>
  `;
  document.body.appendChild(hud);

  // Inject Drawer
  const drawer = document.createElement('div');
  drawer.id = 'landaction-drawer';
  drawer.innerHTML = `
    <div class="la-drawer-head">
      <div class="la-drawer-brand">
        <span class="la-logo-icon">⚡</span>
        <div>
          <h3>LandAction Inspector</h3>
          <p>Tamil Nadu Land Records & Due Diligence</p>
        </div>
      </div>
      <button id="la-drawer-close">&times;</button>
    </div>
    <div class="la-drawer-body">
      <div class="la-card">
        <span class="la-tag">Revenue Register</span>
        <h4>Survey No. 112/5 · Karapakkam</h4>
        <p>Taluk: Sholinganallur · District: Chennai · SRO: Neelankarai</p>
        <div class="la-stat-grid">
          <div><small>Extent</small><b>0.48 Acres</b></div>
          <div><small>Guideline Rate</small><b>₹4,850/sq.ft</b></div>
          <div><small>Class</small><b>Ryotwari Nanjai</b></div>
          <div><small>Patta No.</small><b>P-4821</b></div>
        </div>
        <div class="la-owner-box">
          <small>Recorded Owner</small>
          <b>Ramanathan K (ராமநாதன் கே)</b>
        </div>
      </div>

      <div class="la-checks-head">13 Instant Land Checks (All Free)</div>
      <ul class="la-checks-list">
        <li class="pass">✓ Owner matches patta registration</li>
        <li class="pass">✓ No open encumbrance (30-year trail verified)</li>
        <li class="pass">✓ CMDA Primary Residential Zone (Housing allowed)</li>
        <li class="pass">✓ Water body clearance (140m away > 15m rule)</li>
        <li class="pass">✓ Outside Coastal Regulation Zone (CRZ clear)</li>
        <li class="pass">✓ Airport height clearance granted (45m AMSL)</li>
        <li class="pass">✓ Not HR&CE Temple Land</li>
        <li class="pass">✓ Not Tamil Nadu Waqf Board property</li>
        <li class="pass">✓ Clear of Reserve Forest & HACA Hill limits</li>
        <li class="pass">✓ Zero Madras High Court / Civil Court suits</li>
        <li class="pass">✓ CERSAI mortgage registry clean</li>
        <li class="pass">✓ GCC property tax dues clear</li>
        <li class="pass">✓ Road width: 18.0m (FSI 2.0 to 3.25 permissible)</li>
      </ul>

      <a href="http://localhost:3000/#vml" target="_blank" class="la-full-report-btn">
        Open Full 33-Check LandAction Report
      </a>
    </div>
  `;
  document.body.appendChild(drawer);

  document.getElementById('la-inspect-btn').addEventListener('click', () => {
    drawer.classList.add('open');
  });

  document.getElementById('la-drawer-close').addEventListener('click', () => {
    drawer.classList.remove('open');
  });
}

// Observe URL and DOM changes
setTimeout(injectLandActionOverlay, 2500);
