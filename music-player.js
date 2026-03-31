export const meta = {
  id: 'music-player',
  name: 'Music Player',
  version: '1.0.0',
  compat: '>=3.3.0'
};

let currentApi = null;
let playerEl = null;
let audioEl = null;
let currentStation = null;
let favorites = [];

// ── FREE MUSIC SOURCES ──
const STATIONS = [
  {
    id: 'lofi-1',
    name: 'Lofi Girl',
    genre: 'Lofi',
    icon: '🌸',
    sources: [
      'https://play.streamafrica.net/lofiradio',
      'https://streams.ilovemusic.de/iloveradio17.mp3'
    ]
  },
  {
    id: 'chillhop',
    name: 'Chillhop Radio',
    genre: 'Chill Hop',
    icon: '🎧',
    sources: [
      'http://stream.zeno.fm/fyn8eh3h5f8uv'
    ]
  },
  {
    id: 'jazz-1',
    name: 'Jazz Radio',
    genre: 'Jazz',
    icon: '🎷',
    sources: [
      'https://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3'
    ]
  },
  {
    id: 'classical-1',
    name: 'Classical KING',
    genre: 'Classical',
    icon: '🎻',
    sources: [
      'https://classicalking.streamguys1.com/king-fm-aac-128k'
    ]
  },
  {
    id: 'ambient-1',
    name: 'SomaFM Drone Zone',
    genre: 'Ambient',
    icon: '🌌',
    sources: [
      'https://ice1.somafm.com/dronezone-128-mp3'
    ]
  },
  {
    id: 'synthwave',
    name: 'SomaFM DEF CON',
    genre: 'Synthwave',
    icon: '🌃',
    sources: [
      'https://ice1.somafm.com/defcon-128-mp3'
    ]
  },
  {
    id: 'indie-1',
    name: 'SomaFM Indie Pop',
    genre: 'Indie',
    icon: '🎵',
    sources: [
      'https://ice1.somafm.com/indiepop-128-mp3'
    ]
  },
  {
    id: 'reggae',
    name: 'SomaFM Reggae',
    genre: 'Reggae',
    icon: '🌴',
    sources: [
      'https://ice1.somafm.com/reggae-128-mp3'
    ]
  },
  {
    id: 'metal',
    name: 'SomaFM Metal',
    genre: 'Metal',
    icon: '🤘',
    sources: [
      'https://ice1.somafm.com/metal-128-mp3'
    ]
  },
  {
    id: '80s',
    name: 'SomaFM 80s',
    genre: '80s',
    icon: '🕹️',
    sources: [
      'https://ice1.somafm.com/u80s-128-mp3'
    ]
  }
];

// Free Jamendo API tracks (Creative Commons)
const JAMENDO_SEARCH_URL = 'https://api.jamendo.com/v3.0/tracks/?client_id=b6747d04&format=json&limit=20&include=musicinfo&audioformat=mp3&search=';

