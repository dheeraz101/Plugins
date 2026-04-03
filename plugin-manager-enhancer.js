export const meta = {
  id: 'pm-enhancer',
  name: 'PM Enhancer',
  version: '1.3.7',
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3v12"/>
          <path d="M7 10l5 5 5-5"/>
          <path d="M5 21h14"/>
        </svg>
        `;
        installBtn.dataset.iconified = 'true';
      }
      // Update Button → Icon
      const updateBtn = actionGroup.querySelector('[data-update]');
      if (updateBtn && !updateBtn.dataset.iconified) {
        updateBtn.className = 'apple-icon-btn';
        updateBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#28a745">
            <path d="M15.75,2 C16.9926407,2 18,3.00735931 18,4.25 L18,19.75 C18,20.9926407 16.9926407,22 15.75,22 L8.25,22 C7.00735931,22 6,20.9926407 6,19.75 L6,4.25 C6,3.00735931 7.00735931,2 8.25,2 L15.75,2 Z M12,7.03091032 L11.8982294,7.03775694 L11.8006203,7.05770104 C11.5184556,7.13531582 11.302859,7.37364017 11.2584322,7.66807246 L11.25,7.78091032 L11.2493326,14.4919103 L10.2886627,13.5308062 L10.2045443,13.458188 C9.9109328,13.2403335 9.49426911,13.2645396 9.22800255,13.5308062 C8.96173599,13.7970727 8.93752994,14.2137364 9.1553844,14.5073479 L9.22800255,14.5914663 L11.4696699,16.8331337 L11.521803,16.8806484 L11.576687,16.9220073 L11.6535357,16.9682062 L11.7651467,17.0152982 L11.8614701,17.0400358 L11.9532009,17.0513519 L12.0467865,17.0513519 L12.1392767,17.0398316 L12.2018763,17.0253178 L12.3025771,16.989272 L12.3630989,16.9592071 L12.4296295,16.9177078 L12.4921384,16.8687687 L12.5303301,16.8331337 L14.7719974,14.5914663 L14.8446156,14.5073479 C15.038264,14.2463599 15.0406547,13.8881455 14.8517878,13.6247568 L14.7719974,13.5308062 L14.687879,13.458188 C14.426891,13.2645396 14.0686766,13.2621489 13.805288,13.4510158 L13.7113373,13.5308062 L12.7493326,14.4919103 L12.75,7.78091032 L12.7431534,7.67913976 C12.6980057,7.3463438 12.4345665,7.08290459 12.1017706,7.03775694 L12,7.03091032 Z"></path>
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

          if (text === 'system') {
          // Apple-style "Command/Chip" symbol for System plugins
          icon = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.33 1.82V22a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.33-1.82 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.82-.33H2a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.82-.33 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6c.26 0 .52-.06.76-.17A1.7 1.7 0 0 0 10.6 3V2a2 2 0 1 1 4 0v.09c0 .64.38 1.22.96 1.49.24.11.5.17.76.17a1.7 1.7 0 0 0 1-.6l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.15-.33 1.82.11.24.17.5.17.76 0 .26-.06.52-.17.76a1.7 1.7 0 0 0 .33 1.82l.06.06A2 2 0 1 1 19.4 15z"/>
          </svg>
          `;
          badge.title = "System Plugin";
        } 
        else if (text === 'active') {
          icon = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
          badge.style.color = "#34C759"; // Apple Success Green
          badge.style.background = "rgba(52, 199, 89, 0.12)"; // Very light green tint
        } 
        else if (text === 'inactive') {
          icon = `
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          `;
          badge.style.color = "#FF3B30"; // Apple System Red
          badge.style.background = "rgba(255, 59, 48, 0.12)"; // Very light red tint
        }
        else if (text.includes('update')) {
          icon = `
            <svg width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path class="update" d="m 8 0 c -0.257812 0 -0.511719 0.0976562 -0.707031 0.292969 l -1.707031 1.707031 h -2.585938 c -0.550781 0 -1 0.449219 -1 1 v 2.585938 l -1.707031 1.707031 c -0.3906252 0.390625 -0.3906252 1.023437 0 1.414062 l 1.707031 1.707031 v 2.585938 c 0 0.550781 0.449219 1 1 1 h 2.585938 l 1.707031 1.707031 c 0.390625 0.390625 1.023437 0.390625 1.414062 0 l 1.707031 -1.707031 h 2.585938 c 0.550781 0 1 -0.449219 1 -1 v -2.585938 l 1.707031 -1.707031 c 0.390625 -0.390625 0.390625 -1.023437 0 -1.414062 l -1.707031 -1.707031 v -2.585938 c 0 -0.550781 -0.449219 -1 -1 -1 h -2.585938 l -1.707031 -1.707031 c -0.195312 -0.1953128 -0.449219 -0.292969 -0.707031 -0.292969 z m -1 4 h 2 v 5 h -2 z m 1 5.75 c 0.6875 0 1.25 0.5625 1.25 1.25 s -0.5625 1.25 -1.25 1.25 s -1.25 -0.5625 -1.25 -1.25 s 0.5625 -1.25 1.25 -1.25 z" fill="#28a745"/>
            </svg>`;
          badge.style.color = "#28a745"; // Green for update
        }
        if (icon) {
          badge.innerHTML = icon;
          badge.style.display = 'inline-flex';
          badge.style.alignItems = 'center';
          badge.style.justifyContent = 'center';
          badge.style.padding = '5px';
          badge.style.borderRadius = '50%';
          if (!badge.style.background) {
            badge.style.background = 'rgba(120, 120, 128, 0.08)';
          }
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