let currentApi = null;

export const meta = {
  id: 'dice-roller',
  name: 'Dice Roller',
  version: '2.1.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    /* The Fix: Force the absolute outer container to be invisible */
    #dice-roller, 
    .dr-container {
      width: 100%;
      height: 100%;
      background: transparent !important;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible !important; /* Allows shadow to spread */
    }

    .dr-card {
      position: relative;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 32px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 0.5px solid rgba(255, 255, 255, 0.5);
      /* Balanced Shadow */
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      font-family: -apple-system, "SF Pro Display", system-ui;
      overflow: hidden; /* Clips internal elements to the radius */
    }

    .dr-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #000;
      z-index: 100;
      transition: all 0.2s ease;
    }
    .dr-close:hover { background: rgba(0, 0, 0, 0.1); transform: scale(1.05); }
    .dr-close:active { transform: scale(0.9); }

    .dr-header { margin-top: 4px; text-align: center; pointer-events: none; }
    .dr-title { font-size: 12px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.05em; }

    .dr-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .dr-result {
      font-size: 88px;
      font-weight: 700;
      color: #1d1d1f;
      letter-spacing: -3px;
      margin: 0;
      transition: transform 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.49);
    }

    .dr-result.rolling { transform: scale(0.7) rotate(-10deg); opacity: 0.3; }

    .dr-picker-tray {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 12px 0;
      width: 100%;
      scrollbar-width: none;
      justify-content: center;
    }
    .dr-picker-tray::-webkit-scrollbar { display: none; }

    .dr-die-node {
      font-size: 14px;
      font-weight: 600;
      color: #86868b;
      cursor: pointer;
      padding: 8px 14px;
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .dr-die-node.active {
      color: #007AFF;
      background: rgba(0, 122, 255, 0.12);
    }

    .dr-action-btn {
      width: 100%;
      height: 58px;
      background: #007AFF;
      border: none;
      border-radius: 20px;
      color: white;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 20px rgba(0, 122, 255, 0.25);
    }

    .dr-action-btn:active { transform: scale(0.97); filter: brightness(1.1); }

    @media (prefers-color-scheme: dark) {
      .dr-card { background: rgba(28, 28, 30, 0.85); border: 0.5px solid rgba(255, 255, 255, 0.1); }
      .dr-result { color: #fff; }
      .dr-close { background: rgba(255, 255, 255, 0.1); color: #fff; }
      .dr-die-node { background: rgba(255, 255, 255, 0.05); color: #a1a1a6; }
      .dr-die-node.active { color: #0a84ff; background: rgba(10, 132, 255, 0.2); }
    }
  `);

  const container = api.container;
  let selectedDie = 6;
  const dice = [4, 6, 8, 12, 20, 100];
  let lastResult = '--';

  function render() {
    container.innerHTML = `
      <div class="dr-container">
        <div class="dr-card">
          <button class="dr-close" id="dr-close-trigger" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 3.5L10.5 10.5M3.5 10.5L10.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <div class="dr-header">
            <div class="dr-title">D${selectedDie}</div>
          </div>

          <div class="dr-stage">
            <div class="dr-result" id="res-val">${lastResult}</div>
          </div>

          <div class="dr-picker-tray">
            ${dice.map(d => `<div class="dr-die-node ${d === selectedDie ? 'active' : ''}" data-val="${d}">d${d}</div>`).join('')}
          </div>

          <button class="dr-action-btn" id="roll-trigger">Roll</button>
        </div>
      </div>
    `;

    // 1. Fixed Close Logic
    const closeBtn = container.querySelector('#dr-close-trigger');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents triggers on parent elements
      if (api.removeWidget) {
        api.removeWidget(meta.id);
      } else {
        // Fallback: Remove the DOM element manually if the API is restricted
        container.innerHTML = '';
      }
    });

    // 2. Selection Logic
    container.querySelectorAll('.dr-die-node').forEach(el => {
      el.onclick = () => {
        selectedDie = parseInt(el.dataset.val);
        render();
      };
    });

    // 3. Roll Logic with Haptic-style Animation
    const rollBtn = container.querySelector('#roll-trigger');
    rollBtn.onclick = () => {
      const display = container.querySelector('#res-val');
      display.classList.add('rolling');
      
      setTimeout(() => {
        lastResult = Math.floor(Math.random() * selectedDie) + 1;
        display.classList.remove('rolling');
        render();
      }, 160);
    };
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}