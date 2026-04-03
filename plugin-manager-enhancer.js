export const meta = {
  id: 'pm-enhancer',
  name: 'PM Enhancer',
  version: '1.3.3',
  compat: '>=3.3.0'
};

let style = null;
let observer = null;
let scrollListener = null;

export function setup(api) {
  style = document.createElement('style');
  style.textContent = `
    /* 1. Custom Aesthetic Scrollbar (Light & Dark) */
    .pm-content::-webkit-scrollbar { 
      width: 6px; 
    }
    .pm-content::-webkit-scrollbar-track { 
      background: transparent; 
    }
    .pm-content::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      transition: background 0.2s;
    }
    .pm-content::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
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

    /* Force hide original text buttons */
    .toggle-btn { display: none !important; }

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

    /* 5. Action Icons (Reload & Delete) */
    .apple-icon-btn {
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

 /* 6. Floating Scroll Button - FIXED POSITIONING & UI */
     .pm-scroll-top {
      position: fixed; /* Changed to fixed so it stays in place */
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
      pointer-events: none; /* Disable when hidden */
    }

    .pm-scroll-top.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto; /* Enable when shown */
    }

    .pm-scroll-top:hover {
      background: rgba(255, 255, 255, 1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      color: #007AFF; /* Apple Blue on hover for better UI */
      transform: translateX(-50%) translateY(-2px);
    }

    .plugin-badge svg {
      display: block;
    }

    .plugin-badge {
      min-width: 20px;
      height: 20px;
    }
        
    /* 7. Dark Mode Overrides */
    @media (prefers-color-scheme: dark) {
      .pm-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
      .pm-content::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
      .apple-version-pill { background: rgba(255, 255, 255, 0.1); color: #a1a1a6; }
      .apple-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .apple-slider { background-color: rgba(255, 255, 255, 0.2); }
      .pm-scroll-top { 
        background: rgba(50, 50, 50, 0.8); 
        color: #fff; 
        border-color: rgba(255, 255, 255, 0.1); 
      }
      .pm-scroll-top:hover { background: rgba(70, 70, 70, 1); color: #0A84FF; }
    }
  `;
  document.head.appendChild(style);

   const injectScrollButton = () => {
    const pmRoot = document.querySelector('.pm-root');
    const content = document.querySelector('.pm-content');
    if (!pmRoot || !content || document.querySelector('.pm-scroll-top')) return;

    const topBtn = document.createElement('div');
    topBtn.className = 'pm-scroll-top';
    topBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;
    
    topBtn.onclick = (e) => {
      e.stopPropagation();
      content.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Append to pmRoot instead of content to keep it fixed relative to the window
    pmRoot.appendChild(topBtn);

    scrollListener = () => {
      topBtn.classList.toggle('visible', content.scrollTop > 150);
    };
    content.addEventListener('scroll', scrollListener);
  };

  const transformUI = () => {
    injectScrollButton();
    const items = document.querySelectorAll('.plugin-item');
    
    items.forEach(item => {
      // 1. FIX: Target the correct elements for the Version Pill
      const info = item.querySelector('.plugin-info');
      if (info && !info.dataset.versionEnhanced) {
        const nameEl = info.querySelector('.plugin-name'); // Core uses .plugin-name
        const metaEl = info.querySelector('.plugin-meta'); // Core uses .plugin-meta
        
        // Extract version (e.g., v3.6.7) from the meta text
        const versionMatch = metaEl?.textContent.match(/v?\d+\.\d+\.\d+/);
        
        if (versionMatch && nameEl) {
          const pill = document.createElement('span');
          pill.className = 'apple-version-pill';
          pill.textContent = versionMatch[0];
          
          // Append the pill next to the name
          nameEl.style.display = 'inline-flex';
          nameEl.style.alignItems = 'center';
          nameEl.appendChild(pill);
          
          // Clean up the original meta text so version isn't shown twice
          metaEl.textContent = metaEl.textContent.replace(versionMatch[0], '').replace(/^[\s•]+|[\s•]+$/g, '');
        }
        info.dataset.versionEnhanced = 'true';
      }

      // 2. Action Buttons Logic (Remains mostly the same, but verified)
      const actionGroup = item.querySelector('.pm-action-group');
      if (!actionGroup || actionGroup.dataset.enhanced === 'true') return;

      const reloadBtn = actionGroup.querySelector('.reload-btn');
      const toggleBtn = actionGroup.querySelector('.toggle-btn');
      const deleteBtn = actionGroup.querySelector('.delete-btn');

      if (reloadBtn) {
        reloadBtn.className = 'apple-icon-btn reload-btn'; // Keep original class for functionality
        reloadBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`;
      }

      if (toggleBtn) {
        // Core Manager uses text "Disable" to indicate an active plugin
        const isEnabled = toggleBtn.textContent.trim() === 'Disable';
        const switchWrapper = document.createElement('label');
        switchWrapper.className = 'apple-switch';
        switchWrapper.innerHTML = `<input type="checkbox" ${isEnabled ? 'checked' : ''}><span class="apple-slider"></span>`;
        
        // Link the switch to the hidden core button
        switchWrapper.querySelector('input').onchange = () => toggleBtn.click();
        actionGroup.insertBefore(switchWrapper, toggleBtn);
      }

      if (deleteBtn) {
        deleteBtn.className = 'apple-icon-btn delete-icon delete-btn';
        deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
      }
      // Install Button → Icon
      const installBtn = actionGroup.querySelector('[data-install]');
      if (installBtn && !installBtn.dataset.iconified) {
        installBtn.className = 'apple-icon-btn';
        installBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        `;
        installBtn.dataset.iconified = 'true';
      }
      // Update Button → Icon
      const updateBtn = actionGroup.querySelector('[data-update]');
      if (updateBtn && !updateBtn.dataset.iconified) {
        updateBtn.className = 'apple-icon-btn';
        updateBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"/>
            <path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
          </svg>
        `;
        updateBtn.dataset.iconified = 'true';
      }

      actionGroup.dataset.enhanced = 'true';

 // 3. Replace Badge Text with Icons (Apple Style)
      const badges = item.querySelectorAll('.plugin-badge');

      badges.forEach(badge => {
        if (badge.dataset.iconified) return;
        const text = badge.textContent.trim().toLowerCase();

        let icon = '';

        if (text.includes('system')) {
          // Apple-style "Command/Chip" symbol for System plugins
          icon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" ry="5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`;
          badge.title = "System Plugin";
        } 
        else if (text.includes('active')) {
          // Thicker, rounded checkmark for Active status
          icon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
          badge.style.color = "#34C759"; // Apple Success Green
        } 
        else if (text.includes('inactive')) {
          // Hollow circle for Inactive
          icon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>`;
          badge.style.color = "#86868b";
        } 
        else if (text.includes('update')) {
          // "Arrow down into circle" for Update available
          icon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12l4 4 4-4"/></svg>`;
          badge.style.color = "#007AFF"; // Apple Blue
        }

        if (icon) {
          badge.innerHTML = icon;
          badge.style.display = 'inline-flex';
          badge.style.alignItems = 'center';
          badge.style.justifyContent = 'center';
          badge.style.padding = '5px';
          badge.style.borderRadius = '50%';
          badge.style.background = 'rgba(120, 120, 128, 0.08)';
        }

        badge.dataset.iconified = 'true';
      });
    
    });
  };

  observer = new MutationObserver(() => transformUI());
  
  const startObserving = () => {
    const pmRoot = document.querySelector('.pm-root');
    if (pmRoot) {
      observer.observe(pmRoot, { childList: true, subtree: true });
      transformUI();
    } else {
      setTimeout(startObserving, 300);
    }
  };

  startObserving();
}

export function teardown() {
  if (style) style.remove();
  if (observer) observer.disconnect();
  const content = document.querySelector('.pm-content');
  if (content && scrollListener) content.removeEventListener('scroll', scrollListener);
  document.querySelectorAll('.apple-switch, .pm-scroll-top, .apple-version-pill').forEach(el => el.remove());
}