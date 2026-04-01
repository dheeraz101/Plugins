let currentApi = null;

export const meta = {
  id: 'unit-converter',
  name: 'Unit Converter',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .uc-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; padding: 16px; box-sizing: border-box; font-family: system-ui, sans-serif; }
    .uc-title { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .uc-tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .uc-tab { padding: 6px 12px; background: #252540; color: #888; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .uc-tab.active { background: #e94560; color: #fff; }
    .uc-field { margin-bottom: 10px; }
    .uc-label { color: #888; font-size: 12px; margin-bottom: 4px; }
    .uc-input { width: 100%; padding: 8px 12px; background: #252540; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box; }
    .uc-result { background: #252540; border-radius: 8px; padding: 10px 12px; color: #2ecc71; font-size: 18px; font-weight: 600; text-align: center; margin-top: 8px; }
  `);

  const container = api.container;
  let category = 'length';

  const converters = {
    length: { label: '📏 Length', units: ['meters', 'feet', 'inches', 'km', 'miles'], calc: (v, from, to) => {
      const toM = { meters: 1, feet: 0.3048, inches: 0.0254, km: 1000, miles: 1609.344 };
      return (v * toM[from] / toM[to]).toFixed(4);
    }},
    weight: { label: '⚖️ Weight', units: ['kg', 'lbs', 'grams', 'oz'], calc: (v, from, to) => {
      const toKg = { kg: 1, lbs: 0.453592, grams: 0.001, oz: 0.0283495 };
      return (v * toKg[from] / toKg[to]).toFixed(4);
    }},
    temp: { label: '🌡️ Temp', units: ['Celsius', 'Fahrenheit', 'Kelvin'], calc: (v, from, to) => {
      let c = from === 'Celsius' ? v : from === 'Fahrenheit' ? (v-32)*5/9 : v - 273.15;
      return to === 'Celsius' ? c.toFixed(2) : to === 'Fahrenheit' ? (c*9/5+32).toFixed(2) : (c+273.15).toFixed(2);
    }},
    speed: { label: '🏎️ Speed', units: ['km/h', 'mph', 'm/s', 'knots'], calc: (v, from, to) => {
      const toMs = { 'km/h': 0.277778, 'mph': 0.44704, 'm/s': 1, 'knots': 0.514444 };
      return (v * toMs[from] / toMs[to]).toFixed(4);
    }}
  };

  let fromUnit = 'meters', toUnit = 'feet', value = 1;

  function render() {
    const cat = converters[category];
    if (!cat.units.includes(fromUnit)) fromUnit = cat.units[0];
    if (!cat.units.includes(toUnit)) toUnit = cat.units[1];
    const result = cat.calc(value, fromUnit, toUnit);

    container.innerHTML = `
      <div class="uc-widget">
        <div class="uc-title">Unit Converter</div>
        <div class="uc-tabs">
          ${Object.entries(converters).map(([k,v]) => `<button class="uc-tab ${k===category?'active':''}" data-cat="${k}">${v.label}</button>`).join('')}
        </div>
        <div class="uc-field">
          <div class="uc-label">From</div>
          <div style="display:flex;gap:8px">
            <input class="uc-input" type="number" id="uc-val" value="${value}" style="flex:1">
            <select class="uc-input" id="uc-from" style="width:100px">${cat.units.map(u => `<option ${u===fromUnit?'selected':''}>${u}</option>`).join('')}</select>
          </div>
        </div>
        <div class="uc-field">
          <div class="uc-label">To</div>
          <select class="uc-input" id="uc-to">${cat.units.map(u => `<option ${u===toUnit?'selected':''}>${u}</option>`).join('')}</select>
        </div>
        <div class="uc-result">${result} ${toUnit}</div>
      </div>
    `;

    container.querySelectorAll('.uc-tab').forEach(el => el.addEventListener('click', () => { category = el.dataset.cat; render(); }));
    container.querySelector('#uc-val').addEventListener('input', e => { value = +e.target.value || 0; render(); });
    container.querySelector('#uc-from').addEventListener('change', e => { fromUnit = e.target.value; render(); });
    container.querySelector('#uc-to').addEventListener('change', e => { toUnit = e.target.value; render(); });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
