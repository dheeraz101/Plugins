let currentApi = null;

export const meta = {
  id: 'dice-roller',
  name: 'Dice Roller',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .dr-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; padding: 20px; box-sizing: border-box; }
    .dr-result { font-size: 64px; margin-bottom: 8px; }
    .dr-value { font-size: 28px; color: #fff; font-weight: 700; margin-bottom: 16px; }
    .dr-dice { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; justify-content: center; }
    .dr-die { width: 44px; height: 44px; border-radius: 10px; background: #252540; border: 2px solid #444; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: all 0.2s; color: #fff; }
    .dr-die:hover, .dr-die.active { border-color: #e94560; background: #2a2a4a; }
    .dr-roll { padding: 12px 32px; background: #e94560; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 700; transition: transform 0.1s; }
    .dr-roll:active { transform: scale(0.95); }
    .dr-history { margin-top: 12px; color: #666; font-size: 12px; }
  `);

  const container = api.container;
  let selected = 6;
  const dice = [4, 6, 8, 10, 12, 20, 100];
  let history = [];

  function render() {
    const last = history.length ? history[history.length - 1] : '?';
    container.innerHTML = `
      <div class="dr-widget">
        <div class="dr-result">🎲</div>
        <div class="dr-value">${last}</div>
        <div class="dr-dice">
          ${dice.map(d => `<div class="dr-die ${d === selected ? 'active' : ''}" data-d="${d}">d${d}</div>`).join('')}
        </div>
        <button class="dr-roll" id="dr-roll">Roll!</button>
        <div class="dr-history">${history.length ? 'Last: ' + history.slice(-5).join(', ') : 'Pick a die and roll!'}</div>
      </div>
    `;

    container.querySelectorAll('.dr-die').forEach(el => el.addEventListener('click', () => {
      selected = +el.dataset.d; render();
    }));
    container.querySelector('#dr-roll').addEventListener('click', roll);
  }

  function roll() {
    const result = Math.floor(Math.random() * selected) + 1;
    history.push(result);
    render();
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
