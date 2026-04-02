export const meta = {
  id: 'pm-enhancer',
  name: 'PM Apple Aesthetic Enhancer',
  version: '1.0.1',
  compat: '>=3.3.0'
};

let style = null;
let observer = null;

export function setup(api) {
  style = document.createElement('style');
  style.textContent = `
    /* Force hide the original text-based toggle buttons */
    .toggle-btn { 
      display: none !important; 
    }

    /* Modern Apple Toggle Switch */
    .apple-switch {
      position: relative;
      display: inline-flex;
      width: 42px;
      height: 24px;
      cursor: pointer;
      align-items: center;
    }

    .apple-switch input { opacity: 0; width: 0; height: 0; }

    .apple-slider {
      position: absolute;
      cursor: pointer;
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

    /* Action Icon Buttons */
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
    }

    .apple-icon-btn:hover { background: rgba(0,0,0,0.05); color: #1d1d1f; }
    .apple-icon-btn:active { transform: scale(0.9); }
    .apple-icon-btn.delete-icon:hover { color: #FF3B30; background: rgba(255, 59, 48, 0.1); }
    
    @media (prefers-color-scheme: dark) {
      .apple-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .apple-slider { background-color: rgba(255, 255, 255, 0.2); }
    }
  `;
  document.head.appendChild(style);

  const transformUI = () => {
    const items = document.querySelectorAll('.plugin-item');
    
    items.forEach(item => {
      const actionGroup = item.querySelector('.pm-action-group');
      if (!actionGroup || actionGroup.dataset.enhanced === 'true') return;

      const reloadBtn = actionGroup.querySelector('.reload-btn');
      const toggleBtn = actionGroup.querySelector('.toggle-btn');
      const deleteBtn = actionGroup.querySelector('.delete-btn');

      // 1. Reload Circle
      if (reloadBtn) {
        reloadBtn.className = 'apple-icon-btn';
        reloadBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`;
      }

      // 2. Apple Toggle (Logic Link)
      if (toggleBtn) {
        const isEnabled = toggleBtn.textContent.trim() === 'Disable';
        const switchWrapper = document.createElement('label');
        switchWrapper.className = 'apple-switch';
        switchWrapper.innerHTML = `
          <input type="checkbox" ${isEnabled ? 'checked' : ''}>
          <span class="apple-slider"></span>
        `;
        
        switchWrapper.querySelector('input').onchange = () => toggleBtn.click();
        actionGroup.insertBefore(switchWrapper, toggleBtn);
      }

      // 3. Aesthetic Dustbin
      if (deleteBtn) {
        deleteBtn.className = 'apple-icon-btn delete-icon';
        deleteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
      }

      actionGroup.dataset.enhanced = 'true';
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
  document.querySelectorAll('.apple-switch').forEach(el => el.remove());
}