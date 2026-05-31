export const meta = {
  id: 'pm-enhancer',
  name: 'PM Enhancer',
  version: '3.2.1',
  compat: '>=4.0.0',
  coreVersion: '4.1.0',
  icon: '⚡',
  author: 'Dheeraz',
  description: 'A polished Apple-style visual enhancement layer for Plugin Manager.',
  category: 'system',
  trust: 'official',
  permissions: ['ui', 'globalCSS', 'bus'],
  whatsNew: [
    {
      version: '3.2.1',
      title: 'Community install button enhancement',
      text: 'Improved visual feedback for community plugin install buttons.'
    },
    {
      version: '3.1.0',
      title: 'Core v4.1 compatibility',
      text: 'Updated for the latest Blank Board Core and Plugin Manager architecture.'
    },
    {
      version: '3.0.0',
      title: 'Safer visual enhancement',
      text: 'No more toggle injection, button rewriting, or action reordering. The enhancer now improves visuals without fighting Plugin Manager behavior.'
    },
    {
      version: '2.0.0',
      title: 'Animated badge system',
      text: 'Keeps the animated system, active, inactive, new, and update badge experience with cleaner DOM handling.'
    },
    {
      version: '1.0.0',
      title: 'Better cleanup',
      text: 'Teardown now removes enhancer-only overlays, scroll buttons, classes, and styles without leaving broken UI behind.'
    }
  ],
  changelogText: 'v3.2.0 rebuilds PM Enhancer for Core v4.1.0 and Plugin Manager v5.7.x while preserving the best visual features from the original enhancer.'
};

let style = null;
let observer = null;
let scrollListener = null;
let resizeListener = null;
let uiReadyOff = null;
let rafId = null;
let scrollButton = null;
let mounted = false;

const STYLE_ID = 'pm-enhancer-style';
const STYLE_NEXT_ID = 'pm-enhancer-style-new';
const SCROLL_BTN_ID = 'pm-enhancer-scroll-top';

export function setup(api) {
  if (mounted) return;
  mounted = true;

  injectStyle();
  bootEnhancer();

  const rerun = () => requestEnhance();

  if (api?.bus?.on) {
    uiReadyOff = api.bus.on('pm:ui-slots-ready', rerun, meta.id);
  }

  return () => teardown();
}

