let currentApi = null;

export const meta = {
  id: 'color-picker',
  name: 'Color Picker',
  version: '1.3.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    [data-plugin-id="${meta.id}"].bb-plugin-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    .cp-widget { 
      position: relative;
      width: 100%; 
      height: 100%; 
      background: rgba(255, 255, 255, 0.85); 
      backdrop-filter: blur(30px) saturate(200%);
      -webkit-backdrop-filter: blur(30px) saturate(200%);
      border: 0.5px solid rgba(0, 0, 0, 0.1);
      border-radius: 30px; 
      padding: 24px; 
      box-sizing: border-box; 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      color: #1d1d1f;
    }

    .cp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .cp-title { font-size: 13px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Fix: Ensure 'X' is visible with higher contrast */
    .cp-close-btn {
      background: rgba(0,0,0,0.08);
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #000;
      transition: all 0.2s;
    }
    .cp-close-btn:hover { background: rgba(0,0,0,0.15); }

    .cp-preview { 
      width: 100%; 
      height: 90px; 
      border-radius: 18px; 
      margin-bottom: 24px; 
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
    }

    .cp-row { margin-bottom: 12px; }

    .cp-row input[type=range] { 
      width: 100%;
      -webkit-appearance: none;
      height: 8px;
      border-radius: 4px;
      outline: none;
      /* Background is handled dynamically in JS for the color hint */
    }

    .cp-row input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px; height: 22px;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.2);
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
    }

    .cp-hex-row { display: flex; gap: 10px; margin-top: 18px; }
    .cp-hex { 
      flex: 1; padding: 12px; background: rgba(0,0,0,0.04); 
      border: 1px solid rgba(0,0,0,0.05); border-radius: 14px; 
      font-family: "SF Mono", monospace; font-size: 14px; text-align: center;
      color: #1d1d1f;
    }

    .cp-copy { 
      padding: 0 20px; background: #007AFF; color: #fff; 
      border: none; border-radius: 14px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s;
    }
    .cp-copy:active { opacity: 0.8; }

    @media (prefers-color-scheme: dark) {
      .cp-widget { background: rgba(28, 28, 30, 0.9); border-color: rgba(255,255,255,0.1); color: #fff; }
      .cp-close-btn { background: rgba(255,255,255,0.15); color: #fff; }
      .cp-hex { background: rgba(255,255,255,0.08); color: #fff; }
      .cp-copy { background: #0A84FF; }
    }
  `, { global: true });

  const container = api.container;
  let color = { r: 0, g: 122, b: 255 };

  function render() {
    const hex = '#' + [color.r, color.g, color.b].map(c => c.toString(16).padStart(2,'0')).join('').toUpperCase();
    
    // Sliders show their respective color gradients
    const rGrad = `linear-gradient(to right, rgb(0,${color.g},${color.b}), rgb(255,${color.g},${color.b}))`;
    const gGrad = `linear-gradient(to right, rgb(${color.r},0,${color.b}), rgb(${color.r},255,${color.b}))`;
    const bGrad = `linear-gradient(to right, rgb(${color.r},${color.g},0), rgb(${color.r},${color.g},255))`;

    container.innerHTML = `
      <div class="cp-widget">
        <div class="cp-header">
          <span class="cp-title">Color Picker</span>
          <button class="cp-close-btn" id="cp-close-trigger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="cp-preview" style="background:${hex}"></div>
        
        <div class="cp-row">
          <input type="range" min="0" max="255" value="${color.r}" id="r-sl" style="background:${rGrad}">
        </div>
        <div class="cp-row">
          <input type="range" min="0" max="255" value="${color.g}" id="g-sl" style="background:${gGrad}">
        </div>
        <div class="cp-row">
          <input type="range" min="0" max="255" value="${color.b}" id="b-sl" style="background:${bGrad}">
        </div>
        
        <div class="cp-hex-row">
          <input class="cp-hex" value="${hex}" readonly>
          <button class="cp-copy" id="cp-copy-trigger">Copy</button>
        </div>
      </div>
    `;

    // FIXED: Stop propagation on mousedown so Blank Board doesn't drag the plugin
    const stopDrag = (e) => e.stopPropagation();

    ['r', 'g', 'b'].forEach(ch => {
      const el = container.querySelector(`#${ch}-sl`);
      el.addEventListener('mousedown', stopDrag); // Prevents core dragging
      el.oninput = (e) => {
        color[ch] = parseInt(e.target.value);
        render();
      };
    });

    container.querySelector('#cp-close-trigger').onclick = (e) => {
      e.stopPropagation();
      api.removeContainer(meta.id);
      api.removeCSS(meta.id);
    };

    container.querySelector('#cp-copy-trigger').onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(hex);
      api.notify('Hex code copied', 'success');
    };
  }

  render();
}

export function teardown() {
  if (currentApi) {
    currentApi.removeCSS(meta.id);
    currentApi.removeContainer(meta.id);
  }
}