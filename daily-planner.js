let currentApi = null;

export const meta = {
  id: 'daily-planner',
  name: 'Daily Planner',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const today = new Date().toISOString().slice(0, 10);
  let events = api.storage.getForPlugin(meta.id, 'events-' + today) || [];

  api.injectCSS(meta.id, `
    .dp-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .dp-header { padding: 12px 16px; border-bottom: 1px solid #2a2a4a; display: flex; align-items: center; gap: 10px; }
    .dp-date { color: #fff; font-size: 15px; font-weight: 600; flex: 1; }
    .dp-add { padding: 6px 12px; background: #e94560; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .dp-timeline { flex: 1; overflow-y: auto; padding: 8px; }
    .dp-hour { display: flex; gap: 8px; margin-bottom: 4px; min-height: 36px; align-items: center; }
    .dp-hour-label { width: 50px; text-align: right; color: #666; font-size: 12px; flex-shrink: 0; }
    .dp-hour-slot { flex: 1; border-left: 2px solid #333; padding: 4px 8px; min-height: 32px; }
    .dp-event { background: linear-gradient(135deg, #7c6fff33, #e9456033); border-left: 3px solid #7c6fff; padding: 6px 10px; border-radius: 0 6px 6px 0; color: #ddd; font-size: 12px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
    .dp-event-del { background: none; border: none; color: #666; cursor: pointer; margin-left: auto; font-size: 12px; }
    .dp-event-del:hover { color: #e94560; }
    .dp-now { border-left-color: #e94560 !important; }
    .dp-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .dp-modal-inner { background: #1a1a2e; border-radius: 14px; padding: 20px; width: 280px; }
    .dp-modal h3 { color: #fff; margin: 0 0 12px; font-size: 16px; }
    .dp-modal input, .dp-modal select { width: 100%; padding: 8px; background: #252540; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; margin-bottom: 10px; box-sizing: border-box; outline: none; }
    .dp-modal-actions { display: flex; gap: 8px; }
    .dp-modal-actions button { flex: 1; padding: 8px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .dp-modal-save { background: #e94560; color: #fff; }
    .dp-modal-cancel { background: #333; color: #aaa; }
  `);

  const container = api.container;
  const hours = Array.from({length: 16}, (_, i) => i + 7); // 7AM to 10PM
  const currentHour = new Date().getHours();

  function save() { api.storage.setForPlugin(meta.id, 'events-' + today, events); }

  function render() {
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const d = new Date();
    const dateStr = `${dayNames[d.getDay()]}, ${d.toLocaleDateString()}`;

    container.innerHTML = `
      <div class="dp-widget">
        <div class="dp-header">
          <div class="dp-date">📅 ${dateStr}</div>
          <button class="dp-add" id="dp-add">+ Event</button>
        </div>
        <div class="dp-timeline">
          ${hours.map(h => {
            const hourEvents = events.filter(e => e.hour === h);
            const h12 = h > 12 ? h - 12 : h;
            const ampm = h >= 12 ? 'PM' : 'AM';
            return `
              <div class="dp-hour">
                <div class="dp-hour-label">${h12}${ampm}</div>
                <div class="dp-hour-slot ${h === currentHour ? 'dp-now' : ''}">
                  ${hourEvents.map(e => `
                    <div class="dp-event">
                      <span>${e.text}</span>
                      <button class="dp-event-del" data-id="${e.id}">×</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelector('#dp-add').addEventListener('click', showAddModal);
    container.querySelectorAll('.dp-event-del').forEach(el => el.addEventListener('click', () => {
      events = events.filter(e => e.id !== el.dataset.id);
      save(); render();
    }));
  }

  function showAddModal() {
    const modal = document.createElement('div');
    modal.className = 'dp-modal';
    modal.innerHTML = `
      <div class="dp-modal-inner">
        <h3>📅 New Event</h3>
        <input id="dp-text" placeholder="Event name...">
        <select id="dp-hour">${hours.map(h => {
          const h12 = h > 12 ? h - 12 : h;
          const ampm = h >= 12 ? 'PM' : 'AM';
          return `<option value="${h}" ${h === currentHour ? 'selected' : ''}>${h12}:00 ${ampm}</option>`;
        }).join('')}</select>
        <div class="dp-modal-actions">
          <button class="dp-modal-cancel" id="dp-cancel">Cancel</button>
          <button class="dp-modal-save" id="dp-save">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#dp-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    modal.querySelector('#dp-save').addEventListener('click', () => {
      const text = modal.querySelector('#dp-text').value.trim();
      const hour = +modal.querySelector('#dp-hour').value;
      if (text) {
        events.push({ id: 'e' + Date.now(), text, hour });
        save(); render();
      }
      modal.remove();
    });
    modal.querySelector('#dp-text').focus();
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
