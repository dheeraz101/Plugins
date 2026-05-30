export const meta = {
  id: 'pm-enhancer',
  name: 'PM Enhancer',
  version: '3.1.0',
  compat: '>=4.0.0',
  coreVersion: '4.1.0',
  icon: '⚡',
  author: 'Dheeraz',
  description: 'A refined visual polish layer for Plugin Manager.',
  category: 'system',
  trust: 'official',
  permissions: ['ui', 'globalCSS', 'bus'],
  whatsNew: [
    {
      version: '3.1.0',
      title: 'Animated section badges',
      text: 'Adds refined animated System and Standard Extension badges while preserving Plugin Manager behavior.'
    },
    {
      version: '3.0.0',
      title: 'No more button hijacking',
      text: 'The enhancer no longer rewrites toggles, reload buttons, install buttons, or delete buttons.'
    },
    {
      version: '3.0.0',
      title: 'Cleaner visual polish',
      text: 'Improved version pills, filter categories, card spacing, scroll-to-top positioning, and subtle Apple-style details.'
    }
  ],
  changelogText: 'v3.1.0 adds animated System and Standard section badges while staying compatible with Plugin Manager v5.7.x and Core v4.1.0.'
};

let style = null;
let observer = null;
let scrollListener = null;
let resizeListener = null;
let uiReadyOff = null;
let rafId = null;
let scrollButton = null;
let mounted = false;

const STYLE_ID = 'pm-enhancer-v31-style';
const SCROLL_BTN_ID = 'pm-enhancer-scroll-top';

export function setup(api) {
  if (mounted) return;
  mounted = true;

  injectStyle();
  bootEnhancer();

  const rerun = () => {
    requestEnhance();
  };

  if (api?.bus?.on) {
    uiReadyOff = api.bus.on('pm:ui-slots-ready', rerun, meta.id);
  }

  return () => teardown();
}

