let currentApi = null;

export const meta = {
  id: 'dice-roller',
  name: 'Dice Roller',
  version: '1.1.1',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .dr-card { 
      position: relative;
      width: 100%; 
      height: 100%; 
      background: rgba(255, 255, 255, 0.7); 
      border-radius: 28px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: space-between; 
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; 
      padding: 24px; 
      box-sizing: border-box; 
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }

    /* Close Button - Apple Style */
    .dr-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #000;
      transition: all 0.2s;
    }
    .dr-close:hover { background: rgba(0, 0, 0, 0.1); transform: scale(1.1); }

    .dr-header { text-align: center; margin-top: 10px; }
    .dr-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #86868b; margin-bottom: 4px; }
    
    .dr-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-grow: 1;
    }
    .dr-value { font-size: 64px; font-weight: 700; color: #1d1d1f; letter-spacing: -2px; line-height: 1; }
    .dr-emoji { font-size: 24px; margin-bottom: 8px; opacity: 0.9; }

    /* Segmented Control Style for Dice */
    .dr-dice-picker { 
      display: flex; 
      background: rgba(0, 0, 0, 0.05); 
      padding: 3px;
      border-radius: 12px;
      width: 100%;
      margin: 20px 0;
    }
    .dr-die-opt { 
      flex: 1;
      text-align: center;
      padding: 6px 0;
      font-size: 12px;
      font-weight: 600;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: #424245;
    }
    .dr-die-opt.active { 
      background: #fff; 
      color: #000; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
    }

    .dr-roll-btn { 
      width: 100%;
      padding: 14px; 
      background: #007AFF; 
      color: #fff; 
      border: none; 
      border-radius: 16px; 
      font-size: 17px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
    }
    .dr-roll-btn:active { transform: scale(0.97); filter: brightness(1.1); }

    .dr-history { font-size: 11px; color: #86868b; margin-top: 12px; font-weight: 500; }

    @media (prefers-color-scheme: dark) {
      .dr-card { background: rgba(28, 28, 30, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); }
      .dr-value { color: #f5f5f7; }
      .dr-close { background: rgba(255, 255, 255, 0.1); color: #fff; }
      .dr-dice-picker { background: rgba(255, 255, 255, 0.1); }
      .dr-die-opt { color: #a1a1a6; }
      .dr-die-opt.active { background: rgba(255, 255, 255, 0.2); color: #fff; }
      .dr-label { color: #86868b; }
    }
  `);

  const container = api.container;
  let selectedDie = 6;
  const diceOptions = [4, 6, 8, 12, 20];
  let history = [];

  function render() {
    const lastResult = history.length ? history[history.length - 1] : '--';
    
    container.innerHTML = `
      <div class="dr-card">
        <button class="dr-close" id="dr-close-btn">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <div class="dr-header">
          <div class="dr-label">Dice Roller</div>
        </div>

        <div class="dr-display">
          <div class="dr-emoji">🎲</div>
          <div class="dr-value">${lastResult}</div>
          <div class="dr-history">
            ${history.length ? 'History: ' + history.slice(-3).reverse().join(' • ') : 'Roll for luck'}
          </div>
        </div>

        <div class="dr-dice-picker">
          ${diceOptions.map(d => `<div class="dr-die-opt ${d === selectedDie ? 'active' : ''}" data-d="${d}">d${d}</div>`).join('')}
        </div>

        <button class="dr-roll-btn" id="dr-roll-trigger">Roll d${selectedDie}</button>
      </div>
    `;

    // Event Listeners
    container.querySelectorAll('.dr-die-opt').forEach(el => el.addEventListener('click', () => {
      selectedDie = +el.dataset.d;
      render();
    }));

    container.querySelector('#dr-roll-trigger').addEventListener('click', roll);
    
    container.querySelector('#dr-close-btn').addEventListener('click', () => {
        // Since it's a widget, we usually call a teardown or remove the element
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
        setTimeout(() => api.removeWidget(meta.id), 200);
    });
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