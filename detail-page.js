(function () {
  const body = document.body;
  const table = body.dataset.table;
  const videoField = body.dataset.videoField;
  const kind = table === 'movies' ? 'ფილმი' : 'ვიდეო';
  let playerEmbed = '';
  let currentRow = null;
  let posterSrc = '';
  let mountedSrc = '';
  const byId = id => document.getElementById(id);
  const value = (row, ...keys) => keys.map(key => row[key]).find(item => item !== null && item !== undefined && String(item).trim()) || '';
  const escapeHtml = text => String(text || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

  function splitNames(raw) {
    return String(raw || '').split(/\n|,/).map(item => item.trim()).filter(Boolean);
  }

  function createAvatar(name) {
    const initials = name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
    return `<span class="person-avatar" aria-hidden="true">${escapeHtml(initials || '•')}</span>`;
  }

  function episodeImageStyle(index) {
    const positions = ['50% 18%', '30% 35%', '70% 42%', '50% 65%', '25% 70%', '75% 24%'];
    return `object-position:${positions[index % positions.length]}`;
  }

  function renderDetailHub(row, episodes, cast, creative, poster) {
    const existing = byId('detail-hub');
    if (existing) existing.remove();

    const seasons = [...new Set(episodes.map(item => item.season))];
    const isSeries = row.content_type === 'series';
    const language = value(row, 'original_language', 'spoken_languages') || '—';
    const companies = splitNames(value(row, 'production_companies'));
    const countries = splitNames(value(row, 'production_countries'));
    const hub = document.createElement('div');
    hub.id = 'detail-hub';
    hub.className = 'detail-hub';

    const stats = [
      ['ტიპი', isSeries ? 'სერიალი' : kind],
      ['ენა', language],
      ['გამოშვება', value(row, 'release_year') || '—'],
      ...(isSeries ? [['სეზონები', String(seasons.length)], ['ეპიზოდები', String(episodes.length)]] : []),
    ];

    hub.innerHTML = `
      <section class="title-facts" aria-label="${isSeries ? 'სერიალის' : 'ფილმის'} ინფორმაცია">
        ${stats.map(([label, content]) => `<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(content)}</strong></div>`).join('')}
        ${value(row, 'studio_name') ? `<div class="fact-studio"><small>სტუდია</small><strong>${escapeHtml(value(row, 'studio_name'))}</strong></div>` : ''}
      </section>
      ${isSeries ? `<section class="hub-section hub-episodes">
        <div class="hub-heading"><div><span>სეზონები და ეპიზოდები</span><h2>უყურე ეპიზოდებს</h2></div><label class="episode-season-picker">სეზონი <select id="detail-season-picker"></select></label></div>
        <div class="episode-rail" id="detail-episode-rail"></div>
      </section>` : ''}
      <div class="hub-columns">
        <section class="hub-section hub-copy"><div class="hub-heading"><span>შესახებ</span><h2>აღწერილობა</h2></div><p>${escapeHtml(value(row, 'description') || 'აღწერა ჯერ არ არის დამატებული.')}</p></section>
        <section class="hub-section hub-production"><div class="hub-heading"><span>ინფორმაცია</span><h2>წარმოება</h2></div>
          <dl>
            ${value(row, 'director_name') ? `<div><dt>რეჟისორი</dt><dd>${escapeHtml(value(row, 'director_name'))}</dd></div>` : ''}
            ${value(row, 'writer_names') ? `<div><dt>სცენარი</dt><dd>${escapeHtml(value(row, 'writer_names'))}</dd></div>` : ''}
            ${companies.length ? `<div><dt>კომპანია</dt><dd>${companies.map(company => `<span>${escapeHtml(company)}</span>`).join('')}</dd></div>` : ''}
            ${countries.length ? `<div><dt>ქვეყანა</dt><dd>${countries.map(country => `<span>${escapeHtml(country)}</span>`).join('')}</dd></div>` : ''}
          </dl>
        </section>
      </div>
      ${(cast.length || creative.length) ? `<section class="hub-section cast-section"><div class="hub-heading"><span>შემოქმედებითი ჯგუფი</span><h2>მსახიობები და გუნდი</h2></div><div class="people-grid">
        ${cast.map(person => { const [name, role] = person.split(/\s+—\s+|\s+-\s+/, 2); return `<article class="person-card">${createAvatar(name)}<div><strong>${escapeHtml(name)}</strong>${role ? `<small>${escapeHtml(role)}</small>` : ''}</div></article>`; }).join('')}
        ${creative.flatMap(([role, names]) => splitNames(names).map(name => `<article class="person-card crew-card">${createAvatar(name)}<div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(role)}</small></div></article>`)).join('')}
      </div></section>` : ''}
    `;
    document.querySelector('.detail-grid').after(hub);

    if (!isSeries) return;
    const seasonPicker = byId('detail-season-picker');
    const rail = byId('detail-episode-rail');
    const drawEpisodes = number => {
      rail.replaceChildren();
      episodes.filter(item => item.season === number).forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `episode-card${item.video_url ? '' : ' is-pending'}`;
        button.innerHTML = `${poster ? `<img src="${escapeHtml(poster)}" alt="" style="${episodeImageStyle(index)}">` : '<span class="episode-card-art"></span>'}<span class="episode-chip">E${item.episode}</span><span class="episode-card-copy"><strong>${escapeHtml(item.title)}</strong><small>${item.video_url ? 'ყურება' : 'ვიდეო მალე დაემატება'}</small></span>`;
        button.addEventListener('click', () => paintWatch(true, item));
        rail.append(button);
      });
    };
    seasons.forEach(number => {
      const option = document.createElement('option'); option.value = String(number); option.textContent = `სეზონი ${number}`; seasonPicker.append(option);
    });
    seasonPicker.onchange = () => drawEpisodes(Number(seasonPicker.value));
    drawEpisodes(seasons[0]);
  }

  function renderWatchControls(items, current) {
    const info = document.querySelector('.watch-info');
    byId('watch-source-card')?.remove();
    byId('watch-selector-card')?.remove();
    const source = document.createElement('section');
    source.id = 'watch-source-card';
    source.className = 'watch-side-card watch-source-card';
    source.innerHTML = `<div class="watch-card-title"><span>◉</span> ვიდეოს წყარო</div><button type="button" class="source-option${current?.video_url || (!items.length && playerEmbed) ? ' is-ready' : ''}"><span><b>სტუდია პრიზმა</b><small>${current?.video_url || (!items.length && playerEmbed) ? 'მთავარი წყარო · მზადაა' : 'ვიდეო ჯერ არ ატვირთულა'}</small></span><strong>${current?.video_url || (!items.length && playerEmbed) ? '✓' : '—'}</strong></button><p class="source-note">ხარისხი ავტომატურად განისაზღვრება პლეიერის მიერ.</p>`;
    info.append(source);

    if (!items.length) return;
    const picker = document.createElement('aside');
    picker.id = 'watch-selector-card';
    picker.className = 'watch-side-card watch-selector-card';
    picker.innerHTML = `<div class="watch-card-title"><span>▤</span> ეპიზოდის არჩევა</div><label>სეზონი <select id="watch-season-side"></select></label><label>ეპიზოდი <select id="watch-episode-side"></select></label><p class="picker-count">${items.length} ეპიზოდი</p>`;
    info.append(picker);
    const seasonSelect = byId('watch-season-side');
    const episodeSelect = byId('watch-episode-side');
    const seasons = [...new Set(items.map(item => item.season))];
    seasons.forEach(number => { const option = new Option(`სეზონი ${number}`, String(number), false, number === current?.season); seasonSelect.append(option); });
    const drawEpisodeOptions = season => {
      episodeSelect.replaceChildren();
      items.filter(item => item.season === season).forEach(item => {
        const option = new Option(`${item.episode}. ${item.title}`, String(item.episode), false, item.episode === current?.episode); episodeSelect.append(option);
      });
    };
    drawEpisodeOptions(current?.season || seasons[0]);
    seasonSelect.onchange = () => { drawEpisodeOptions(Number(seasonSelect.value)); const next = items.find(item => item.season === Number(seasonSelect.value)); if (next) paintWatch(true, next); };
    episodeSelect.onchange = () => { const next = items.find(item => item.season === Number(seasonSelect.value) && item.episode === Number(episodeSelect.value)); if (next) paintWatch(true, next); };
  }

  function prepareRumbleUrl(raw) {
    let input = String(raw || '').trim();
    const iframe = input.match(/src=["']([^"']+)["']/i);
    if (iframe) input = iframe[1];
    if (input.includes('rumble.com/embed/')) return input.startsWith('http') ? input : `https://${input.replace(/^[/:]+/, '')}`;
    const match = input.match(/(?:rumble\.com\/v|(?:\/|^)v)([a-zA-Z0-9]+)/i);
    const id = match?.[1] || (!input.includes('://') && !input.includes('.') ? input.split('/').filter(Boolean).pop() : '');
    return id ? `https://rumble.com/embed/${id}/?pub=4p1avk&api=1` : input;
  }

  function externalUrl(raw) {
    const url = String(raw || '').trim();
    return url && /^(https?:)?\/\//i.test(url) ? url : '';
  }

  function setLink(id, raw) {
    const link = byId(id); const url = externalUrl(raw);
    if (!url) { link.hidden = true; return; }
    link.href = url;
    link.hidden = false;
  }

  function render(row) {
    const title = value(row, 'title');
    const poster = value(row, 'poster_url', 'photo_url', 'card_url', 'cover_url');
    const backdrop = value(row, 'cover_url', 'photo_url', 'poster_url');
    const titleArt = value(row, 'title_image_url');
    byId('detail-backdrop').style.backgroundImage = backdrop ? `url("${backdrop.replaceAll('"', '%22')}")` : '';
    byId('detail-poster').src = poster;
    byId('detail-poster').alt = title;
    byId('detail-title').textContent = title;
    byId('detail-title').hidden = Boolean(titleArt);
    if (titleArt) { byId('detail-title-art').src = titleArt; byId('detail-title-art').alt = title; byId('detail-title-art').hidden = false; }
    byId('detail-year').textContent = value(row, 'release_year') || '—';
    byId('detail-duration').textContent = value(row, 'duration') || '—';
    const rating = Number(row.rating || 0); byId('detail-rating').textContent = rating ? rating.toFixed(1) : '—';
    byId('detail-description').textContent = value(row, 'description') || 'აღწერა ჯერ არ არის დამატებული.';
    const genres = String(value(row, 'genre', 'category') || 'სხვა').split(/\s*[/,]\s*/).filter(Boolean);
    byId('detail-genres').innerHTML = genres.map(item => `<span>${item.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span>`).join('');
    const studioName = value(row, 'studio_name') || (row.is_official ? 'ოფიციალური სტუდია' : 'სტუდია პრიზმა');
    byId('studio-name').textContent = studioName;
    const studioLogo = externalUrl(value(row, 'studio_logo_url'));
    if (studioLogo) { byId('studio-logo').src = studioLogo; byId('studio-logo').alt = studioName; byId('studio-logo').hidden = false; }
    byId('official-note').hidden = !row.is_official;
    setLink('website-link', value(row, 'studio_website_url', 'creator_url'));
    setLink('trailer-link', value(row, 'trailer_url'));
    const original = value(row, 'original_link'); setLink('original-link', original);
    const cast = String(value(row, 'cast_members')).split('\n').map(item => item.trim()).filter(Boolean);
    const creative = [
      ['რეჟისორი', value(row, 'director_name')],
      ['სცენარის ავტორი', value(row, 'writer_names')],
      ['პროდიუსერი', value(row, 'producer_names')],
    ].filter(item => item[1]);
    currentRow = row;
    posterSrc = poster;
    const episodes = playlist(row);
    const embed = episodes.length ? prepareRumbleUrl(episodes.find(item => item.video_url)?.video_url || '') : prepareRumbleUrl(value(row, videoField));
    byId('watch-button').disabled = false;
    byId('watch-label').textContent = episodes.length ? 'ეპიზოდების ყურება' : `${kind}ს ყურება`;
    playerEmbed = embed;
    renderDetailHub(row, episodes, cast, creative, poster);
    document.title = `${title} — სტუდია პრიზმა`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', value(row, 'description') || title);
    const saved = JSON.parse(localStorage.getItem('prisma-detail-saved') || '[]');
    byId('save-button').classList.toggle('active', saved.includes(row.id));
    byId('save-label').textContent = saved.includes(row.id) ? 'შენახულია' : 'შენახვა';
    byId('save-button').onclick = () => {
      const current = JSON.parse(localStorage.getItem('prisma-detail-saved') || '[]');
      const next = current.includes(row.id) ? current.filter(id => id !== row.id) : [...current, row.id];
      localStorage.setItem('prisma-detail-saved', JSON.stringify(next));
      byId('save-button').classList.toggle('active', next.includes(row.id));
      byId('save-label').textContent = next.includes(row.id) ? 'შენახულია' : 'შენახვა';
    };
    const playing = new URLSearchParams(location.search).get('play') === '1';
    byId('detail-content').hidden = playing;
    byId('detail-status').hidden = true;
    if (playing) paintWatch(false);
    if (window.lucide) window.lucide.createIcons();
  }

  function playlist(row) {
    if (row.content_type !== 'series' || !Array.isArray(row.seasons)) return [];
    return [...row.seasons]
      .sort((a, b) => Number(a.number) - Number(b.number))
      .flatMap(season => [...(season.episodes || [])]
        .sort((a, b) => Number(a.number) - Number(b.number))
        .map(episode => ({
          season: Number(season.number),
          seasonTitle: season.title || '',
          episode: Number(episode.number),
          title: episode.title || 'ეპიზოდი',
          description: episode.description || '',
          video_url: prepareRumbleUrl(episode.video_url),
        })));
  }

  function chosenEpisode(items) {
    const params = new URLSearchParams(location.search);
    const season = Number(params.get('season'));
    const episode = Number(params.get('episode'));
    return items.find(item => item.season === season && item.episode === episode)
      || items.find(item => item.video_url)
      || items[0]
      || null;
  }

  function watchHref(item) {
    const params = new URLSearchParams(location.search);
    params.set('play', '1');
    params.delete('season');
    params.delete('episode');
    if (item) { params.set('season', String(item.season)); params.set('episode', String(item.episode)); }
    return `${location.pathname}?${params}`;
  }

  function detailHref() {
    const params = new URLSearchParams(location.search);
    params.delete('play'); params.delete('season'); params.delete('episode');
    return `${location.pathname}?${params}`;
  }

  function mountPlayer(url) {
    const frame = byId('watch-frame');
    const error = byId('watch-error');
    const skeleton = byId('watch-skeleton');
    if (!url) {
      frame.replaceChildren();
      mountedSrc = '';
      skeleton.hidden = true;
      byId('watch-error-text').textContent = 'ვიდეო ჯერ არ ატვირთულა';
      byId('watch-retry').hidden = true;
      error.hidden = false;
      return;
    }
    if (mountedSrc === url && frame.querySelector('iframe')) return;
    mountedSrc = url;
    error.hidden = true;
    byId('watch-retry').hidden = false;
    skeleton.hidden = false;
    const iframe = document.createElement('iframe');
    iframe.title = byId('watch-heading').textContent || 'ვიდეო';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => { skeleton.hidden = true; });
    frame.replaceChildren(iframe);
    try {
      const embedUrl = new URL(url);
      if (embedUrl.hostname.endsWith('rumble.com')) embedUrl.searchParams.set('autoplay', '2');
      iframe.src = embedUrl.href;
    } catch {
      iframe.src = url;
    }
  }

  function paintWatch(push, explicit) {
    if (!currentRow) return;
    const items = playlist(currentRow);
    const current = explicit || (items.length ? chosenEpisode(items) : null);
    const show = value(currentRow, 'title') || kind;
    const facts = [value(currentRow, 'release_year'), value(currentRow, 'duration'), Number(currentRow.rating) ? Number(currentRow.rating).toFixed(1) : ''].filter(Boolean);
    byId('watch-show').textContent = show;
    byId('watch-position').textContent = current ? `სეზონი ${current.season} · ეპიზოდი ${current.episode}` : '';
    byId('watch-kicker').textContent = current ? `${show}` : (table === 'movies' ? 'ფილმი' : 'ვიდეო');
    byId('watch-heading').textContent = current ? current.title : show.split('|')[0].trim();
    byId('watch-facts').textContent = current ? `სეზონი ${current.season} · ეპიზოდი ${current.episode}` : facts.join(' · ');
    byId('watch-blurb').textContent = current?.description || value(currentRow, 'description') || '';
    byId('watch-ambient').style.backgroundImage = posterSrc ? `url("${posterSrc.replaceAll('"', '%22')}")` : '';
    const watchPoster = byId('watch-poster');
    if (watchPoster) { watchPoster.src = posterSrc; watchPoster.alt = show; }
    document.body.classList.add('is-watching');
    byId('watch-shell').hidden = false;
    byId('detail-content').hidden = true;
    document.querySelector('.detail-header').hidden = true;
    const index = current ? items.indexOf(current) : -1;
    const previous = index > 0 ? items[index - 1] : null;
    const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
    byId('watch-jump').hidden = !items.length;
    byId('watch-prev').hidden = !previous;
    byId('watch-next').hidden = !next;
    byId('watch-prev').onclick = () => previous && paintWatch(true, previous);
    byId('watch-next').onclick = () => next && paintWatch(true, next);
    const episodePanel = byId('watch-episodes');
    episodePanel.hidden = !items.length;
    if (items.length) {
      const seasonNumbers = [...new Set(items.map(item => item.season))];
      const seasonSelect = byId('watch-season');
      const activeSeason = current ? current.season : seasonNumbers[0];
      seasonSelect.replaceChildren();
      seasonNumbers.forEach(number => {
        const option = document.createElement('option');
        option.value = String(number);
        const named = items.find(item => item.season === number && item.seasonTitle);
        option.textContent = named?.seasonTitle ? `სეზონი ${number} — ${named.seasonTitle}` : `სეზონი ${number}`;
        option.selected = number === activeSeason;
        seasonSelect.append(option);
      });
      seasonSelect.onchange = () => {
        const first = items.find(item => item.season === Number(seasonSelect.value));
        if (first) paintWatch(true, first);
      };
      const list = byId('watch-episode-list');
      list.replaceChildren();
      items.filter(item => item.season === activeSeason).forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `episode-row${current && item.season === current.season && item.episode === current.episode ? ' is-current' : ''}`;
        const thumb = document.createElement('span');
        thumb.className = 'episode-thumb';
        if (posterSrc) { const image = document.createElement('img'); image.src = posterSrc; image.alt = ''; image.loading = 'lazy'; thumb.append(image); }
        const copy = document.createElement('span');
        const title = document.createElement('strong');
        title.textContent = `${item.episode}. ${item.title}`;
        copy.append(title);
        if (current && item.season === current.season && item.episode === current.episode) {
          const badge = document.createElement('em'); badge.textContent = 'ახლა უყურებ'; copy.append(badge);
        }
        if (item.description) { const text = document.createElement('small'); text.textContent = item.description; copy.append(text); }
        button.append(thumb, copy);
        button.addEventListener('click', () => paintWatch(true, item));
        list.append(button);
      });
    }
    const target = current ? current.video_url : playerEmbed;
    renderWatchControls(items, current);
    if (push) history.pushState({ play: true }, '', watchHref(current));
    else if (current && new URLSearchParams(location.search).get('episode') !== String(current.episode)) history.replaceState({ play: true }, '', watchHref(current));
    document.title = current ? `${show} — ს${current.season} ე${current.episode}` : `${show} — ყურება`;
    mountPlayer(target);
  }

  async function load() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) { byId('detail-status').textContent = `${kind} ვერ მოიძებნა.`; return; }
    const { data, error } = await _supabase.from(table).select('*').eq('id', id).single();
    if (error || !data) { byId('detail-status').textContent = `${kind} ვერ მოიძებნა.`; return; }
    render(data);
    const rpc = table === 'movies' ? ['increment_movie_views', { movie_id: id }] : ['increment_short_views', { video_id: id }];
    _supabase.rpc(rpc[0], rpc[1]).then(() => {}).catch(() => {});
  }

  function leaveWatch() {
    byId('watch-frame').querySelector('iframe')?.contentWindow?.postMessage('{"method":"pause"}', '*');
    document.body.classList.remove('is-watching');
    byId('watch-shell').hidden = true;
    byId('detail-content').hidden = false;
    document.querySelector('.detail-header').hidden = false;
    document.title = `${value(currentRow || {}, 'title') || kind} — სტუდია პრიზმა`;
  }

  byId('watch-button').addEventListener('click', () => paintWatch(true));
  byId('watch-back').addEventListener('click', () => {
    location.assign(table === 'movies' ? '/?section=Movies' : '/?section=Videos');
  });
  byId('watch-retry').addEventListener('click', () => { const src = mountedSrc; mountedSrc = ''; mountPlayer(src); });
  addEventListener('popstate', () => {
    if (!currentRow) return;
    if (new URLSearchParams(location.search).get('play') === '1') paintWatch(false);
    else leaveWatch();
  });
  byId('share-button').addEventListener('click', async () => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); byId('share-label').textContent = 'დაკოპირდა'; } } catch {} });
  addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (document.body.classList.contains('is-watching')) byId('watch-back').click();
  });
  load();
})();
