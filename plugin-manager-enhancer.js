let currentApi = null;
let enhancerStyle = null;
let enhanceInterval = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Enhancer',
  version: '2.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  let viewMode = api.storage.getForPlugin(meta.id, 'viewMode') || 'grid';

  // ───────── CSS-ONLY ENHANCEMENTS ─────────
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

    /* ========== HEADER — pretext-inspired spacing ========== */
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
      letter-spacing: 0.01em !important;
      line-height: 1.4 !important;
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
      line-height: 1.3 !important;
      transition: all 0.2s ease !important;
    }
    .pm-tab.active {
      color: #a78bfa !important;
      border-bottom-color: #a78bfa !important;
    }
    .pm-tab:hover {
      color: #bbb !important;
    }

    /* ========== PANEL ========== */
    .pm-body {
      background: #111118 !important;
    }
    .pm-panel {
      padding: 20px 20px 40px !important;
    }
    .pm-panel::-webkit-scrollbar { width: 6px !important; }
    .pm-panel::-webkit-scrollbar-track { background: transparent !important; }
    .pm-panel::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1) !important;
      border-radius: 8px !important;
    }
    .pm-panel::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.18) !important;
    }

    /* ========== INJECTED TOOLBAR ========== */
    .pme-toolbar {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 10px 20px !important;
      border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      background: rgba(0,0,0,0.15) !important;
      flex-shrink: 0 !important;
    }
    .pme-search-wrap {
      position: relative !important;
      flex: 1 !important;
    }
    .pme-search-icon {
      position: absolute !important;
      left: 12px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      color: #555 !important;
      font-size: 13px !important;
      pointer-events: none !important;
    }
    .pme-search {
      width: 100% !important;
      padding: 8px 14px 8px 36px !important;
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 10px !important;
      color: #fff !important;
      font-size: 13px !important;
      outline: none !important;
      transition: border-color 0.2s, background 0.2s !important;
      box-sizing: border-box !important;
      font-family: inherit !important;
      letter-spacing: -0.01em !important;
      line-height: 1.5 !important;
    }
    .pme-search:focus {
      border-color: #a78bfa !important;
      background: rgba(255,255,255,0.08) !important;
    }
    .pme-search::placeholder {
      color: #555 !important;
    }
    .pme-view-btns {
      display: flex !important;
      gap: 2px !important;
      background: rgba(255,255,255,0.05) !important;
      border-radius: 8px !important;
      padding: 3px !important;
    }
    .pme-view-btn {
      padding: 6px 10px !important;
      background: none !important;
      border: none !important;
      color: #555 !important;
      cursor: pointer !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      transition: all 0.15s !important;
      line-height: 1 !important;
    }
    .pme-view-btn.active {
      background: rgba(167,139,250,0.2) !important;
      color: #a78bfa !important;
    }
    .pme-view-btn:hover { color: #aaa !important; }

    /* ========== CARDS ========== */
    .pm-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.06) !important;
      border-radius: 14px !important;
      padding: 18px !important;
      margin-bottom: 10px !important;
      transition: all 0.2s ease !important;
    }
    .pm-card:hover {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(255,255,255,0.12) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25) !important;
    }

    /* Card typography — pretext-style */
    .pm-card b {
      font-size: 15px !important;
      letter-spacing: -0.02em !important;
      line-height: 1.35 !important;
    }
    .pm-card div[style*="font-size:11px"] {
      line-height: 1.45 !important;
      letter-spacing: 0.01em !important;
    }

    /* ========== GRID MODE ========== */
    .pm-panel.pme-grid-view .pm-card {
      display: inline-block !important;
      width: calc(33.333% - 8px) !important;
      margin-right: 10px !important;
      margin-bottom: 10px !important;
      vertical-align: top !important;
    }

    /* ========== LIST MODE ========== */
    .pm-panel.pme-list-view .pm-card {
      display: flex !important;
      align-items: flex-start !important;
      gap: 14px !important;
      padding: 14px 18px !important;
      border-radius: 10px !important;
    }
    .pm-panel.pme-list-view .pm-card > div:first-child {
      flex-shrink: 0 !important;
    }
    .pm-panel.pme-list-view .pm-card > div:nth-child(2) {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .pm-panel.pme-list-view .pm-card > div:last-child {
      flex-shrink: 0 !important;
      margin-top: 0 !important;
    }

    /* ========== BUTTONS ========== */
    .pm-btn {
      padding: 7px 16px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      transition: all 0.15s ease !important;
      letter-spacing: -0.01em !important;
      line-height: 1.4 !important;
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
    }
    .pm-btn.danger {
      background: rgba(232,72,77,0.1) !important;
      color: #ff6b6b !important;
    }
    .pm-btn.danger:hover {
      background: rgba(232,72,77,0.2) !important;
    }

    /* ========== INSTALL BUTTON ========== */
    .pm-btn.primary[data-act="install"] {
      width: 100% !important;
      padding: 9px 16px !important;
      border-radius: 10px !important;
    }

    /* ========== COMMUNITY CARD DESCRIPTION ========== */
    .pm-card div[style*="line-height:1.4"] {
      font-size: 13px !important;
      color: #999 !important;
      line-height: 1.55 !important;
      letter-spacing: 0.005em !important;
    }

    /* ========== STATS BAR (injected) ========== */
    .pme-stats {
      display: flex !important;
      gap: 16px !important;
      padding: 10px 24px !important;
      border-top: 1px solid rgba(255,255,255,0.04) !important;
      background: rgba(0,0,0,0.2) !important;
      flex-shrink: 0 !important;
      font-size: 11px !important;
      color: #555 !important;
      letter-spacing: 0.01em !important;
      line-height: 1.4 !important;
    }
    .pme-stats b { color: #a78bfa !important; font-weight: 700 !important; }
    .pme-stats .pme-green { color: #2ecc71 !important; }
    .pme-stats .pme-orange { color: #f39c12 !important; }
    .pme-stats .pme-right { margin-left: auto !important; }

    /* ========== SECTION DIVIDER (injected before paused group) ========== */
    .pme-divider {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 14px 4px 10px !important;
      margin-top: 4px !important;
    }
    .pme-divider-dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 50% !important;
    }
    .pme-divider-text {
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
      color: #666 !important;
      line-height: 1 !important;
    }
    .pme-divider-count {
      font-size: 10px !important;
      color: #444 !important;
      background: rgba(255,255,255,0.04) !important;
      padding: 2px 8px !important;
      border-radius: 10px !important;
      line-height: 1.3 !important;
    }

    /* ========== STATUS PILL (injected into cards) ========== */
    .pme-pill {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      font-size: 9px !important;
      font-weight: 700 !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.06em !important;
      line-height: 1 !important;
      margin-left: 8px !important;
      vertical-align: middle !important;
    }
    .pme-pill-on {
      background: rgba(46,204,113,0.12) !important;
      color: #2ecc71 !important;
    }
    .pme-pill-off {
      background: rgba(243,156,18,0.12) !important;
      color: #f39c12 !important;
    }
    .pme-pill-dot {
      width: 4px !important;
      height: 4px !important;
      border-radius: 50% !important;
    }
    .pme-pill-on .pme-pill-dot { background: #2ecc71 !important; }
    .pme-pill-off .pme-pill-dot { background: #f39c12 !important; }

    /* ========== HIDE CARDS THAT DON'T MATCH SEARCH ========== */
    .pme-hidden { display: none !important; }

    /* ========== MODAL ========== */
    .bb-modal-overlay {
      z-index: 2147483648 !important;
    }
  `;
  document.head.appendChild(enhancerStyle);

  // ───────── INJECT TOOLBAR + STATS INTO PM ─────────
  function injectToolbar(pmRoot) {
    if (pmRoot.querySelector('.pme-toolbar')) return; // already injected

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
        <button class="pme-view-btn ${viewMode==='grid'?'active':''}" data-view="grid" title="Grid view">⊞</button>
        <button class="pme-view-btn ${viewMode==='list'?'active':''}" data-view="list" title="List view">☰</button>
      </div>
    `;
    pmTabs.after(toolbar);

    // Stats bar at bottom
    if (!pmRoot.querySelector('.pme-stats')) {
      const stats = document.createElement('div');
      stats.className = 'pme-stats';
      stats.id = 'pme-stats';
      pmRoot.appendChild(stats);
    }

    // View toggle
    toolbar.querySelectorAll('.pme-view-btn').forEach(btn => {
      btn.onclick = () => {
        viewMode = btn.dataset.view;
        api.storage.setForPlugin(meta.id, 'viewMode', viewMode);
        toolbar.querySelectorAll('.pme-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyViewMode(pmRoot);
        organizeInstalled(pmRoot);
      };
    });

    // Search
    const searchInput = toolbar.querySelector('#pme-search');
    const doSearch = api.debounce(() => {
      applySearch(pmRoot, searchInput.value.toLowerCase());
    }, 200);
    searchInput.addEventListener('input', doSearch);

    // Clear search on tab switch — hook into existing tabs
    pmRoot.querySelectorAll('.pm-tab').forEach(tab => {
      if (tab.dataset.pmeHooked) return;
      tab.dataset.pmeHooked = '1';
      tab.addEventListener('click', () => {
        searchInput.value = '';
        applySearch(pmRoot, '');
        // Re-apply after the PM switches panels
        setTimeout(() => {
          applyViewMode(pmRoot);
          organizeInstalled(pmRoot);
          updateStats(pmRoot);
        }, 80);
      });
    });

    applyViewMode(pmRoot);
  }

  // ───────── VIEW MODE (grid/list class on active panel) ─────────
  function applyViewMode(pmRoot) {
    const panels = pmRoot.querySelectorAll('.pm-panel');
    panels.forEach(p => {
      p.classList.remove('pme-grid-view', 'pme-list-view');
      if (p.style.display !== 'none') {
        p.classList.add(viewMode === 'grid' ? 'pme-grid-view' : 'pme-list-view');
      }
    });
  }

  // ───────── SEARCH FILTER ─────────
  function applySearch(pmRoot, query) {
    // Installed panel
    const installedPanel = pmRoot.querySelector('#installed');
    if (installedPanel && installedPanel.style.display !== 'none') {
      const cards = installedPanel.querySelectorAll('.pm-card');
      cards.forEach(card => {
        if (!query) {
          card.classList.remove('pme-hidden');
          return;
        }
        const text = card.textContent.toLowerCase();
        card.classList.toggle('pme-hidden', !text.includes(query));
      });
      // Re-organize sections after search
      organizeInstalled(pmRoot);
    }

    // Community panel
    const communityPanel = pmRoot.querySelector('#community');
    if (communityPanel && communityPanel.style.display !== 'none') {
      const cards = communityPanel.querySelectorAll('.pm-card');
      cards.forEach(card => {
        if (!query) {
          card.classList.remove('pme-hidden');
          return;
        }
        const text = card.textContent.toLowerCase();
        card.classList.toggle('pme-hidden', !text.includes(query));
      });
    }

    updateStats(pmRoot);
  }

  // ───────── ORGANIZE INSTALLED: Active on top, Paused below ─────────
  function organizeInstalled(pmRoot) {
    const panel = pmRoot.querySelector('#installed');
    if (!panel || panel.style.display === 'none') return;

    const cards = Array.from(panel.querySelectorAll('.pm-card'));
    if (cards.length === 0) return;

    // Remove old dividers
    panel.querySelectorAll('.pme-divider').forEach(el => el.remove());

    // Separate active/paused by checking button text
    let firstPausedIndex = -1;
    const plugins = currentApi.registry.getAll();

    cards.forEach((card, i) => {
      // Don't touch hidden cards
      if (card.classList.contains('pme-hidden')) return;

      const toggleBtn = card.querySelector('[data-act="toggle"]');
      if (!toggleBtn) return; // system protected card

      const id = toggleBtn.dataset.id;
      const plugin = plugins.find(p => p.id === id);
      if (!plugin) return;

      // Inject status pill if not present
      if (!card.querySelector('.pme-pill')) {
        const nameEl = card.querySelector('b');
        if (nameEl) {
          const pill = document.createElement('span');
          pill.className = `pme-pill ${plugin.enabled ? 'pme-pill-on' : 'pme-pill-off'}`;
          pill.innerHTML = `<span class="pme-pill-dot"></span>${plugin.enabled ? 'Active' : 'Paused'}`;
          nameEl.insertAdjacentElement('afterend', pill);
        }
      }

      // Update pill state
      const pill = card.querySelector('.pme-pill');
      if (pill) {
        pill.className = `pme-pill ${plugin.enabled ? 'pme-pill-on' : 'pme-pill-off'}`;
        pill.innerHTML = `<span class="pme-pill-dot"></span>${plugin.enabled ? 'Active' : 'Paused'}`;
      }

      // Track first paused card position
      if (!plugin.enabled && firstPausedIndex === -1) {
        firstPausedIndex = i;
      }

      // Move paused cards to the bottom: if we find a paused card before an active one, swap
      // Actually, let's just reorder: collect all active, then all paused
    });

    // Reorder: active first, then paused
    let activeCards = [];
    let pausedCards = [];

    cards.forEach(card => {
      if (card.classList.contains('pme-hidden')) return;
      const toggleBtn = card.querySelector('[data-act="toggle"]');
      if (!toggleBtn) return; // system card — put in active
      const id = toggleBtn.dataset.id;
      const plugin = plugins.find(p => p.id === id);
      if (!plugin || plugin.enabled) {
        activeCards.push(card);
      } else {
        pausedCards.push(card);
      }
    });

    // Only reorder if we have both groups
    if (activeCards.length > 0 && pausedCards.length > 0) {
      // Detach all cards
      cards.forEach(card => {
        if (card.parentNode === panel) panel.removeChild(card);
      });

      // Re-attach: active first
      activeCards.forEach(card => panel.appendChild(card));

      // Divider before paused
      const divider = document.createElement('div');
      divider.className = 'pme-divider';
      divider.innerHTML = `
        <div class="pme-divider-dot" style="background:#f39c12"></div>
        <div class="pme-divider-text">Paused</div>
        <div class="pme-divider-count">${pausedCards.length}</div>
      `;
      panel.appendChild(divider);

      // Paused cards
      pausedCards.forEach(card => panel.appendChild(card));
    }
  }

  // ───────── UPDATE STATS BAR ─────────
  function updateStats(pmRoot) {
    const statsEl = pmRoot.querySelector('#pme-stats');
    if (!statsEl) return;

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled).length;
    const paused = plugins.filter(p => !p.enabled).length;

    // Count visible cards in current panel
    const installedPanel = pmRoot.querySelector('#installed');
    const communityPanel = pmRoot.querySelector('#community');
    let visible = 0, total = 0;

    if (installedPanel && installedPanel.style.display !== 'none') {
      const cards = installedPanel.querySelectorAll('.pm-card');
      total = cards.length;
      visible = Array.from(cards).filter(c => !c.classList.contains('pme-hidden')).length;
      statsEl.innerHTML = `
        <span><b>${plugins.length}</b> plugins</span>
        <span><b class="pme-green">${active}</b> active</span>
        <span><b class="pme-orange">${paused}</b> paused</span>
        <span class="pme-right">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    } else if (communityPanel && communityPanel.style.display !== 'none') {
      const cards = communityPanel.querySelectorAll('.pm-card');
      total = cards.length;
      visible = Array.from(cards).filter(c => !c.classList.contains('pme-hidden')).length;
      statsEl.innerHTML = `
        <span><b>${total}</b> available</span>
        <span><b class="pme-green">${plugins.length}</b> installed</span>
        <span class="pme-right">${visible} shown · ${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    }
  }

  // ───────── MAIN ENHANCE LOOP ─────────
  function enhance() {
    const pmRoot = document.querySelector('.pm-root');
    if (!pmRoot) return;

    const isVisible = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
    if (!isVisible) return;

    injectToolbar(pmRoot);
    applyViewMode(pmRoot);
    organizeInstalled(pmRoot);
    updateStats(pmRoot);
  }

  // Poll every 500ms when PM is open — more reliable than MutationObserver
  enhanceInterval = setInterval(enhance, 500);

  // Also trigger on right-click (PM opens)
  const contextHandler = (e) => {
    if (e.target.closest('.pm-root')) return;
    setTimeout(enhance, 300);
    setTimeout(enhance, 600);
  };
  api.boardEl.addEventListener('contextmenu', contextHandler);

  // Keyboard shortcut to toggle PM
  const unregister = api.registerShortcut('ctrl+shift+p', () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      const isOpen = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
      pmRoot.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        setTimeout(enhance, 200);
        setTimeout(enhance, 500);
      }
    }
  });

  console.log('⚡ Plugin Manager Enhancer v2.0.0 — enhancing PM in-place');
}

export function teardown() {
  if (enhanceInterval) clearInterval(enhanceInterval);
  if (enhancerStyle) enhancerStyle.remove();
  // Clean up injected elements
  document.querySelectorAll('.pme-toolbar, .pme-stats, .pme-divider, .pme-pill').forEach(el => el.remove());
  // Clean up classes
  document.querySelectorAll('.pme-hidden').forEach(el => el.classList.remove('pme-hidden'));
  document.querySelectorAll('.pme-grid-view, .pme-list-view').forEach(el => {
    el.classList.remove('pme-grid-view', 'pme-list-view');
  });
  // Remove hooks
  document.querySelectorAll('[data-pme-hooked]').forEach(el => delete el.dataset.pmeHooked);
  if (currentApi) {
    currentApi.removeToolbarButton && currentApi.removeToolbarButton('pme-open-pm');
  }
  currentApi = null;
}
