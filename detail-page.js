(function () {
  const body = document.body;
  const table = body.dataset.table;
  const videoField = body.dataset.videoField;
  const kind = table === 'movies' ? 'ფილმი' : 'ვიდეო';
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
    setLink('video-source-link', value(row, 'rumble_link'));
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
    const embed = prepareRumbleUrl(value(row, videoField));
    byId('watch-button').disabled = !embed;
    byId('watch-label').textContent = embed ? `${kind}ს ყურება` : 'მალე დაემატება';
    if (embed) byId('player-frame').innerHTML = `<iframe src="${embed.replaceAll('"', '&quot;')}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
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
    byId('detail-content').hidden = false; byId('detail-status').hidden = true;
    if (window.lucide) window.lucide.createIcons();
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

  byId('watch-button').addEventListener('click', () => byId('player-overlay').classList.add('open'));
  byId('player-close').addEventListener('click', () => { byId('player-overlay').classList.remove('open'); byId('player-frame').querySelector('iframe')?.contentWindow?.postMessage('{"method":"pause"}', '*'); });
  byId('player-overlay').addEventListener('click', event => { if (event.target === byId('player-overlay')) byId('player-close').click(); });
  byId('share-button').addEventListener('click', async () => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); byId('share-label').textContent = 'დაკოპირდა'; } } catch {} });
  addEventListener('keydown', event => { if (event.key === 'Escape') byId('player-close').click(); });
  load();
})();
