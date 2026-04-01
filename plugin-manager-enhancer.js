let currentApi = null;
let observer = null;
let enhancerStyle = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Enhancer',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  let viewMode = api.storage.getForPlugin(meta.id, 'viewMode') || 'grid';
  let searchQuery = '';

  // ───────── ENHANCER STYLES (overrides existing PM styles) ─────────
  enhancerStyle = document.createElement('style');
  enhancerStyle.id = 'pme-styles';
  enhancerStyle.textContent = `

    /* ========== ENHANCED PLUGIN MANAGER ========== */

    /* Make PM window bigger & prettier */
    .pm-root {
      width: 960px !important;
      height: 82vh !important;
      max-width: 97vw !important;
      max-height: 95vh !important;
      border-radius: 20px !important;
      background: #0e0e14 !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7) !important;
    }

    /* Header polish */
    .pm-header {
      padding: 18px 24px !important;
      background: rgba(255,255,255,0.015) !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }

    /* Tabs polish */
    .pm-tabs {
      background: rgba(0,0,0,0.3) !important;
      padding: 0 16px !important;
    }
    .pm-tab {
      font-weight: 600 !important;
      font-size: 13px !important;
      padding: 13px 20px !important;
    }
    .pm-tab.active {
      color: #a78bfa !important;
      border-bottom-color: #a78bfa !important;
    }

    /* Body area */
    .pm-body {
      background: #111118 !important;
      display: flex !important;
      flex-direction: column !important;
    }

    /* ========== TOOLBAR (injected by enhancer) ========== */
    .pme-toolbar {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 12px 20px !important;
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
      padding: 9px 14px 9px 36px !important;
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 10px !important;
      color: #fff !important;
      font-size: 13px !important;
      outline: none !important;
      transition: all 0.2s !important;
      box-sizing: border-box !important;
      font-family: inherit !important;
    }
    .pme-search:focus {
      border-color: #a78bfa !important;
      background: rgba(255,255,255,0.08) !important;
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
      color: #666 !important;
      cursor: pointer !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      transition: all 0.15s !important;
    }
    .pme-view-btn.active {
      background: rgba(167,139,250,0.2) !important;
      color: #a78bfa !important;
    }
    .pme-view-btn:hover { color: #aaa !important; }

    /* ========== SECTION HEADERS ========== */
    .pme-section {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 10px 4px 8px !important;
    }
    .pme-section-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
    }
    .pme-section-dot.green { background: #2ecc71 !important; }
    .pme-section-dot.yellow { background: #f39c12 !important; }
    .pme-section-title {
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
      color: #888 !important;
    }
    .pme-section-count {
      font-size: 10px !important;
      color: #555 !important;
      background: rgba(255,255,255,0.04) !important;
      padding: 2px 8px !important;
      border-radius: 10px !important;
    }

    /* ========== ENHANCED CARDS (GRID MODE) ========== */
    .pme-grid-wrap {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
      gap: 10px !important;
      margin-bottom: 16px !important;
    }

    /* ========== ENHANCED CARDS (LIST MODE) ========== */
    .pme-list-wrap {
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
      margin-bottom: 16px !important;
    }

    /* ========== CARD STYLING ========== */
    .pm-card {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.06) !important;
      border-radius: 14px !important;
      padding: 16px !important;
      margin-bottom: 0 !important;
      transition: all 0.2s !important;
    }
    .pm-card:hover {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(255,255,255,0.12) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
    }

    /* List mode card */
    .pm-card.pme-list-card {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 12px 16px !important;
      border-radius: 10px !important;
    }
    .pm-card.pme-list-card:hover {
      transform: none !important;
    }

    /* ========== STATUS BADGE ========== */
    .pme-status {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      font-size: 10px !important;
      font-weight: 600 !important;
      padding: 3px 8px !important;
      border-radius: 6px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
    .pme-status.active {
      background: rgba(46,204,113,0.12) !important;
      color: #2ecc71 !important;
    }
    .pme-status.paused {
      background: rgba(243,156,18,0.12) !important;
      color: #f39c12 !important;
    }
    .pme-status-dot {
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
    }
    .pme-status.active .pme-status-dot { background: #2ecc71 !important; }
    .pme-status.paused .pme-status-dot { background: #f39c12 !important; }

    /* ========== BETTER BUTTONS ========== */
    .pm-btn {
      padding: 7px 16px !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      transition: all 0.15s !important;
    }
    .pm-btn.primary {
      background: #a78bfa !important;
    }
    .pm-btn.primary:hover {
      background: #8b5cf6 !important;
    }

    /* ========== STATS BAR ========== */
    .pme-stats-bar {
      display: flex !important;
      gap: 16px !important;
      padding: 10px 20px !important;
      border-top: 1px solid rgba(255,255,255,0.04) !important;
      background: rgba(0,0,0,0.2) !important;
      flex-shrink: 0 !important;
    }
    .pme-stat {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-size: 11px !important;
      color: #666 !important;
    }
    .pme-stat-val {
      color: #a78bfa !important;
      font-weight: 700 !important;
    }

    /* ========== EMPTY STATE ========== */
    .pme-empty {
      text-align: center !important;
      padding: 40px 20px !important;
      color: #555 !important;
    }
    .pme-empty-icon { font-size: 36px !important; margin-bottom: 8px !important; opacity: 0.5 !important; }
    .pme-empty-text { font-size: 13px !important; font-weight: 500 !important; }

    /* ========== SCROLLBAR ========== */
    .pm-panel::-webkit-scrollbar { width: 6px !important; }
    .pm-panel::-webkit-scrollbar-track { background: transparent !important; }
    .pm-panel::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1) !important;
      border-radius: 8px !important;
    }

    /* ========== COMMUNITY CARDS ========== */
    .pme-community-card .pm-card {
      min-height: auto !important;
    }
  `;
  document.head.appendChild(enhancerStyle);

  // ───────── INJECT TOOLBAR & STATS INTO EXISTING PM ─────────
  function enhancePluginManager() {
    const pmRoot = document.querySelector('.pm-root');
    if (!pmRoot || pmRoot.dataset.pmeEnhanced) return;
    pmRoot.dataset.pmeEnhanced = 'true';

    const pmBody = pmRoot.querySelector('.pm-body');
    const installedPanel = pmRoot.querySelector('#installed');
    const communityPanel = pmRoot.querySelector('#community');

    if (!pmBody || !installedPanel) return;

    // Inject toolbar between tabs and body
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

    // Inject stats bar at bottom
    const statsBar = document.createElement('div');
    statsBar.className = 'pme-stats-bar';
    statsBar.id = 'pme-stats-bar';

    // Insert toolbar before the body, stats after
    pmBody.parentNode.insertBefore(toolbar, pmBody);
    pmBody.parentNode.appendChild(statsBar);

    // View toggle buttons
    toolbar.querySelectorAll('.pme-view-btn').forEach(btn => {
      btn.onclick = () => {
        viewMode = btn.dataset.view;
        api.storage.setForPlugin(meta.id, 'viewMode', viewMode);
        toolbar.querySelectorAll('.pme-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reRenderInstalled();
        reRenderCommunity();
      };
    });

    // Search input
    const searchInput = toolbar.querySelector('#pme-search');
    const debouncedSearch = api.debounce(e => {
      searchQuery = e.target.value.toLowerCase();
      reRenderInstalled();
      reRenderCommunity();
    }, 200);
    searchInput.addEventListener('input', debouncedSearch);

    // Clear search on tab switch
    pmRoot.querySelectorAll('.pm-tab').forEach(tab => {
      const origOnClick = tab.onclick;
      tab.onclick = (e) => {
        searchQuery = '';
        searchInput.value = '';
        if (origOnClick) origOnClick.call(tab, e);
        // Re-render after tab switch settles
        setTimeout(() => {
          reRenderInstalled();
          reRenderCommunity();
        }, 50);
      };
    });

    // Initial render
    reRenderInstalled();
  }

  // ───────── RE-RENDER INSTALLED PANEL ─────────
  function reRenderInstalled() {
    const installedPanel = document.querySelector('#installed');
    if (!installedPanel || installedPanel.style.display === 'none') return;

    const cards = installedPanel.querySelectorAll('.pm-card');
    if (cards.length === 0) return;

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled);
    const paused = plugins.filter(p => !p.enabled);

    // Filter by search
    const matchSearch = (p) => !searchQuery ||
      (p.name||p.id).toLowerCase().includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery);

    const fActive = active.filter(matchSearch);
    const fPaused = paused.filter(matchSearch);

    // Update stats bar
    const statsBar = document.querySelector('#pme-stats-bar');
    if (statsBar) {
      statsBar.innerHTML = `
        <div class="pme-stat"><span class="pme-stat-val">${plugins.length}</span> plugins</div>
        <div class="pme-stat"><span class="pme-stat-val" style="color:#2ecc71">${active.length}</span> active</div>
        <div class="pme-stat"><span class="pme-stat-val" style="color:#f39c12">${paused.length}</span> paused</div>
        <div style="margin-left:auto" class="pme-stat">View: <span class="pme-stat-val">${viewMode === 'grid' ? 'Grid' : 'List'}</span></div>
      `;
    }

    // If no search, just re-organize the existing cards
    if (!searchQuery) {
      organizeCards(installedPanel, plugins, 'installed');
      return;
    }

    // With search, show/hide cards
    const allCards = installedPanel.querySelectorAll('.pm-card');
    allCards.forEach(card => {
      const id = card.querySelector('[data-id]')?.dataset.id;
      const p = plugins.find(x => x.id === id);
      if (p && matchSearch(p)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // ───────── RE-RENDER COMMUNITY PANEL ─────────
  function reRenderCommunity() {
    const communityPanel = document.querySelector('#community');
    if (!communityPanel || communityPanel.style.display === 'none') return;

    const cards = communityPanel.querySelectorAll('.pm-card');
    if (cards.length === 0) return;

    if (!searchQuery) {
      // Reset visibility
      cards.forEach(c => c.style.display = '');
      organizeCards(communityPanel, null, 'community');
      return;
    }

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchQuery) ? '' : 'none';
    });
  }

  // ───────── ORGANIZE CARDS INTO SECTIONS (ACTIVE/PAUSED) ─────────
  function organizeCards(panel, plugins, panelType) {
    if (!plugins && panelType === 'installed') return;

    // Remove old sections
    panel.querySelectorAll('.pme-section, .pme-grid-wrap, .pme-list-wrap, .pme-empty').forEach(el => el.remove());

    const cards = Array.from(panel.querySelectorAll('.pm-card'));
    if (cards.length === 0) return;

    if (panelType === 'installed' && plugins) {
      const active = plugins.filter(p => p.enabled);
      const paused = plugins.filter(p => !p.enabled);

      const activeCards = [];
      const pausedCards = [];

      cards.forEach(card => {
        const toggleBtn = card.querySelector('[data-act="toggle"]');
        const id = toggleBtn?.dataset.id;
        if (!id) return;

        // Add status badge if not present
        if (!card.querySelector('.pme-status')) {
          const p = plugins.find(x => x.id === id);
          const isPaused = !p?.enabled;
          const badge = document.createElement('span');
          badge.className = `pme-status ${isPaused ? 'paused' : 'active'}`;
          badge.innerHTML = `<span class="pme-status-dot"></span>${isPaused ? 'Paused' : 'Active'}`;
          badge.style.marginLeft = '8px';

          const nameEl = card.querySelector('b');
          if (nameEl) nameEl.parentNode.appendChild(badge);
        }

        // Style for list mode
        if (viewMode === 'list') {
          card.classList.add('pme-list-card');
        } else {
          card.classList.remove('pme-list-card');
        }

        const p = plugins.find(x => x.id === id);
        if (p?.enabled) activeCards.push(card);
        else pausedCards.push(card);
      });

      // Clear panel and rebuild with sections
      const fragment = document.createDocumentFragment();

      if (activeCards.length > 0) {
        fragment.appendChild(createSection('green', 'Active', activeCards.length));
        if (viewMode === 'grid') {
          const wrap = document.createElement('div');
          wrap.className = 'pme-grid-wrap';
          activeCards.forEach(c => wrap.appendChild(c));
          fragment.appendChild(wrap);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'pme-list-wrap';
          activeCards.forEach(c => wrap.appendChild(c));
          fragment.appendChild(wrap);
        }
      }

      if (pausedCards.length > 0) {
        fragment.appendChild(createSection('yellow', 'Paused', pausedCards.length));
        if (viewMode === 'grid') {
          const wrap = document.createElement('div');
          wrap.className = 'pme-grid-wrap';
          pausedCards.forEach(c => wrap.appendChild(c));
          fragment.appendChild(wrap);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'pme-list-wrap';
          pausedCards.forEach(c => wrap.appendChild(c));
          fragment.appendChild(wrap);
        }
      }

      if (activeCards.length === 0 && pausedCards.length === 0) {
        fragment.appendChild(createEmpty('No plugins match your search'));
      }

      // Insert fragment at top of panel (before any leftover elements)
      panel.insertBefore(fragment, panel.firstChild);

    } else if (panelType === 'community') {
      // Community: just apply grid/list wrapping
      const visibleCards = cards.filter(c => c.style.display !== 'none');

      if (visibleCards.length === 0) return;

      // Add list card class
      visibleCards.forEach(card => {
        if (viewMode === 'list') {
          card.classList.add('pme-list-card');
        } else {
          card.classList.remove('pme-list-card');
        }
      });

      const wrap = document.createElement('div');
      wrap.className = viewMode === 'grid' ? 'pme-grid-wrap' : 'pme-list-wrap';

      // Move cards into wrap
      visibleCards.forEach(c => wrap.appendChild(c));
      panel.insertBefore(wrap, panel.firstChild);
    }
  }

  function createSection(color, title, count) {
    const div = document.createElement('div');
    div.className = 'pme-section';
    div.innerHTML = `
      <div class="pme-section-dot ${color}"></div>
      <div class="pme-section-title">${title}</div>
      <div class="pme-section-count">${count}</div>
    `;
    return div;
  }

  function createEmpty(text) {
    const div = document.createElement('div');
    div.className = 'pme-empty';
    div.innerHTML = `
      <div class="pme-empty-icon">🔍</div>
      <div class="pme-empty-text">${text}</div>
    `;
    return div;
  }

  // ───────── MUTATION OBSERVER ─────────
  // Watch for PM being opened (display changes from none to flex)
  observer = new MutationObserver(() => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot && pmRoot.style.display !== 'none' && pmRoot.style.display !== '') {
      enhancePluginManager();
    }
  });

  // Also observe for PM root being added to DOM
  const bodyObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.classList?.contains('pm-root')) {
          setTimeout(enhancePluginManager, 100);
        }
      }
    }
  });
  bodyObserver.observe(api.boardEl, { childList: true, subtree: true });

  // Observe existing PM if present
  const existingPM = document.querySelector('.pm-root');
  if (existingPM) {
    observer.observe(existingPM, { attributes: true, attributeFilter: ['style'] });
    if (existingPM.style.display !== 'none') {
      setTimeout(enhancePluginManager, 200);
    }
  }

  // Also listen for right-click (PM opens on contextmenu)
  api.boardEl.addEventListener('contextmenu', () => {
    setTimeout(enhancePluginManager, 300);
  });

  // Re-organize when installed panel content changes
  const installedPanel = document.querySelector('#installed');
  if (installedPanel) {
    const panelObserver = new MutationObserver(api.debounce(() => {
      const pmRoot = document.querySelector('.pm-root');
      if (pmRoot && pmRoot.style.display !== 'none') {
        setTimeout(() => {
          reRenderInstalled();
          reRenderCommunity();
        }, 100);
      }
    }, 150));
    panelObserver.observe(installedPanel, { childList: true });
  }

  // Toolbar button to open PM
  api.registerToolbarButton({
    id: 'pme-open-pm',
    label: '⚙️ Plugins',
    onClick: () => {
      const pmRoot = document.querySelector('.pm-root');
      if (pmRoot) {
        pmRoot.style.display = 'flex';
        setTimeout(enhancePluginManager, 100);
      }
    }
  });

  // Keyboard shortcut
  const unregister = api.registerShortcut('ctrl+shift+p', () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      const isOpen = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
      pmRoot.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) setTimeout(enhancePluginManager, 100);
    }
  });

  console.log('⚡ Plugin Manager Enhancer v1.0.0 — enhancing your PM in-place');
}

export function teardown() {
  if (observer) observer.disconnect();
  if (enhancerStyle) enhancerStyle.remove();
  if (currentApi) {
    currentApi.removeToolbarButton('pme-open-pm');
  }
  // Remove enhancer elements
  document.querySelectorAll('.pme-toolbar, .pme-stats-bar, .pme-section, .pme-grid-wrap, .pme-list-wrap').forEach(el => el.remove());
  // Remove list card class
  document.querySelectorAll('.pme-list-card').forEach(el => el.classList.remove('pme-list-card'));
  // Remove status badges
  document.querySelectorAll('.pme-status').forEach(el => el.remove());
  // Remove enhanced flag
  const pmRoot = document.querySelector('.pm-root');
  if (pmRoot) delete pmRoot.dataset.pmeEnhanced;
  currentApi = null;
}
