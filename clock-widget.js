let currentApi = null;
let interval = null;
let resizeHandler = null;

export const meta = {
  id: 'clock-widget',
  name: 'Clock Widget',
  version: '3.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .clock-card {
      position: relative;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(25px) saturate(190%);
      -webkit-backdrop-filter: blur(25px) saturate(190%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      color: #1d1d1f;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .clock-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 26px;
      height: 26px;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: all 0.2s ease;
      color: #86868b;
      z-index: 10;
    }

    .clock-card:hover .clock-close {
      opacity: 1;
    }

    .clock-close:hover {
      background: rgba(255, 59, 48, 0.1);
      color: #FF3B30;
    }

    .clock-greeting {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #86868b;
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }

    .clock-time {
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.04em;
      color: #1d1d1f;
    }

    .clock-date {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #424245;
    }

    @media (prefers-color-scheme: dark) {
      .clock-card {
        background: rgba(28, 28, 30, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .clock-time { color: #fff; }
      .clock-date { color: #a1a1a6; }
      .clock-greeting { color: #a1a1a6; }
      .clock-close { background: rgba(255, 255, 255, 0.1); }
    }
  `);

  const container = api.container;
  container.innerHTML = `
    <div class="clock-card">
      <button class="clock-close" id="close-clock">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="clock-greeting" id="greeting"></div>
      <div class="clock-time" id="time"></div>
      <div class="clock-date" id="date"></div>
    </div>
  `;

  const timeEl = container.querySelector('#time');
  const dateEl = container.querySelector('#date');
  const greetEl = container.querySelector('#greeting');

  const update = () => {
    const now = new Date();
    
    // Time
    timeEl.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).replace(/\s?[APM]{2}/, '');

    // Date
    dateEl.textContent = now.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'long', 
      day: 'numeric' 
    });

    // Dynamic Greeting & Icon
    const hour = now.getHours();
    let greet = "Good Evening";
    let icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    
    if (hour < 12) {
      greet = "Good Morning";
      icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path></svg>`;
    } else if (hour < 17) {
      greet = "Good Afternoon";
      icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    }
    
    greetEl.innerHTML = `${icon} ${greet}`;

    // Responsiveness
    const scale = Math.min(container.offsetWidth / 240, container.offsetHeight / 160);
    timeEl.style.fontSize = (48 * scale) + 'px';
    dateEl.style.fontSize = (14 * scale) + 'px';
    greetEl.style.fontSize = (13 * scale) + 'px';
  };

  container.querySelector('#close-clock').onclick = () => {
    if (api.unloadPlugin) api.unloadPlugin(meta.id);
  };

  interval = setInterval(update, 1000);
  resizeHandler = api.debounce(update, 100);
  api.bus.on('board:resize', resizeHandler);
  
  update();
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) {
    currentApi.removeCSS(meta.id);
    currentApi.bus.off('board:resize', resizeHandler);
  }
}