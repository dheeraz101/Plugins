export const meta = {
  id: 'focus',
  name: 'Focus',
  version: '1.0.1',
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
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(45px) saturate(220%);
      -webkit-backdrop-filter: blur(45px) saturate(220%);
      border: 0.5px solid rgba(0, 0, 0, 0.06);
      border-radius: 28px;
      font-family: -apple-system, "SF Pro Display", "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      isolation: isolate;
      user-select: none;
      -webkit-user-select: none;
    }

    .focus-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: #86868b;
    }

    .focus-close-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #1d1d1f;
    }

    .focus-close-btn:active {
      transform: scale(0.88);
    }

    /* ── SETUP VIEW ── */
    .focus-setup {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 48px 40px 40px;
      text-align: center;
    }

    .focus-setup-icon {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      box-shadow: 0 8px 24px rgba(0, 122, 255, 0.25);
    }

    .focus-setup-icon svg {
      width: 36px;
      height: 36px;
      color: #fff;
    }

    .focus-setup-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #1d1d1f;
      margin: 0;
      font-family: "SF Pro Display", -apple-system, system-ui;
    }

    .focus-setup-sub {
      font-size: 15px;
      color: #86868b;
      margin: 0;
      font-weight: 400;
      max-width: 220px;
      line-height: 1.4;
    }

    .focus-sessions-row {
      display: flex;
      align-items: center;
      gap: 20px;
      margin: 8px 0;
    }

    .focus-session-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(0, 0, 0, 0.04);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 500;
      color: #1d1d1f;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: "SF Pro Text", -apple-system, system-ui;
    }

    .focus-session-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      transform: scale(1.05);
    }

    .focus-session-btn:active {
      transform: scale(0.92);
    }

    .focus-session-count {
      font-size: 44px;
      font-weight: 700;
      color: #1d1d1f;
      min-width: 52px;
      text-align: center;
      letter-spacing: -1.5px;
      font-family: "SF Pro Display", -apple-system, system-ui;
      line-height: 1;
    }

    .focus-session-label {
      font-size: 12px;
      color: #86868b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .focus-start-btn {
      padding: 15px 56px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #007AFF 0%, #0055CC 100%);
      color: #fff;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.2px;
      font-family: "SF Pro Text", -apple-system, system-ui;
      box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
      margin-top: 8px;
    }

    .focus-start-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
    }

    .focus-start-btn:active {
      transform: translateY(0) scale(0.98);
    }

    /* ── SESSION VIEW ── */
    .focus-session {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      gap: 24px;
      padding: 40px;
    }

    .focus-session.active {
      display: flex;
    }

    .focus-setup.hidden {
      display: none;
    }

    .focus-phase-text {
      font-size: 20px;
      font-weight: 600;
      color: #1d1d1f;
      letter-spacing: -0.3px;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: "SF Pro Display", -apple-system, system-ui;
    }

    .focus-phase-text.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .focus-circle-container {
      position: relative;
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .focus-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007AFF, #5856D6);
      transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 4s cubic-bezier(0.4, 0, 0.2, 1),
                  background 0.6s ease;
      box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    }

    .focus-circle.inhale {
      transform: scale(1.4);
      box-shadow: 0 16px 48px rgba(0, 122, 255, 0.35);
    }

    .focus-circle.hold {
      transform: scale(1.4);
      box-shadow: 0 16px 48px rgba(88, 86, 214, 0.35);
      background: linear-gradient(135deg, #5856D6, #AF52DE);
    }

    .focus-circle.exhale {
      transform: scale(1);
      box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    }

    .focus-circle.complete {
      transform: scale(1.15);
      box-shadow: 0 12px 36px rgba(52, 199, 89, 0.4);
      background: linear-gradient(135deg, #34C759, #30D158);
    }

    .focus-ring {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      border: 1.5px solid rgba(0, 122, 255, 0.12);
      transition: transform 4s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 4s cubic-bezier(0.4, 0, 0.2, 1),
                  border-color 0.6s ease;
      pointer-events: none;
    }

    .focus-ring.inhale {
      transform: scale(1.12);
      opacity: 0.4;
    }

    .focus-ring.hold {
      transform: scale(1.12);
      opacity: 0.4;
      border-color: rgba(88, 86, 214, 0.2);
    }

    .focus-ring.exhale {
      transform: scale(1);
      opacity: 0.2;
    }

    .focus-ring.complete {
      transform: scale(1.12);
      opacity: 0.5;
      border-color: rgba(52, 199, 89, 0.25);
    }

    .focus-counter {
      font-size: 13px;
      color: #86868b;
      font-weight: 500;
      font-family: "SF Pro Text", -apple-system, system-ui;
      letter-spacing: 0.2px;
    }

    .focus-skip-btn {
      padding: 11px 28px;
      border-radius: 999px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      color: #86868b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: "SF Pro Text", -apple-system, system-ui;
    }

    .focus-skip-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #1d1d1f;
    }

    .focus-skip-btn:active {
      transform: scale(0.96);
    }

    /* ── DONE VIEW ── */
    .focus-done {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      text-align: center;
    }

    .focus-done.active {
      display: flex;
    }

    .focus-done-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #34C759, #30D158);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: focus-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 8px 24px rgba(52, 199, 89, 0.3);
    }

    @keyframes focus-pop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .focus-done-icon svg {
      width: 40px;
      height: 40px;
      color: #fff;
    }

    .focus-done-title {
      font-size: 24px;
      font-weight: 700;
      color: #1d1d1f;
      margin: 0;
      letter-spacing: -0.4px;
      font-family: "SF Pro Display", -apple-system, system-ui;
    }

    .focus-done-sub {
      font-size: 15px;
      color: #86868b;
      margin: 0;
      font-weight: 400;
      line-height: 1.4;
    }

    .focus-done-btn {
      padding: 14px 40px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #007AFF 0%, #0055CC 100%);
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: "SF Pro Text", -apple-system, system-ui;
      box-shadow: 0 4px 16px rgba(0, 122, 255, 0.25);
      margin-top: 8px;
    }

    .focus-done-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
    }

    .focus-done-btn:active {
      transform: scale(0.98);
    }

    /* ── Dark Mode ── */
    @media (prefers-color-scheme: dark) {
      .focus-widget {
        background: rgba(28, 28, 30, 0.88);
        border-color: rgba(255, 255, 255, 0.08);
      }
      .focus-close-btn {
        background: transparent;
        color: #98989d;
      }
      .focus-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f5f5f7;
      }
      .focus-setup-icon {
        box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
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
        color: #98989d;
      }
      .focus-session-btn {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.1);
        color: #f5f5f7;
      }
      .focus-session-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }
      .focus-skip-btn {
        background: rgba(255, 255, 255, 0.08);
        color: #98989d;
      }
      .focus-skip-btn:hover {
        background: rgba(255, 255, 255, 0.12);
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
      <div class="focus-setup-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <h2 class="focus-setup-title">Focus</h2>
      <p class="focus-setup-sub">Take a moment to breathe. Inhale, hold, and exhale.</p>
      <div class="focus-sessions-row">
        <button class="focus-session-btn" id="focus-minus">−</button>
        <div style="display:flex;flex-direction:column;align-items:center;">
          <span class="focus-session-count" id="focus-count">3</span>
          <span class="focus-session-label">Sessions</span>
        </div>
        <button class="focus-session-btn" id="focus-plus">+</button>
      </div>
      <button class="focus-start-btn" id="focus-start">Begin Session</button>
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
