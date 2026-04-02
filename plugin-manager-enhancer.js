export const meta = {
  id: 'pm-enhancer',
  name: 'PM Apple Aesthetic Enhancer',
  version: '1.1.2',
  compat: '>=3.3.0'
};

let style = null;
let observer = null;
let scrollListener = null;

export function setup(api) {
  style = document.createElement('style');
  style.textContent = `
    /* 1. Custom Aesthetic Scrollbar (Light Mode focus) */
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

    /* 2. Original Button Hiding */
    .toggle-btn { display: none !important; }

    /* 3. Modern Apple Toggle Switch */
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

    /* 4. Action Icon Buttons */
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

    /* 5. Floating Scroll-to-Top Button */
    .pm-scroll-top {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      width: 40px;
      height: 40px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      z-index: 100;
      color: #1d1d1f;
    }
    .pm-scroll-top.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .pm-scroll-top:hover {
      background: rgba(255, 255, 255, 0.95);
      transform: translateX(-50%) translateY(-3px);
    }
    
    /* 6. Dark Mode Adjustments */
    @media (prefers-color-scheme: dark) {
      .pm-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
      }
      .pm-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
      .apple-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      .apple-slider { background-color: rgba(255, 255, 255, 0.2); }
      .pm-scroll-top { 
        background: rgba(45, 45, 45, 0.6); 
        border-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  `;
  document.head.appendChild(style);

  const injectScrollButton = () => {
    const content = document.querySelector('.pm-content');
    if (!content || document.querySelector('.pm-scroll-top')) return;

    const topBtn = document.createElement('div');
    topBtn.className = 'pm-scroll-top';
    topBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;
    
    topBtn.onclick = () => {
      content.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Appending to parent to maintain absolute positioning relative to the container
    content.parentElement.appendChild(topBtn);

    scrollListener = () => {
      if (content.scrollTop > 100) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    };

    content.addEventListener('scroll', scrollListener);
  };

  const transformUI = () => {
    injectScrollButton();
    const items = document.querySelectorAll('.plugin-item');
    items.forEach(item => {
      const actionGroup = item.querySelector('.pm-action-group');
      if (!actionGroup || actionGroup.dataset.enhanced === 'true') return;

      const reloadBtn = actionGroup.querySelector('.reload-btn');
      const toggleBtn = actionGroup.querySelector('.toggle-btn');
      const deleteBtn = actionGroup.querySelector('.delete-btn');

      if (reloadBtn) {
        reloadBtn.className = 'apple-icon-btn';
        reloadBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`;
      }

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
  
  const content = document.querySelector('.pm-content');
  if (content && scrollListener) {
    content.removeEventListener('scroll', scrollListener);
  }
  
  document.querySelectorAll('.apple-switch, .pm-scroll-top').forEach(el => el.remove());
}