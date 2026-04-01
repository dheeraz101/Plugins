let currentApi = null;

export const meta = {
  id: 'drawing-canvas',
  name: 'Drawing Canvas',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .dc-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .dc-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #2a2a4a; flex-wrap: wrap; }
    .dc-tool { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #444; background: #252540; color: #aaa; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .dc-tool.active { background: #e94560; border-color: #e94560; color: #fff; }
    .dc-color { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #444; cursor: pointer; }
    .dc-color.active { border-color: #fff; box-shadow: 0 0 0 2px #e94560; }
    .dc-size { width: 60px; accent-color: #e94560; }
    .dc-canvas-wrap { flex: 1; overflow: hidden; position: relative; }
    .dc-canvas { width: 100%; height: 100%; cursor: crosshair; background: #fff; display: block; }
    .dc-clear { margin-left: auto; padding: 6px 12px; background: #333; color: #aaa; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .dc-clear:hover { background: #e94560; color: #fff; }
  `);

  const container = api.container;
  let drawing = false, tool = 'pen', color = '#e94560', size = 3, lastX = 0, lastY = 0;
  const colors = ['#e94560','#f39c12','#f1c40f','#2ecc71','#3498db','#7c6fff','#1a1a2e','#ffffff'];
  let canvas, ctx;

  function render() {
    container.innerHTML = `
      <div class="dc-widget">
        <div class="dc-toolbar">
          <button class="dc-tool ${tool==='pen'?'active':''}" data-t="pen" title="Pen">✏️</button>
          <button class="dc-tool ${tool==='eraser'?'active':''}" data-t="eraser" title="Eraser">🧹</button>
          <div style="width:1px;height:20px;background:#444"></div>
          ${colors.map(c => `<div class="dc-color ${c===color?'active':''}" data-c="${c}" style="background:${c}"></div>`).join('')}
          <div style="width:1px;height:20px;background:#444"></div>
          <input type="range" class="dc-size" min="1" max="20" value="${size}" id="dc-size" title="Brush size">
          <span style="color:#888;font-size:12px">${size}px</span>
          <button class="dc-clear" id="dc-clear">🗑️ Clear</button>
        </div>
        <div class="dc-canvas-wrap">
          <canvas class="dc-canvas" id="dc-canvas"></canvas>
        </div>
      </div>
    `;

    canvas = container.querySelector('#dc-canvas');
    const wrap = container.querySelector('.dc-canvas-wrap');
    canvas.width = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    // Touch support
    canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; startDraw({offsetX: t.clientX - canvas.getBoundingClientRect().left, offsetY: t.clientY - canvas.getBoundingClientRect().top}); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; draw({offsetX: t.clientX - canvas.getBoundingClientRect().left, offsetY: t.clientY - canvas.getBoundingClientRect().top}); });
    canvas.addEventListener('touchend', () => drawing = false);

    container.querySelectorAll('.dc-tool').forEach(el => el.addEventListener('click', () => { tool = el.dataset.t; render(); }));
    container.querySelectorAll('.dc-color').forEach(el => el.addEventListener('click', () => { color = el.dataset.c; render(); }));
    container.querySelector('#dc-size').addEventListener('input', e => { size = +e.target.value; render(); });
    container.querySelector('#dc-clear').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  function startDraw(e) {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  }

  function draw(e) {
    if (!drawing) return;
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
