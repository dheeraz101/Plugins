let currentApi = null;

export const meta = {
  id: 'emoji-keyboard',
  name: 'Emoji Keyboard',
  version: '1.0.0',
  compat: '>=3.3.0'
};

export function setup(api) {
  currentApi = api;

  const categories = {
    '😀': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐'],
    '👋': ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏'],
    '❤️': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️'],
    '🐱': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗'],
    '🍎': ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🫘','🥜','🌰','🍞','🥐','🥖','🫓','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙'],
    '⚽': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂'],
    '🚀': ['🚀','🛸','🌍','🌎','🌏','🌐','🗺️','🧭','⛰️','🏔️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽'],
    '💡': ['💡','🔦','🕯️','🧯','🛢️','💰','💴','💵','💶','💷','🪙','💸','💳','🧾','💹','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','🎞️','📽️','🎬','📺','📷','📸','📹','📼','🔍','🔎']
  };

  api.injectCSS(meta.id, `
    .ek-widget { width: 100%; height: 100%; background: #1a1a2e; border-radius: 14px; display: flex; flex-direction: column; font-family: system-ui, sans-serif; overflow: hidden; }
    .ek-header { padding: 10px; border-bottom: 1px solid #2a2a4a; }
    .ek-search { width: 100%; padding: 8px 12px; background: #252540; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box; }
    .ek-cats { display: flex; padding: 6px; gap: 4px; border-bottom: 1px solid #2a2a4a; overflow-x: auto; }
    .ek-cat { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; font-size: 18px; background: none; border: none; flex-shrink: 0; }
    .ek-cat.active { background: #333355; }
    .ek-grid { flex: 1; display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 8px; overflow-y: auto; align-content: start; }
    .ek-emoji { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 22px; border-radius: 6px; cursor: pointer; border: none; background: none; transition: background 0.1s; }
    .ek-emoji:hover { background: #333355; }
    .ek-copied { position: fixed; bottom: 20px; right: 20px; background: #2ecc71; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; pointer-events: none; }
  `);

  const container = api.container;
  let activeCat = Object.keys(categories)[0];

  function render() {
    const emojis = categories[activeCat] || [];
    container.innerHTML = `
      <div class="ek-widget">
        <div class="ek-header"><input class="ek-search" placeholder="🔍 Search emojis..." id="ek-search"></div>
        <div class="ek-cats">${Object.keys(categories).map(c => `<button class="ek-cat ${c===activeCat?'active':''}" data-cat="${c}">${c}</button>`).join('')}</div>
        <div class="ek-grid" id="ek-grid">${emojis.map(e => `<button class="ek-emoji" data-e="${e}">${e}</button>`).join('')}</div>
      </div>
    `;

    container.querySelectorAll('.ek-cat').forEach(el => el.addEventListener('click', () => {
      activeCat = el.dataset.cat; render();
    }));

    container.querySelectorAll('.ek-emoji').forEach(el => el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.dataset.e);
      api.notify(`Copied ${el.dataset.e}`, 'success', 1500);
    }));

    container.querySelector('#ek-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      if (!q) { render(); return; }
      const all = Object.values(categories).flat();
      // Simple: show all when searching (emoji names not available in this simple implementation)
      const grid = container.querySelector('#ek-grid');
      grid.innerHTML = all.map(em => `<button class="ek-emoji" data-e="${em}">${em}</button>`).join('');
      grid.querySelectorAll('.ek-emoji').forEach(el => el.addEventListener('click', () => {
        navigator.clipboard.writeText(el.dataset.e);
        api.notify(`Copied ${el.dataset.e}`, 'success', 1500);
      }));
    });
  }

  render();
}

export function teardown() {
  if (currentApi) currentApi.removeCSS(meta.id);
  currentApi = null;
}
