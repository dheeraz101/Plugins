let currentApi = null;
let enhancerStyle = null;
let pmeObserver = null;
let enhanceTimer = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Enhancer',
  version: '4.1.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  let viewMode = api.storage.getForPlugin(meta.id, 'viewMode') || 'grid';

  enhancerStyle = document.createElement('style');
  enhancerStyle.id = 'pme-styles';
  enhancerStyle.textContent = `
    /* ========== CORE WINDOW & BLUR ========== */
    .pm-root {
      width: 900px !important;
      height: 75vh !important;
      background: rgba(255, 255, 255, 0.85) !important;
      backdrop-filter: blur(25px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      border-radius: 22px !important;
      box-shadow: 0 30px 60px rgba(0,0,0,0.15) !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif !important;
    }

    @media (prefers-color-scheme: dark) {
      .pm-root {
        background: rgba(28, 28, 30, 0.8) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 30px 60px rgba(0,0,0,0.4) !important;
      }
    }

    /* ========== TABS & NAVIGATION ========== */
    .pm-tabs {
      padding: 12px 20px 0 !important;
      background: transparent !important;
      border-bottom: 1px solid rgba(0,0,0,0.05) !important;
      display: flex !important;
      gap: 24px !important;
    }
    .pm-tab {
      padding: 8px 0 12px 0 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #86868b !important;
      border-bottom: 2px solid transparent !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    }
    .pm-tab.active {
      color: #0071e3 !important;
      border-bottom-color: #0071e3 !important;
    }

    /* ========== APPLE STYLE TOOLBAR ========== */
    .pme-toolbar {
      display: flex !important;
      align-items: center !important;
      padding: 16px 24px !important;
      gap: 16px !important;
      border-bottom: 1px solid rgba(0,0,0,0.05) !important;
      background: rgba(255,255,255,0.6) !important;
      backdrop-filter: blur(20px) !important;
    }
    .pme-search-wrap { 
      position: relative !important;
      flex: 1 !important;
    }
    .pme-search {
      width: 100% !important;
      background: rgba(0,0,0,0.05) !important;
      border: none !important;
      padding: 8px 12px 8px 32px !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      outline: none !important;
      box-sizing: border-box !important;
    }
    .pme-search-icon {
      position: absolute !important;
      left: 10px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      opacity: 0.4 !important;
      pointer-events: none !important;
    }

    /* View Switcher Pill */
    .pme-view-switcher {
      display: flex !important;
      background: rgba(0,0,0,0.05) !important;
      padding: 2px !important;
      border-radius: 8px !important;
    }
    .pme-view-btn {
      border: none !important;
      background: transparent !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #555 !important;
      font-size: 14px !important;
    }
    .pme-view-btn.active {
      background: #fff !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
      color: #0071e3 !important;
    }

    /* ========== GRID SYSTEM (FIXES FLASHING) ========== */
    .pm-panel { 
      padding: 24px !important; 
      display: grid !important; 
      gap: 16px !important; 
      transition: opacity 0.2s ease !important;
      overflow-y: auto !important;
      max-height: calc(75vh - 150px) !important;
    }
    .pm-panel::-webkit-scrollbar { width: 8px !important; }
    .pm-panel::-webkit-scrollbar-track { background: transparent !important; }
    .pm-panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12) !important; border-radius: 8px !important; }
    .pm-panel.pme-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
      align-items: stretch !important;
    }
    .pm-panel.pme-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }

    /* ========== THE CARD ========== */
    .pm-card {
      background: #fff !important;
      border-radius: 16px !important;
      padding: 16px !important;
      border: 1px solid rgba(0,0,0,0.05) !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      min-height: 150px !important;
    }
    .pm-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important;
    }
    .pm-panel.pme-list .pm-card {
      flex-direction: row !important;
      align-items: center !important;
    }
    .pm-panel.pme-list .pm-card > div:first-child {
      flex: 1 !important;
      min-width: 0 !important;
    }
    .pm-panel.pme-list .pm-card > div:last-child,
    .pm-panel.pme-list .pm-card .pme-comm-footer {
      margin-left: auto !important;
      margin-top: 0 !important;
      flex-shrink: 0 !important;
      align-self: center !important;
    }
    .pm-panel.pme-grid .pm-card {
      width: auto !important;
      margin: 0 !important;
    }
    .pm-panel.pme-grid .pm-card > div:last-child {
      margin-top: auto !important;
      align-self: flex-end !important;
    }

    /* ========== STATUS PILLS ========== */
    .pme-status-pill {
      font-size: 10px !important;
      font-weight: 600 !important;
      padding: 2px 8px !important;
      border-radius: 20px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.02em !important;
    }
    .status-active { background: #e3f9eb !important; color: #1fb141 !important; }
    .status-paused { background: #fff1e6 !important; color: #ff9500 !important; }

    /* ========== BUTTONS ========== */
    .pm-btn {
      border-radius: 999px !important;
      padding: 6px 16px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      border: none !important;
      cursor: pointer !important;
    }
    .pm-btn.primary { background: #0071e3 !important; color: white !important; }
    .pm-btn.secondary { background: rgba(0,0,0,0.05) !important; color: #1d1d1f !important; }

    @media (prefers-color-scheme: dark) {
      .pm-card { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.05) !important; }
      .pme-view-btn.active { background: rgba(255,255,255,0.2) !important; }
      .pme-search { background: rgba(255,255,255,0.1) !important; color: white !important; }
      .pm-btn.secondary { background: rgba(255,255,255,0.1) !important; color: white !important; }
    }

    /* ========== STATS BAR ========== */
    .pme-stats {
      display: flex !important;
      align-items: center !important;
      gap: 20px !important;
      padding: 12px 24px !important;
      border-top: 1px solid rgba(0,0,0,0.05) !important;
      background: rgba(255,255,255,0.85) !important;
      font-size: 12px !important;
      color: #555 !important;
    }
    .pme-stats b { color: #0071e3 !important; font-weight: 700 !important; }
    .pme-stats .sg { color: #2ecc71 !important; }
    .pme-stats .so { color: #f39c12 !important; }
    .pme-stats .sr { margin-left: auto !important; color: #444 !important; }

    /* ========== SECTION DIVIDER ========== */
    .pme-section {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 16px 4px 12px !important;
      flex-basis: 100% !important;
      width: 100% !important;
    }
    .pme-section-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; flex-shrink: 0 !important; }
    .pme-section-label {
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
      color: #888 !important;
    }
    .pme-section-count {
      font-size: 10px !important;
      color: #555 !important;
      background: rgba(0,0,0,0.05) !important;
      padding: 2px 8px !important;
      border-radius: 10px !important;
    }

    /* ========== STATUS PILL ========== */
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
      margin-left: 8px !important;
      vertical-align: middle !important;
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
      <div class="pme-view-switcher">
        <button class="pme-view-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Grid">⊞</button>
        <button class="pme-view-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="List">☰</button>
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
        enhance();
      };
    });

    const searchInput = toolbar.querySelector('#pme-search');
    searchInput.addEventListener('input', api.debounce(() => {
      applySearch(pmRoot, searchInput.value.toLowerCase());
    }, 200));

    pmRoot.querySelectorAll('.pm-tab').forEach(tab => {
      if (tab.dataset.pmeHooked) return;
      tab.dataset.pmeHooked = '1';
      tab.addEventListener('click', () => {
        searchInput.value = '';
        applySearch(pmRoot, '');
        setTimeout(enhance, 120);
      });
    });
  }

  function getActivePanel(pmRoot) {
    const activeTab = pmRoot.querySelector('.pm-tab.active');
    if (!activeTab) return null;
    const target = activeTab.dataset.tab;
    if (!target) return null;
    return pmRoot.querySelector(`#${target}`);
  }

  function resetPanel(panel) {
    panel.querySelectorAll('.pme-section, .pme-pill, .pme-comm-footer').forEach(el => el.remove());
    panel.querySelectorAll('.pme-hidden').forEach(el => el.classList.remove('pme-hidden'));
    panel.querySelectorAll('[data-pme-comm]').forEach(el => delete el.dataset.pmeComm);
    panel.classList.remove('pme-grid', 'pme-list');
    delete panel.dataset.pmeState;
  }

  function enforceSinglePanel(pmRoot, activePanel) {
    pmRoot.querySelectorAll('.pm-panel').forEach(panel => {
      if (panel === activePanel) {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.pointerEvents = 'auto';
      } else {
        panel.style.display = 'none';
      }
    });
  }

  function applyViewMode(pmRoot) {
    const activePanel = getActivePanel(pmRoot);
    if (!activePanel) return;
    activePanel.classList.remove('pme-grid', 'pme-list');
    activePanel.classList.add(viewMode === 'grid' ? 'pme-grid' : 'pme-list');
  }

  function applySearch(pmRoot, query) {
    const activePanel = getActivePanel(pmRoot);
    if (!activePanel) return;
    activePanel.querySelectorAll('.pm-card').forEach(card => {
      if (!query) {
        card.classList.remove('pme-hidden');
        return;
      }
      card.classList.toggle('pme-hidden', !card.textContent.toLowerCase().includes(query));
    });
    updateStats(pmRoot);
  }

  function organizeInstalled(pmRoot) {
    const panel = pmRoot.querySelector('#installed');
    if (!panel) return;

    const cards = Array.from(panel.querySelectorAll('.pm-card'));
    if (cards.length === 0) return;

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled);
    const paused = plugins.filter(p => !p.enabled);
    const stateKey = `${active.length}:${paused.length}:${cards.length}`;
    if (panel.dataset.pmeState === stateKey) return;

    panel.querySelectorAll('.pme-section').forEach(el => el.remove());
    panel.dataset.pmeState = stateKey;

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

    if (active.length > 0 && paused.length > 0) {
      const activeCards = [];
      const pausedCards = [];
      cards.forEach(card => {
        const toggleBtn = card.querySelector('[data-act="toggle"]');
        if (!toggleBtn) { activeCards.push(card); return; }
        const plugin = plugins.find(p => p.id === toggleBtn.dataset.id);
        if (!plugin || plugin.enabled) activeCards.push(card);
        else pausedCards.push(card);
      });

      [...activeCards, ...pausedCards].forEach(c => {
        if (c.parentNode === panel) panel.removeChild(c);
      });

      const activeHeader = document.createElement('div');
      activeHeader.className = 'pme-section';
      activeHeader.innerHTML = `
        <div class="pme-section-dot" style="background:#2ecc71"></div>
        <div class="pme-section-label">Active</div>
        <div class="pme-section-count">${activeCards.length}</div>
      `;
      panel.appendChild(activeHeader);
      activeCards.forEach(c => panel.appendChild(c));

      const pausedHeader = document.createElement('div');
      pausedHeader.className = 'pme-section';
      pausedHeader.innerHTML = `
        <div class="pme-section-dot" style="background:#f39c12"></div>
        <div class="pme-section-label">Paused</div>
        <div class="pme-section-count">${pausedCards.length}</div>
      `;
      panel.appendChild(pausedHeader);
      pausedCards.forEach(c => panel.appendChild(c));
    } else {
      const onlyActive = paused.length === 0;
      const header = document.createElement('div');
      header.className = 'pme-section';
      header.innerHTML = `
        <div class="pme-section-dot" style="background:${onlyActive ? '#2ecc71' : '#f39c12'}"></div>
        <div class="pme-section-label">${onlyActive ? 'Active' : 'Paused'}</div>
        <div class="pme-section-count">${cards.length}</div>
      `;
      const firstCard = panel.querySelector('.pm-card');
      if (firstCard) panel.insertBefore(header, firstCard);
      else panel.appendChild(header);
    }
  }

  function enhanceCommunity(pmRoot) {
    const panel = pmRoot.querySelector('#community');
    if (!panel) return;

    const cards = panel.querySelectorAll('.pm-card');
    if (cards.length === 0) return;

    const installed = new Set(currentApi.registry.getAll().map(p => p.id));

    cards.forEach(card => {
      if (card.dataset.pmeComm) return;

      const installBtn = card.querySelector('[data-install]');
      const existingDisabled = card.querySelector('button[disabled]');
      const pluginId = installBtn?.dataset.install || '';

      if (installBtn) {
        const footer = document.createElement('div');
        footer.className = 'pme-comm-footer';

        if (installed.has(pluginId)) {
          footer.innerHTML = `
            <span class="pme-comm-status">Installed</span>
            <button class="pme-icon-btn installed" title="Already installed">✓</button>
          `;
        } else {
          footer.innerHTML = `
            <span class="pme-comm-status">Available</span>
            <button class="pme-icon-btn install" title="Install" data-install="${pluginId}" data-url="${installBtn.dataset.url}">↓</button>
          `;
        }
        installBtn.parentElement.replaceWith(footer);
      } else if (existingDisabled) {
        const footer = document.createElement('div');
        footer.className = 'pme-comm-footer';
        footer.innerHTML = `
          <span class="pme-comm-status">Installed</span>
          <button class="pme-icon-btn installed" title="Already installed">✓</button>
        `;
        existingDisabled.parentElement.replaceWith(footer);
      }

      card.dataset.pmeComm = '1';
    });

    panel.querySelectorAll('.pme-icon-btn.install').forEach(btn => {
      if (btn.dataset.pmeBound) return;
      btn.dataset.pmeBound = '1';
      btn.onclick = async () => {
        const newDef = {
          id: btn.dataset.install,
          url: btn.dataset.url,
          name: btn.dataset.install,
          enabled: true,
          source: 'registry'
        };
        const registry = currentApi.registry.getAll();
        currentApi.registry.save([...registry, newDef]);
        try {
          await currentApi.reloadPlugin(newDef.id);
          currentApi.notify(`✅ Installed ${newDef.id}`, 'success');
          btn.className = 'pme-icon-btn installed';
          btn.title = 'Already installed';
          btn.textContent = '✓';
          btn.onclick = null;
          const status = btn.parentElement.querySelector('.pme-comm-status');
          if (status) status.textContent = 'Installed';
        } catch {
          currentApi.notify('Install failed', 'error');
        }
      };
    });
  }

  function updateStats(pmRoot) {
    const statsEl = pmRoot.querySelector('#pme-stats');
    if (!statsEl) return;

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled).length;
    const paused = plugins.filter(p => !p.enabled).length;

    const installedPanel = pmRoot.querySelector('#installed');
    const communityPanel = pmRoot.querySelector('#community');
    const activePanel = getActivePanel(pmRoot);

    if (activePanel === installedPanel) {
      statsEl.innerHTML = `
        <span><b>${plugins.length}</b> total</span>
        <span><b class="sg">${active}</b> active</span>
        <span><b class="so">${paused}</b> paused</span>
        <span class="sr">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    } else if (activePanel === communityPanel) {
      const total = communityPanel.querySelectorAll('.pm-card').length;
      const instCount = new Set(currentApi.registry.getAll().map(p => p.id)).size;
      statsEl.innerHTML = `
        <span><b>${total}</b> available</span>
        <span><b class="sg">${instCount}</b> installed</span>
        <span class="sr">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    }
  }

  function enhance() {
    const pmRoot = document.querySelector('.pm-root');
    if (!pmRoot || pmRoot.style.display === 'none') return;
    if (pmRoot.dataset.pmeEnhancing) return;
    pmRoot.dataset.pmeEnhancing = '1';

    try {
      injectToolbar(pmRoot);

      const activePanel = getActivePanel(pmRoot);
      if (!activePanel) return;

      enforceSinglePanel(pmRoot, activePanel);
      applyViewMode(pmRoot);

      const installedPanel = pmRoot.querySelector('#installed');
      const communityPanel = pmRoot.querySelector('#community');

      if (activePanel.id === 'installed') {
        if (communityPanel) resetPanel(communityPanel);
        organizeInstalled(pmRoot);
      } else if (activePanel.id === 'community') {
        if (installedPanel) resetPanel(installedPanel);
        enhanceCommunity(pmRoot);
      }

      updateStats(pmRoot);
    } finally {
      delete pmRoot.dataset.pmeEnhancing;
    }
  }

  pmeObserver = new MutationObserver(() => {
    if (enhanceTimer) return;
    enhanceTimer = setTimeout(() => {
      enhanceTimer = null;
      enhance();
    }, 250);
  });
  pmeObserver.observe(document.body, { childList: true, subtree: true });

  api.boardEl.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.pm-root')) return;
    setTimeout(enhance, 300);
    setTimeout(enhance, 700);
  });

  api.registerShortcut('ctrl+p', () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      const isOpen = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
      pmRoot.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        setTimeout(enhance, 200);
        setTimeout(enhance, 600);
      }
    }
  });

  console.log('⚡ PM Enhancer v4.0.0');
}

export function teardown() {
  if (pmeObserver) { pmeObserver.disconnect(); pmeObserver = null; }
  if (enhanceTimer) { clearTimeout(enhanceTimer); enhanceTimer = null; }
  if (enhancerStyle) { enhancerStyle.remove(); enhancerStyle = null; }
  document.querySelectorAll('.pme-toolbar, .pme-stats, .pme-section, .pme-pill, .pme-comm-footer').forEach(el => el.remove());
  document.querySelectorAll('.pme-hidden').forEach(el => el.classList.remove('pme-hidden'));
  document.querySelectorAll('.pme-grid, .pme-list').forEach(el => el.classList.remove('pme-grid', 'pme-list'));
  document.querySelectorAll('[data-pme-hooked]').forEach(el => delete el.dataset.pmeHooked);
  document.querySelectorAll('[data-pme-comm]').forEach(el => delete el.dataset.pmeComm);
  currentApi = null;
}