export function setup(api) {
  currentApi = api;
  favorites = api.storage.getForPlugin(meta.id, 'favorites') || [];

  api.injectCSS(meta.id, `
    .mp-root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #0a0a0f;
      color: #e0e0e0;
      font-family: system-ui, -apple-system, sans-serif;
      border-radius: 14px;
      overflow: hidden;
    }

    .mp-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .mp-header-icon { font-size: 22px; }
    .mp-header-title { font-weight: 700; font-size: 15px; }
    .mp-header-subtitle { font-size: 11px; color: #666; }

    .mp-tabs {
      display: flex;
      padding: 0 12px;
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }

    .mp-tab {
      padding: 10px 14px;
      border: none;
      background: none;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .mp-tab:hover { color: #aaa; }
    .mp-tab.active { color: #7c6fff; border-bottom-color: #7c6fff; }

    .mp-body {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .mp-panel {
      position: absolute;
      inset: 0;
      overflow-y: auto;
      padding: 12px;
      display: none;
    }

    .mp-panel.active { display: block; }

    .mp-panel::-webkit-scrollbar { width: 6px; }
    .mp-panel::-webkit-scrollbar-track { background: transparent; }
    .mp-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }

    .mp-station-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .mp-station-card:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(124,111,255,0.3);
    }

    .mp-station-card.playing {
      background: rgba(124,111,255,0.1);
      border-color: #7c6fff;
    }

    .mp-station-icon {
      font-size: 28px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      flex-shrink: 0;
    }

    .mp-station-info { flex: 1; min-width: 0; }

    .mp-station-name {
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mp-station-genre { font-size: 11px; color: #7c6fff; margin-top: 2px; }

    .mp-now-playing-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      color: #2ecc71;
      margin-top: 3px;
    }

    .mp-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 14px;
    }

    .mp-bar span {
      display: block;
      width: 3px;
      background: #2ecc71;
      border-radius: 2px;
      animation: mp-bounce 0.8s infinite ease-in-out;
    }

    .mp-bar span:nth-child(1) { animation-delay: 0s; height: 40%; }
    .mp-bar span:nth-child(2) { animation-delay: 0.15s; height: 70%; }
    .mp-bar span:nth-child(3) { animation-delay: 0.3s; height: 50%; }
    .mp-bar span:nth-child(4) { animation-delay: 0.45s; height: 80%; }

    @keyframes mp-bounce {
      0%, 100% { transform: scaleY(0.5); }
      50% { transform: scaleY(1); }
    }

    .mp-search-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .mp-search-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 8px 12px;
      color: #e0e0e0;
      font-size: 13px;
      outline: none;
    }

    .mp-search-input:focus { border-color: #7c6fff; }

    .mp-search-btn {
      padding: 8px 14px;
      background: #7c6fff;
      border: none;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .mp-track-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      margin-bottom: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .mp-track-card:hover { background: rgba(255,255,255,0.06); }
    .mp-track-card.playing { background: rgba(124,111,255,0.1); }

    .mp-track-thumb {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      overflow: hidden;
    }

    .mp-track-thumb img { width: 100%; height: 100%; object-fit: cover; }

    .mp-track-info { flex: 1; min-width: 0; }

    .mp-track-name {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mp-track-artist { font-size: 11px; color: #888; margin-top: 1px; }
    .mp-track-duration { font-size: 11px; color: #666; flex-shrink: 0; }

    .mp-player-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }

    .mp-player-info { flex: 1; min-width: 0; }

    .mp-player-title {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mp-player-subtitle { font-size: 11px; color: #888; }

    .mp-ctrl-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      color: #e0e0e0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.15s;
      flex-shrink: 0;
    }

    .mp-ctrl-btn:hover { background: rgba(255,255,255,0.15); }

    .mp-ctrl-btn.play-btn {
      width: 42px;
      height: 42px;
      background: #7c6fff;
      font-size: 18px;
    }

    .mp-ctrl-btn.play-btn:hover { background: #6a5ce0; }

    .mp-volume-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .mp-volume-slider {
      width: 70px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255,255,255,0.15);
      border-radius: 2px;
      outline: none;
    }

    .mp-volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #7c6fff;
      cursor: pointer;
    }

    .mp-volume-icon {
      font-size: 14px;
      cursor: pointer;
      opacity: 0.7;
    }

    .mp-status {
      font-size: 10px;
      color: #555;
      text-align: center;
      padding: 4px;
    }

    .mp-loading {
      display: inline-flex;
      gap: 3px;
      align-items: center;
    }

    .mp-loading span {
      width: 4px;
      height: 4px;
      background: #7c6fff;
      border-radius: 50%;
      animation: mp-pulse 1s infinite;
    }

    .mp-loading span:nth-child(2) { animation-delay: 0.2s; }
    .mp-loading span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes mp-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `);

  // ── AUDIO ELEMENT ──
  audioEl = document.createElement('audio');
  audioEl.preload = 'none';
  audioEl.volume = api.storage.getForPlugin(meta.id, 'volume') ?? 0.7;
  document.body.appendChild(audioEl);

  const container = api.container;

  // ── BUILD UI ──
  playerEl = document.createElement('div');
  playerEl.className = 'mp-root';

  playerEl.innerHTML = `
    <div class="mp-header">
      <span class="mp-header-icon">🎵</span>
      <div>
        <div class="mp-header-title">Music Player</div>
        <div class="mp-header-subtitle">Free streams & Creative Commons music</div>
      </div>
    </div>

    <div class="mp-tabs">
      <button class="mp-tab active" data-tab="stations">📻 Stations</button>
      <button class="mp-tab" data-tab="search">🔍 Search</button>
      <button class="mp-tab" data-tab="favorites">⭐ Favorites</button>
    </div>

    <div class="mp-body">
      <div class="mp-panel active" id="mp-stations-panel"></div>
      <div class="mp-panel" id="mp-search-panel"></div>
      <div class="mp-panel" id="mp-favorites-panel"></div>
    </div>

    <div class="mp-player-bar">
      <div class="mp-player-info">
        <div class="mp-player-title" id="mp-player-title">Nothing playing</div>
        <div class="mp-player-subtitle" id="mp-player-sub">Select a station or track</div>
      </div>
      <button class="mp-ctrl-btn" id="mp-prev" title="Previous">⏮</button>
      <button class="mp-ctrl-btn play-btn" id="mp-play" title="Play/Pause">▶</button>
      <button class="mp-ctrl-btn" id="mp-next" title="Next">⏭</button>
      <div class="mp-volume-wrap">
        <span class="mp-volume-icon" id="mp-vol-icon">🔊</span>
        <input type="range" class="mp-volume-slider" id="mp-volume" min="0" max="1" step="0.05" value="${audioEl.volume}">
      </div>
    </div>
  `;

  container.appendChild(playerEl);

  // ── STATIONS ──
  function renderStations() {
    const panel = playerEl.querySelector('#mp-stations-panel');
    panel.innerHTML = STATIONS.map(s => `
      <div class="mp-station-card ${currentStation?.id === s.id ? 'playing' : ''}" data-station="${s.id}">
        <div class="mp-station-icon">${s.icon}</div>
        <div class="mp-station-info">
          <div class="mp-station-name">${s.name}</div>
          <div class="mp-station-genre">${s.genre}</div>
          ${currentStation?.id === s.id ? `
            <div class="mp-now-playing-badge">
              <div class="mp-bar"><span></span><span></span><span></span><span></span></div>
              Playing
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderStations();

  // ── SEARCH ──
  const searchPanel = playerEl.querySelector('#mp-search-panel');
  searchPanel.innerHTML = `
    <div class="mp-search-bar">
      <input class="mp-search-input" id="mp-search-input" placeholder="Search free music (powered by Jamendo)..." />
      <button class="mp-search-btn" id="mp-search-btn">Search</button>
    </div>
    <div id="mp-search-results">
      <div class="mp-status">Search for any song, artist, or genre — all tracks are Creative Commons licensed</div>
    </div>
  `;

  async function searchTracks(query) {
    const resultsEl = playerEl.querySelector('#mp-search-results');
    resultsEl.innerHTML = '<div class="mp-status"><div class="mp-loading"><span></span><span></span><span></span></div> Searching...</div>';

    try {
      const res = await fetch(JAMENDO_SEARCH_URL + encodeURIComponent(query));
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        resultsEl.innerHTML = '<div class="mp-status">No results found. Try a different search.</div>';
        return;
      }

      resultsEl.innerHTML = data.results.map(track => {
        const dur = track.duration;
        const mins = Math.floor(dur / 60);
        const secs = String(dur % 60).padStart(2, '0');

        return `
          <div class="mp-track-card" data-url="${track.audio}" data-name="${track.name}" data-artist="${track.artist_name}" data-thumb="${track.image || ''}">
            <div class="mp-track-thumb">
              ${track.image ? `<img src="${track.image}" alt="" />` : '🎵'}
            </div>
            <div class="mp-track-info">
              <div class="mp-track-name">${track.name}</div>
              <div class="mp-track-artist">${track.artist_name}</div>
            </div>
            <div class="mp-track-duration">${mins}:${secs}</div>
          </div>
        `;
      }).join('');
    } catch (err) {
      resultsEl.innerHTML = '<div class="mp-status">Search failed. Check your connection.</div>';
    }
  }

  playerEl.querySelector('#mp-search-btn').onclick = () => {
    const q = playerEl.querySelector('#mp-search-input').value.trim();
    if (q) searchTracks(q);
  };

  playerEl.querySelector('#mp-search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) searchTracks(q);
    }
  });

  // ── FAVORITES ──
  function renderFavorites() {
    const panel = playerEl.querySelector('#mp-favorites-panel');
    if (favorites.length === 0) {
      panel.innerHTML = '<div class="mp-status">No favorites yet. Star tracks from search results to save them here.</div>';
      return;
    }

    panel.innerHTML = favorites.map((fav, i) => `
      <div class="mp-track-card" data-url="${fav.url}" data-name="${fav.name}" data-artist="${fav.artist || 'Station'}" data-fav-idx="${i}">
        <div class="mp-track-thumb">⭐</div>
        <div class="mp-track-info">
          <div class="mp-track-name">${fav.name}</div>
          <div class="mp-track-artist">${fav.artist || 'Radio Station'}</div>
        </div>
        <button class="mp-ctrl-btn" data-remove-fav="${i}" title="Remove" style="width:28px;height:28px;font-size:12px;">✕</button>
      </div>
    `).join('');
  }

  // ── PLAYBACK ──
  let playlist = [];
  let playlistIndex = -1;
  let isPlaying = false;

  function playUrl(url, title, subtitle) {
    audioEl.src = url;
    audioEl.load();
    audioEl.play().then(() => {
      isPlaying = true;
      updatePlayerUI(title, subtitle);
      renderStations();
    }).catch(err => {
      api.notify('Playback failed — stream may be unavailable', 'error', 3000);
    });
  }

  function playStation(station) {
    currentStation = station;
    const url = station.sources[0];
    playUrl(url, station.name, station.genre);
  }

  function updatePlayerUI(title, subtitle) {
    playerEl.querySelector('#mp-player-title').textContent = title || 'Nothing playing';
    playerEl.querySelector('#mp-player-sub').textContent = subtitle || '';
    playerEl.querySelector('#mp-play').textContent = isPlaying ? '⏸' : '▶';
  }

  // ── CONTROLS ──
  playerEl.querySelector('#mp-play').onclick = () => {
    if (!audioEl.src) return;
    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
    } else {
      audioEl.play();
      isPlaying = true;
    }
    updatePlayerUI(
      playerEl.querySelector('#mp-player-title').textContent,
      playerEl.querySelector('#mp-player-sub').textContent
    );
    renderStations();
  };

  playerEl.querySelector('#mp-prev').onclick = () => {
    if (playlist.length > 0) {
      playlistIndex = (playlistIndex - 1 + playlist.length) % playlist.length;
      const t = playlist[playlistIndex];
      playUrl(t.url, t.name, t.artist);
    }
  };

  playerEl.querySelector('#mp-next').onclick = () => {
    if (playlist.length > 0) {
      playlistIndex = (playlistIndex + 1) % playlist.length;
      const t = playlist[playlistIndex];
      playUrl(t.url, t.name, t.artist);
    }
  };

  // Volume
  const volSlider = playerEl.querySelector('#mp-volume');
  const volIcon = playerEl.querySelector('#mp-vol-icon');

  volSlider.oninput = () => {
    const vol = parseFloat(volSlider.value);
    audioEl.volume = vol;
    api.storage.setForPlugin(meta.id, 'volume', vol);
    volIcon.textContent = vol === 0 ? '🔇' : vol < 0.5 ? '🔉' : '🔊';
  };

  volIcon.onclick = () => {
    if (audioEl.volume > 0) {
      audioEl.volume = 0;
      volSlider.value = 0;
      volIcon.textContent = '🔇';
    } else {
      audioEl.volume = 0.7;
      volSlider.value = 0.7;
      volIcon.textContent = '🔊';
    }
    api.storage.setForPlugin(meta.id, 'volume', audioEl.volume);
  };

  // ── CLICK HANDLERS (delegated) ──
  playerEl.onclick = (e) => {
    const stationCard = e.target.closest('[data-station]');
    if (stationCard) {
      const station = STATIONS.find(s => s.id === stationCard.dataset.station);
      if (station) playStation(station);
      return;
    }

    const trackCard = e.target.closest('[data-url]');
    if (trackCard && !e.target.closest('[data-remove-fav]')) {
      const url = trackCard.dataset.url;
      const name = trackCard.dataset.name;
      const artist = trackCard.dataset.artist;
      playUrl(url, name, artist);

      const allCards = [...trackCard.parentElement.querySelectorAll('[data-url]')];
      playlist = allCards.map(c => ({ url: c.dataset.url, name: c.dataset.name, artist: c.dataset.artist }));
      playlistIndex = allCards.indexOf(trackCard);
      return;
    }

    const removeBtn = e.target.closest('[data-remove-fav]');
    if (removeBtn) {
      const idx = parseInt(removeBtn.dataset.removeFav);
      favorites.splice(idx, 1);
      api.storage.setForPlugin(meta.id, 'favorites', favorites);
      renderFavorites();
      api.notify('Removed from favorites', 'info', 1500);
      return;
    }
  };

  // Right-click to favorite
  playerEl.addEventListener('contextmenu', (e) => {
    const trackCard = e.target.closest('[data-url]');
    if (!trackCard || trackCard.closest('#mp-favorites-panel')) return;
    e.preventDefault();

    const name = trackCard.dataset.name;
    const artist = trackCard.dataset.artist;
    const url = trackCard.dataset.url;

    if (favorites.find(f => f.url === url)) {
      api.notify('Already in favorites', 'info', 1500);
      return;
    }

    favorites.push({ name, artist, url });
    api.storage.setForPlugin(meta.id, 'favorites', favorites);
    api.notify(`⭐ "${name}" added to favorites`, 'success', 2000);
  });

  // ── TABS ──
  playerEl.querySelectorAll('.mp-tab').forEach(tab => {
    tab.onclick = () => {
      playerEl.querySelectorAll('.mp-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      playerEl.querySelectorAll('.mp-panel').forEach(p => p.classList.remove('active'));
      playerEl.querySelector(`#mp-${tab.dataset.tab}-panel`).classList.add('active');

      if (tab.dataset.tab === 'favorites') renderFavorites();
    };
  });

  // ── AUDIO EVENTS ──
  audioEl.onerror = () => {
    isPlaying = false;
    updatePlayerUI('Stream unavailable', 'Try another station');
    renderStations();
  };

  audioEl.onended = () => {
    isPlaying = false;
    updatePlayerUI();
    renderStations();
  };
}

export function teardown() {
  if (audioEl) {
    audioEl.pause();
    audioEl.src = '';
    audioEl.remove();
    audioEl = null;
  }
  currentApi?.removeCSS(meta.id);
  playerEl?.remove();
  playerEl = null;
  currentApi = null;
}