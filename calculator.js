let currentApi = null;

export const meta = {
  id: 'calculator',
  name: 'Calculator',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .calc { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .calc-display { padding: 20px; text-align: right; color: #fff; font-size: 32px; font-weight: 300; min-height: 40px; word-break: break-all; }
    .calc-expr { padding: 0 20px 10px; text-align: right; color: #666; font-size: 14px; min-height: 20px; }
    .calc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; padding: 1px; flex: 1; }
    .calc-btn { border: none; font-size: 18px; cursor: pointer; transition: background 0.15s; font-family: inherit; }
    .calc-btn-num { background: #252540; color: #fff; }
    .calc-btn-op { background: #e94560; color: #fff; }
    .calc-btn-fn { background: #333355; color: #aaa; }
    .calc-btn:hover { filter: brightness(1.2); }
    .calc-btn:active { filter: brightness(0.8); }
  `);

  const container = api.container;
  let display = '0';
  let expr = '';
  let resetNext = false;

  function evaluate(expr) {
    try {
      return Function('"use strict"; return (' + expr + ')')();
    } catch { return 'Error'; }
  }

  function render() {
    container.innerHTML = `
      <div class="calc">
        <div class="calc-expr">${expr}</div>
        <div class="calc-display">${display}</div>
        <div class="calc-grid">
          ${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','±','='].map((b, i) => {
            let cls = 'calc-btn-num';
            if ([3,7,11,15,19].includes(i)) cls = 'calc-btn-op';
            if ([0,1,2].includes(i)) cls = 'calc-btn-fn';
            return `<button class="calc-btn ${cls}" data-val="${b}">${b}</button>`;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => handle(btn.dataset.val));
    });
  }

  function handle(v) {
    if (v === 'C') { display = '0'; expr = ''; resetNext = false; render(); return; }
    if (v === '±') { display = String(-parseFloat(display)); render(); return; }
    if (v === '%') { display = String(parseFloat(display) / 100); render(); return; }
    if (v === '=') {
      expr += display;
      const result = evaluate(expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-'));
      display = String(Math.round(result * 1e10) / 1e10);
      expr = '';
      resetNext = true;
      render();
      return;
    }
    const ops = {'÷':'/','×':'*','−':'-','+':'+'};
    if (ops[v]) {
      expr += display + ops[v];
      resetNext = true;
      render();
      return;
    }
    if (resetNext) { display = ''; resetNext = false; }
    if (v === '.' && display.includes('.')) return;
    display = display === '0' && v !== '.' ? v : display + v;
    render();
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
