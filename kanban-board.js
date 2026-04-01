let currentApi = null;

export const meta = {
  id: 'kanban-board',
  name: 'Kanban Board',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  const defaultData = {
    columns: [
      { id: 'todo', title: '📋 To Do', cards: [{ id: 'c1', text: 'Welcome! Drag me around' }] },
      { id: 'doing', title: '🚀 In Progress', cards: [] },
      { id: 'done', title: '✅ Done', cards: [] }
    ]
  };
  let data = api.storage.getForPlugin(meta.id, 'kanban') || defaultData;
  let dragCard = null, dragFrom = null;

  api.injectCSS(meta.id, `
    .kb-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .kb-header { padding: 12px 16px; color: #fff; font-size: 15px; font-weight: 600; border-bottom: 1px solid #2a2a4a; }
    .kb-board { flex: 1; display: flex; gap: 8px; padding: 8px; overflow-x: auto; }
    .kb-col { flex: 1; min-width: 140px; background: #252540; border-radius: 10px; display: flex; flex-direction: column; }
    .kb-col-title { padding: 10px 12px; font-size: 13px; font-weight: 600; color: #ccc; border-bottom: 1px solid #2a2a4a; }
    .kb-cards { flex: 1; padding: 8px; overflow-y: auto; min-height: 60px; }
    .kb-card { background: #1a1a2e; border-radius: 8px; padding: 10px; margin-bottom: 6px; color: #ddd; font-size: 13px; cursor: grab; border: 1px solid transparent; transition: all 0.15s; }
    .kb-card:hover { border-color: #444; }
    .kb-card.dragging { opacity: 0.5; border-color: #e94560; }
    .kb-add { margin: 8px; padding: 8px; background: none; border: 1px dashed #444; border-radius: 8px; color: #666; cursor: pointer; font-size: 12px; text-align: center; }
    .kb-add:hover { border-color: #e94560; color: #e94560; }
    .kb-card-del { float: right; background: none; border: none; color: #555; cursor: pointer; font-size: 12px; padding: 0; }
    .kb-card-del:hover { color: #e94560; }
  `);

  const container = api.container;

  function save() { api.storage.setForPlugin(meta.id, 'kanban', data); }

  function render() {
    container.innerHTML = `
      <div class="kb-widget">
        <div class="kb-header">📌 Kanban Board</div>
        <div class="kb-board">
          ${data.columns.map(col => `
            <div class="kb-col" data-col="${col.id}">
              <div class="kb-col-title">${col.title} (${col.cards.length})</div>
              <div class="kb-cards" data-col="${col.id}">
                ${col.cards.map(card => `
                  <div class="kb-card" draggable="true" data-card="${card.id}" data-from="${col.id}">
                    <button class="kb-card-del" data-card="${card.id}" data-from="${col.id}">×</button>
                    ${card.text}
                  </div>
                `).join('')}
              </div>
              <button class="kb-add" data-col="${col.id}">+ Add card</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Drag and drop
    container.querySelectorAll('.kb-card').forEach(el => {
      el.addEventListener('dragstart', e => {
        dragCard = el.dataset.card;
        dragFrom = el.dataset.from;
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
    });

    container.querySelectorAll('.kb-cards').forEach(el => {
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', () => {
        const toCol = el.dataset.col;
        if (!dragCard || !dragFrom) return;
        const fromColumn = data.columns.find(c => c.id === dragFrom);
        const toColumn = data.columns.find(c => c.id === toCol);
        const cardIdx = fromColumn.cards.findIndex(c => c.id === dragCard);
        if (cardIdx > -1) {
          const [card] = fromColumn.cards.splice(cardIdx, 1);
          toColumn.cards.push(card);
          save(); render();
          api.bus.emit('kanban:card:moved', { card: card.id, from: dragFrom, to: toCol });
        }
        dragCard = null; dragFrom = null;
      });
    });

    // Add card
    container.querySelectorAll('.kb-add').forEach(el => el.addEventListener('click', () => {
      const text = prompt('Card title:');
      if (!text) return;
      const col = data.columns.find(c => c.id === el.dataset.col);
      col.cards.push({ id: 'c' + Date.now(), text });
      save(); render();
    }));

    // Delete card
    container.querySelectorAll('.kb-card-del').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      const col = data.columns.find(c => c.id === el.dataset.from);
      col.cards = col.cards.filter(c => c.id !== el.dataset.card);
      save(); render();
    }));
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
