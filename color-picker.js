let currentApi = null;

export const meta = {
  id: 'color-picker',
  name: 'Color Picker',
  version: '1.4.1',
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
      background: #1e1e1e;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      color: #fff;
      user-select: none;
    }

    .cp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .cp-title {
      font-size: 12px;
      font-weight: 700;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .cp-close-btn {
      background: rgba(255,255,255,0.12);
      border: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      font-size: 13px;
      line-height: 1;
      transition: background 0.2s, transform 0.1s;
    }

    .cp-close-btn:hover {
      background: #ff4d4f; /* red */
      color: #fff;
      box-shadow: 0 0 8px rgba(255, 77, 79, 0.6);
    }

    .cp-close-btn:active {
      background: #d9363e; /* darker red */
      transform: scale(0.92);
    }

    .cp-preview {
      width: 100%;
      height: 80px;
      border-radius: 14px;
      margin-bottom: 20px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    /* Slider row wrapper */
    .cp-row {
      margin-bottom: 14px;
    }

    /* The custom slider track container */
    .cp-slider-track {
      position: relative;
      width: 100%;
      height: 14px;
      border-radius: 7px;
      cursor: pointer;
      /* background set inline per channel */
    }

    /* Native range sits on top, fully transparent so our track shows through */
    .cp-slider-track input[type=range] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      opacity: 0;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      /* IMPORTANT: pointer-events must be enabled */
      pointer-events: all;
    }

    /* Visible thumb overlay */
    .cp-thumb {
      position: absolute;
      top: 50%;
      width: 22px;
      height: 22px;
      background: #fff;
      border: 2px solid rgba(0,0,0,0.15);
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: box-shadow 0.15s;
    }

    .cp-slider-track:active .cp-thumb {
      box-shadow: 0 0 0 4px rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.35);
    }

    /* Label above each slider */
    .cp-label {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .cp-hex-row {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    .cp-hex {
      flex: 1;
      padding: 11px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: 14px;
      text-align: center;
      color: #fff;
      outline: none;
    }

    .cp-copy {
      padding: 0 18px;
      background: #007AFF;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }

    .cp-copy:hover { background: #0066dd; }
    .cp-copy:active { transform: scale(0.96); }
  `, { global: true });

  const container = api.container;
  let color = { r: 44, g: 199, b: 255 };

  // Build DOM once — never use innerHTML again
  function buildWidget() {
    container.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'cp-widget';

    // Header
    const header = document.createElement('div');
    header.className = 'cp-header';
    const title = document.createElement('span');
    title.className = 'cp-title';
    title.textContent = 'Color Picker';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cp-close-btn';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => container.remove());
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Preview swatch
    const preview = document.createElement('div');
    preview.className = 'cp-preview';

    // Sliders
    const channels = [
      { key: 'r', label: 'Red',   from: (c) => `rgb(0,${c.g},${c.b})`,   to: (c) => `rgb(255,${c.g},${c.b})` },
      { key: 'g', label: 'Green', from: (c) => `rgb(${c.r},0,${c.b})`,   to: (c) => `rgb(${c.r},255,${c.b})` },
      { key: 'b', label: 'Blue',  from: (c) => `rgb(${c.r},${c.g},0)`,   to: (c) => `rgb(${c.r},${c.g},255)` },
    ];

    const sliderTracks = {};
    const sliderThumbs = {};
    const sliderInputs = {};

    channels.forEach(({ key, label, from, to }) => {
      const row = document.createElement('div');
      row.className = 'cp-row';

      const lbl = document.createElement('div');
      lbl.className = 'cp-label';
      lbl.textContent = label;

      const track = document.createElement('div');
      track.className = 'cp-slider-track';

      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0;
      input.max = 255;
      input.value = color[key];

      const thumb = document.createElement('div');
      thumb.className = 'cp-thumb';

      track.appendChild(input);
      track.appendChild(thumb);
      row.appendChild(lbl);
      row.appendChild(track);

      sliderTracks[key] = track;
      sliderThumbs[key] = thumb;
      sliderInputs[key] = input;

      // Use both 'input' and 'change' for maximum compatibility
      input.addEventListener('input', () => {
        color[key] = parseInt(input.value, 10);
        updateVisuals();
      });

      // Also handle pointer events directly on track for smoother dragging
      track.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); // prevent outer makeDraggable from hijacking
        track.setPointerCapture(e.pointerId);
        updateColorFromTrackEvent(e, key, track, input);
      });

      track.addEventListener('pointermove', (e) => {
        if (e.buttons === 0) return;
        e.stopPropagation();
        updateColorFromTrackEvent(e, key, track, input);
      });

      track.addEventListener('pointerup', (e) => {
        e.stopPropagation();
      });

      widget.appendChild(row);
    });

    // Hex row
    const hexRow = document.createElement('div');
    hexRow.className = 'cp-hex-row';

    const hexInput = document.createElement('input');
    hexInput.className = 'cp-hex';
    hexInput.type = 'text';
    hexInput.readOnly = true;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'cp-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(hexInput.value).catch(() => {});
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    });

    hexRow.appendChild(hexInput);
    hexRow.appendChild(copyBtn);

    widget.insertBefore(header, widget.firstChild);
    widget.appendChild(preview);
    channels.forEach(({ key }) => {
      // rows were already appended above, re-order: header -> preview -> rows -> hexrow
    });
    widget.appendChild(hexRow);

    container.appendChild(widget);

    function updateColorFromTrackEvent(e, key, track, input) {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const val = Math.round(ratio * 255);
      color[key] = val;
      input.value = val;
      updateVisuals();
    }

    function updateVisuals() {
      const { r, g, b } = color;
      const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

      preview.style.background = `rgb(${r},${g},${b})`;
      hexInput.value = hex;

      // Update each slider track gradient and thumb position
      channels.forEach(({ key, from, to }) => {
        sliderTracks[key].style.background = `linear-gradient(to right, ${from(color)}, ${to(color)})`;
        const ratio = color[key] / 255;
        sliderThumbs[key].style.left = `calc(${ratio * 100}% + ${(0.5 - ratio) * 22}px)`;
        sliderInputs[key].value = color[key];
      });
    }

    // Initial render
    updateVisuals();
  }

  // Prevent the outer makeDraggable from stealing slider interactions
  // by stopping propagation on the widget area during pointer interactions
  container.addEventListener('pointerdown', (e) => {
    const isSliderArea = e.target.closest('.cp-slider-track');
    if (isSliderArea) {
      e.stopImmediatePropagation();
    }
  }, true); // capture phase — fires before makeDraggable

  buildWidget();

  // Dragging should only work via the header title area
  const widget = container.querySelector('.cp-widget');
  if (widget) {
    const header = widget.querySelector('.cp-header');
    if (header) {
      api.makeDraggable(container, header);
    }
  }
}