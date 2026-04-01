let currentApi = null;
let interval = null;

export const meta = {
  id: 'world-clock',
  name: 'World Clock',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  let cities = api.storage.getForPlugin(meta.id, 'cities') || [
    { name: 'New York', tz: 'America/New_York', flag: '🗽' },
    { name: 'London', tz: 'Europe/London', flag: '🇬🇧' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', flag: '🗼' },
    { name: 'Sydney', tz: 'Australia/Sydney', flag: '🦘' }
  ];

  api.injectCSS(meta.id, `
    .wc-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .wc-header { padding: 12px 16px; border-bottom: 1px solid #2a2a4a; color: #fff; font-size: 15px; font-weight: 600; }
    .wc-list { flex: 1; overflow-y: auto; padding: 8px; }
    .wc-city { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; margin-bottom: 4px; transition: background 0.15s; }
    .wc-city:hover { background: #252540; }
    .wc-flag { font-size: 24px; }
    .wc-info { flex: 1; }
    .wc-name { color: #ccc; font-size: 13px; }
    .wc-time { color: #fff; font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .wc-date { color: #666; font-size: 11px; }
    .wc-add-row { padding: 8px; border-top: 1px solid #2a2a4a; display: flex; gap: 6px; }
    .wc-add-input { flex: 1; padding: 6px 10px; background: #252540; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 12px; outline: none; }
    .wc-add-btn { padding: 6px 12px; background: #e94560; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
  `);

  const container = api.container;

  function render() {
    container.innerHTML = `
      <div class="wc-widget">
        <div class="wc-header">🌍 World Clock</div>
        <div class="wc-list">
          ${cities.map((c, i) => {
            let time = '--:--:--', date = '';
            try {
              const now = new Date();
              time = now.toLocaleTimeString('en-US', { timeZone: c.tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              date = now.toLocaleDateString('en-US', { timeZone: c.tz, weekday: 'short', month: 'short', day: 'numeric' });
            } catch {}
            return `
              <div class="wc-city">
                <div class="wc-flag">${c.flag}</div>
                <div class="wc-info">
                  <div class="wc-name">${c.name}</div>
                  <div class="wc-time">${time}</div>
                  <div class="wc-date">${date}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="wc-add-row">
          <input class="wc-add-input" placeholder="City name (e.g. Paris)" id="wc-name">
          <input class="wc-add-input" placeholder="Timezone (e.g. Europe/Paris)" id="wc-tz">
          <button class="wc-add-btn" id="wc-add">+</button>
        </div>
      </div>
    `;

    container.querySelector('#wc-add').addEventListener('click', () => {
      const name = container.querySelector('#wc-name').value.trim();
      const tz = container.querySelector('#wc-tz').value.trim();
      if (name && tz) {
        cities.push({ name, tz, flag: '🌐' });
        api.storage.setForPlugin(meta.id, 'cities', cities);
        render();
      }
    });
  }

  render();
  interval = setInterval(render, 1000);
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
  interval = null;
}
