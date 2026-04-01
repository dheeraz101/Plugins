let currentApi = null;
let enhancerStyle = null;
let enhanceInterval = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Enhancer',
  version: '2.1.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  let viewMode = api.storage.getForPlugin(meta.id, 'viewMode') || 'grid';

  enhancerStyle = document.createElement('style');
  enhancerStyle.id = 'pme-styles';
  enhancerStyle.textContent = `

    /* ========== WINDOW ========== */
    .pm-root {
      width: 960px !important;
      height: 82vh !important;
      max-width: 97vw !important;
      max-height: 95vh !important;
      border-radius: 20px !important;
      background: #0e0e14 !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7) !important;
      overflow: hidden !important;
    }

    /* ========== HEADER ========== */
    .pm-header {
      padding: 20px 24px !important;
      background: rgba(255,255,255,0.015) !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }
    .pm-header b {
      font-size: 16px !important;
      letter-spacing: -0.025em !important;
      line-height: 1.3 !important;
    }
    #pm-stats {
      font-size: 11px !important;
      color: #555 !important;
      margin-top: 4px !important;
    }

    /* ========== TABS ========== */
    .pm-tabs {
      background: rgba(0,0,0,0.3) !important;
      padding: 0 16px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
    }
    .pm-tab {
      font-weight: 600 !important;
      font-size: 13px !important;
      padding: 14px 22px !important;
      letter-spacing: -0.01em !important;
    }
    .pm-tab.active {
      color: #a78bfa !important;
      border-bottom-color: #a78bfa !important;
    }
    .pm-tab:hover { color: #bbb !important; }

    /* ========== BODY ========== */
    .pm-body {
      background: #111118 !important;
      display: flex !important;
      flex-direction: column !important;
    }

    /* ========== TOOLBAR ========== */
    .pme-toolbar {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 10px 20px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      background: rgba(0,0,0,0.15) !important;
      flex-shrink: 0 !important;
    }
    .pme-search-wrap { position: relative !important; flex: 1 !important; }
    .pme-search-icon {
      position: absolute !important; left: 12px !important; top: 50% !important;
      transform: translateY(-50%) !important; color: #555 !important;
      font-size: 13px !important; pointer-events: none !important;
    }
    .pme-search {
      width: 100% !important; padding: 8px 14px 8px 36px !important;
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 10px !important; color: #fff !important;
      font-size: 13px !important; outline: none !important;
      transition: border-color 0.2s, background 0.2s !important;
      box-sizing: border-box !important; font-family: inherit !important;
    }
    .pme-search:focus { border-color: #a78bfa !important; background: rgba(255,255,255,0.08) !important; }
    .pme-search::placeholder { color: #555 !important; }
    .pme-view-btns {
      display: flex !important; gap: 2px !important;
      background: rgba(255,255,255,0.05) !important;
      border-radius: 8px !important; padding: 3px !important;
    }
    .pme-view-btn {
      padding: 6px 10px !important; background: none !important; border: none !important;
      color: #555 !important; cursor: pointer !important; border-radius: 6px !important;
      font-size: 14px !important; transition: all 0.15s !important;
    }
    .pme-view-btn.active { background: rgba(167,139,250,0.2) !important; color: #a78bfa !important; }
    .pme-view-btn:hover { color: #aaa !important; }

    /* ========== PANEL ========== */
    .pm-panel {
      padding: 16px 20px 40px !important;
      flex: 1 !important;
      overflow-y: auto !important;
    }
    .pm-panel::after { height: 20px !important; }
    .pm-panel::-webkit-scrollbar { width: 6px !important; }
    .pm-panel::-webkit-scrollbar-track { background: transparent !important; }
    .pm-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1) !important; border-radius: 8px !important; }

    /* ========== GRID VIEW — ALL PANELS ========== */
    .pm-panel.pme-grid .pm-card {
      display: inline-block !important;
      vertical-align: top !important;
      width: calc(33.333% - 8px) !important;
      margin: 0 10px 12px 0 !important;
    }
    .pm-panel.pme-grid .pm-card:nth-child(3n) {
      margin-right: 0 !important;
    }

    /* ========== LIST VIEW ========== */
    .pm-panel.pme-list .pm-card {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 14px 18px !important;
      border-radius: 10px !important;
      margin-bottom: 6px !important;
    }
    .pm-panel.pme-list .pm-card > div:first-child {
      flex-shrink: 0 !important;
    }
    .pm-panel.pme-list .pm-card > div:nth-child(2) {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .pm-panel.pme-list .pm-card > div:last-child {
      flex-shrink: 0 !important;
      margin-top: 0 !important;
    }

    /* ========== CARDS — UNIFORM HEIGHT ========== */
    .pm-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.06) !important;
      border-radius: 14px !important;
      padding: 18px !important;
      margin-bottom: 12px !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    }
    .pm-card:hover {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(255,255,255,0.12) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25) !important;
    }

    /* Grid cards: flex column so button stays at bottom */
    .pm-panel.pme-grid .pm-card {
      display: flex !important;
      flex-direction: column !important;
    }
    .pm-panel.pme-grid .pm-card > div:first-child {
      flex: 1 !important;
    }
    .pm-panel.pme-grid .pm-card > div:last-child {
      margin-top: auto !important;
      padding-top: 10px !important;
    }

    /* ========== CARD TEXT — PRETEXT SPACING ========== */
    .pm-card b {
      font-size: 15px !important;
      letter-spacing: -0.02em !important;
      line-height: 1.35 !important;
    }
    .pm-card div[style*="font-size:11px"] {
      font-size: 11px !important;
      line-height: 1.45 !important;
    }
    .pm-card div[style*="font-size:13px"] {
      font-size: 13px !important;
      line-height: 1.55 !important;
      color: #999 !important;
    }

    /* ========== UNIFORM BUTTONS ========== */
    .pm-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 8px 18px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      letter-spacing: -0.01em !important;
      transition: all 0.15s ease !important;
      white-space: nowrap !important;
      min-height: 34px !important;
    }
    .pm-btn.primary {
      background: #a78bfa !important;
      color: #fff !important;
    }
    .pm-btn.primary:hover {
      background: #8b5cf6 !important;
      transform: translateY(-1px) !important;
    }
    .pm-btn.secondary {
      background: rgba(255,255,255,0.06) !important;
      color: #ddd !important;
    }
    .pm-btn.danger {
      background: rgba(232,72,77,0.1) !important;
      color: #ff6b6b !important;
    }
    .pm-btn.danger:hover {
      background: rgba(232,72,77,0.2) !important;
    }

    /* Full-width install button in grid cards */
    .pm-panel.pme-grid .pm-btn[data-install],
    .pm-panel.pme-grid .pm-btn.primary {
      width: 100% !important;
    }

    /* Button row in grid cards */
    .pm-panel.pme-grid .pm-card > div:last-child {
      display: flex !important;
      gap: 6px !important;
    }

    /* ========== STATS BAR ========== */
    .pme-stats {
      display: flex !important; gap: 16px !important;
      padding: 10px 24px !important;
      border-top: 1px solid rgba(255,255,255,0.04) !important;
      background: rgba(0,0,0,0.2) !important;
      flex-shrink: 0 !important;
      font-size: 11px !important; color: #555 !important;
    }
    .pme-stats b { color: #a78bfa !important; font-weight: 700 !important; }
    .pme-stats .pme-green { color: #2ecc71 !important; }
    .pme-stats .pme-orange { color: #f39c12 !important; }
    .pme-stats .pme-right { margin-left: auto !important; }

    /* ========== SECTION DIVIDER ========== */
    .pme-divider {
      display: flex !important; align-items: center !important; gap: 10px !important;
      padding: 14px 4px 10px !important; margin-top: 4px !important;
      clear: both !important;
    }
    .pme-divider-dot { width: 7px !important; height: 7px !important; border-radius: 50% !important; }
    .pme-divider-text {
      font-size: 11px !important; font-weight: 700 !important;
      text-transform: uppercase !important; letter-spacing: 0.08em !important;
      color: #666 !important;
    }
    .pme-divider-count {
      font-size: 10px !important; color: #444 !important;
      background: rgba(255,255,255,0.04) !important;
      padding: 2px 8px !important; border-radius: 10px !important;
    }

    /* ========== STATUS PILL ========== */
    .pme-pill {
      display: inline-flex !important; align-items: center !important; gap: 4px !important;
      font-size: 9px !important; font-weight: 700 !important;
      padding: 3px 8px !important; border-radius: 6px !important;
      text-transform: uppercase !important; letter-spacing: 0.06em !important;
      margin-left: 8px !important; vertical-align: middle !important;
    }
    .pme-pill-on { background: rgba(46,204,113,0.12) !important; color: #2ecc71 !important; }
    .pme-pill-off { background: rgba(243,156,18,0.12) !important; color: #f39c12 !important; }
    .pme-pill-dot { width: 4px !important; height: 4px !important; border-radius: 50% !important; }
    .pme-pill-on .pme-pill-dot { background: #2ecc71 !important; }
    .pme-pill-off .pme-pill-dot { background: #f39c12 !important; }

    /* ========== SEARCH HIDDEN ========== */
    .pme-hidden { display: none !important; }

    /* ========== MODAL ========== */
    .bb-modal-overlay { z-index: 2147483648 !important; }
  `;
  document.head.appendChild(enhancerStyle);

  // ───────── INJECT TOOLBAR + STATS ─────────
  function injectToolbar(pmRoot) {
    if (pmRoot.querySelector('.pme-toolbar')) return;
    const pmTabs = pmRoot.querySelector('.pm-tabs');
    if (!pmTabs) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'pme-toolbar';
    toolbar.innerHTML = `
      <div class="pme-search-wrap">
        <span class="pme-search-icon">🔍</span>
        <input class="pme-search" placeholder="Search plugins..." id="pme-search">
      </div>
      <div class="pme-view-btns">
        <button class="pme-view-btn ${viewMode==='grid'?'active':''}" data-view="grid" title="Grid">⊞</button>
        <button class="pme-view-btn ${viewMode==='list'?'active':''}" data-view="list" title="List">☰</button>
      </div>
    `;
    pmTabs.after(toolbar);

    if (!pmRoot.querySelector('.pme-stats')) {
      const stats = document.createElement('div');
      stats.className = 'pme-stats';
      stats.id = 'pme-stats';
      pmRoot.appendChild(stats);
    }

    toolbar.querySelectorAll('.pme-view-btn').forEach(btn => {
      btn.onclick = () => {
        viewMode = btn.dataset.view;
        api.storage.setForPlugin(meta.id, 'viewMode', viewMode);
        toolbar.querySelectorAll('.pme-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyViewMode(pmRoot);
      };
    });

    const searchInput = toolbar.querySelector('#pme-search');
    searchInput.addEventListener('input', api.debounce(() => {
      applySearch(pmRoot, searchInput.value.toLowerCase());
    }, 200));

    // Hook tab clicks to clear search and re-apply
    pmRoot.querySelectorAll('.pm-tab').forEach(tab => {
      if (tab.dataset.pmeHooked) return;
      tab.dataset.pmeHooked = '1';
      tab.addEventListener('click', () => {
        searchInput.value = '';
        applySearch(pmRoot, '');
        setTimeout(() => applyViewMode(pmRoot), 80);
      });
    });
  }

  // ───────── VIEW MODE ─────────
  function applyViewMode(pmRoot) {
    pmRoot.querySelectorAll('.pm-panel').forEach(p => {
      p.classList.remove('pme-grid', 'pme-list');
      if (p.style.display !== 'none') {
        p.classList.add(viewMode === 'grid' ? 'pme-grid' : 'pme-list');
      }
    });
  }

  // ───────── SEARCH ─────────
  function applySearch(pmRoot, query) {
    ['#installed', '#community'].forEach(sel => {
      const panel = pmRoot.querySelector(sel);
      if (!panel || panel.style.display === 'none') return;
      panel.querySelectorAll('.pm-card').forEach(card => {
        if (!query) { card.classList.remove('pme-hidden'); return; }
        card.classList.toggle('pme-hidden', !card.textContent.toLowerCase().includes(query));
      });
    });
    updateStats(pmRoot);
  }

  // ───────── ORGANIZE INSTALLED ─────────
  function organizeInstalled(pmRoot) {
    const panel = pmRoot.querySelector('#installed');
    if (!panel || panel.style.display === 'none') return;

    const cards = Array.from(panel.querySelectorAll('.pm-card'));
    if (cards.length === 0) return;

    // Remove old dividers
    panel.querySelectorAll('.pme-divider').forEach(el => el.remove());

    const plugins = currentApi.registry.getAll();

    // Inject/update pills
    cards.forEach(card => {
      const toggleBtn = card.querySelector('[data-act="toggle"]');
      if (!toggleBtn) return;
      const plugin = plugins.find(p => p.id === toggleBtn.dataset.id);
      if (!plugin) return;

      let pill = card.querySelector('.pme-pill');
      if (!pill) {
        pill = document.createElement('span');
        pill.className = 'pme-pill';
        const nameEl = card.querySelector('b');
        if (nameEl) nameEl.insertAdjacentElement('afterend', pill);
      }
      pill.className = `pme-pill ${plugin.enabled ? 'pme-pill-on' : 'pme-pill-off'}`;
      pill.innerHTML = `<span class="pme-pill-dot"></span>${plugin.enabled ? 'Active' : 'Paused'}`;
    });

    // Separate and reorder
    const activeCards = [];
    const pausedCards = [];
    cards.forEach(card => {
      if (card.classList.contains('pme-hidden')) return;
      const toggleBtn = card.querySelector('[data-act="toggle"]');
      if (!toggleBtn) { activeCards.push(card); return; }
      const plugin = plugins.find(p => p.id === toggleBtn.dataset.id);
      if (!plugin || plugin.enabled) activeCards.push(card);
      else pausedCards.push(card);
    });

    if (activeCards.length > 0 && pausedCards.length > 0) {
      // Detach all visible cards
      [...activeCards, ...pausedCards].forEach(c => {
        if (c.parentNode === panel) panel.removeChild(c);
      });

      // Re-attach active
      activeCards.forEach(c => panel.appendChild(c));

      // Divider
      const div = document.createElement('div');
      div.className = 'pme-divider';
      div.innerHTML = `
        <div class="pme-divider-dot" style="background:#f39c12"></div>
        <div class="pme-divider-text">Paused</div>
        <div class="pme-divider-count">${pausedCards.length}</div>
      `;
      panel.appendChild(div);

      // Re-attach paused
      pausedCards.forEach(c => panel.appendChild(c));
    }
  }

  // ───────── UPDATE STATS ─────────
  function updateStats(pmRoot) {
    const statsEl = pmRoot.querySelector('#pme-stats');
    if (!statsEl) return;

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled).length;
    const paused = plugins.filter(p => !p.enabled).length;

    const installedPanel = pmRoot.querySelector('#installed');
    const communityPanel = pmRoot.querySelector('#community');

    if (installedPanel && installedPanel.style.display !== 'none') {
      statsEl.innerHTML = `
        <span><b>${plugins.length}</b> plugins</span>
        <span><b class="pme-green">${active}</b> active</span>
        <span><b class="pme-orange">${paused}</b> paused</span>
        <span class="pme-right">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    } else if (communityPanel && communityPanel.style.display !== 'none') {
      const total = communityPanel.querySelectorAll('.pm-card').length;
      statsEl.innerHTML = `
        <span><b>${total}</b> available</span>
        <span><b class="pme-green">${plugins.length}</b> installed</span>
        <span class="pme-right">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    }
  }

  // ───────── ENHANCE LOOP ─────────
  function enhance() {
    const pmRoot = document.querySelector('.pm-root');
    if (!pmRoot || pmRoot.style.display === 'none' || pmRoot.style.display === '') return;

    injectToolbar(pmRoot);
    applyViewMode(pmRoot);
    organizeInstalled(pmRoot);
    updateStats(pmRoot);
  }

  enhanceInterval = setInterval(enhance, 600);

  // Also on right-click
  api.boardEl.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.pm-root')) return;
    setTimeout(enhance, 300);
    setTimeout(enhance, 700);
  });

  // Ctrl+Shift+P
  api.registerShortcut('ctrl+shift+p', () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      const isOpen = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
      pmRoot.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) { setTimeout(enhance, 200); setTimeout(enhance, 600); }
    }
  });

  console.log('⚡ PM Enhancer v2.1.0');
}

export function teardown() {
  if (enhanceInterval) clearInterval(enhanceInterval);
  if (enhancerStyle) enhancerStyle.remove();
  document.querySelectorAll('.pme-toolbar, .pme-stats, .pme-divider, .pme-pill').forEach(el => el.remove());
  document.querySelectorAll('.pme-hidden').forEach(el => el.classList.remove('pme-hidden'));
  document.querySelectorAll('.pme-grid, .pme-list').forEach(el => el.classList.remove('pme-grid', 'pme-list'));
  document.querySelectorAll('[data-pme-hooked]').forEach(el => delete el.dataset.pmeHooked);
  currentApi = null;
}
