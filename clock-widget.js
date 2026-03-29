let currentApi = null;
let interval = null;
let resizeHandler = null;

export const meta = {
  id: 'clock-widget',
  name: 'Clock Widget',
  version: '2.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .clock {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      color: #7c6fff;
      background: #161618;
      border-radius: 14px;
    }
  `);

  const container = api.container;

  container.innerHTML = `<div class="clock"></div>`;
  const el = container.querySelector('.clock');

  const update = () => {
    el.textContent = new Date().toLocaleTimeString();
    el.style.fontSize = Math.max(container.offsetWidth / 7, 18) + 'px';
  };

  interval = setInterval(update, 1000);

  resizeHandler = api.debounce(update, 150);
  api.bus.on('board:resize', resizeHandler);

  update();
}

export function teardown() {
  if (!currentApi) return;

  clearInterval(interval);

  currentApi.bus.off('board:resize', resizeHandler);
  currentApi.removeCSS(meta.id);

  interval = null;
  resizeHandler = null;
  currentApi = null;
}