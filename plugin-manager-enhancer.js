let currentApi = null;
let enhancerStyle = null;
let enhanceInterval = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Enhancer',
  version: '2.3.0',
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
      flex: 1 !important;
      overflow: hidden !important;
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
    .pm-panel::after { content: "" !important; display: block !important; height: 20px !important; }
    .pm-panel::-webkit-scrollbar { width: 6px !important; }
    .pm-panel::-webkit-scrollbar-track { background: transparent !important; }
    .pm-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1) !important; border-radius: 8px !important; }

    /* ============================================================
       GRID VIEW — applies to ALL visible panels (installed + community)
       ============================================================ */
    .pm-panel.pme-grid {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 12px !important;
    }
    .pm-panel.pme-grid .pm-card {
      width: calc(33.333% - 8px) !important;
      margin: 0 !important;
      flex-shrink: 0 !important;
    }

    /* Grid: flex column so buttons sit at bottom */
    .pm-panel.pme-grid .pm-card {
      display: flex !important;
      flex-direction: column !important;
    }
    .pm-panel.pme-grid .pm-card > div:first-child {
      flex: 1 !important;
    }
    .pm-panel.pme-grid .pm-card > div:last-child,
    .pm-panel.pme-grid .pme-comm-footer {
      margin-top: auto !important;
      padding-top: 10px !important;
    }

    /* ============================================================
       LIST VIEW — applies to ALL visible panels
       ============================================================ */
    .pm-panel.pme-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
    }
    .pm-panel.pme-list .pm-card {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
      padding: 14px 18px !important;
      border-radius: 10px !important;
      margin: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .pm-panel.pme-list .pm-card > div:first-child {
      flex-shrink: 0 !important;
    }
    .pm-panel.pme-list .pm-card > div:nth-child(2) {
      flex: 1 !important;
      min-width: 0 !important;
    }

    /* List: push action buttons to FAR RIGHT */
    .pm-panel.pme-list .pm-card > div:last-child:not(.pme-comm-footer),
    .pm-panel.pme-list .pm-card .pme-comm-footer {
      margin-left: auto !important;
      flex-shrink: 0 !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    /* ============================================================
       CARDS — base styling
       ============================================================ */
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

    /* ========== CARD TYPOGRAPHY ========== */
    .pm-card b {
      font-size: 15px !important;
      letter-spacing: -0.02em !important;
      line-height: 1.35 !important;
    }

    /* ========== BUTTONS — UNIFORM ========== */
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
      gap: 6px !important;
      line-height: 1 !important;
    }
    .pm-btn.primary { background: #a78bfa !important; color: #fff !important; }
    .pm-btn.primary:hover { background: #8b5cf6 !important; transform: translateY(-1px) !important; }
    .pm-btn.secondary { background: rgba(255,255,255,0.06) !important; color: #ddd !important; }
    .pm-btn.danger { background: rgba(232,72,77,0.1) !important; color: #ff6b6b !important; }
    .pm-btn.danger:hover { background: rgba(232,72,77,0.2) !important; }

    /* ========== COMMUNITY ICON BUTTONS ========== */
    .pme-icon-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 38px !important;
      height: 38px !important;
      border-radius: 10px !important;
      border: none !important;
      cursor: pointer !important;
      font-size: 18px !important;
      transition: all 0.2s ease !important;
      line-height: 1 !important;
      padding: 0 !important;
      flex-shrink: 0 !important;
    }
    .pme-icon-btn.install {
      background: rgba(167,139,250,0.15) !important;
      color: #a78bfa !important;
    }
    .pme-icon-btn.install:hover {
      background: rgba(167,139,250,0.3) !important;
      transform: scale(1.1) !important;
    }
    .pme-icon-btn.installed {
      background: rgba(255,255,255,0.04) !important;
      color: #444 !important;
      cursor: default !important;
      filter: grayscale(1) !important;
      opacity: 0.5 !important;
    }

    /* Community footer */
    .pme-comm-footer {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .pme-comm-status {
      font-size: 10px !important;
      color: #555 !important;
      letter-spacing: 0.02em !important;
    }

    /* Grid community footer: space between */
    .pm-panel.pme-grid .pme-comm-footer {
      justify-content: space-between !important;
      margin-top: auto !important;
      padding-top: 10px !important;
    }

    /* List community footer: push to far right */
    .pm-panel.pme-list .pme-comm-footer {
      margin-left: auto !important;
      flex-shrink: 0 !important;
    }

    /* ========== STATS BAR ========== */
    .pme-stats {
      display: flex !important; align-items: center !important;
      gap: 20px !important;
      padding: 12px 24px !important;
      border-top: 1px solid rgba(255,255,255,0.04) !important;
      background: rgba(0,0,0,0.2) !important;
      flex-shrink: 0 !important;
      font-size: 12px !important; color: #555 !important;
    }
    .pme-stats b { color: #a78bfa !important; font-weight: 700 !important; }
    .pme-stats .sg { color: #2ecc71 !important; }
    .pme-stats .so { color: #f39c12 !important; }
    .pme-stats .sr { margin-left: auto !important; color: #444 !important; }

    /* ========== SECTION DIVIDER ========== */
    .pme-section {
      display: flex !important; align-items: center !important; gap: 10px !important;
      padding: 16px 4px 12px !important; clear: both !important;
      flex-basis: 100% !important; width: 100% !important;
    }
    .pme-section-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; flex-shrink: 0 !important; }
    .pme-section-label {
      font-size: 11px !important; font-weight: 700 !important;
      text-transform: uppercase !important; letter-spacing: 0.08em !important;
      color: #888 !important;
    }
    .pme-section-count {
      font-size: 10px !important; color: #555 !important;
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

    pmRoot.querySelectorAll('.pm-tab').forEach(tab => {
      if (tab.dataset.pmeHooked) return;
      tab.dataset.pmeHooked = '1';
      tab.addEventListener('click', () => {
        searchInput.value = '';
        applySearch(pmRoot, '');
        setTimeout(() => {
          applyViewMode(pmRoot);
          organizeInstalled(pmRoot);
          enhanceCommunity(pmRoot);
          updateStats(pmRoot);
        }, 100);
      });
    });
  }

  // ───────── VIEW MODE — applies to ALL panels ─────────
  function applyViewMode(pmRoot) {
    pmRoot.querySelectorAll('.pm-panel').forEach(p => {
      p.classList.remove('pme-grid', 'pme-list');
      // Always apply class regardless of display state
      // (community might become visible later)
      p.classList.add(viewMode === 'grid' ? 'pme-grid' : 'pme-list');
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

    panel.querySelectorAll('.pme-section').forEach(el => el.remove());

    const plugins = currentApi.registry.getAll();
    const active = plugins.filter(p => p.enabled);
    const paused = plugins.filter(p => !p.enabled);

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

  // ───────── ENHANCE COMMUNITY ─────────
  function enhanceCommunity(pmRoot) {
    const panel = pmRoot.querySelector('#community');
    if (!panel || panel.style.display === 'none') return;

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

    // Bind install clicks
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

  // ───────── STATS ─────────
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
        <span><b>${plugins.length}</b> total</span>
        <span><b class="sg">${active}</b> active</span>
        <span><b class="so">${paused}</b> paused</span>
        <span class="sr">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
      `;
    } else if (communityPanel && communityPanel.style.display !== 'none') {
      const total = communityPanel.querySelectorAll('.pm-card').length;
      const instCount = new Set(currentApi.registry.getAll().map(p => p.id)).size;
      statsEl.innerHTML = `
        <span><b>${total}</b> available</span>
        <span><b class="sg">${instCount}</b> installed</span>
        <span class="sr">${viewMode === 'grid' ? '⊞ Grid' : '☰ List'}</span>
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
    enhanceCommunity(pmRoot);
    updateStats(pmRoot);
  }

  enhanceInterval = setInterval(enhance, 600);

  api.boardEl.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.pm-root')) return;
    setTimeout(enhance, 300);
    setTimeout(enhance, 700);
  });

  api.registerShortcut('ctrl+shift+p', () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      const isOpen = pmRoot.style.display !== 'none' && pmRoot.style.display !== '';
      pmRoot.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) { setTimeout(enhance, 200); setTimeout(enhance, 600); }
    }
  });

  console.log('⚡ PM Enhancer v2.3.0');
}

export function teardown() {
  if (enhanceInterval) clearInterval(enhanceInterval);
  if (enhancerStyle) enhancerStyle.remove();
  document.querySelectorAll('.pme-toolbar, .pme-stats, .pme-section, .pme-pill, .pme-comm-footer').forEach(el => el.remove());
  document.querySelectorAll('.pme-hidden').forEach(el => el.classList.remove('pme-hidden'));
  document.querySelectorAll('.pme-grid, .pme-list').forEach(el => el.classList.remove('pme-grid', 'pme-list'));
  document.querySelectorAll('[data-pme-hooked]').forEach(el => delete el.dataset.pmeHooked);
  document.querySelectorAll('[data-pme-comm]').forEach(el => delete el.dataset.pmeComm);
  currentApi = null;
}
