export const meta = {
  id: 'focus',
  name: 'Focus',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;
let sessionTimer = null;
let phaseTimer = null;
let animationFrame = null;

export function setup(api) {
  currentApi = api;

  api.injectCSS(meta.id, `
    [data-plugin-id="${meta.id}"].bb-plugin-container {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    .focus-widget {
      position: relative;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 0.5px solid rgba(255, 255, 255, 0.5);
      border-radius: 32px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      font-family: -apple-system, "SF Pro Display", system-ui;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      isolation: isolate;
      user-select: none;
    }

    .focus-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s ease;
      color: #86868b;
    }

    .focus-close-btn:hover {
      background: rgba(255, 59, 48, 0.15);
      color: #FF3B30;
      transform: scale(1.05);
    }

    .focus-close-btn:active {
      transform: scale(0.9);
    }

    /* ── SETUP VIEW ── */
    .focus-setup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 32px;
      text-align: center;
    }

    .focus-setup-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #1d1d1f;
      margin: 0;
    }

    .focus-setup-sub {
      font-size: 15px;
      color: #86868b;
      margin: 0;
      font-weight: 400;
    }

    .focus-sessions-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .focus-session-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      color: #1d1d1f;
      transition: all 0.15s ease;
    }

    .focus-session-btn:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    .focus-session-btn:active {
      transform: scale(0.92);
    }

    .focus-session-count {
      font-size: 48px;
      font-weight: 700;
      color: #1d1d1f;
      min-width: 60px;
      text-align: center;
      letter-spacing: -1px;
    }

    .focus-session-label {
      font-size: 13px;
      color: #86868b;
      font-weight: 500;
    }

    .focus-start-btn {
      padding: 14px 48px;
      border-radius: 999px;
      border: none;
      background: #007AFF;
      color: #fff;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: -0.2px;
    }

    .focus-start-btn:hover {
      background: #0066dd;
      transform: scale(1.02);
    }

    .focus-start-btn:active {
      transform: scale(0.96);
    }

    /* ── SESSION VIEW ── */
    .focus-session {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      gap: 20px;
    }

    .focus-session.active {
      display: flex;
    }

    .focus-setup.hidden {
      display: none;
    }

    .focus-phase-text {
      font-size: 22px;
      font-weight: 600;
      color: #1d1d1f;
      letter-spacing: -0.3px;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .focus-phase-text.visible {
      opacity: 1;
    }

    .focus-circle-container {
      position: relative;
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .focus-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007AFF, #5856D6);
      transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 30px rgba(0, 122, 255, 0.25);
    }

    .focus-circle.inhale {
      transform: scale(1.35);
      box-shadow: 0 12px 40px rgba(0, 122, 255, 0.4);
    }

    .focus-circle.hold {
      transform: scale(1.35);
      box-shadow: 0 12px 40px rgba(88, 86, 214, 0.4);
    }

    .focus-circle.exhale {
      transform: scale(1);
      box-shadow: 0 8px 30px rgba(0, 122, 255, 0.25);
    }

    .focus-circle.complete {
      transform: scale(1.1);
      box-shadow: 0 10px 35px rgba(52, 199, 89, 0.4);
      background: linear-gradient(135deg, #34C759, #30D158);
    }

    .focus-ring {
      position: absolute;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      border: 2px solid rgba(0, 122, 255, 0.15);
      transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .focus-ring.inhale {
      transform: scale(1.15);
      opacity: 0.5;
    }

    .focus-ring.hold {
      transform: scale(1.15);
      opacity: 0.5;
    }

    .focus-ring.exhale {
      transform: scale(1);
      opacity: 0.3;
    }

    .focus-ring.complete {
      transform: scale(1.1);
      opacity: 0.6;
      border-color: rgba(52, 199, 89, 0.3);
    }

    .focus-counter {
      font-size: 13px;
      color: #86868b;
      font-weight: 500;
    }

    .focus-skip-btn {
      padding: 10px 28px;
      border-radius: 999px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(0, 0, 0, 0.04);
      color: #86868b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .focus-skip-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #1d1d1f;
    }

    .focus-skip-btn:active {
      transform: scale(0.95);
    }

    /* ── DONE VIEW ── */
    .focus-done {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 32px;
      text-align: center;
    }

    .focus-done.active {
      display: flex;
    }

    .focus-done-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #34C759, #30D158);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: focus-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes focus-pop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .focus-done-icon svg {
      width: 32px;
      height: 32px;
      color: #fff;
    }

    .focus-done-title {
      font-size: 24px;
      font-weight: 700;
      color: #1d1d1f;
      margin: 0;
      letter-spacing: -0.4px;
    }

    .focus-done-sub {
      font-size: 15px;
      color: #86868b;
      margin: 0;
    }

    .focus-done-btn {
      padding: 12px 36px;
      border-radius: 999px;
      border: none;
      background: #007AFF;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .focus-done-btn:hover {
      background: #0066dd;
    }

    .focus-done-btn:active {
      transform: scale(0.96);
    }

    /* ── Dark Mode ── */
    @media (prefers-color-scheme: dark) {
      .focus-widget {
        background: rgba(28, 28, 30, 0.85);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .focus-close-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #a1a1a6;
      }
      .focus-close-btn:hover {
        background: rgba(255, 59, 48, 0.2);
        color: #FF6961;
      }
      .focus-setup-title,
      .focus-session-count,
      .focus-phase-text,
      .focus-done-title {
        color: #f5f5f7;
      }
      .focus-setup-sub,
      .focus-session-label,
      .focus-counter,
      .focus-done-sub {
        color: #6e6e73;
      }
      .focus-session-btn {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        color: #f5f5f7;
      }
      .focus-session-btn:hover {
        background: rgba(255, 255, 255, 0.14);
      }
      .focus-skip-btn {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        color: #6e6e73;
      }
      .focus-skip-btn:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #f5f5f7;
      }
    }
  `, { global: true });

  const container = api.container;
  let sessionCount = 3;
  let currentSession = 0;

  function render() {
    container.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'focus-widget';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'focus-close-btn';
    closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5L10.5 10.5M3.5 10.5L10.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      cleanup();
      if (api.removeContainer) {
        api.removeContainer(meta.id);
      } else if (api.unloadPlugin) {
        api.unloadPlugin(meta.id);
      } else {
        teardown();
      }
    };

    // Setup view
    const setupView = document.createElement('div');
    setupView.className = 'focus-setup';
    setupView.innerHTML = `
      <h2 class="focus-setup-title">Focus</h2>
      <p class="focus-setup-sub">Breathe in, hold, breathe out.</p>
      <div class="focus-sessions-row">
        <button class="focus-session-btn" id="focus-minus">−</button>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <span class="focus-session-count" id="focus-count">3</span>
          <span class="focus-session-label">sessions</span>
        </div>
        <button class="focus-session-btn" id="focus-plus">+</button>
      </div>
      <button class="focus-start-btn" id="focus-start">Begin</button>
    `;

    // Session view
    const sessionView = document.createElement('div');
    sessionView.className = 'focus-session';
    sessionView.innerHTML = `
      <div class="focus-phase-text" id="focus-phase"></div>
      <div class="focus-circle-container">
        <div class="focus-ring" id="focus-ring"></div>
        <div class="focus-circle" id="focus-circle"></div>
      </div>
      <span class="focus-counter" id="focus-session-counter"></span>
      <button class="focus-skip-btn" id="focus-skip">Skip</button>
    `;

    // Done view
    const doneView = document.createElement('div');
    doneView.className = 'focus-done';
    doneView.innerHTML = `
      <div class="focus-done-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 class="focus-done-title">Session Complete</h2>
      <p class="focus-done-sub">You completed ${sessionCount} breathing cycles.</p>
      <button class="focus-done-btn" id="focus-done-btn">Done</button>
    `;

    widget.appendChild(closeBtn);
    widget.appendChild(setupView);
    widget.appendChild(sessionView);
    widget.appendChild(doneView);
    container.appendChild(widget);

    // Setup view events
    setupView.querySelector('#focus-minus').onclick = () => {
      if (sessionCount > 1) {
        sessionCount--;
        setupView.querySelector('#focus-count').textContent = sessionCount;
      }
    };

    setupView.querySelector('#focus-plus').onclick = () => {
      if (sessionCount < 10) {
        sessionCount++;
        setupView.querySelector('#focus-count').textContent = sessionCount;
      }
    };

    setupView.querySelector('#focus-start').onclick = () => {
      currentSession = 0;
      setupView.classList.add('hidden');
      sessionView.classList.add('active');
      runSession();
    };

    // Skip button
    sessionView.querySelector('#focus-skip').onclick = () => {
      cleanup();
      currentSession++;
      if (currentSession >= sessionCount) {
        showDone();
      } else {
        runSession();
      }
    };

    // Done button
    doneView.querySelector('#focus-done-btn').onclick = () => {
      if (api.removeContainer) {
        api.removeContainer(meta.id);
      } else if (api.unloadPlugin) {
        api.unloadPlugin(meta.id);
      } else {
        teardown();
      }
    };
  }

  function runSession() {
    currentSession++;
    const phaseEl = document.querySelector('#focus-phase');
    const circleEl = document.querySelector('#focus-circle');
    const ringEl = document.querySelector('#focus-ring');
    const counterEl = document.querySelector('#focus-session-counter');

    counterEl.textContent = `Session ${currentSession} of ${sessionCount}`;

    const phases = [
      { text: 'Breathe In', cls: 'inhale', duration: 4000 },
      { text: 'Hold', cls: 'hold', duration: 4000 },
      { text: 'Breathe Out', cls: 'exhale', duration: 4000 },
      { text: 'Complete', cls: 'complete', duration: 1500 },
    ];

    let phaseIndex = 0;

    function nextPhase() {
      if (phaseIndex >= phases.length) {
        if (currentSession >= sessionCount) {
          showDone();
        } else {
          runSession();
        }
        return;
      }

      const phase = phases[phaseIndex];

      // Reset classes
      circleEl.className = 'focus-circle';
      ringEl.className = 'focus-ring';
      phaseEl.classList.remove('visible');

      phaseTimer = setTimeout(() => {
        phaseEl.textContent = phase.text;
        phaseEl.classList.add('visible');
        circleEl.classList.add(phase.cls);
        ringEl.classList.add(phase.cls);

        phaseIndex++;
        phaseTimer = setTimeout(nextPhase, phase.duration);
      }, 300);
    }

    nextPhase();
  }

  function showDone() {
    const sessionView = document.querySelector('.focus-session');
    const doneView = document.querySelector('.focus-done');
    const doneSub = doneView.querySelector('.focus-done-sub');

    doneSub.textContent = `You completed ${sessionCount} breathing cycle${sessionCount > 1 ? 's' : ''}.`;

    sessionView.classList.remove('active');
    doneView.classList.add('active');
  }

  function cleanup() {
    if (sessionTimer) { clearTimeout(sessionTimer); sessionTimer = null; }
    if (phaseTimer) { clearTimeout(phaseTimer); phaseTimer = null; }
    if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
  }

  render();

  // Handle board resizing
  const resizeHandler = api.debounce(() => {}, 100);
  api.bus.on('board:resize', resizeHandler);
}

export function teardown() {
  if (currentApi) {
    currentApi.removeCSS(meta.id);
  }
  cleanup();
  if (currentApi && currentApi.container) {
    currentApi.container.innerHTML = '';
  }
}
