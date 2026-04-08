export const meta = {
  id: 'pm-enhancer',
  name: 'PM Enhancer',
  version: '2.1.2',
  compat: '>=3.3.0'
};

let style = null;
let observer = null;
let scrollListener = null;
let isInitialized = false;

export function setup(api) {
  if (isInitialized) return;
  isInitialized = true;

  // ───────────────── STYLE INJECTION ─────────────────
  if (!document.querySelector('#pm-enhancer-style')) {
    style = document.createElement('style');
    style.id = 'pm-enhancer-style';

    style.textContent = `
    .pm-action-group .toggle-btn {
      display: none !important;
    }

    .pm-action-group .reload-btn:disabled {
      pointer-events: none !important;
      opacity: 0.4 !important;
      cursor: default !important;
    }

    .pm-action-group {
      min-width: 120px; 
      display: flex;
      align-items: center;
      justify-content: flex-end;
      position: relative;
    }

    /* 1. Custom Aesthetic Scrollbar (Light & Dark) with padding from edges */
    .pm-content { 
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }
    .pm-content::-webkit-scrollbar { 
      width: 6px; 
    }
    .pm-content::-webkit-scrollbar-track { 
      background: transparent; 
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .pm-content::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      transition: background 0.2s;
      min-height: 40px;
    }
    .pm-content::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }

    /* System Badge - Animated Spinning Icon */
    .status-system-wrapper {
      width: 22px !important;
      height: 22px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(88, 86, 214, 0.2) 0%, rgba(0, 122, 255, 0.2) 100%) !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-system-wrapper svg {
      width: 13px !important;
      height: 13px !important;
    }
    
    @keyframes system-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .system-icon-running {
      animation: system-spin 3s linear infinite;
    }

    /* 2. Version Pill Styling */
    .apple-version-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: rgba(120, 120, 128, 0.12);
      color: #86868b;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-left: 10px;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* 3. Layout Adjustments for Info & Alignment */
    .plugin-item {
      display: flex !important;
      align-items: center !important;
      padding: 14px 16px !important;
      border-bottom: 1px solid rgba(0,0,0,0.05) !important;
    }
    
    .plugin-info h4 {
      display: flex;
      align-items: center;
      margin: 0 0 4px 0 !important;
    }

    /* 4. Modern Apple Toggle Switch */
    .apple-switch {
      position: relative;
      display: inline-flex;
      width: 42px;
      height: 24px;
      cursor: pointer;
      margin: 0 10px;
      flex-shrink: 0;
    }
    .apple-switch input { opacity: 0; width: 0; height: 0; }
    .apple-slider {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(120, 120, 128, 0.32);
      transition: .25s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 34px;
    }
    .apple-slider:before {
      position: absolute;
      content: "";
      height: 20px; width: 20px;
      left: 2px; bottom: 2px;
      background-color: white;
      transition: .25s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
      box-shadow: 0 3px 8px rgba(0,0,0,0.12);
    }
    input:checked + .apple-slider { background-color: #34C759; }
    input:checked + .apple-slider:before { transform: translateX(18px); }

    /* 5. Action Icons (Reload, Delete, Update, Rollback) */
    .apple-icon-btn {
      opacity: 1 !important;
      pointer-events: auto !important;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      color: #86868b;
      flex-shrink: 0;
    }
    .apple-icon-btn:hover { background: rgba(0,0,0,0.05); color: #1d1d1f; }
    .apple-icon-btn:active { transform: scale(0.9); }
    .apple-icon-btn.delete-icon:hover { color: #FF3B30; background: rgba(255, 59, 48, 0.1); }
    .apple-icon-btn.rollback-btn { color: #d97706; }
    .apple-icon-btn.rollback-btn:hover { color: #b45309; background: rgba(255, 149, 0, 0.15); }

    /* 6. Floating Scroll Button */
    .pm-scroll-top {
      position: fixed;
      bottom: 40px; 
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.1);
      width: 42px; height: 42px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0; 
      z-index: 9999;
      color: #1d1d1f;
      pointer-events: none;
    }

    .pm-scroll-top.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .pm-scroll-top:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      color: #007AFF;
      transform: translateX(-50%) translateY(-2px);
    }

    /* 7. Layered Icon Box & Status Badges */
    .plugin-icon-box {
      position: relative;
      overflow: visible !important;
    }
    
    .icon-base-dimmed {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.95;
      filter: brightness(0.85); 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      /* Keep the plugin icon art strictly rounded */
      border-radius: 12px;
      overflow: hidden;
    }

    /* The new absolute positioned status badge wrapper half-in and half-out */
    .plugin-badge.icon-status-badge {
      position: absolute !important;
      bottom: 0 !important;
      left: 50% !important;
      transform: translate(-50%, 50%) !important;
      z-index: 10;
      margin: 0 !important;
      /* Glassmorphism cutout background to separate it from the icon */
      background: transparent !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      padding: 0px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      height: auto !important;
      box-shadow: none;
    }

    /* New badge positioned at top-center (half out) */
    .plugin-badge.icon-new-badge {
      position: absolute !important;
      top: -8px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 10 !important;
      margin: 0 !important;
      
      /* --- OVERRIDING THE CIRCLE --- */
      width: auto !important;     
      height: auto !important;    
      border-radius: 12px !important; 
      padding: 3px 8px !important; 
      /* ----------------------------- */

      /* Typography */
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #fff;

      /* 🔥 Premium Gradient (more depth than flat Apple one) */
      background: linear-gradient(135deg, #ff9500 0%, #ff2d55 100%);

      /* Depth */
      box-shadow: 
        0 4px 12px rgba(255, 45, 85, 0.35),
        inset 0 0.5px 0 rgba(255, 255, 255, 0.5);

      border: 1px solid rgba(255, 255, 255, 0.35);

      white-space: nowrap;
      line-height: 1.2;

      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);

      /* ✨ subtle entrance animation */
      animation: badge-pop 0.4s ease-out;
    }

    .plugin-badge.icon-new-badge::after {
      content: '';
      position: absolute;
      top: 0;
      left: -120%;
      width: 60%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.85),
        transparent
      );
      animation: shimmer-sweep 2.8s infinite ease-in-out;
    }

    /* 🎬 Animations */
    @keyframes shimmer-sweep {
      0% {
        left: -120%;
      }
      50%,
      100% {
        left: 220%;
      }
    }

    @keyframes badge-pop {
      0% {
        transform: translateX(-50%) scale(0.6);
        opacity: 0;
      }
      60% {
        transform: translateX(-50%) scale(1.08);
      }
      100% {
        transform: translateX(-50%) scale(1);
        opacity: 1;
      }
    }

    /* Sized perfectly for bottom-center */
    .status-active-wrapper, .status-inactive-wrapper, .status-system-wrapper {
      width: 16px; height: 16px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center;
      transition: background 0.3s ease;
    }
    
    .status-active-wrapper { background: rgba(52, 199, 89, 0.15); }
    .status-inactive-wrapper { background: rgba(255, 59, 48, 0.15); }
    .status-system-wrapper { background: rgba(142, 142, 147, 0.15); color: #8e8e93; }

    /* New badge styling */
    .status-new-wrapper {
      width: 18px; height: 18px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #FF9500, #FF6B35);
      box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .plugin-item:hover .status-active-wrapper { background: rgba(52, 199, 89, 0.22); }
    .plugin-item:hover .status-inactive-wrapper { background: rgba(255, 59, 48, 0.22); }
    .plugin-item:hover .status-new-wrapper { 
      background: linear-gradient(135deg, #FFB347, #FF8C42);
      box-shadow: 0 3px 10px rgba(255, 149, 0, 0.4);
    }

    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #34C759;
      animation: apple-breathe 2.4s ease-in-out infinite;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    /* New badge text */
    .status-new-text {
      font-size: 9px;
      font-weight: 600;
      color: white;
      letter-spacing: -0.3px;
      text-transform: uppercase;
    }

    .icon-update-overlay {
      position: absolute;
      top: -4px;
      right: -4px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .apple-update-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    @keyframes apple-breathe {
      0%, 100% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 4px rgba(52, 199, 89, 0.4); }
      50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 10px rgba(52, 199, 89, 0.9); }
    }

    .plugin-badge {
      display: inline-flex !important; align-items: center !important;
      justify-content: center !important; width: 24px !important;
      height: 24px !important; border-radius: 50% !important;
      margin: 0 4px; padding: 0 !important;
    }
    .plugin-badge svg { display: block; }
    .plugin-badge.badge-update { display: none !important; }

    /* 8. Logger & Sidebar Buttons Aesthetic Support */
    #pm-actions .pm-btn {
      border-radius: 10px !important;
      justify-content: flex-start;
      padding: 8px 14px;
      font-weight: 500;
    }

    /* 9. Community Plugin Description - 2 lines with ellipsis and tooltip */
    .plugin-meta[style*="margin-top"] {
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      line-height: 1.4 !important;
      max-height: 2.8em !important;
      position: relative !important;
      cursor: default !important;
    }
    .plugin-meta[style*="margin-top"]:hover::after {
      content: attr(title) !important;
      position: absolute !important;
      left: 0 !important;
      top: 100% !important;
      background: rgba(0, 0, 0, 0.85) !important;
      color: #fff !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      font-size: 12px !important;
      max-width: 280px !important;
      white-space: normal !important;
      word-wrap: break-word !important;
      z-index: 9999 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      line-height: 1.4 !important;
      margin-top: 6px !important;
    }
        
    /* 9. Dark Mode Overrides */
    @media (prefers-color-scheme: dark) {
      .pm-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
      .pm-content::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
      .apple-version-pill { background: rgba(255, 255, 255, 0.1); color: #a1a1a6; }
      .apple-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .apple-icon-btn.update-btn-enhanced { color: #0A84FF; }
      .apple-icon-btn.update-btn-enhanced:hover { background: rgba(10, 132, 255, 0.15); }
      .apple-icon-btn.rollback-btn { color: #ffb340; }
      .apple-icon-btn.rollback-btn:hover { background: rgba(255, 149, 0, 0.2); }
      .apple-slider { background-color: rgba(255, 255, 255, 0.2); }
      .pm-scroll-top { background: rgba(50, 50, 50, 0.8); color: #fff; border-color: rgba(255, 255, 255, 0.1); }
      .pm-scroll-top:hover { background: rgba(70, 70, 70, 1); color: #0A84FF; }
      
      .plugin-badge.icon-status-badge {
        background: transparent !important;
        border: none !important;
      }

      .status-active-wrapper { background: rgba(48, 209, 88, 0.18); }
      .status-inactive-wrapper { background: rgba(255, 69, 58, 0.18); }
      .status-system-wrapper {
        background: linear-gradient(135deg, rgba(88, 86, 214, 0.25) 0%, rgba(0, 122, 255, 0.25) 100%) !important;
      }
      .status-system-wrapper svg { stroke: #8E8EFF !important; }
      
      .apple-update-circle {
        background: rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.15);
        color: #0A84FF; 
      }

      .plugin-meta[style*="margin-top"]:hover::after {
        background: rgba(40, 40, 43, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }

      .plugin-badge.icon-new-badge {
        box-shadow: 
          0 4px 14px rgba(255, 45, 85, 0.45),
          inset 0 0.5px 0 rgba(255, 255, 255, 0.25);
      }

      .plugin-badge.icon-new-badge::after {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.25),
          transparent
        );
      }
    }
    `;
    document.head.appendChild(style);
  }

  // ───────────────── SCROLL BUTTON ─────────────────
  let scrollInjected = false;
  const injectScrollButton = () => {
    if (scrollInjected) return;
    scrollInjected = true;
    const pmRoot = document.querySelector('.pm-root');
    const content = document.querySelector('.pm-content');

    if (!pmRoot || !content) return;

    let topBtn = document.querySelector('.pm-scroll-top');

    if (!topBtn) {
      topBtn = document.createElement('div');
      topBtn.className = 'pm-scroll-top';
      topBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
        stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;

      topBtn.onclick = (e) => {
        e.stopPropagation();
        content.scrollTo({ top: 0, behavior: 'smooth' });
      };

      pmRoot.appendChild(topBtn);
    }

    if (scrollListener) {
      content.removeEventListener('scroll', scrollListener);
    }

    scrollListener = () => {
      topBtn.classList.toggle('visible', content.scrollTop > 150);
    };

    content.addEventListener('scroll', scrollListener);
  };

  function enhanceItem(item) {
    const actionGroup = item.querySelector('.pm-action-group');
    const info = item.querySelector('.plugin-info');
    const iconBox = item.querySelector('.plugin-icon-box');

    // ── FORCE TOGGLE FIX
    if (actionGroup && !actionGroup.querySelector('.apple-switch')) {
      let attempts = 0;
      const tryInject = () => {
        if (!document.body.contains(item)) return;
        const toggleBtn = actionGroup.querySelector('.toggle-btn');

        if (!toggleBtn) {
          if (attempts++ < 20) requestAnimationFrame(tryInject);
          return;
        }

        const isEnabled = toggleBtn.textContent.trim() === 'Disable';

        const wrapper = document.createElement('label');
        wrapper.className = 'apple-switch';

        wrapper.innerHTML = `
          <input type="checkbox" ${isEnabled ? 'checked' : ''}>
          <span class="apple-slider"></span>
        `;

        wrapper.querySelector('input').onchange = () => {
          const freshToggle = actionGroup.querySelector('.toggle-btn');
          freshToggle?.click();
        };

        actionGroup.dataset.switchEnhanced = 'true';
        actionGroup.insertBefore(wrapper, actionGroup.firstChild);
      };

      tryInject();
    }

    // ── VERSION PILL ──
    if (info) {
      const nameEl = info.querySelector('.plugin-name');
      const metaEl = info.querySelector('.plugin-meta');

      if (nameEl && metaEl) {
        if (!metaEl.dataset.originalText) {
          metaEl.dataset.originalText = metaEl.textContent;
        }

        const original = metaEl.dataset.originalText;
        const match = original.match(/v?\d+\.\d+\.\d+/);
        const existing = nameEl.querySelector('.apple-version-pill');

        if (match && !existing) {
          const pill = document.createElement('span');
          pill.className = 'apple-version-pill';
          pill.textContent = match[0];

          nameEl.appendChild(pill);
          const metaText = metaEl.textContent;
          const cleaned = metaText.replace(match[0], '').replace(/^[\s•]+/, '').trim();
          if (cleaned) {
            metaEl.textContent = cleaned;
          }
        }
      }
    }

    // ── LAYERED ICON BADGE (Update Check) ──
    const updateBtn = actionGroup?.querySelector('[data-update]');
    if (iconBox && !iconBox.dataset.updateEnhanced) {
      const originalIconHtml = iconBox.innerHTML;
      
      // We wrap the original icon in .icon-base-dimmed to handle border-radius centrally
      let newHtml = `<div class="icon-base-dimmed">${originalIconHtml}</div>`;
      
      if (updateBtn) {
        newHtml += `
          <div class="icon-update-overlay" title="Update Available">
            <div class="apple-update-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="4" x2="12" y2="20"></line>
                <polyline points="18 14 12 20 6 14"></polyline>
              </svg>
            </div>
          </div>
        `;
      }
      iconBox.innerHTML = newHtml;
      iconBox.dataset.updateEnhanced = 'true';
    }

    // ── ACTION BUTTONS REWRITE ──
    if (actionGroup) {
      const reloadBtn = actionGroup.querySelector('.reload-btn');
      const deleteBtn = actionGroup.querySelector('.delete-btn');
      const installBtn = actionGroup.querySelector('[data-install]');
      const rollbackBtn = actionGroup.querySelector('[data-rb-rollback]');

      if (rollbackBtn && !rollbackBtn.dataset.iconified) {
        rollbackBtn.className = 'apple-icon-btn rollback-btn';
        rollbackBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 14 4 9 9 4"/>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
          </svg>
        `;
        rollbackBtn.dataset.iconified = 'true';
      }

      if (reloadBtn && !reloadBtn.dataset.iconified) {
        reloadBtn.className = 'apple-icon-btn reload-btn';
        reloadBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
          <polyline points="21 3 21 8 16 8"/>
        </svg>`;
        reloadBtn.dataset.iconified = 'true';
      }

      if (deleteBtn && !deleteBtn.dataset.iconified) {
        deleteBtn.className = 'apple-icon-btn delete-icon delete-btn';
        deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>`;
        deleteBtn.dataset.iconified = 'true';
      }

      if (installBtn && !installBtn.dataset.iconified) {
        installBtn.className = 'apple-icon-btn';
        installBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12"/>
            <path d="M7 10l5 5 5-5"/>
            <path d="M5 21h14"/>
          </svg>
        `;
        installBtn.dataset.iconified = 'true';
      }

      if (updateBtn && !updateBtn.dataset.iconified) {
        updateBtn.className = 'apple-icon-btn update-btn-enhanced';
        updateBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7 19L5.78311 18.9954C3.12231 18.8818 1 16.6888 1 14
            C1 11.3501 3.06139 9.18169 5.66806 9.01084
            C6.78942 6.64027 9.20316 5 12 5
            C15.5268 5 18.4445 7.60822 18.9293 11.001
            L19 11C21.2091 11 23 12.7909 23 15
            C23 17.1422 21.316 18.8911 19.1996 18.9951
            L17 19M12 10V18M12 18L15 15M12 18L9 15"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        updateBtn.dataset.iconified = 'true';
      }

      // ── REORDER BUTTONS: Reload → Switch → Delete ──
      if (!actionGroup.dataset.reordered) {
        const appleSwitch = actionGroup.querySelector('.apple-switch');
        const reloadBtnEl = actionGroup.querySelector('.reload-btn');
        const deleteBtnEl = actionGroup.querySelector('.delete-btn');
        const updateBtnEl = actionGroup.querySelector('.update-btn-enhanced');
        const rollbackBtnEl = actionGroup.querySelector('.rollback-btn');

        if (appleSwitch && reloadBtnEl && deleteBtnEl) {
          // Remove all relevant elements
          const elements = [];
          if (reloadBtnEl) elements.push(reloadBtnEl);
          if (appleSwitch) elements.push(appleSwitch);
          if (deleteBtnEl) elements.push(deleteBtnEl);
          if (updateBtnEl) elements.push(updateBtnEl);
          if (rollbackBtnEl) elements.push(rollbackBtnEl);

          elements.forEach(el => el.remove());

          // Re-append in desired order: Reload → Switch → Delete → Update → Rollback
          if (reloadBtnEl) actionGroup.appendChild(reloadBtnEl);
          if (appleSwitch) actionGroup.appendChild(appleSwitch);
          if (deleteBtnEl) actionGroup.appendChild(deleteBtnEl);
          if (updateBtnEl) actionGroup.appendChild(updateBtnEl);
          if (rollbackBtnEl) actionGroup.appendChild(rollbackBtnEl);

          actionGroup.dataset.reordered = 'true';
        }
      }
    }

    // ── STATUS BADGES (Moved to bottom center of the Icon Box) ──
    item.querySelectorAll('.plugin-badge').forEach(badge => {
      if (badge.dataset.iconified) return;

      const text = badge.textContent.trim().toLowerCase();
      let isStatusBadge = false;
      // New: place a top-centered 'New' badge on the plugin icon box
      if (text === 'new' && iconBox) {
        badge.classList.remove('icon-status-badge');
        badge.classList.add('icon-new-badge');
        if (badge.parentElement !== iconBox) {
          iconBox.appendChild(badge);
        }
        badge.style.display = 'inline-flex';
        badge.dataset.iconified = 'true';
        return;
      }

      // Handle System Badge 
      if (text === 'system') {
        badge.innerHTML = `
          <div class="status-system-wrapper" title="System Plugin">
            <svg class="system-icon-running" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                stroke="#5856D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.93l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.2-1.17.53-1.69.93l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.93l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.2 1.17-.53 1.69-.93l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/>
            </svg>
          </div>
        `;
        badge.style.background = "transparent";
        badge.style.border = "none";
        isStatusBadge = true;
      }
      // Handle Active Badge
      else if (text === 'active') {
        badge.innerHTML = `
          <div class="status-active-wrapper" title="Active">
            <div class="status-dot"></div>
          </div>`;
        badge.style.background = 'none';
        item.classList.add('active');
        isStatusBadge = true;
      } 
      // Handle Inactive Badge
      else if (text === 'inactive') {
        badge.innerHTML = `
          <div class="status-inactive-wrapper" title="Inactive">
            <svg width="8" height="8" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>`;
        badge.style.color = "#FF3B30";
        badge.style.background = "none";
        isStatusBadge = true;
      } 
      // Hide standard update text badge, as the layered corner icon handles this
      else if (text.includes('update')) {
        badge.style.display = 'none';
      }

      // If it's a status badge, physically move it into the Icon Box wrapper!
      if (isStatusBadge && iconBox) {
        badge.classList.add('icon-status-badge');
        iconBox.appendChild(badge);
      } else if (!isStatusBadge && !text.includes('update') && badge.innerHTML) {
         // Fallback for random badges
         badge.style.display = 'inline-flex';
      }

      badge.dataset.iconified = 'true';
    });

    item.dataset.enhanced = 'true';
    item.classList.add('enhanced');
  }

  // ───────────────── OBSERVER ─────────────────
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.('.plugin-item')) enhanceItem(node);
        node.querySelectorAll?.('.plugin-item').forEach(enhanceItem);
      }
    }
  });

  const start = () => {
    const root = document.querySelector('.pm-root');
    if (!root) {
      setTimeout(start, 300);
      return;
    }
    injectScrollButton();
    observer.observe(root, { childList: true, subtree: true });
    root.querySelectorAll('.plugin-item').forEach(enhanceItem);
  };

  start();
}

export function teardown() {
  if (style) style.remove();
  if (observer) observer.disconnect();

  const content = document.querySelector('.pm-content');
  if (content && scrollListener) {
    content.removeEventListener('scroll', scrollListener);
  }

  document
    .querySelectorAll('.apple-switch, .pm-scroll-top, .apple-version-pill')
    .forEach(el => el.remove());

  isInitialized = false;
}
