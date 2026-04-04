let currentApi = null;

export const meta = {
  id: 'dice-roller',
  name: 'Dice Roller',
  version: '2.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .dr-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      perspective: 1000px;
    }

    .dr-card {
      position: relative;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 32px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 0.5px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      font-family: -apple-system, "SF Pro Display", system-ui;
    }

    /* Minimalist Close Glyph */
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
      transition: background 0.2s;
    }

    .dr-header {
      margin-top: 8px;
      text-align: center;
    }

    .dr-title {
      font-size: 13px;
      font-weight: 600;
      color: #86868b;
      letter-spacing: -0.01em;
    }

    /* Focused Center Stage */
    .dr-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .dr-result {
      font-size: 96px;
      font-weight: 700;
      color: #1d1d1f;
      letter-spacing: -4px;
      margin: 0;
      transition: transform 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.49);
    }

    .dr-result.rolling {
      transform: scale(0.8) rotate(-5deg);
      opacity: 0.5;
    }

    /* Horizontal Picker - Clean & Spaced */
    .dr-picker-tray {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 10px 0;
      width: 100%;
      scrollbar-width: none;
      justify-content: center;
      mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    }
    
    .dr-picker-tray::-webkit-scrollbar { display: none; }

    .dr-die-node {
      font-size: 14px;
      font-weight: 500;
      color: #86868b;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .dr-die-node.active {
      color: #007AFF;
      background: rgba(0, 122, 255, 0.1);
    }

    /* Primary Action */
    .dr-action-btn {
      width: 100%;
      height: 54px;
      background: #007AFF;
      border: none;
      border-radius: 18px;
      color: white;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 20px rgba(0, 122, 255, 0.25);
    }

    .dr-action-btn:active {
      transform: scale(0.96);
      filter: brightness(1.1);
    }

    @media (prefers-color-scheme: dark) {
      .dr-card { background: rgba(28, 28, 30, 0.8); border: 0.5px solid rgba(255, 255, 255, 0.1); }
      .dr-result { color: #fff; }
      .dr-close { background: rgba(255, 255, 255, 0.1); color: #fff; }
      .dr-die-node.active { color: #0a84ff; background: rgba(10, 132, 255, 0.15); }
    }
  `);

  const container = api.container;
  let selectedDie = 6;
  const dice = [4, 6, 8, 10, 12, 20, 100];
  let lastResult = '--';

  function render() {
    container.innerHTML = `
      <div class="dr-container">
        <div class="dr-card">
          <button class="dr-close" id="close-btn">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2L10 10M2 10L10 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          
          <div class="dr-header">
            <div class="dr-title">D${selectedDie} ROLL</div>
          </div>

          <div class="dr-stage">
            <h1 class="dr-result" id="result-text">${lastResult}</h1>
          </div>

          <div class="dr-picker-tray">
            ${dice.map(d => `<div class="dr-die-node ${d === selectedDie ? 'active' : ''}" data-val="${d}">d${d}</div>`).join('')}
          </div>

          <button class="dr-action-btn" id="roll-btn">Roll Dice</button>
        </div>
      </div>
    `;

    // Logic for Selection
    container.querySelectorAll('.dr-die-node').forEach(el => {
      el.onclick = () => {
        selectedDie = parseInt(el.dataset.val);
        render();
      };
    });

    // Logic for Close
    container.querySelector('#close-btn').onclick = () => {
      if (api.removeWidget) api.removeWidget(meta.id);
    };

    // Logic for Roll with Animation
    container.querySelector('#roll-btn').onclick = () => {
      const display = container.querySelector('#result-text');
      display.classList.add('rolling');
      
      setTimeout(() => {
        lastResult = Math.floor(Math.random() * selectedDie) + 1;
        display.classList.remove('rolling');
        render();
      }, 150);
    };
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}