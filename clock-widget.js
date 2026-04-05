let currentApi = null;
let interval = null;
let resizeHandler = null;

export const meta = {
  id: 'clock-widget',
  name: 'Clock Widget Pro',
  version: '3.0.2',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    /* Kill outer container artifacts (IMPORTANT) */
    #clock-widget,
    .bb-plugin-container[data-plugin-id="clock-widget"] {
      background: transparent !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      overflow: visible !important;
    }

    .cw-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
    }

    /* Actual card */
    .cw-card {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 28px;
      border-radius: 32px;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      box-sizing: border-box;

      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 0.5px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);

      font-family: -apple-system, "SF Pro Display", system-ui;
      isolation: isolate;
    }

    /* Close button FIXED */
    .cw-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 30px;
      height: 30px;
      border-radius: 50%;

      background: rgba(0, 0, 0, 0.05);
      border: none;

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;
      z-index: 10;

      transition: all 0.2s ease;
    }

    .cw-close:hover {
      background: rgba(255, 59, 48, 0.15);
      color: #FF3B30;
      transform: scale(1.05);
    }

    .cw-close:active {
      transform: scale(0.9);
    }

    /* Content */
    .cw-time {
      font-size: 72px;
      font-weight: 700;
      letter-spacing: -0.04em;
      color: #1d1d1f;
      margin: 0;
      line-height: 1;
    }

    .cw-date {
      margin-top: 10px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #86868b;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .cw-card {
        background: rgba(28, 28, 30, 0.85);
        border: 0.5px solid rgba(255,255,255,0.1);
      }

      .cw-time { color: #fff; }
      .cw-date { color: #a1a1a6; }

      .cw-close {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
    }
  `);

  const container = api.container;

  function render() {
    container.innerHTML = `
      <div class="cw-container">
        <div class="cw-card">

          <button class="cw-close" id="btn-close-clock">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 3.5L10.5 10.5M3.5 10.5L10.5 3.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"/>
            </svg>
          </button>

          <div class="cw-time" id="display-time">00:00</div>
          <div class="cw-date" id="display-date">MONDAY, JAN 1</div>

        </div>
      </div>
    `;

    const closeBtn = container.querySelector('#btn-close-clock');

    closeBtn.onclick = (e) => {
      e.stopPropagation();

      // SAME STRATEGY AS DICE ROLLER (important!)
      if (api.removeContainer) {
        api.removeContainer(meta.id);
      } else if (api.unloadPlugin) {
        api.unloadPlugin(meta.id);
      } else {
        teardown();
      }
    };
  }

  const update = () => {
    const timeEl = container.querySelector('#display-time');
    const dateEl = container.querySelector('#display-date');
    if (!timeEl || !dateEl) return;

    const now = new Date();

    timeEl.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    dateEl.textContent = now.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();

    // ✅ Stable scaling (fixed)
    const baseWidth = 320;
    const scale = Math.min(container.offsetWidth / baseWidth, 1);

    timeEl.style.fontSize = (64 * scale) + 'px';
    dateEl.style.fontSize = (14 * scale) + 'px';
  };

  render();
  interval = setInterval(update, 1000);
  
  // Handle board resizing from core eventBus
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
  // Clear any remaining HTML to ensure "completely hides" requirement
  if (currentApi && currentApi.container) {
    currentApi.container.innerHTML = '';
  }
}