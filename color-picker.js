let currentApi = null;

export const meta = {
  id: 'color-picker',
  name: 'Color Picker',
  version: '1.1.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .cp-widget { 
      position: relative;
      width: 100%; 
      height: 100%; 
      background: rgba(255, 255, 255, 0.8); 
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 18px; 
      padding: 20px; 
      box-sizing: border-box; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      color: #1d1d1f;
    }

    .cp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .cp-title {
      font-size: 14px;
      font-weight: 600;
      color: #1d1d1f;
      letter-spacing: -0.01em;
    }

    .cp-close-btn {
      background: rgba(0,0,0,0.05);
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #86868b;
    }

    .cp-close-btn:hover {
      background: rgba(255, 59, 48, 0.1);
      color: #FF3B30;
    }

    .cp-preview { 
      width: 100%; 
      height: 90px; 
      border-radius: 12px; 
      margin-bottom: 20px; 
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
      transition: background 0.1s ease;
    }

    .cp-label-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .cp-label { 
      color: #86868b; 
      font-size: 11px; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cp-val { 
      color: #1d1d1f; 
      font-size: 12px; 
      font-weight: 500;
      font-variant-numeric: tabular-nums; 
    }

    .cp-row { 
      display: flex; 
      align-items: center; 
      margin-bottom: 14px; 
    }

    .cp-row input[type=range] { 
      flex: 1; 
      -webkit-appearance: none;
      background: rgba(0,0,0,0.05);
      height: 4px;
      border-radius: 2px;
      outline: none;
    }

    .cp-row input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
    }

    .cp-hex-row { 
      display: flex; 
      gap: 10px; 
      margin-top: 10px; 
    }

    .cp-hex { 
      flex: 1; 
      padding: 10px; 
      background: rgba(0,0,0,0.03); 
      border: 1px solid rgba(0,0,0,0.05); 
      border-radius: 10px; 
      color: #1d1d1f; 
      font-size: 14px; 
      font-family: "SF Mono", monospace; 
      text-align: center; 
      outline: none;
    }

    .cp-copy { 
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px; 
      background: #0071e3; 
      color: #fff; 
      border: none; 
      border-radius: 10px; 
      cursor: pointer; 
      font-weight: 500; 
      font-size: 13px;
      transition: background 0.2s;
    }

    .cp-copy:hover { background: #0077ed; }
    .cp-copy:active { transform: scale(0.96); }

    @media (prefers-color-scheme: dark) {
      .cp-widget { background: rgba(28, 28, 30, 0.8); border-color: rgba(255,255,255,0.1); color: #fff; }
      .cp-title { color: #fff; }
      .cp-label { color: #a1a1a6; }
      .cp-val { color: #fff; }
      .cp-hex { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.1); }
      .cp-row input[type=range] { background: rgba(255,255,255,0.1); }
      .cp-close-btn { background: rgba(255,255,255,0.1); }
    }
  `);

  const container = api.container;
  let r = 0, g = 113, b = 227; // Default Apple Blue

  function updateColor(channel, val) {
    if (channel === 'r') r = +val;
    if (channel === 'g') g = +val;
    if (channel === 'b') b = +val;
    
    const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
    
    // Update UI elements without full re-render for performance
    container.querySelector('.cp-preview').style.background = hex;
    container.querySelector('#cp-hex').value = hex.toUpperCase();
    container.querySelector('#val-r').textContent = r;
    container.querySelector('#val-g').textContent = g;
    container.querySelector('#val-b').textContent = b;
  }

  function render() {
    const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
    container.innerHTML = `
      <div class="cp-widget">
        <div class="cp-header">
          <span class="cp-title">Color Picker</span>
          <button class="cp-close-btn" id="cp-close" title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="cp-preview" style="background:${hex}"></div>
        
        <div class="cp-label-row"><span class="cp-label">Red</span><span class="cp-val" id="val-r">${r}</span></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${r}" id="cp-r"></div>
        
        <div class="cp-label-row"><span class="cp-label">Green</span><span class="cp-val" id="val-g">${g}</span></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${g}" id="cp-g"></div>
        
        <div class="cp-label-row"><span class="cp-label">Blue</span><span class="cp-val" id="val-b">${b}</span></div>
        <div class="cp-row"><input type="range" min="0" max="255" value="${b}" id="cp-b"></div>
        
        <div class="cp-hex-row">
          <input class="cp-hex" value="${hex.toUpperCase()}" readonly id="cp-hex">
          <button class="cp-copy" id="cp-copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
          </button>
        </div>
      </div>
    `;

    container.querySelector('#cp-r').oninput = e => updateColor('r', e.target.value);
    container.querySelector('#cp-g').oninput = e => updateColor('g', e.target.value);
    container.querySelector('#cp-b').oninput = e => updateColor('b', e.target.value);

    container.querySelector('#cp-copy').onclick = () => {
      const hexVal = container.querySelector('#cp-hex').value;
      navigator.clipboard.writeText(hexVal);
      api.notify('Copied ' + hexVal, 'success');
    };

    container.querySelector('#cp-close').onclick = () => {
      // Logic to unload the plugin via the core API
      if (api.unloadPlugin) {
        api.unloadPlugin(meta.id);
      } else {
        // Fallback if unloadPlugin isn't exposed directly
        container.innerHTML = '';
        api.removeCSS(meta.id);
      }
    };
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}