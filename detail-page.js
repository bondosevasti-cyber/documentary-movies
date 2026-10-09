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
    if (cast.length || creative.length) {
      const panel = document.createElement('section'); panel.className = 'detail-panel';
      const heading = document.createElement('h2'); heading.textContent = 'მსახიობები და შემოქმედებითი გუნდი'; panel.appendChild(heading);
      const columns = document.createElement('div'); columns.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px';
      const castList = document.createElement('div'); castList.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px';
      cast.forEach(person => { const item = document.createElement('div'); item.className = 'detail-link'; item.style.justifyContent = 'flex-start'; item.textContent = person; castList.appendChild(item); });
      const team = document.createElement('div'); team.style.cssText = 'display:grid;gap:14px';
      creative.forEach(([label, names]) => { const item = document.createElement('div'); const small = document.createElement('small'); small.style.cssText = 'display:block;color:#777b86;margin-bottom:4px'; small.textContent = label; const strong = document.createElement('strong'); strong.textContent = names; item.append(small, strong); team.appendChild(item); });
      columns.append(castList, team); panel.appendChild(columns); document.querySelector('.detail-grid > section').appendChild(panel);
    }
    currentRow = row;
    posterSrc = poster;
    const episodes = playlist(row);
    const embed = episodes.length ? prepareRumbleUrl(episodes.find(item => item.video_url)?.video_url || '') : prepareRumbleUrl(value(row, videoField));
    byId('watch-button').disabled = !embed;
    byId('watch-label').textContent = embed ? (episodes.length ? 'ეპიზოდების ყურება' : `${kind}ს ყურება`) : 'მალე დაემატება';
    playerEmbed = embed;
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
      byId('watch-error-text').textContent = 'ვიდეოს ბმული ჯერ არ არის დამატებული.';
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
    iframe.src = url;
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
        button.disabled = !item.video_url;
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
    const target = current?.video_url || playerEmbed;
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

  byId('watch-button').addEventListener('click', () => { if (playerEmbed) paintWatch(true); });
  byId('watch-back').addEventListener('click', () => {
    if (history.state && history.state.play) history.back();
    else location.assign(detailHref());
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
