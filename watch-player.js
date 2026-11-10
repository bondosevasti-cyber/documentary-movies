function createWatchPlayer(root, { onBack, onEpisodeSelect }) {
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const button = (action, label, content, className = '') =>
    `<button type="button" class="watch-button ${className}" data-watch="${action}" aria-label="${label}" title="${label}">${content}</button>`;
  const playIcon = `<span class="watch-play-icon">${icon('play')}</span><span class="watch-pause-icon">${icon('pause')}</span>`;
  const volumeIcon = `<span class="watch-volume-icon">${icon('volume-2')}</span><span class="watch-muted-icon">${icon('volume-x')}</span>`;

  root.innerHTML = `
    <div class="watch-stage">
      <div class="watch-frame" id="watch-frame"></div>
      <div class="watch-loading" data-watch="loading" aria-hidden="true"></div>
      <div class="watch-surface" data-watch="surface" aria-hidden="true"></div>
      <div class="watch-error" data-watch="error" hidden>
        <p role="status" data-watch="error-text"></p>
        ${button('retry', 'ხელახლა ცდა', 'ხელახლა ცდა', 'watch-text-button')}
      </div>
      <div class="watch-shade" aria-hidden="true"></div>
      <header class="watch-top">
        ${button('back', 'დეტალებზე დაბრუნება', icon('chevron-left'))}
        <div class="watch-top-title"><strong data-watch="title"></strong><span data-watch="position"></span></div>
      </header>
      <div class="watch-center">
        ${button('rewind', '10 წამით უკან', icon('rewind'))}
        ${button('play', 'დაკვრა', playIcon, 'watch-big-play')}
        ${button('forward', '10 წამით წინ', icon('fast-forward'))}
      </div>
      ${button('lock', 'მართვის ღილაკების ჩაკეტვა', icon('lock-open'), 'watch-lock')}
      <div class="watch-info">
        <h1><img data-watch="art" alt="" hidden><span data-watch="heading"></span></h1>
        <p class="watch-facts" data-watch="facts"></p>
        <p class="watch-blurb" data-watch="blurb"></p>
      </div>
      <div class="watch-footer">
        <div class="watch-timeline">
          <p class="watch-time"><strong data-watch="elapsed">0:00</strong><span data-watch="duration"> / 0:00</span><span data-watch="remaining"></span></p>
          <input data-watch="seek" type="range" min="0" max="0" step="0.1" value="0" aria-label="ვიდეოს დრო">
        </div>
        <div class="watch-toolbar">
          <div class="watch-group watch-transport">
            ${button('play', 'დაკვრა', playIcon)}
            ${button('mute', 'ხმის გათიშვა', volumeIcon)}
            <input data-watch="volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="ხმის სიმაღლე">
          </div>
          <div class="watch-group watch-tools">
            ${button('previous', 'წინა ეპიზოდი', icon('skip-back'))}
            ${button('next', 'შემდეგი ეპიზოდი', icon('skip-forward'))}
            ${button('episodes', 'ეპიზოდები', icon('list-video'))}
            ${button('sources', 'ვიდეოს წყარო', icon('server'))}
            ${button('settings', 'წყაროს მართვის ღილაკები', icon('settings'))}
            ${button('fullscreen', 'სრულ ეკრანზე', icon('maximize'))}
          </div>
        </div>
      </div>
      <dialog class="watch-dialog" data-watch="source-dialog" aria-label="ვიდეოს წყარო">
        <div class="watch-dialog-head"><h2>ვიდეოს წყარო</h2>${button('close-source', 'დახურვა', icon('x'))}</div>
        <p data-watch="source-label"></p>
        <div class="watch-source-actions">
          ${button('reload', 'წყაროს ხელახლა ჩატვირთვა', 'ხელახლა ჩატვირთვა', 'watch-text-button')}
          <a data-watch="external" target="_blank" rel="noopener noreferrer">წყაროს გახსნა ${icon('external-link')}</a>
        </div>
      </dialog>
      <dialog class="watch-dialog watch-episode-dialog" data-watch="episode-dialog" aria-label="ეპიზოდები">
        <div class="watch-dialog-head"><h2>ეპიზოდები</h2>${button('close-episodes', 'დახურვა', icon('x'))}</div>
        <label>სეზონი <select data-watch="season"></select></label>
        <div class="watch-episode-list" data-watch="episode-list"></div>
      </dialog>
    </div>`;

  const element = (name) => root.querySelector(`[data-watch="${name}"]`);
  const elements = (name) => root.querySelectorAll(`[data-watch="${name}"]`);
  const stage = root.firstElementChild;
  const frame = root.querySelector('#watch-frame');
  const timeline = element('seek');
  const volumeRange = element('volume');
  const sourceDialog = element('source-dialog');
  const episodeDialog = element('episode-dialog');
  let movie, source, iframe, video, embedId;
  let playing = false;
  let started = false;
  let nativeMode = false;
  let locked = false;
  let muted = false;
  let volume = 1;
  let position = 0;
  let duration = 0;
  let seekTime = 0;
  let sourceNumber = 0;
  let poll, idle, loadTimeout;

  function formatTime(seconds) {
    const time = Math.floor(seconds);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60) % 60;
    const secs = String(time % 60).padStart(2, '0');
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
  }

  function label(control, text) {
    control.setAttribute('aria-label', text);
    control.title = text;
  }

  function customControls() { return Boolean(video || started) && !nativeMode; }

  function paint() {
    const custom = customControls();
    stage.toggleAttribute('data-custom', custom);
    stage.toggleAttribute('data-native', nativeMode);
    stage.toggleAttribute('data-playing', playing);
    stage.toggleAttribute('data-muted', muted || volume === 0);
    stage.toggleAttribute('data-locked', locked);
    stage.toggleAttribute('data-timed', duration > 0);
    for (const control of elements('play')) label(control, playing ? 'პაუზა' : 'დაკვრა');
    label(element('mute'), muted || volume === 0 ? 'ხმის ჩართვა' : 'ხმის გათიშვა');
    label(element('settings'), nativeMode ? 'პრიზმას მართვის ღილაკები' : 'წყაროს მართვის ღილაკები');
    element('settings').hidden = !iframe || !started;
    element('fullscreen').hidden = !document.fullscreenEnabled && !video?.webkitEnterFullscreen;
    element('elapsed').textContent = formatTime(position);
    element('duration').textContent = ` / ${formatTime(duration)}`;
    element('remaining').textContent = ` −${formatTime(Math.max(0, duration - position))}`;
    timeline.max = String(duration);
    timeline.value = String(position);
    timeline.setAttribute('aria-valuetext', formatTime(position));
    timeline.style.setProperty('--watch-progress', `${duration > 0 ? Math.min(100, position / duration * 100) : 0}%`);
    volumeRange.value = String(muted ? 0 : volume);
  }

  function wake() {
    clearTimeout(idle);
    stage.removeAttribute('data-idle');
    if (playing && customControls()) idle = setTimeout(() => stage.setAttribute('data-idle', ''), 2500);
  }

  function setPlaying(value) {
    if (playing === value) return;
    playing = value;
    started ||= value;
    paint();
    wake();
  }

  function send(method, value) {
    if (iframe && embedId) iframe.contentWindow?.postMessage(JSON.stringify({ method, value }), source.origin);
  }

  // Rumble's iframe adapter is enabled by api=1 plus player_id. It omits
  // numeric zero replies, so reset the local clock explicitly when seeking.
  function receive(event) {
    if (!embedId || event.source !== iframe?.contentWindow || event.origin !== source.origin) return;
    let payload;
    try { payload = JSON.parse(event.data); } catch { return; }
    if (payload?.player_id !== embedId) return;
    if (payload.event === 'ready') {
      clearInterval(poll);
      const refresh = () => {
        if (document.hidden) return;
        send('getPaused');
        send('getCurrentTime');
        if (!duration) send('getDuration');
        send('getMuted');
        send('getVolume');
      };
      refresh();
      poll = setInterval(refresh, 500);
      return;
    }
    const { method, value } = payload;
    if (method === 'getPaused' && typeof value === 'boolean') {
      setPlaying(!value);
      return;
    }
    if (method === 'getDuration' && Number.isFinite(value) && value > 0) duration = value;
    if (method === 'getCurrentTime' && Number.isFinite(value) && value >= 0 && performance.now() >= seekTime) position = value;
    if (method === 'getVolume' && Number.isFinite(value)) volume = Math.min(1, Math.max(0, value));
    if (method === 'getMuted' && typeof value === 'boolean') muted = value;
    paint();
  }

  function showError(message, retry) {
    element('loading').hidden = true;
    element('error-text').textContent = message;
    element('retry').hidden = !retry;
    element('error').hidden = false;
  }

  function resetMedia() {
    clearInterval(poll);
    clearTimeout(loadTimeout);
    clearTimeout(idle);
    frame.replaceChildren();
    iframe = video = source = embedId = null;
    playing = started = nativeMode = locked = muted = false;
    position = duration = seekTime = 0;
    volume = 1;
    stage.removeAttribute('data-idle');
  }

  function mount() {
    resetMedia();
    element('error').hidden = true;
    const loading = element('loading');
    loading.hidden = false;
    try {
      const url = movie.source && new URL(movie.source, location.href);
      if (url && /^https?:$/.test(url.protocol)) source = url;
    } catch { /* malformed media URL */ }

    const external = element('external');
    external.hidden = element('reload').hidden = !source;
    if (!source) {
      external.removeAttribute('href');
      element('source-label').textContent = 'ვიდეო ჯერ არ ატვირთულა.';
      showError('ვიდეო ჯერ არ ატვირთულა.', false);
      paint();
      return;
    }
    external.href = source.href;
    const rumble = /(^|\.)rumble\.com$/i.test(source.hostname) && source.pathname.startsWith('/embed/');
    element('source-label').textContent = rumble ? 'Rumble · სტუდია პრიზმა' : source.hostname;
    const url = new URL(source);
    const media = document.createElement('video');
    if (/\.(mp4|m4v|webm|ogv)$/i.test(url.pathname) || (/\.m3u8$/i.test(url.pathname) && media.canPlayType('application/vnd.apple.mpegurl'))) {
      video = media;
      video.playsInline = true;
      video.preload = 'metadata';
      if (movie.backdrop) video.poster = movie.backdrop;
      for (const event of ['loadedmetadata', 'timeupdate', 'volumechange', 'play', 'pause', 'ended', 'durationchange']) {
        video.addEventListener(event, () => {
          if (video !== media) return;
          loading.hidden = true;
          duration = Number.isFinite(media.duration) ? media.duration : 0;
          position = media.currentTime;
          volume = media.volume;
          muted = media.muted;
          setPlaying(!media.paused && !media.ended);
          paint();
        });
      }
      video.addEventListener('error', () => { if (video === media) showError('ვიდეოს ჩატვირთვა ვერ მოხერხდა.', true); });
      frame.append(video);
      video.src = url.href;
    } else {
      const player = document.createElement('iframe');
      iframe = player;
      if (rumble) {
        embedId = `prisma-watch-${++sourceNumber}`;
        url.searchParams.set('api', '1');
        url.searchParams.set('player_id', embedId);
        url.searchParams.set('autoplay', '2');
      }
      player.title = movie.heading;
      player.allow = 'autoplay; fullscreen; picture-in-picture';
      player.allowFullscreen = true;
      player.referrerPolicy = 'strict-origin-when-cross-origin';
      player.addEventListener('load', () => {
        if (iframe !== player) return;
        clearTimeout(loadTimeout);
        loading.hidden = true;
        element('error').hidden = true;
      });
      player.src = url.href;
      frame.append(player);
      loadTimeout = setTimeout(() => showError('ვიდეოს ჩატვირთვას დიდი დრო სჭირდება.', true), 15000);
    }
    paint();
  }

  function togglePlayback() {
    if (video) {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    } else send(playing ? 'pause' : 'play', playing ? undefined : 1);
  }

  function seek(seconds) {
    if (!duration) return;
    position = Math.max(0, Math.min(seconds, duration));
    seekTime = performance.now() + 650;
    if (video) video.currentTime = position;
    else {
      send('setCurrentTime', position);
      // The embed starts playback when scrubbing, even if it was paused.
      if (!playing) send('pause');
    }
    paint();
  }

  function setVolume(value) {
    if (video) {
      video.volume = value;
      video.muted = value === 0;
    } else if (value === 0) send('mute');
    else send('setVolume', value);
    muted = value === 0;
    if (value > 0) volume = value;
    paint();
  }

  function toggleMute() {
    if (video) {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 1;
    } else send(muted ? 'unmute' : 'mute');
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.fullscreenEnabled) stage.requestFullscreen().catch(() => {});
    else video?.webkitEnterFullscreen?.();
  }

  function drawEpisodes() {
    const season = Number(element('season').value);
    const list = element('episode-list');
    list.replaceChildren();
    for (const episode of movie.items.filter(item => item.season === season)) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'watch-episode';
      row.textContent = `${episode.episode}. ${episode.title}`;
      if (episode === movie.current) row.setAttribute('aria-current', 'true');
      if (!episode.video_url) {
        const note = document.createElement('small');
        note.textContent = 'მალე დაემატება';
        row.append(note);
      }
      row.onclick = () => { episodeDialog.close(); onEpisodeSelect(episode); };
      list.append(row);
    }
  }

  function selectAdjacent(direction) {
    const episode = movie.items[movie.items.indexOf(movie.current) + direction];
    if (episode) onEpisodeSelect(episode);
  }

  function setLocked(value) {
    locked = value;
    element('lock').innerHTML = icon(locked ? 'lock' : 'lock-open');
    element('lock').setAttribute('aria-pressed', String(locked));
    label(element('lock'), locked ? 'მართვის ღილაკების განბლოკვა' : 'მართვის ღილაკების ჩაკეტვა');
    window.lucide?.createIcons();
    paint();
  }

  const actions = {
    back: onBack,
    play: togglePlayback,
    mute: toggleMute,
    rewind: () => seek(position - 10),
    forward: () => seek(position + 10),
    lock: () => setLocked(!locked),
    fullscreen,
    sources: () => sourceDialog.showModal(),
    'close-source': () => sourceDialog.close(),
    episodes: () => episodeDialog.showModal(),
    'close-episodes': () => episodeDialog.close(),
    retry: mount,
    reload: () => { sourceDialog.close(); mount(); },
    previous: () => selectAdjacent(-1),
    next: () => selectAdjacent(1),
    settings: () => { nativeMode = !nativeMode; paint(); wake(); },
  };
  for (const [action, run] of Object.entries(actions)) {
    for (const control of elements(action)) control.addEventListener('click', run);
  }

  element('surface').onclick = (event) => {
    if (stage.hasAttribute('data-idle') || event.pointerType === 'touch') wake();
    else togglePlayback();
  };
  element('surface').ondblclick = fullscreen;
  element('season').onchange = drawEpisodes;
  timeline.oninput = () => seek(Number(timeline.value));
  volumeRange.oninput = () => setVolume(Number(volumeRange.value));
  stage.addEventListener('pointermove', wake, { passive: true });
  stage.addEventListener('focusin', wake);
  document.addEventListener('fullscreenchange', () => {
    label(element('fullscreen'), document.fullscreenElement ? 'სრული ეკრანიდან გამოსვლა' : 'სრულ ეკრანზე');
    wake();
  });
  addEventListener('message', receive);
  addEventListener('keydown', (event) => {
    if (root.hidden || sourceDialog.open || episodeDialog.open || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') {
      if (locked) setLocked(false);
      else if (!document.fullscreenElement) onBack();
      return;
    }
    if (locked || !customControls() || event.target?.closest?.('button, input, select, a')) return;
    const run = ({
      ' ': togglePlayback, k: togglePlayback, ArrowLeft: actions.rewind, ArrowRight: actions.forward, m: toggleMute, f: fullscreen,
    })[event.key];
    if (typeof run === 'function') { event.preventDefault(); run(); wake(); }
  });

  return {
    show(next) {
      const sameEpisode = Boolean(source) && movie?.source === next.source
        && movie?.current?.season === next.current?.season && movie?.current?.episode === next.current?.episode;
      movie = next;
      element('title').textContent = movie.title;
      element('position').textContent = movie.position;
      element('heading').textContent = movie.heading;
      element('facts').textContent = movie.facts;
      element('blurb').textContent = movie.description || '';
      const art = element('art');
      art.hidden = !movie.art;
      element('heading').hidden = Boolean(movie.art);
      if (movie.art) {
        art.src = movie.art;
        art.alt = movie.heading;
        art.onerror = () => { art.hidden = true; element('heading').hidden = false; };
      }
      element('loading').style.backgroundImage = movie.backdrop ? `url("${String(movie.backdrop).replaceAll('"', '%22')}")` : '';
      const seasons = [...new Set(movie.items.map(episode => episode.season))];
      const picker = element('season');
      picker.replaceChildren(...seasons.map(season => {
        const name = movie.items.find(item => item.season === season)?.seasonTitle;
        return new Option(name ? `სეზონი ${season} · ${name}` : `სეზონი ${season}`, String(season), false, season === movie.current?.season);
      }));
      const index = movie.items.indexOf(movie.current);
      element('episodes').hidden = !seasons.length;
      element('previous').hidden = index < 1;
      element('next').hidden = index < 0 || index + 1 >= movie.items.length;
      if (seasons.length) drawEpisodes();
      if (!sameEpisode) { mount(); setLocked(false); }
      window.lucide?.createIcons();
    },
    clear() {
      if (sourceDialog.open) sourceDialog.close();
      if (episodeDialog.open) episodeDialog.close();
      if (document.fullscreenElement === stage) document.exitFullscreen().catch(() => {});
      resetMedia();
    },
  };
}