function injectStyle() {
  document.querySelector(`#${STYLE_ID}`)?.remove();

  style = document.createElement('style');
  style.id = STYLE_ID;

  style.textContent = `
    /* PM Enhancer v3.1: visual polish only. No PM behavior hijacking. */

    .pm-root {
      --pme-radius-card: 22px;
      --pme-border-soft: rgba(255,255,255,0.12);
      --pme-shadow-card: 0 10px 30px rgba(0,0,0,0.06);
    }

    .pm-content {
      padding-top: 34px !important;
      padding-bottom: 34px !important;
      scroll-behavior: smooth;
    }

    .pm-content::-webkit-scrollbar {
      width: 8px !important;
    }

    .pm-content::-webkit-scrollbar-track {
      background: transparent !important;
      margin-top: 12px !important;
      margin-bottom: 12px !important;
    }

    .pm-content::-webkit-scrollbar-thumb {
      background: rgba(120,120,128,0.22) !important;
      border-radius: 999px !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
      min-height: 44px !important;
    }

    .pm-content::-webkit-scrollbar-thumb:hover {
      background: rgba(120,120,128,0.36) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
    }

    .pm-view-title {
      letter-spacing: -0.035em !important;
    }

    .pm-view-subtitle {
      max-width: 520px;
      line-height: 1.45 !important;
    }

    /* Minimal category/filter pills */
    .pm-filter-bar {
      gap: 7px !important;
      padding: 3px !important;
      border-radius: 999px !important;
      background: rgba(120,120,128,0.08) !important;
      width: fit-content !important;
      max-width: 100% !important;
    }

    .pm-filter-btn {
      height: 27px !important;
      padding: 0 12px !important;
      border-radius: 999px !important;
      font-size: 12px !important;
      font-weight: 650 !important;
      letter-spacing: -0.01em !important;
      background: transparent !important;
      color: var(--pm-muted) !important;
      transition:
        background 0.18s ease,
        color 0.18s ease,
        transform 0.15s ease,
        box-shadow 0.18s ease !important;
    }

    .pm-filter-btn:hover {
      background: rgba(120,120,128,0.12) !important;
      color: var(--pm-text) !important;
    }

    .pm-filter-btn.active {
      background: rgba(0,113,227,0.92) !important;
      color: #fff !important;
      box-shadow: 0 4px 12px rgba(0,113,227,0.22) !important;
    }

    .pm-filter-btn:active {
      transform: scale(0.97);
    }

    /* Plugin cards */
    .plugin-item {
      border-radius: var(--pme-radius-card) !important;
      padding: 17px 20px !important;
      min-height: 82px !important;
      border-color: rgba(128,128,128,0.16) !important;
      box-shadow: none !important;
      transition:
        transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
        background 0.18s ease,
        border-color 0.18s ease,
        box-shadow 0.18s ease !important;
    }

    .plugin-item:hover {
      transform: translateY(-1px) !important;
      box-shadow: var(--pme-shadow-card) !important;
      border-color: rgba(128,128,128,0.24) !important;
    }

    .plugin-name-row {
      gap: 8px !important;
      align-items: center !important;
    }

    .plugin-name {
      font-size: 16px !important;
      font-weight: 700 !important;
      letter-spacing: -0.018em !important;
    }

    .plugin-meta {
      margin-top: 3px !important;
      font-size: 12.8px !important;
      letter-spacing: -0.005em !important;
    }

    .plugin-desc {
      max-width: 460px !important;
    }

    /* Better version pill. PM uses .badge-disabled for version inside .plugin-name-row. */
    .plugin-name-row > .plugin-badge.badge-disabled {
      height: 19px !important;
      padding: 0 7px !important;
      border-radius: 999px !important;
      background: rgba(120,120,128,0.16) !important;
      color: rgba(245,245,247,0.68) !important;
      font-size: 10.8px !important;
      font-weight: 700 !important;
      letter-spacing: 0.015em !important;
      text-transform: none !important;
      line-height: 1 !important;
      transform: translateY(-0.5px);
    }

    @media (prefers-color-scheme: light) {
      .plugin-name-row > .plugin-badge.badge-disabled {
        color: rgba(60,60,67,0.66) !important;
        background: rgba(60,60,67,0.10) !important;
      }
    }

    /* Badges: less shouty, more Apple-like */
    .pm-badge-row {
      gap: 5px !important;
      margin-top: 7px !important;
    }

    .plugin-badge,
    .perm-badge,
    .trust-badge {
      min-height: 18px !important;
      padding: 0 7px !important;
      font-size: 10.6px !important;
      font-weight: 700 !important;
      letter-spacing: 0.01em !important;
      border-radius: 999px !important;
      text-transform: none !important;
      line-height: 18px !important;
    }

    .badge-enabled {
      background: rgba(52,199,89,0.16) !important;
      color: #30d158 !important;
    }

    .badge-disabled {
      background: rgba(142,142,147,0.18) !important;
      color: #a1a1a6 !important;
    }

    .badge-system {
      background: rgba(94,92,230,0.18) !important;
      color: #b2b0ff !important;
    }

    .perm-badge {
      background: rgba(142,142,147,0.14) !important;
      color: rgba(245,245,247,0.68) !important;
    }

    .perm-badge.risky,
    .badge-risk {
      background: rgba(255,159,10,0.16) !important;
      color: #ffd08a !important;
    }

    .trust-badge {
      background: rgba(142,142,147,0.14) !important;
      color: rgba(245,245,247,0.72) !important;
    }

    @media (prefers-color-scheme: light) {
      .perm-badge,
      .trust-badge {
        background: rgba(60,60,67,0.08) !important;
        color: rgba(60,60,67,0.70) !important;
      }

      .badge-system {
        background: rgba(88,86,214,0.13) !important;
        color: #5856d6 !important;
      }

      .badge-enabled {
        background: rgba(52,199,89,0.13) !important;
        color: #248a3d !important;
      }

      .badge-disabled {
        background: rgba(142,142,147,0.13) !important;
        color: #6e6e73 !important;
      }

      .perm-badge.risky,
      .badge-risk {
        background: rgba(255,149,0,0.14) !important;
        color: #b76e00 !important;
      }
    }

    /* Icons */
    .plugin-icon-box {
      border-radius: 14px !important;
      box-shadow:
        0 8px 18px rgba(0,0,0,0.12),
        inset 0 1px 0 rgba(255,255,255,0.18) !important;
    }

    .pm-icon-btn,
    .pm-toggle,
    .pm-btn {
      -webkit-tap-highlight-color: transparent;
    }

    /* Animated System / Standard section badges */
    .pme-section-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      width: fit-content;
      margin: 18px auto 20px auto;
      padding: 7px 13px;
      border-radius: 999px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 750;
      letter-spacing: 0.075em;
      text-transform: uppercase;
      color: rgba(245,245,247,0.78);
      background: rgba(120,120,128,0.12);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.10),
        0 6px 18px rgba(0,0,0,0.10);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      position: relative;
      overflow: hidden;
      user-select: none;
    }

    .pme-section-badge::before {
      content: "";
      position: absolute;
      inset: -120%;
      background:
        conic-gradient(
          from 0deg,
          transparent 0deg,
          transparent 80deg,
          rgba(255,255,255,0.46) 110deg,
          transparent 145deg,
          transparent 360deg
        );
      animation: pme-badge-glint 5.5s linear infinite;
      opacity: 0.55;
      pointer-events: none;
    }

    .pme-section-badge::after {
      content: "";
      position: absolute;
      inset: 1px;
      border-radius: inherit;
      background: rgba(28,28,30,0.72);
      z-index: 0;
    }

    .pme-section-badge > * {
      position: relative;
      z-index: 1;
    }

    .pme-section-badge-icon {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 18px;
    }

    .pme-section-badge-icon svg {
      width: 12.5px;
      height: 12.5px;
      stroke-width: 2.35;
    }

    .pme-section-system {
      color: #b9b8ff;
      background: rgba(94,92,230,0.12);
      border-color: rgba(94,92,230,0.22);
    }

    .pme-section-system .pme-section-badge-icon {
      background: rgba(94,92,230,0.18);
      color: #b9b8ff;
      box-shadow: 0 0 0 3px rgba(94,92,230,0.08);
    }

    .pme-section-system .pme-section-badge-icon svg {
      animation: pme-system-orbit 4.8s linear infinite;
    }

    .pme-section-standard {
      color: #c7c7cc;
      background: rgba(142,142,147,0.10);
      border-color: rgba(142,142,147,0.18);
    }

    .pme-section-standard .pme-section-badge-icon {
      background: rgba(142,142,147,0.16);
      color: #c7c7cc;
      box-shadow: 0 0 0 3px rgba(142,142,147,0.07);
    }

    .pme-section-standard .pme-section-badge-icon svg {
      animation: pme-standard-float 2.8s ease-in-out infinite;
    }

    .pme-section-badge-text {
      line-height: 1;
      white-space: nowrap;
    }

    @media (prefers-color-scheme: light) {
      .pme-section-badge {
        color: rgba(60,60,67,0.76);
        background: rgba(255,255,255,0.72);
        border-color: rgba(60,60,67,0.10);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.65),
          0 6px 16px rgba(0,0,0,0.06);
      }

      .pme-section-badge::after {
        background: rgba(255,255,255,0.78);
      }

      .pme-section-system {
        color: #5856d6;
        border-color: rgba(88,86,214,0.20);
      }

      .pme-section-system .pme-section-badge-icon {
        background: rgba(88,86,214,0.12);
        color: #5856d6;
      }

      .pme-section-standard {
        color: #6e6e73;
        border-color: rgba(60,60,67,0.12);
      }

      .pme-section-standard .pme-section-badge-icon {
        background: rgba(60,60,67,0.08);
        color: #6e6e73;
      }
    }

    @keyframes pme-badge-glint {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pme-system-orbit {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pme-standard-float {
      0%, 100% { transform: translateY(0); opacity: 0.82; }
      50% { transform: translateY(-1px); opacity: 1; }
    }

    /* Content-centered scroll-to-top button */
    .pm-scroll-top {
      position: fixed;
      left: var(--pme-scroll-x, 50%);
      bottom: var(--pme-scroll-bottom, 48px);
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(44,44,46,0.78);
      color: #f5f5f7;
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      box-shadow:
        0 12px 34px rgba(0,0,0,0.30),
        inset 0 1px 0 rgba(255,255,255,0.10);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      z-index: 2147483640;
      transform: translate(-50%, 18px) scale(0.94);
      transition:
        opacity 0.22s ease,
        transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
        background 0.18s ease,
        color 0.18s ease;
    }

    .pm-scroll-top.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
    }

    .pm-scroll-top:hover {
      background: rgba(58,58,60,0.92);
      color: #0a84ff;
      transform: translate(-50%, -2px) scale(1.02);
    }

    .pm-scroll-top svg {
      width: 19px;
      height: 19px;
      stroke-width: 2.35;
    }

    @media (prefers-color-scheme: light) {
      .pm-scroll-top {
        background: rgba(255,255,255,0.78);
        color: #1d1d1f;
        border-color: rgba(0,0,0,0.10);
        box-shadow:
          0 10px 28px rgba(0,0,0,0.13),
          inset 0 1px 0 rgba(255,255,255,0.55);
      }

      .pm-scroll-top:hover {
        background: rgba(255,255,255,0.96);
        color: #0071e3;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .pm-scroll-top,
      .plugin-item,
      .pm-filter-btn,
      .pme-section-badge::before,
      .pme-section-badge-icon svg {
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function bootEnhancer() {
  const start = () => {
    const root = document.querySelector('.pm-root');
    const content = document.querySelector('.pm-root .pm-content');

    if (!root || !content) {
      window.setTimeout(start, 250);
      return;
    }

    ensureScrollButton(root, content);
    enhanceAll(root);
    watch(root);

    resizeListener = () => updateScrollButtonPosition(content);
    window.addEventListener('resize', resizeListener, { passive: true });
    updateScrollButtonPosition(content);
  };

  start();
}

function requestEnhance() {
  if (rafId) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    rafId = null;

    const root = document.querySelector('.pm-root');
    const content = document.querySelector('.pm-root .pm-content');

    if (!root || !content) return;

    enhanceAll(root);
    ensureScrollButton(root, content);
    updateScrollButtonPosition(content);
  });
}

function watch(root) {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    let shouldRun = false;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        if (
          node.matches?.('.plugin-item, .pm-filter-btn, .pm-list, .pm-divider, #installed, #community') ||
          node.querySelector?.('.plugin-item, .pm-filter-btn, .pm-divider')
        ) {
          shouldRun = true;
          break;
        }
      }

      if (shouldRun) break;
    }

    if (shouldRun) requestEnhance();
  });

  observer.observe(root, {
    childList: true,
    subtree: true
  });
}

function enhanceAll(root) {
  root.querySelectorAll('.plugin-item').forEach(enhancePluginCard);
  root.querySelectorAll('.pm-filter-btn').forEach(enhanceFilterButton);
  enhanceSectionBadges(root);
}

function enhancePluginCard(card) {
  if (!(card instanceof HTMLElement)) return;

  card.dataset.pmEnhanced = 'true';

  const versionPill = card.querySelector('.plugin-name-row > .plugin-badge.badge-disabled');

  if (versionPill && !versionPill.dataset.pmEnhancedVersion) {
    versionPill.dataset.pmEnhancedVersion = 'true';

    const raw = versionPill.textContent.trim();

    if (raw && !raw.startsWith('v')) {
      versionPill.textContent = `v${raw}`;
    }
  }

  const badges = card.querySelectorAll('.plugin-badge, .perm-badge, .trust-badge');

  badges.forEach((badge) => {
    if (!(badge instanceof HTMLElement)) return;

    const text = badge.textContent.trim();

    if (text.length > 18) {
      badge.title = text;
    }
  });
}

function enhanceFilterButton(button) {
  if (!(button instanceof HTMLElement)) return;
  if (button.dataset.pmEnhancedFilter) return;

  button.dataset.pmEnhancedFilter = 'true';

  const text = button.textContent.trim();

  if (text) {
    button.setAttribute('aria-label', `${text} plugins`);
  }
}

function enhanceSectionBadges(root) {
  const installedList = root.querySelector('#installed .pm-list');
  if (!installedList) return;

  const systemRows = [];
  const standardRows = [];

  installedList.querySelectorAll('.plugin-item[data-plugin-id]').forEach((card) => {
    const isSystem =
      card.querySelector('.badge-system') ||
      card.dataset.pluginId === 'plugin-manager' ||
      card.dataset.pluginId === 'pm-enhancer' ||
      card.dataset.pluginId === 'logger' ||
      card.dataset.pluginId === 'rollback-manager';

    if (isSystem) systemRows.push(card);
    else standardRows.push(card);
  });

  // Remove Plugin Manager's default divider, then replace with enhanced divider.
  installedList.querySelectorAll('.pm-divider').forEach((divider) => {
    if (!divider.classList.contains('pme-managed-divider')) {
      divider.remove();
    }
  });

  installedList.querySelectorAll('.pme-section-badge').forEach((badge) => badge.remove());

  if (systemRows.length) {
    const systemBadge = createSectionBadge('system', `System Plugins`);
    installedList.insertBefore(systemBadge, systemRows[0]);
  }

  if (standardRows.length) {
    const standardBadge = createSectionBadge('standard', `Standard Extensions`);
    installedList.insertBefore(standardBadge, standardRows[0]);
  }
}

function createSectionBadge(type, label) {
  const badge = document.createElement('div');
  badge.className = `pme-section-badge pme-section-${type} pme-managed-divider`;
  badge.dataset.pluginOwner = meta.id;
  badge.dataset.pluginId = meta.id;

  badge.innerHTML = `
    <span class="pme-section-badge-icon">
      ${type === 'system' ? iconSystem() : iconStandard()}
    </span>
    <span class="pme-section-badge-text">${escapeHTML(label)}</span>
  `;

  return badge;
}

function ensureScrollButton(root, content) {
  if (scrollButton?.isConnected) return;

  scrollButton = document.querySelector(`#${SCROLL_BTN_ID}`);

  if (!scrollButton) {
    scrollButton = document.createElement('button');
    scrollButton.id = SCROLL_BTN_ID;
    scrollButton.className = 'pm-scroll-top';
    scrollButton.type = 'button';
    scrollButton.title = 'Scroll to top';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    scrollButton.dataset.pluginOwner = meta.id;
    scrollButton.dataset.pluginId = meta.id;

    scrollButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5"></path>
        <path d="M6 11l6-6 6 6"></path>
      </svg>
    `;

    scrollButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      content.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  root.appendChild(scrollButton);

  if (scrollListener) {
    content.removeEventListener('scroll', scrollListener);
  }

  scrollListener = () => {
    scrollButton.classList.toggle('visible', content.scrollTop > 180);
    updateScrollButtonPosition(content);
  };

  content.addEventListener('scroll', scrollListener, { passive: true });
  updateScrollButtonPosition(content);
}

function updateScrollButtonPosition(content) {
  if (!scrollButton || !content) return;

  const rect = content.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;

  scrollButton.style.setProperty('--pme-scroll-x', `${centerX}px`);
  scrollButton.style.setProperty('--pme-scroll-bottom', `${Math.max(36, window.innerHeight - rect.bottom + 34)}px`);
}

export function teardown() {
  mounted = false;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (uiReadyOff) {
    try {
      uiReadyOff();
    } catch {}
    uiReadyOff = null;
  }

  const content = document.querySelector('.pm-root .pm-content');

  if (content && scrollListener) {
    content.removeEventListener('scroll', scrollListener);
  }

  scrollListener = null;

  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
    resizeListener = null;
  }

  if (scrollButton) {
    try {
      scrollButton.remove();
    } catch {}
    scrollButton = null;
  }

  document.querySelectorAll('.pme-section-badge').forEach((el) => {
    try {
      el.remove();
    } catch {}
  });

  if (style) {
    try {
      style.remove();
    } catch {}
    style = null;
  }

  document.querySelectorAll('[data-pm-enhanced], [data-pm-enhanced-filter], [data-pm-enhanced-version]').forEach((el) => {
    delete el.dataset.pmEnhanced;
    delete el.dataset.pmEnhancedFilter;
    delete el.dataset.pmEnhancedVersion;
  });
}

function iconSystem() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v3"></path>
      <path d="M12 18v3"></path>
      <path d="M3 12h3"></path>
      <path d="M18 12h3"></path>
      <path d="m5.6 5.6 2.1 2.1"></path>
      <path d="m16.3 16.3 2.1 2.1"></path>
      <path d="m18.4 5.6-2.1 2.1"></path>
      <path d="m7.7 16.3-2.1 2.1"></path>
      <circle cx="12" cy="12" r="3.2"></circle>
    </svg>
  `;
}

function iconStandard() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="5" width="6" height="6" rx="1.6"></rect>
      <rect x="13" y="5" width="6" height="6" rx="1.6"></rect>
      <rect x="5" y="13" width="6" height="6" rx="1.6"></rect>
      <rect x="13" y="13" width="6" height="6" rx="1.6"></rect>
    </svg>
  `;
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}