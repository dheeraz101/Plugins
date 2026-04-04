let currentApi = null;
let interval = null;
let resizeHandler = null;

export const meta = {
  id: 'clock-widget',
  name: 'Clock Widget Pro',
  version: '3.0.1',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .clock-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      /* Apple Glassmorphism */
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(30px) saturate(200%);
      -webkit-backdrop-filter: blur(30px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 32px;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }

    /* Hide the boxy look by making the container feel like a floating object */
    .clock-container:hover {
      background: rgba(255, 255, 255, 0.5);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .clock-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      background: rgba(0, 0, 0, 0.08);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease, background 0.2s ease;
      color: #1d1d1f;
      padding: 0;
    }

    .clock-container:hover .clock-close {
      opacity: 1;
    }

    .clock-close:hover {
      background: rgba(255, 59, 48, 0.15);
      color: #FF3B30;
    }

    .clock-time {
      font-size: 72px; /* Increased Size */
      font-weight: 700;
      letter-spacing: -0.05em;
      color: #1d1d1f;
      line-height: 1;
      margin: 0;
    }

    .clock-date {
      font-size: 16px;
      font-weight: 500;
      color: #86868b;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .clock-container {
        background: rgba(28, 28, 30, 0.4);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .clock-time { color: #ffffff; }
      .clock-date { color: #a1a1a6; }
      .clock-close { background: rgba(255, 255, 255, 0.1); color: #ffffff; }
    }
  `);

  const container = api.container;

  function render() {
    container.innerHTML = `
      <div class="clock-container">
        <button class="clock-close" id="btn-close-clock">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="clock-time" id="display-time">00:00</div>
        <div class="clock-date" id="display-date">MONDAY, JAN 1</div>
      </div>
    `;

    const closeBtn = container.querySelector('#btn-close-clock');
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      // Use the core unload function to completely remove the plugin
      if (api.unloadPlugin) {
        api.unloadPlugin(meta.id);
      } else {
        // Fallback teardown if unloadPlugin isn't exposed directly
        teardown();
        container.innerHTML = '';
      }
    };
  }

  const update = () => {
    const timeEl = container.querySelector('#display-time');
    const dateEl = container.querySelector('#display-date');
    if (!timeEl || !dateEl) return;

    const now = new Date();
    
    // Format: 10:45
    timeEl.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    // Format: WEDNESDAY, APRIL 5
    dateEl.textContent = now.toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase();

    // Auto-scaling logic for the high-value "Big Clock" feel
    const scale = Math.min(container.offsetWidth / 300, container.offsetHeight / 200);
    timeEl.style.fontSize = Math.max(32, 72 * scale) + 'px';
    dateEl.style.fontSize = Math.max(10, 16 * scale) + 'px';
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