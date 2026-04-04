let currentApi = null;

export const meta = {
  id: 'dice-roller',
  name: 'Dice Roller',
  version: '1.2.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    /* Fix: Ensure the parent container doesn't show through corners */
    .dr-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      overflow: hidden; 
    }

    .dr-card { 
      position: relative;
      width: 100%; 
      height: 100%; 
      background: rgba(255, 255, 255, 0.8); 
      border-radius: 24px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 24px; 
      box-sizing: border-box; 
      backdrop-filter: blur(25px) saturate(190%);
      -webkit-backdrop-filter: blur(25px) saturate(190%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .dr-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.06);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #333;
      z-index: 10;
    }
    .dr-close:hover { background: rgba(0, 0, 0, 0.12); }

    .dr-header { margin-bottom: 12px; }
    .dr-label { font-size: 11px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.8px; }

    .dr-main { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      gap: 4px;
    }
    .dr-value { font-size: 72px; font-weight: 800; color: #1d1d1f; letter-spacing: -3px; }
    .dr-history-text { font-size: 13px; color: #86868b; font-weight: 500; height: 18px; }

    /* Segmented Control Fix */
    .dr-dice-picker { 
      display: flex; 
      background: rgba(0, 0, 0, 0.05); 
      padding: 3px;
      border-radius: 12px;
      width: 100%;
      margin: 20px 0;
      gap: 2px;
    }
    .dr-die-opt { 
      flex: 1;
      text-align: center;
      padding: 8px 0;
      font-size: 13px;
      font-weight: 600;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: #1d1d1f;
    }
    .dr-die-opt.active { 
      background: #fff; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.08); 
    }

    .dr-roll-btn { 
      width: 100%;
      padding: 16px; 
      background: #007AFF; 
      color: #fff; 
      border: none; 
      border-radius: 16px; 
      font-size: 17px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.2s;
    }
    .dr-roll-btn:active { transform: scale(0.96); opacity: 0.9; }

    @media (prefers-color-scheme: dark) {
      .dr-card { background: rgba(28, 28, 30, 0.75); border-color: rgba(255, 255, 255, 0.1); }
      .dr-value { color: #f5f5f7; }
      .dr-close { background: rgba(255, 255, 255, 0.1); color: #fff; }
      .dr-dice-picker { background: rgba(255, 255, 255, 0.12); }
      .dr-die-opt { color: #f5f5f7; }
      .dr-die-opt.active { background: rgba(255, 255, 255, 0.15); }
    }
  `);

  const container = api.container;
  let selectedDie = 6;
  const diceOptions = [4, 6, 8, 12, 20];
  let history = [];

  function render() {
    const lastResult = history.length ? history[history.length - 1] : '--';
    
    container.innerHTML = `
      <div class="dr-wrapper">
        <div class="dr-card">
          <button class="dr-close" id="dr-close">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2L10 10M2 10L10 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>

          <div class="dr-header">
            <div class="dr-label">Dice Roller</div>
          </div>

          <div class="dr-main">
            <div style="font-size: 24px; margin-bottom: 4px;">🎲</div>
            <div class="dr-value">${lastResult}</div>
            <div class="dr-history-text">
              ${history.length ? history.slice(-3).reverse().join(' · ') : 'Roll for luck'}
            </div>
          </div>

          <div class="dr-dice-picker">
            ${diceOptions.map(d => `<div class="dr-die-opt ${d === selectedDie ? 'active' : ''}" data-d="${d}">d${d}</div>`).join('')}
          </div>

          <button class="dr-roll-btn" id="dr-roll">Roll d${selectedDie}</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.dr-die-opt').forEach(el => el.addEventListener('click', () => {
      selectedDie = +el.dataset.d;
      render();
    }));

    container.querySelector('#dr-roll').onclick = roll;
    
    container.querySelector('#dr-close').onclick = () => {
        if(api.removeWidget) api.removeWidget(meta.id);
    };
  }

  function roll() {
    const result = Math.floor(Math.random() * selectedDie) + 1;
    history.push(result);
    render();
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}