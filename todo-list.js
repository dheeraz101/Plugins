let currentApi = null;
let todos = [];

export const meta = {
  id: 'todo-list',
  name: 'Todo List',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;
  todos = api.storage.getForPlugin(meta.id, 'todos') || [];

  api.injectCSS(meta.id, `
    .todo { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .todo-header { padding: 16px; border-bottom: 1px solid #2a2a4a; }
    .todo-header h3 { margin: 0 0 10px; color: #fff; font-size: 16px; }
    .todo-input-row { display: flex; gap: 8px; }
    .todo-input { flex: 1; padding: 8px 12px; border: 1px solid #333; border-radius: 8px; background: #252540; color: #fff; font-size: 14px; outline: none; }
    .todo-add { padding: 8px 14px; background: #e94560; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .todo-list { flex: 1; overflow-y: auto; padding: 8px; }
    .todo-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; margin-bottom: 4px; transition: background 0.15s; }
    .todo-item:hover { background: #252540; }
    .todo-item.done .todo-text { text-decoration: line-through; color: #555; }
    .todo-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #555; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .todo-check.checked { background: #2ecc71; border-color: #2ecc71; }
    .todo-text { flex: 1; color: #ddd; font-size: 14px; }
    .todo-del { background: none; border: none; color: #666; cursor: pointer; font-size: 16px; padding: 0 4px; }
    .todo-del:hover { color: #e94560; }
    .todo-footer { padding: 10px 16px; border-top: 1px solid #2a2a4a; color: #666; font-size: 12px; display: flex; justify-content: space-between; }
  `);

  const container = api.container;

  function save() { api.storage.setForPlugin(meta.id, 'todos', todos); }

  function render() {
    const remaining = todos.filter(t => !t.done).length;
    container.innerHTML = `
      <div class="todo">
        <div class="todo-header">
          <h3>📋 Todo List</h3>
          <div class="todo-input-row">
            <input class="todo-input" placeholder="Add a task..." id="todo-input" />
            <button class="todo-add" id="todo-add">+</button>
          </div>
        </div>
        <div class="todo-list">
          ${todos.map((t, i) => `
            <div class="todo-item ${t.done ? 'done' : ''}">
              <div class="todo-check ${t.done ? 'checked' : ''}" data-i="${i}">${t.done ? '✓' : ''}</div>
              <span class="todo-text">${t.text}</span>
              <button class="todo-del" data-i="${i}">×</button>
            </div>
          `).join('')}
        </div>
        <div class="todo-footer">
          <span>${remaining} remaining</span>
          <span style="cursor:pointer;color:#e94560" id="todo-clear">Clear completed</span>
        </div>
      </div>
    `;

    const input = container.querySelector('#todo-input');
    container.querySelector('#todo-add').addEventListener('click', () => addTodo(input));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(input); });
    container.querySelectorAll('.todo-check').forEach(el => el.addEventListener('click', () => {
      todos[+el.dataset.i].done = !todos[+el.dataset.i].done;
      save(); render();
      api.bus.emit('todo:changed', { count: todos.length, remaining: todos.filter(t => !t.done).length });
    }));
    container.querySelectorAll('.todo-del').forEach(el => el.addEventListener('click', () => {
      todos.splice(+el.dataset.i, 1); save(); render();
    }));
    container.querySelector('#todo-clear').addEventListener('click', () => {
      todos = todos.filter(t => !t.done); save(); render();
    });
  }

  function addTodo(input) {
    const text = input.value.trim();
    if (!text) return;
    todos.push({ text, done: false });
    save(); render();
    api.bus.emit('todo:changed', { count: todos.length, remaining: todos.filter(t => !t.done).length });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
