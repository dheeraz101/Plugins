let currentApi = null;
let interval = null;

export const meta = {
  id: 'stopwatch',
  name: 'Stopwatch',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .sw-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; padding: 20px; box-sizing: border-box; }
    .sw-time { font-size: 42px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; margin-bottom: 16px; }
    .sw-ms { font-size: 20px; color: #888; }
    .sw-controls { display: flex; gap: 10px; margin-top: 16px; }
    .sw-btn { padding: 10px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
    .sw-start { background: #2ecc71; color: #fff; }
    .sw-stop { background: #e94560; color: #fff; }
    .sw-reset { background: #333; color: #aaa; }
    .sw-lap { background: #3498db; color: #fff; }
    .sw-laps { margin-top: 12px; max-height: 100px; overflow-y: auto; width: 100%; }
    .sw-lap-item { color: #888; font-size: 12px; text-align: center; padding: 2px 0; }
  `);

  const container = api.container;
  let elapsed = 0, running = false, startTime = 0, laps = [];

  function format(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${cs.toString().padStart(2,'0')}`;
  }

  function render() {
    container.innerHTML = `
      <div class="sw-widget">
        <div class="sw-time">${format(elapsed)}</div>
        <div class="sw-controls">
          <button class="sw-btn ${running ? 'sw-stop' : 'sw-start'}" id="sw-toggle">${running ? 'Stop' : 'Start'}</button>
          <button class="sw-btn sw-lap" id="sw-lap" ${!running ? 'disabled style="opacity:0.4"' : ''}>Lap</button>
          <button class="sw-btn sw-reset" id="sw-reset">Reset</button>
        </div>
        <div class="sw-laps">${laps.map((l, i) => `<div class="sw-lap-item">Lap ${i+1}: ${format(l)}</div>`).join('')}</div>
      </div>
    `;

    container.querySelector('#sw-toggle').addEventListener('click', toggle);
    container.querySelector('#sw-reset').addEventListener('click', reset);
    container.querySelector('#sw-lap').addEventListener('click', lap);
  }

  function toggle() {
    if (running) {
      running = false;
      clearInterval(interval);
      interval = null;
    } else {
      running = true;
      startTime = Date.now() - elapsed;
      interval = setInterval(() => { elapsed = Date.now() - startTime; render(); }, 30);
    }
    render();
  }

  function reset() {
    running = false;
    clearInterval(interval);
    interval = null;
    elapsed = 0;
    laps = [];
    render();
  }

  function lap() {
    if (running) { laps.push(elapsed); render(); }
  }

  render();
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
  interval = null;
}
