let currentApi = null;

export const meta = {
  id: 'color-picker',
  name: 'Color Picker',
  version: '1.2.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  // GLOBAL: true is critical here to strip the core's default box styles
  api.injectCSS(meta.id, `
    /* 1. Reset the parent container provided by Blank Board */
    [data-plugin-id="${meta.id}"].bb-plugin-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    /* 2. Your Apple-style Widget */
    .cp-widget { 
      position: relative;
      width: 100%; 
      height: 100%; 
      background: rgba(255, 255, 255, 0.8); 
      backdrop-filter: blur(25px) saturate(180%);
      -webkit-backdrop-filter: blur(25px) saturate(180%);
      border: 0.5px solid rgba(0, 0, 0, 0.1);
      border-radius: 28px; 
      padding: 22px; 
      box-sizing: border-box; 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 15px 35px rgba(0,0,0,0.12);
      color: #1d1d1f;
    }

    .cp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .cp-title { font-size: 13px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.05em; }

    .cp-close-btn {
      background: rgba(0,0,0,0.05);
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #1d1d1f;
    }

    .cp-preview { 
      width: 100%; 
      height: 100px; 
      border-radius: 16px; 
      margin-bottom: 20px; 
      border: 0.5px solid rgba(0,0,0,0.05);
    }

    .cp-row input[type=range] { 
      width: 100%;
      -webkit-appearance: none;
      background: rgba(0,0,0,0.05);
      height: 6px;
      border-radius: 3px;
      margin: 10px 0;
    }

    .cp-row input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px; height: 20px;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.15);
      border-radius: 50%;
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    }

    .cp-hex-row { display: flex; gap: 8px; margin-top: 12px; }
    .cp-hex { 
      flex: 1; padding: 12px; background: rgba(0,0,0,0.03); 
      border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; 
      font-family: "SF Mono", monospace; font-size: 14px; text-align: center;
    }

    .cp-copy { 
      padding: 0 20px; background: #0071e3; color: #fff; 
      border: none; border-radius: 12px; font-weight: 600; cursor: pointer; 
    }

    @media (prefers-color-scheme: dark) {
      .cp-widget { background: rgba(28, 28, 30, 0.85); border-color: rgba(255,255,255,0.1); color: #fff; }
      .cp-hex { background: rgba(255,255,255,0.05); color: #fff; }
    }
  `, { global: true }); // Crucial for overriding Blank Board's .bb-plugin-box

  const container = api.container;
  let color = { r: 0, g: 113, b: 227 };

  function render() {
    const hex = '#' + [color.r, color.g, color.b].map(c => c.toString(16).padStart(2,'0')).join('').toUpperCase();
    
    container.innerHTML = `
      <div class="cp-widget">
        <div class="cp-header">
          <span class="cp-title">Color</span>
          <button class="cp-close-btn" id="cp-close-trigger">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="cp-preview" style="background:${hex}"></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${color.r}" id="r-sl"></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${color.g}" id="g-sl"></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${color.b}" id="b-sl"></div>
        <div class="cp-hex-row">
          <input class="cp-hex" value="${hex}" readonly>
          <button class="cp-copy" id="cp-copy-trigger">Copy</button>
        </div>
      </div>
    `;

    // RE-DOCK / CLOSE LOGIC
    container.querySelector('#cp-close-trigger').onclick = () => {
      // Correct cleanup using your api.js methods
      api.removeContainer(meta.id);
      api.removeCSS(meta.id);
    };

    container.querySelector('#cp-copy-trigger').onclick = () => {
      navigator.clipboard.writeText(hex);
      api.notify('Copied to clipboard', 'success');
    };

    ['r', 'g', 'b'].forEach(ch => {
      container.querySelector(`#${ch}-sl`).oninput = (e) => {
        color[ch] = parseInt(e.target.value);
        render(); // Efficient enough for simple widgets
      };
    });
  }

  render();
}

export function teardown() {
  if (currentApi) {
    currentApi.removeCSS(meta.id);
    currentApi.removeContainer(meta.id);
  }
}