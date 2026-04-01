let currentApi = null;
let observer = null;

export const meta = {
  id: 'plugin-manager-enhancer',
  name: 'Plugin Manager Pro',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const COMMUNITY_URL = 'https://raw.githubusercontent.com/dheeraz101/Empty_Plugins/refs/heads/main/plugins.json';

  // ───────── STATE ─────────
  let viewMode = api.storage.getForPlugin(meta.id, 'viewMode') || 'grid'; // grid | list
  let searchQuery = '';
  let activeTab = 'installed';
  let communityCache = [];
  let communitySearch = '';

  // ───────── STYLES ─────────
  api.injectCSS(meta.id, `
    /* ========== ENHANCER OVERLAY ========== */
    .pme-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      z-index: 2147483646;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .pme-overlay.open { display: flex; }

    .pme-window {
      width: 920px; height: 80vh;
      max-width: 96vw; max-height: 94vh;
      min-width: 480px; min-height: 380px;
      background: #0e0e14;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      display: flex; flex-direction: column;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7);
      overflow: hidden;
      color: #e0e0e0;
    }

    /* ========== HEADER ========== */
    .pme-header {
      padding: 18px 24px;
      display: flex; align-items: center; gap: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.015);
    }
    .pme-logo { font-size: 22px; }
    .pme-title { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
    .pme-subtitle { font-size: 11px; color: #666; margin-top: 1px; }
    .pme-header-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .pme-close {
      width: 34px; height: 34px; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: none;
      color: #888; font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .pme-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

    /* ========== TABS ========== */
    .pme-tabs {
      display: flex; padding: 0 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.3);
    }
    .pme-tab {
      padding: 13px 20px; background: none; border: none;
      color: #666; cursor: pointer; font-size: 13px; font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: all 0.2s; position: relative;
    }
    .pme-tab:hover { color: #aaa; }
    .pme-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }
    .pme-tab-badge {
      position: absolute; top: 8px; right: 4px;
      background: #a78bfa; color: #fff; font-size: 9px;
      padding: 1px 5px; border-radius: 6px; font-weight: 700;
    }

    /* ========== TOOLBAR ========== */
    .pme-toolbar {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .pme-search {
      flex: 1; padding: 9px 14px 9px 36px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; color: #fff; font-size: 13px;
      outline: none; transition: all 0.2s;
    }
    .pme-search:focus { border-color: #a78bfa; background: rgba(255,255,255,0.08); }
    .pme-search-wrap { position: relative; flex: 1; }
    .pme-search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      color: #555; font-size: 13px; pointer-events: none;
    }
    .pme-view-btns { display: flex; gap: 2px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 3px; }
    .pme-view-btn {
      padding: 6px 10px; background: none; border: none;
      color: #666; cursor: pointer; border-radius: 6px; font-size: 14px;
      transition: all 0.15s;
    }
    .pme-view-btn.active { background: rgba(167,139,250,0.2); color: #a78bfa; }
    .pme-view-btn:hover { color: #aaa; }
    .pme-btn-install {
      padding: 8px 16px; background: #a78bfa; color: #fff;
      border: none; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 600; transition: all 0.2s;
      white-space: nowrap;
    }
    .pme-btn-install:hover { background: #8b5cf6; transform: translateY(-1px); }

    /* ========== CONTENT ========== */
    .pme-content {
      flex: 1; overflow-y: auto; padding: 16px 20px;
    }
    .pme-content::-webkit-scrollbar { width: 6px; }
    .pme-content::-webkit-scrollbar-track { background: transparent; }
    .pme-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }

    /* ========== SECTION HEADERS ========== */
    .pme-section {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 12px; margin-top: 8px;
    }
    .pme-section-dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .pme-section-dot.green { background: #2ecc71; }
    .pme-section-dot.yellow { background: #f39c12; }
    .pme-section-dot.purple { background: #a78bfa; }
    .pme-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
    .pme-section-count {
      font-size: 11px; color: #555;
      background: rgba(255,255,255,0.04);
      padding: 2px 8px; border-radius: 10px;
    }

    /* ========== GRID VIEW ========== */
    .pme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 10px; margin-bottom: 20px;
    }
    .pme-grid-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; padding: 16px;
      transition: all 0.2s; cursor: default;
      display: flex; flex-direction: column;
    }
    .pme-grid-card:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.12);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .pme-grid-icon {
      font-size: 28px; margin-bottom: 10px;
      width: 48px; height: 48px;
      background: rgba(255,255,255,0.04);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .pme-grid-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
    .pme-grid-author { font-size: 11px; color: #7c6fff; margin-bottom: 6px; }
    .pme-grid-desc { font-size: 12px; color: #888; line-height: 1.4; flex: 1; margin-bottom: 10px; }
    .pme-grid-actions { display: flex; gap: 6px; }

    /* ========== LIST VIEW ========== */
    .pme-list { margin-bottom: 20px; }
    .pme-list-item {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 14px; border-radius: 10px;
      transition: all 0.15s; margin-bottom: 2px;
    }
    .pme-list-item:hover { background: rgba(255,255,255,0.04); }
    .pme-list-icon {
      font-size: 20px; width: 40px; height: 40px;
      background: rgba(255,255,255,0.04); border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .pme-list-info { flex: 1; min-width: 0; }
    .pme-list-name { font-size: 14px; font-weight: 600; color: #fff; }
    .pme-list-meta { font-size: 11px; color: #666; margin-top: 1px; }
    .pme-list-desc { font-size: 12px; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pme-list-actions { display: flex; gap: 6px; flex-shrink: 0; }

    /* ========== BUTTONS ========== */
    .pme-action-btn {
      padding: 6px 14px; border: none; border-radius: 8px;
      cursor: pointer; font-size: 12px; font-weight: 600;
      transition: all 0.15s;
    }
    .pme-action-btn.primary { background: #a78bfa; color: #fff; }
    .pme-action-btn.primary:hover { background: #8b5cf6; }
    .pme-action-btn.pause { background: rgba(243,156,18,0.15); color: #f39c12; }
    .pme-action-btn.pause:hover { background: rgba(243,156,18,0.25); }
    .pme-action-btn.resume { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .pme-action-btn.resume:hover { background: rgba(46,204,113,0.25); }
    .pme-action-btn.delete { background: rgba(232,72,77,0.1); color: #ff6b6b; }
    .pme-action-btn.delete:hover { background: rgba(232,72,77,0.2); }
    .pme-action-btn.installed { background: rgba(255,255,255,0.05); color: #666; cursor: default; }

    /* ========== STATUS BADGE ========== */
    .pme-status {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10px; font-weight: 600; padding: 3px 8px;
      border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .pme-status.active { background: rgba(46,204,113,0.12); color: #2ecc71; }
    .pme-status.paused { background: rgba(243,156,18,0.12); color: #f39c12; }
    .pme-status-dot { width: 5px; height: 5px; border-radius: 50%; }
    .pme-status.active .pme-status-dot { background: #2ecc71; }
    .pme-status.paused .pme-status-dot { background: #f39c12; }

    /* ========== EMPTY STATE ========== */
    .pme-empty {
      text-align: center; padding: 60px 20px;
      color: #555;
    }
    .pme-empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
    .pme-empty-text { font-size: 14px; font-weight: 500; }
    .pme-empty-sub { font-size: 12px; margin-top: 4px; color: #444; }

    /* ========== STATS BAR ========== */
    .pme-stats {
      display: flex; gap: 16px; padding: 10px 20px;
      border-top: 1px solid rgba(255,255,255,0.04);
      background: rgba(0,0,0,0.2);
    }
    .pme-stat { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666; }
    .pme-stat-val { color: #a78bfa; font-weight: 700; }

    /* ========== INSTALL MODAL ========== */
    .pme-modal-bg {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 2147483648;
      display: flex; align-items: center; justify-content: center;
    }
    .pme-modal {
      background: #16161e; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 24px; width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    .pme-modal h3 { margin: 0 0 16px; font-size: 16px; color: #fff; }
    .pme-modal input {
      width: 100%; padding: 10px 14px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: #fff; font-size: 13px;
      margin-bottom: 10px; outline: none; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .pme-modal input:focus { border-color: #a78bfa; }
    .pme-modal-actions { display: flex; gap: 8px; margin-top: 6px; }
    .pme-modal-actions button { flex: 1; padding: 10px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .pme-modal-save { background: #a78bfa; color: #fff; }
    .pme-modal-save:hover { background: #8b5cf6; }
    .pme-modal-cancel { background: rgba(255,255,255,0.06); color: #aaa; }

    /* ========== KEYFRAMES ========== */
    @keyframes pmeFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    .pme-window { animation: pmeFadeIn 0.2s ease-out; }
  `, { global: true });

  // ───────── BUILD UI ─────────
  const overlay = document.createElement('div');
  overlay.className = 'pme-overlay';
  overlay.innerHTML = `
    <div class="pme-window">
      <div class="pme-header">
        <div class="pme-logo">⚡</div>
        <div>
          <div class="pme-title">Plugin Manager Pro</div>
          <div class="pme-subtitle" id="pme-stats-text">Manage your workspace plugins</div>
        </div>
        <div class="pme-header-right">
          <a href="https://empty-ad9a3406.mintlify.app/" target="_blank"
             style="color:#a78bfa;font-size:11px;text-decoration:none;padding:6px 12px;border-radius:8px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.2)">
            📖 Docs
          </a>
          <button class="pme-close" id="pme-close">✕</button>
        </div>
      </div>

      <div class="pme-tabs">
        <button class="pme-tab active" data-tab="installed">
          🧩 Installed
          <span class="pme-tab-badge" id="pme-installed-count">0</span>
        </button>
        <button class="pme-tab" data-tab="community">
          🌍 Community Store
        </button>
      </div>

      <div class="pme-toolbar">
        <div class="pme-search-wrap">
          <span class="pme-search-icon">🔍</span>
          <input class="pme-search" placeholder="Search plugins..." id="pme-search">
        </div>
        <div class="pme-view-btns">
          <button class="pme-view-btn ${viewMode==='grid'?'active':''}" data-view="grid" title="Grid view">⊞</button>
          <button class="pme-view-btn ${viewMode==='list'?'active':''}" data-view="list" title="List view">☰</button>
        </div>
        <button class="pme-btn-install" id="pme-btn-install-url">+ Install URL</button>
      </div>

      <div class="pme-content" id="pme-content"></div>

      <div class="pme-stats" id="pme-stats-bar"></div>
    </div>
  `;
  api.boardEl.appendChild(overlay);

  // ───────── HELPERS ─────────
  function getPlugins() {
    return api.registry.getAll();
  }

  function saveViewMode(mode) {
    viewMode = mode;
    api.storage.setForPlugin(meta.id, 'viewMode', mode);
  }

  // ───────── RENDER ─────────
  function renderInstalled() {
    const content = overlay.querySelector('#pme-content');
    const plugins = getPlugins();
    const q = searchQuery.toLowerCase();

    const active = plugins.filter(p => p.enabled && p.id !== meta.id);
    const paused = plugins.filter(p => !p.enabled);
    const filtered = (arr) => q ? arr.filter(p => (p.name||p.id).toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : arr;

    const fActive = filtered(active);
    const fPaused = filtered(paused);

    // Update stats
    overlay.querySelector('#pme-installed-count').textContent = plugins.length;
    overlay.querySelector('#pme-stats-text').textContent = `${active.length} active • ${paused.length} paused • ${plugins.length} total`;
    overlay.querySelector('#pme-stats-bar').innerHTML = `
      <div class="pme-stat"><span class="pme-stat-val">${plugins.length}</span> plugins</div>
      <div class="pme-stat"><span class="pme-stat-val" style="color:#2ecc71">${active.length}</span> active</div>
      <div class="pme-stat"><span class="pme-stat-val" style="color:#f39c12">${paused.length}</span> paused</div>
      <div style="margin-left:auto" class="pme-stat">View: <span class="pme-stat-val">${viewMode === 'grid' ? 'Grid' : 'List'}</span></div>
    `;

    let html = '';

    if (fActive.length === 0 && fPaused.length === 0) {
      html = `
        <div class="pme-empty">
          <div class="pme-empty-icon">🔍</div>
          <div class="pme-empty-text">No plugins found</div>
          <div class="pme-empty-sub">${q ? 'Try a different search term' : 'Install plugins from the Community Store'}</div>
        </div>
      `;
    }

    if (fActive.length > 0) {
      html += `<div class="pme-section">
        <div class="pme-section-dot green"></div>
        <div class="pme-section-title">Active</div>
        <div class="pme-section-count">${fActive.length}</div>
      </div>`;
      html += viewMode === 'grid' ? renderGrid(fActive, 'active') : renderList(fActive, 'active');
    }

    if (fPaused.length > 0) {
      html += `<div class="pme-section">
        <div class="pme-section-dot yellow"></div>
        <div class="pme-section-title">Paused</div>
        <div class="pme-section-count">${fPaused.length}</div>
      </div>`;
      html += viewMode === 'grid' ? renderGrid(fPaused, 'paused') : renderList(fPaused, 'paused');
    }

    content.innerHTML = html;
    bindInstalledActions();
  }

  function renderGrid(plugins, status) {
    return `<div class="pme-grid">${plugins.map(p => `
      <div class="pme-grid-card">
        <div class="pme-grid-icon">${p.icon || '📦'}</div>
        <div class="pme-grid-name">${p.name || p.id}</div>
        <div class="pme-grid-author">${p.author ? 'by ' + p.author : ''}</div>
        <div class="pme-grid-desc">${p.description || p.id}</div>
        <div style="margin-bottom:8px">
          <span class="pme-status ${status}">
            <span class="pme-status-dot"></span>
            ${status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
        <div class="pme-grid-actions">
          ${p.id !== 'plugin-manager' ? `
            <button class="pme-action-btn ${status==='active'?'pause':'resume'}" data-act="toggle" data-id="${p.id}">
              ${status==='active'?'Pause':'Resume'}
            </button>
            <button class="pme-action-btn delete" data-act="delete" data-id="${p.id}">🗑</button>
          ` : `<span style="font-size:11px;color:#555">System</span>`}
        </div>
      </div>
    `).join('')}</div>`;
  }

  function renderList(plugins, status) {
    return `<div class="pme-list">${plugins.map(p => `
      <div class="pme-list-item">
        <div class="pme-list-icon">${p.icon || '📦'}</div>
        <div class="pme-list-info">
          <div class="pme-list-name">${p.name || p.id}</div>
          <div class="pme-list-meta">${p.id}${p.author ? ' • by ' + p.author : ''}</div>
          <div class="pme-list-desc">${p.description || ''}</div>
        </div>
        <span class="pme-status ${status}">
          <span class="pme-status-dot"></span>
          ${status === 'active' ? 'Active' : 'Paused'}
        </span>
        <div class="pme-list-actions">
          ${p.id !== 'plugin-manager' ? `
            <button class="pme-action-btn ${status==='active'?'pause':'resume'}" data-act="toggle" data-id="${p.id}">
              ${status==='active'?'Pause':'Resume'}
            </button>
            <button class="pme-action-btn delete" data-act="delete" data-id="${p.id}">🗑</button>
          ` : `<span style="font-size:11px;color:#555">System</span>`}
        </div>
      </div>
    `).join('')}</div>`;
  }

  async function renderCommunity() {
    const content = overlay.querySelector('#pme-content');

    if (!communityCache.length) {
      content.innerHTML = `<div class="pme-empty"><div class="pme-empty-icon">⏳</div><div class="pme-empty-text">Loading community plugins...</div></div>`;
      try {
        communityCache = await fetch(COMMUNITY_URL).then(r => r.json());
      } catch {
        communityCache = [];
      }
    }

    const installed = new Set(getPlugins().map(p => p.id));
    const q = communitySearch.toLowerCase();
    const filtered = q ? communityCache.filter(p =>
      (p.name||'').toLowerCase().includes(q) ||
      (p.id||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q) ||
      (p.author||'').toLowerCase().includes(q)
    ) : communityCache;

    // Update stats
    const installable = filtered.filter(p => !installed.has(p.id)).length;
    overlay.querySelector('#pme-stats-bar').innerHTML = `
      <div class="pme-stat"><span class="pme-stat-val">${communityCache.length}</span> available</div>
      <div class="pme-stat"><span class="pme-stat-val" style="color:#2ecc71">${installed.size}</span> installed</div>
      <div class="pme-stat"><span class="pme-stat-val" style="color:#a78bfa">${installable}</span> to install</div>
      <div style="margin-left:auto" class="pme-stat">${filtered.length} shown</div>
    `;

    if (filtered.length === 0) {
      content.innerHTML = `
        <div class="pme-empty">
          <div class="pme-empty-icon">🌍</div>
          <div class="pme-empty-text">No community plugins found</div>
          <div class="pme-empty-sub">${q ? 'Try a different search' : 'Check back later for new plugins'}</div>
        </div>
      `;
      return;
    }

    if (viewMode === 'grid') {
      content.innerHTML = `
        <div class="pme-section">
          <div class="pme-section-dot purple"></div>
          <div class="pme-section-title">Community Store</div>
          <div class="pme-section-count">${filtered.length} plugins</div>
        </div>
        <div class="pme-grid">${filtered.map(p => `
          <div class="pme-grid-card">
            <div class="pme-grid-icon">${p.icon || '📦'}</div>
            <div class="pme-grid-name">${p.name}</div>
            <div class="pme-grid-author">by ${p.author || 'Unknown'}</div>
            <div class="pme-grid-desc">${p.description || ''}</div>
            <div class="pme-grid-actions">
              ${installed.has(p.id)
                ? `<button class="pme-action-btn installed">✓ Installed</button>`
                : `<button class="pme-action-btn primary" data-install="${p.id}" data-url="${p.url}">Install</button>`
              }
            </div>
          </div>
        `).join('')}</div>
      `;
    } else {
      content.innerHTML = `
        <div class="pme-section">
          <div class="pme-section-dot purple"></div>
          <div class="pme-section-title">Community Store</div>
          <div class="pme-section-count">${filtered.length} plugins</div>
        </div>
        <div class="pme-list">${filtered.map(p => `
          <div class="pme-list-item">
            <div class="pme-list-icon">${p.icon || '📦'}</div>
            <div class="pme-list-info">
              <div class="pme-list-name">${p.name}</div>
              <div class="pme-list-meta">${p.id} • by ${p.author || 'Unknown'}</div>
              <div class="pme-list-desc">${p.description || ''}</div>
            </div>
            <div class="pme-list-actions">
              ${installed.has(p.id)
                ? `<button class="pme-action-btn installed">✓ Installed</button>`
                : `<button class="pme-action-btn primary" data-install="${p.id}" data-url="${p.url}">Install</button>`
              }
            </div>
          </div>
        `).join('')}</div>
      `;
    }

    bindCommunityActions();
  }

  // ───────── ACTIONS ─────────
  function bindInstalledActions() {
    overlay.querySelectorAll('[data-act="toggle"]').forEach(btn => {
      btn.onclick = async () => {
        await api.togglePlugin(btn.dataset.id);
        renderInstalled();
      };
    });
    overlay.querySelectorAll('[data-act="delete"]').forEach(btn => {
      btn.onclick = async () => {
        if (confirm(`Delete "${btn.dataset.id}"? This can't be undone.`)) {
          await api.deletePlugin(btn.dataset.id);
          renderInstalled();
        }
      };
    });
  }

  function bindCommunityActions() {
    overlay.querySelectorAll('[data-install]').forEach(btn => {
      btn.onclick = async () => {
        const newDef = {
          id: btn.dataset.install,
          url: btn.dataset.url,
          name: btn.dataset.install,
          enabled: true,
          source: 'registry'
        };
        const registry = api.registry.getAll();
        api.registry.save([...registry, newDef]);
        try {
          await api.reloadPlugin(newDef.id);
          api.notify(`✅ Installed ${newDef.id}`, 'success');
        } catch {
          api.notify('Install failed', 'error');
        }
        renderCommunity();
      };
    });
  }

  // ───────── EVENTS ─────────
  overlay.querySelector('#pme-close').onclick = () => overlay.classList.remove('open');

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
    }
  });

  // Ctrl+Shift+P shortcut
  const unregister = api.registerShortcut('ctrl+shift+p', e => {
    e.preventDefault();
    overlay.classList.toggle('open');
    if (overlay.classList.contains('open')) {
      searchQuery = '';
      overlay.querySelector('#pme-search').value = '';
      if (activeTab === 'installed') renderInstalled();
      else renderCommunity();
    }
  });

  // Tabs
  overlay.querySelectorAll('.pme-tab').forEach(tab => {
    tab.onclick = () => {
      activeTab = tab.dataset.tab;
      overlay.querySelectorAll('.pme-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      searchQuery = '';
      overlay.querySelector('#pme-search').value = '';
      overlay.querySelector('#pme-search').placeholder = activeTab === 'installed' ? 'Search installed plugins...' : 'Search community store...';
      if (activeTab === 'installed') renderInstalled();
      else renderCommunity();
    };
  });

  // View toggle
  overlay.querySelectorAll('.pme-view-btn').forEach(btn => {
    btn.onclick = () => {
      saveViewMode(btn.dataset.view);
      overlay.querySelectorAll('.pme-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (activeTab === 'installed') renderInstalled();
      else renderCommunity();
    };
  });

  // Search
  const searchInput = overlay.querySelector('#pme-search');
  searchInput.addEventListener('input', api.debounce(e => {
    if (activeTab === 'installed') {
      searchQuery = e.target.value;
      renderInstalled();
    } else {
      communitySearch = e.target.value;
      renderCommunity();
    }
  }, 200));

  // Install via URL
  overlay.querySelector('#pme-btn-install-url').onclick = () => {
    const modalBg = document.createElement('div');
    modalBg.className = 'pme-modal-bg';
    modalBg.innerHTML = `
      <div class="pme-modal">
        <h3>📦 Install Plugin via URL</h3>
        <input placeholder="Plugin JS URL (e.g. https://raw.githubusercontent.com/...)" id="pme-modal-url">
        <input placeholder="Plugin ID (e.g. my-cool-plugin)" id="pme-modal-id">
        <div class="pme-modal-actions">
          <button class="pme-modal-cancel" id="pme-modal-cancel">Cancel</button>
          <button class="pme-modal-save" id="pme-modal-save">Install</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBg);

    modalBg.querySelector('#pme-modal-cancel').onclick = () => modalBg.remove();
    modalBg.onclick = e => { if (e.target === modalBg) modalBg.remove(); };
    modalBg.querySelector('#pme-modal-save').onclick = async () => {
      const url = modalBg.querySelector('#pme-modal-url').value.trim();
      const id = modalBg.querySelector('#pme-modal-id').value.trim();
      if (!url || !id) return api.notify('Missing fields', 'error');

      const registry = api.registry.getAll();
      api.registry.save([...registry, { id, url, name: id, enabled: true, source: 'manual' }]);
      try {
        await api.reloadPlugin(id);
        api.notify(`✅ Installed ${id}`, 'success');
        modalBg.remove();
        renderInstalled();
      } catch {
        api.notify('Install failed', 'error');
      }
    };
    modalBg.querySelector('#pme-modal-url').focus();
  };

  // Context menu to open
  api.boardEl.addEventListener('contextmenu', e => {
    if (e.target.closest('.pme-overlay') || e.target.closest('.pm-root')) return;
    e.preventDefault();
    overlay.classList.add('open');
    renderInstalled();
  });

  // Sidebar button
  api.registerSidebarItem({
    id: 'pme-open',
    icon: '⚡',
    onClick: () => {
      overlay.classList.add('open');
      if (activeTab === 'installed') renderInstalled();
      else renderCommunity();
    }
  });

  // Toolbar button
  api.registerToolbarButton({
    id: 'pme-toolbar',
    label: '⚡ Plugins',
    onClick: () => {
      overlay.classList.add('open');
      if (activeTab === 'installed') renderInstalled();
      else renderCommunity();
    }
  });

  console.log('⚡ Plugin Manager Pro v1.0.0 loaded — Ctrl+Shift+P to open');
}

export function teardown() {
  if (currentApi) {
    currentApi.removeCSS(meta.id);
    currentApi.removeSidebarItem('pme-open');
    currentApi.removeToolbarButton('pme-toolbar');
  }
  const overlay = document.querySelector('.pme-overlay');
  if (overlay) overlay.remove();
  currentApi = null;
}