function injectStyle() {
  const oldStyle = document.querySelector(`#${STYLE_ID}`);
  const staleNextStyle = document.querySelector(`#${STYLE_NEXT_ID}`);
  staleNextStyle?.remove();

  style = document.createElement('style');
  style.id = oldStyle ? STYLE_NEXT_ID : STYLE_ID;

  style.textContent = `
    /* PM Enhancer v3.2 — visual layer only, no Plugin Manager behavior hijacking */

    .pm-root {
      --pme-radius-card: 22px;
      --pme-shadow-card: 0 10px 30px rgba(0,0,0,0.06);
      --pme-muted-pill: rgba(120,120,128,0.16);
      --pme-muted-pill-text: rgba(245,245,247,0.68);
    }

    /* 1. Graceful scrollbar polish */
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
      transition: background 0.2s ease !important;
    }

    .pm-content::-webkit-scrollbar-thumb:hover {
      background: rgba(120,120,128,0.36) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
    }

    /* 2. View text polish */
    .pm-view-title {
      letter-spacing: -0.035em !important;
    }

    .pm-view-subtitle {
      max-width: 520px;
      line-height: 1.45 !important;
    }

    /* 3. Minimal category/filter pills */
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

    /* Community install button visual enhancement */
    .plugin-item[data-community-id] .pm-action-group .pm-btn[data-install] {
      width: 46px !important;
      min-width: 46px !important;
      height: 32px !important;
      padding: 0 !important;
      border-radius: 999px !important;
    }

    .plugin-item[data-community-id] .pm-action-group .pm-btn[data-install] span {
      display: none !important;
    }

    .plugin-item[data-community-id] .pm-action-group .pm-btn[data-install] svg {
      width: 17px !important;
      height: 17px !important;
      stroke-width: 2.35 !important;
    }

    .plugin-item[data-community-id] .pm-action-group .pm-btn[disabled] {
      width: auto !important;
      min-width: 104px !important;
      height: 32px !important;
      padding: 0 18px !important;
      border-radius: 999px !important;
      font-size: 13px !important;
      font-weight: 650 !important;
      opacity: 0.52 !important;
    }

    /* 4. Card polish */
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
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      line-height: 1.38 !important;
    }

    /* 5. Version pill polish — styles Plugin Manager's existing version pill */
    .plugin-name-row > .plugin-badge.badge-disabled {
      height: 19px !important;
      padding: 0 7px !important;
      border-radius: 999px !important;
      background: var(--pme-muted-pill) !important;
      color: var(--pme-muted-pill-text) !important;
      font-size: 10.8px !important;
      font-weight: 700 !important;
      letter-spacing: 0.015em !important;
      text-transform: none !important;
      line-height: 1 !important;
      transform: translateY(-0.5px);
    }

    /* 6. Existing badge polish */
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

    /* 7. Layered icon box */
    .plugin-icon-box {
      position: relative !important;
      overflow: visible !important;
      border-radius: 14px !important;
      box-shadow:
        0 8px 18px rgba(0,0,0,0.12),
        inset 0 1px 0 rgba(255,255,255,0.18) !important;
    }

    .pme-icon-base {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: brightness(0.92);
      transition: filter 0.22s ease, transform 0.22s ease;
    }

    .plugin-item:hover .pme-icon-base {
      filter: brightness(1);
      transform: scale(1.015);
    }

    /* 8. Generated status overlay on icon */
    .pme-status-overlay {
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 50%);
      z-index: 20;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px) saturate(180%);
      -webkit-backdrop-filter: blur(8px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.16);
      box-shadow: 0 4px 10px rgba(0,0,0,0.12);
    }

    .pme-status-overlay svg {
      width: 11px;
      height: 11px;
      stroke-width: 2.45;
    }

    .pme-status-active {
      background: rgba(52,199,89,0.18);
      color: #34c759;
    }

    .pme-status-active::after {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #34c759;
      animation: pme-breathe 2.4s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(52,199,89,0.65);
    }

    .pme-status-inactive {
      background: rgba(255,59,48,0.18);
      color: #ff453a;
    }

    .pme-status-system {
      width: 22px;
      height: 22px;
      background: linear-gradient(135deg, rgba(94,92,230,0.25), rgba(10,132,255,0.20));
      color: #a9a7ff;
      box-shadow:
        0 4px 12px rgba(94,92,230,0.16),
        inset 0 1px 0 rgba(255,255,255,0.12);
    }

    .pme-status-system svg {
      width: 13px;
      height: 13px;
      animation: pme-system-spin 4.2s linear infinite;
    }

    /* 9. New badge on icon */
    .pme-new-badge {
      position: absolute;
      top: -9px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 22;
      height: 19px;
      min-width: 42px;
      padding: 0 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: #fff;
      font-size: 9.8px;
      font-weight: 760;
      line-height: 1;
      letter-spacing: 0.075em;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-shadow: 0 1px 2px rgba(0,0,0,0.22);
      box-shadow: 0 4px 12px rgba(255,149,0,0.22);
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(30,30,30,0.82);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
    }

    .pme-new-badge::before {
      content: "";
      position: absolute;
      inset: -120%;
      background: conic-gradient(
        transparent,
        transparent,
        rgba(255,255,255,0.78),
        transparent,
        transparent
      );
      animation: pme-glint 3.5s linear infinite;
      opacity: 0.7;
      z-index: -2;
    }

    .pme-new-badge::after {
      content: "";
      position: absolute;
      inset: 1px;
      border-radius: inherit;
      background:
        linear-gradient(135deg, rgba(255,149,0,0.92), rgba(255,107,53,0.88));
      z-index: -1;
    }

    /* 10. Update overlay */
    .pme-update-overlay {
      position: absolute;
      top: -5px;
      right: -5px;
      z-index: 21;
      width: 19px;
      height: 19px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.25);
      color: #fff;
      backdrop-filter: blur(8px) saturate(180%);
      -webkit-backdrop-filter: blur(8px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.44);
      box-shadow: 0 4px 12px rgba(0,0,0,0.16);
    }

    .pme-update-overlay svg {
      width: 11px;
      height: 11px;
      stroke-width: 2.8;
    }

    /* Hide text badges only when icon overlays exist */
    .plugin-item.pme-has-status-overlay .pm-badge-row .badge-enabled,
    .plugin-item.pme-has-status-overlay .pm-badge-row .badge-disabled,
    .plugin-item.pme-has-status-overlay .pm-badge-row .badge-system {
      display: none !important;
    }

    .plugin-item.pme-has-update-overlay .pm-badge-row .badge-update {
      display: none !important;
    }

    .plugin-item.pme-has-new-overlay .pm-badge-row .badge-new {
      display: none !important;
    }

    /* 11. Content-centered scroll-to-top */
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
      width: 24px;
      height: 24px;
      stroke-width: 2.5;
    }

    /* Light mode */
    @media (prefers-color-scheme: light) {
      .pm-root {
        --pme-muted-pill: rgba(60,60,67,0.10);
        --pme-muted-pill-text: rgba(60,60,67,0.66);
      }

      .perm-badge,
      .trust-badge {
        background: rgba(60,60,67,0.08) !important;
        color: rgba(60,60,67,0.70) !important;
      }

      .perm-badge.risky,
      .badge-risk {
        background: rgba(255,149,0,0.14) !important;
        color: #b76e00 !important;
      }

      .pme-status-system {
        background: linear-gradient(135deg, rgba(88,86,214,0.15), rgba(0,122,255,0.12));
        color: #5856d6;
      }

      .pme-update-overlay {
        background: rgba(255,255,255,0.72);
        color: #007aff;
        border-color: rgba(0,0,0,0.08);
      }

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

    /* Dark mode refinements */
    @media (prefers-color-scheme: dark) {
      .pm-content::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.18) !important;
      }

      .pm-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.30) !important;
      }

      .pme-update-overlay {
        background: rgba(0,0,0,0.50);
        color: #0a84ff;
        border-color: rgba(255,255,255,0.15);
      }
    }

    @keyframes pme-breathe {
      0%, 100% {
        transform: scale(0.88);
        opacity: 0.62;
        box-shadow: 0 0 4px rgba(52,199,89,0.45);
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
        box-shadow: 0 0 10px rgba(52,199,89,0.9);
      }
    }

    @keyframes pme-system-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pme-glint {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .pm-scroll-top,
      .plugin-item,
      .pm-filter-btn,
      .pme-status-active::after,
      .pme-status-system svg,
      .pme-new-badge::before {
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);

  if (oldStyle) {
    window.setTimeout(() => {
      oldStyle.remove();
      if (style) style.id = STYLE_ID;
    }, 80);
  }
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
          node.matches?.('.plugin-item, .pm-filter-btn, .pm-list, #installed, #community') ||
          node.querySelector?.('.plugin-item, .pm-filter-btn')
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
}

function enhancePluginCard(card) {
  if (!(card instanceof HTMLElement)) return;

  card.dataset.pmEnhanced = 'true';

  enhanceVersionPill(card);
  enhanceDescription(card);
  enhanceIconBox(card);
  enhanceBadges(card);
  enhanceCommunityInstallButton(card);
}

function enhanceVersionPill(card) {
  const versionPill = card.querySelector('.plugin-name-row > .plugin-badge.badge-disabled');
  if (!(versionPill instanceof HTMLElement)) return;

  versionPill.dataset.pmEnhancedVersion = 'true';

  const raw = versionPill.textContent.trim();

  if (raw && !raw.toLowerCase().startsWith('v') && /\d/.test(raw)) {
    versionPill.textContent = `v${raw}`;
  }
}

function enhanceDescription(card) {
  const desc = card.querySelector('.plugin-desc');
  if (!(desc instanceof HTMLElement)) return;

  const text = desc.textContent.trim();
  if (text) desc.title = text;
}

function enhanceIconBox(card) {
  const iconBox = card.querySelector('.plugin-icon-box');
  if (!(iconBox instanceof HTMLElement)) return;

  if (!iconBox.dataset.pmeWrapped) {
    const originalNodes = Array.from(iconBox.childNodes);

    const base = document.createElement('div');
    base.className = 'pme-icon-base';
    base.dataset.pluginOwner = meta.id;
    base.dataset.pluginId = meta.id;

    originalNodes.forEach((node) => {
      base.appendChild(node);
    });

    iconBox.appendChild(base);
    iconBox.dataset.pmeWrapped = 'true';
  }
}

function enhanceBadges(card) {
  const iconBox = card.querySelector('.plugin-icon-box');
  if (!(iconBox instanceof HTMLElement)) return;

  const badgeTexts = Array
    .from(card.querySelectorAll('.pm-badge-row .plugin-badge'))
    .map((badge) => String(badge.textContent || '').trim().toLowerCase());

  const hasSystem = badgeTexts.includes('system');
  const hasActive = badgeTexts.includes('active');
  const hasInactive = badgeTexts.includes('inactive');
  const hasNew = badgeTexts.includes('new');
  const hasUpdate = badgeTexts.some(text => text.includes('update'));

  removeEnhancerOverlays(iconBox);

  if (hasSystem) {
    iconBox.appendChild(createStatusOverlay('system'));
    card.classList.add('pme-has-status-overlay');
  } else if (hasActive) {
    iconBox.appendChild(createStatusOverlay('active'));
    card.classList.add('pme-has-status-overlay');
  } else if (hasInactive) {
    iconBox.appendChild(createStatusOverlay('inactive'));
    card.classList.add('pme-has-status-overlay');
  } else {
    card.classList.remove('pme-has-status-overlay');
  }

  if (hasNew) {
    iconBox.appendChild(createNewBadge());
    card.classList.add('pme-has-new-overlay');
  } else {
    card.classList.remove('pme-has-new-overlay');
  }

  if (hasUpdate || card.querySelector('[data-update]')) {
    iconBox.appendChild(createUpdateOverlay());
    card.classList.add('pme-has-update-overlay');
  } else {
    card.classList.remove('pme-has-update-overlay');
  }

  Array.from(card.querySelectorAll('.plugin-badge, .perm-badge, .trust-badge')).forEach((badge) => {
    if (!(badge instanceof HTMLElement)) return;
    const text = badge.textContent.trim();
    if (text.length > 18) badge.title = text;
  });
}

function enhanceCommunityInstallButton(card) {
  if (!(card instanceof HTMLElement)) return;
  if (!card.matches('[data-community-id]')) return;

  const installBtn = card.querySelector('.pm-action-group .pm-btn[data-install]');
  if (installBtn instanceof HTMLElement && !installBtn.dataset.pmeInstallIconified) {
    installBtn.dataset.pmeInstallIconified = 'true';
    installBtn.title = 'Install plugin';
    installBtn.setAttribute('aria-label', 'Install plugin');

    installBtn.innerHTML = `
      <span>Install</span>
      ${iconInstallDownload()}
    `;
  }

  const installedBtn = Array
    .from(card.querySelectorAll('.pm-action-group .pm-btn[disabled]'))
    .find(btn => btn.textContent.trim().toLowerCase() === 'installed');

  if (installedBtn instanceof HTMLElement) {
    installedBtn.dataset.pmeInstalledText = 'true';
    installedBtn.textContent = 'Installed';
  }
}

function removeEnhancerOverlays(iconBox) {
  iconBox
    .querySelectorAll('.pme-status-overlay, .pme-new-badge, .pme-update-overlay')
    .forEach(node => node.remove());
}

function createStatusOverlay(type) {
  const overlay = document.createElement('div');
  overlay.className = `pme-status-overlay pme-status-${type}`;
  overlay.dataset.pluginOwner = meta.id;
  overlay.dataset.pluginId = meta.id;

  if (type === 'system') {
    overlay.title = 'System Plugin';
    overlay.innerHTML = iconSystemGear();
  } else if (type === 'inactive') {
    overlay.title = 'Inactive';
    overlay.innerHTML = iconMinus();
  } else {
    overlay.title = 'Active';
  }

  return overlay;
}

function createNewBadge() {
  const badge = document.createElement('div');
  badge.className = 'pme-new-badge';
  badge.dataset.pluginOwner = meta.id;
  badge.dataset.pluginId = meta.id;
  badge.textContent = 'New';
  return badge;
}

function createUpdateOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pme-update-overlay';
  overlay.title = 'Update Available';
  overlay.dataset.pluginOwner = meta.id;
  overlay.dataset.pluginId = meta.id;
  overlay.innerHTML = iconDownloadArrow();
  return overlay;
}

function enhanceFilterButton(button) {
  if (!(button instanceof HTMLElement)) return;
  if (button.dataset.pmEnhancedFilter) return;

  button.dataset.pmEnhancedFilter = 'true';

  const text = button.textContent.trim();
  if (text) button.setAttribute('aria-label', `${text} plugins`);
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

    scrollButton.innerHTML = iconChevronUp();

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

  document.querySelectorAll('.pme-status-overlay, .pme-new-badge, .pme-update-overlay').forEach((node) => {
    try {
      node.remove();
    } catch {}
  });

  document.querySelectorAll('.plugin-icon-box[data-pme-wrapped="true"]').forEach((iconBox) => {
    const base = iconBox.querySelector(':scope > .pme-icon-base');

    if (base) {
      while (base.firstChild) {
        iconBox.insertBefore(base.firstChild, base);
      }

      base.remove();
    }

    delete iconBox.dataset.pmeWrapped;
  });

  document.querySelectorAll('.plugin-item').forEach((card) => {
    card.classList.remove('pme-has-status-overlay', 'pme-has-new-overlay', 'pme-has-update-overlay');
    delete card.dataset.pmEnhanced;
  });

  document.querySelectorAll('[data-pm-enhanced-filter], [data-pm-enhanced-version]').forEach((el) => {
    delete el.dataset.pmEnhancedFilter;
    delete el.dataset.pmEnhancedVersion;
  });

  if (style) {
    try {
      style.remove();
    } catch {}
    style = null;
  }

  const nextStyle = document.querySelector(`#${STYLE_NEXT_ID}`);
  if (nextStyle) nextStyle.remove();
}

function iconSystemGear() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.93l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.2-1.17.53-1.69.93l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.93l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.2 1.17-.53 1.69-.93l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"></path>
    </svg>
  `;
}

function iconMinus() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round">
      <path d="M6 12h12"></path>
    </svg>
  `;
}

function iconDownloadArrow() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v12"></path>
      <path d="m7 11 5 5 5-5"></path>
    </svg>
  `;
}

function iconChevronUp() {
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6"></path>
    </svg>
  `;
}

function iconInstallDownload() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v12"></path>
      <path d="m7 10 5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  `;
}