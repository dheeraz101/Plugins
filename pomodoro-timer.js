let currentApi = null;
let interval = null;

export const meta = {
  id: 'pomodoro-timer',
  name: 'Pomodoro Timer',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    .pomodoro {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #1a1a2e;
      border-radius: 14px;
      padding: 20px;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }
    .pomodoro-label { color: #e94560; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .pomodoro-time { color: #fff; font-size: 48px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .pomodoro-controls { display: flex; gap: 10px; margin-top: 16px; }
    .pomodoro-controls button {
      padding: 8px 18px; border: none; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600; transition: all 0.2s;
    }
    .pomodoro-btn-start { background: #e94560; color: #fff; }
    .pomodoro-btn-pause { background: #f39c12; color: #fff; }
    .pomodoro-btn-reset { background: #333; color: #aaa; }
    .pomodoro-btn-start:hover { background: #c0392b; }
    .pomodoro-btn-pause:hover { background: #e67e22; }
    .pomodoro-btn-reset:hover { background: #555; }
    .pomodoro-session { color: #888; font-size: 12px; margin-top: 12px; }
  `);

  const container = api.container;
  let state = api.storage.getForPlugin(meta.id, 'state') || { remaining: 25 * 60, running: false, mode: 'work', sessions: 0 };

  function render() {
    const mins = Math.floor(state.remaining / 60).toString().padStart(2, '0');
    const secs = (state.remaining % 60).toString().padStart(2, '0');
    const modeLabel = state.mode === 'work' ? '🍅 Focus Time' : '☕ Break Time';

    container.innerHTML = `
      <div class="pomodoro">
        <div class="pomodoro-label">${modeLabel}</div>
        <div class="pomodoro-time">${mins}:${secs}</div>
        <div class="pomodoro-controls">
          <button class="pomodoro-btn-start" id="pom-start">${state.running ? 'Running...' : 'Start'}</button>
          <button class="pomodoro-btn-pause" id="pom-pause">Pause</button>
          <button class="pomodoro-btn-reset" id="pom-reset">Reset</button>
        </div>
        <div class="pomodoro-session">Sessions completed: ${state.sessions}</div>
      </div>
    `;

    container.querySelector('#pom-start').addEventListener('click', startTimer);
    container.querySelector('#pom-pause').addEventListener('click', pauseTimer);
    container.querySelector('#pom-reset').addEventListener('click', resetTimer);
  }

  function save() {
    api.storage.setForPlugin(meta.id, 'state', state);
  }

  function startTimer() {
    if (state.running) return;
    state.running = true;
    save();
    interval = setInterval(() => {
      state.remaining--;
      if (state.remaining <= 0) {
        if (state.mode === 'work') {
          state.sessions++;
          state.mode = 'break';
          state.remaining = 5 * 60;
          api.notify('🍅 Pomodoro done! Take a break.', 'success');
        } else {
          state.mode = 'work';
          state.remaining = 25 * 60;
          api.notify('☕ Break over! Back to work.', 'info');
        }
      }
      save();
      render();
    }, 1000);
    render();
  }

  function pauseTimer() {
    state.running = false;
    clearInterval(interval);
    interval = null;
    save();
    render();
  }

  function resetTimer() {
    state.running = false;
    clearInterval(interval);
    interval = null;
    state.remaining = state.mode === 'work' ? 25 * 60 : 5 * 60;
    save();
    render();
  }

  render();
}

export function teardown() {
  if (interval) clearInterval(interval);
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
  interval = null;
}
