(function () {
  const body = document.body;
  const table = body.dataset.table;
  const videoField = body.dataset.videoField;
  const kind = table === 'movies' ? 'ფილმი' : 'ვიდეო';
  const cinema = body.classList.contains('cinema-detail');
  let playerEmbed = '';
  let currentRow = null;
  let posterSrc = '';
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

  function renderLegacyDetail(row) {
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
    renderDetailHub(row, playlist(row), cast, creative, poster);
  }

  function readList(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch { return []; }
  }

  function movieGenres(row) {
    return String(value(row, 'genre', 'category')).split(/\s*[/,]\s*/).filter(Boolean);
  }

  function trailerThumbnail(url, backdrop) {
    try {
      const parsed = new URL(url, location.href);
      const host = parsed.hostname.replace(/^www\./, '');
      const id = host === 'youtu.be' ? parsed.pathname.split('/')[1]
        : host === 'youtube.com' || host === 'youtube-nocookie.com' ? parsed.searchParams.get('v') || parsed.pathname.split('/')[2] : '';
      if (/^[A-Za-z0-9_-]{11}$/.test(id || '')) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    } catch { /* use the catalog artwork */ }
    return backdrop;
  }

  function movieHeading(eyebrow, title, badge = '') {
    return `<div class="movie-heading"><div><p class="movie-eyebrow">${eyebrow}</p><h2>${title}</h2></div>${badge ? `<span class="movie-heading-badge">${badge}</span>` : ''}</div>`;
  }

  function renderCinemaDetail(row, episodes) {
    const title = String(value(row, 'title')).split('|')[0].trim();
    const art = value(row, 'title_image_url');
    const backdrop = value(row, 'cover_url', 'photo_url', 'card_url', 'poster_url');
    const backdropStyle = backdrop ? `url("${String(backdrop).replaceAll('"', '%22')}")` : '';
    byId('detail-backdrop').style.backgroundImage = backdropStyle;
    byId('movie-ambient').style.backgroundImage = backdropStyle;
    byId('detail-title').textContent = title;
    byId('detail-title').hidden = Boolean(art);
    if (art) { const image = byId('detail-title-art'); image.src = art; image.alt = title; image.hidden = false; }

    const isSeries = row.content_type === 'series';
    const type = isSeries ? 'სერიალი' : kind;
    byId('movie-kicker').textContent = [type, row.release_year, row.duration, row.content_rating].filter(Boolean).join(' · ');
    const tagline = byId('movie-tagline');
    tagline.textContent = value(row, 'tagline');
    tagline.hidden = !tagline.textContent;
    const rating = Number(row.rating);
    const ratingElement = byId('movie-rating');
    ratingElement.hidden = !(rating > 0);
    if (rating > 0) {
      const stars = Array.from({ length: 5 }, (_, index) => `<i data-lucide="star" class="${index < Math.round(rating / 2) ? 'is-filled' : ''}"></i>`).join('');
      ratingElement.innerHTML = `<span class="hero-stars" aria-hidden="true">${stars}</span><b>${Math.round(rating * 10)}%</b>${row.vote_count ? `<small>(${Number(row.vote_count).toLocaleString('ka-GE')})</small>` : ''}`;
    }
    setLink('movie-imdb', value(row, 'imdb_url') || (/^tt\d+$/.test(row.imdb_id || '') ? `https://www.imdb.com/title/${row.imdb_id}/` : ''));
    const genres = movieGenres(row);
    byId('detail-genres').innerHTML = genres.map(item => `<span>${escapeHtml(item)}</span>`).join('');
    const description = byId('detail-description');
    description.textContent = value(row, 'description') || 'აღწერა ჯერ არ არის დამატებული.';
    const expand = byId('movie-expand');
    expand.onclick = () => {
      const expanded = expand.getAttribute('aria-expanded') !== 'true';
      expand.setAttribute('aria-expanded', String(expanded));
      description.classList.toggle('is-expanded', expanded);
      expand.textContent = expanded ? 'ნაკლები' : 'ვრცლად';
    };
    const measure = () => { expand.hidden = !description.classList.contains('is-expanded') && description.scrollHeight <= description.clientHeight + 1; };
    new ResizeObserver(measure).observe(description);

    const director = byId('movie-director');
    director.innerHTML = `<small>რეჟისორი</small>${escapeHtml(row.director_name)}`;
    director.hidden = !row.director_name;
    const trailer = externalUrl(value(row, 'trailer_url'));
    setLink('trailer-link', trailer);
    setLink('original-link', row.original_link);

    const cast = splitNames(row.cast_members).map(person => person.split(/\s+[—–-]\s+/, 2));
    const crew = [
      ['რეჟისორი', splitNames(row.director_name)],
      ['სცენარის ავტორი', splitNames(row.writer_names)],
      ['პროდიუსერი', splitNames(row.producer_names)],
    ].filter(([, names]) => names.length);
    const thumb = trailerThumbnail(trailer, backdrop);
    const artwork = thumb ? `<img src="${escapeHtml(thumb)}" alt="" decoding="async">` : '';
    const trailerCard = `<span class="movie-trailer-image">${artwork}<span class="movie-trailer-play"><i data-lucide="play"></i></span></span>`;
    const castTeaser = cast.length ? `<div class="movie-starring"><small>მსახიობები</small><div><span class="movie-avatar-stack">${cast.slice(0, 5).map(([name]) => createAvatar(name)).join('')}</span><span>${cast.slice(0, 3).map(([name]) => escapeHtml(name)).join(', ')}</span></div></div>` : '';
    const preview = byId('movie-preview');
    preview.innerHTML = (trailer ? `<a class="movie-preview-link" href="${escapeHtml(trailer)}" target="_blank" rel="noopener">
      ${trailerCard}<span class="movie-trailer-label">ოფიციალური ტრეილერი</span><span class="movie-preview-caption">ტრეილერის ყურება <i data-lucide="arrow-right"></i></span></a>`
      : backdrop ? `<div class="movie-preview-still"><img src="${escapeHtml(backdrop)}" alt="" decoding="async"></div>` : '') + castTeaser;
    preview.hidden = !trailer && !backdrop && !cast.length;

    const formatCurrency = value => Number(value) > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value)) : '';
    const facts = [
      ['სტატუსი', row.is_coming_soon ? 'მალე დაემატება' : 'გამოსულია'],
      ['ხანგრძლივობა', row.duration], ['ენა', value(row, 'original_language', 'spoken_languages')],
      ['გამოშვება', row.release_year], ['ბიუჯეტი', formatCurrency(row.budget)], ['შემოსავალი', formatCurrency(row.revenue)],
      ['სეზონები', isSeries ? new Set(episodes.map(episode => episode.season)).size : 0],
    ].filter(([, content]) => content);
    const studio = value(row, 'studio_name', 'production_companies');
    const studioLogo = externalUrl(row.studio_logo_url);
    const website = externalUrl(value(row, 'studio_website_url', 'creator_url'));
    const studioContent = `${studioLogo ? `<img src="${escapeHtml(studioLogo)}" alt="" loading="lazy">` : ''}<span>${escapeHtml(studio)}</span>`;
    const person = ([name, role]) => `<article class="movie-person">${createAvatar(name)}<div><strong>${escapeHtml(name)}</strong>${role ? `<p>${escapeHtml(role)}</p>` : ''}</div></article>`;
    const seasons = [...new Set(episodes.map(episode => episode.season))];
    const seasonPicker = seasons.length > 1
      ? `<label class="movie-season-picker">სეზონი <select aria-label="სეზონი">${seasons.map(season => `<option value="${season}">${season}</option>`).join('')}</select></label>` : '';
    byId('movie-sections').innerHTML = `
      <section class="movie-facts" aria-label="ფილმის მონაცემები"><dl>${facts.map(([label, content]) => `<div><dt>${label}</dt><dd>${escapeHtml(content)}</dd></div>`).join('')}</dl>
        ${studio || studioLogo ? `<div class="movie-studio"><small>სტუდია</small>${website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener">${studioContent}</a>` : studioContent}</div>` : ''}
      </section>
      ${trailer ? `<section class="movie-section">${movieHeading('უყურე', 'ტრეილერები', '1 ვიდეო')}<a class="movie-trailer-tile" href="${escapeHtml(trailer)}" target="_blank" rel="noopener">${trailerCard}<span>ოფიციალური ტრეილერი</span></a></section>` : ''}
      ${episodes.length ? `<section class="movie-section">${movieHeading('სეზონები', 'ეპიზოდები')}${seasonPicker}<div class="movie-episode-track"></div></section>` : ''}
      ${cast.length || crew.length ? `<section class="movie-cast movie-section">${movieHeading('მონაწილეობენ', 'მსახიობები და გუნდი', cast.length ? `${cast.length} მსახიობი` : '')}
        <div class="movie-cast-body">
          ${cast.length ? `<div><p class="movie-credits-label"><i data-lucide="users"></i> მსახიობები</p><div class="movie-people">${cast.map(person).join('')}</div></div>` : ''}
          ${crew.length ? `<div><p class="movie-credits-label"><i data-lucide="clapperboard"></i> შემოქმედებითი გუნდი</p>${crew.map(([role, names]) => `<div class="movie-crew"><small>${role}</small>${names.map(name => person([name])).join('')}</div>`).join('')}</div>` : ''}
        </div></section>` : ''}
      <div id="movie-related"></div>`;
    if (episodes.length) {
      const episodeTrack = document.querySelector('.movie-episode-track');
      const picker = document.querySelector('.movie-season-picker select');
      const drawEpisodes = (season) => {
        episodeTrack.replaceChildren();
        episodes.filter(episode => episode.season === season).forEach(episode => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `ე${episode.episode} — ${episode.title}`;
          button.onclick = () => paintWatch(true, episode);
          episodeTrack.append(button);
        });
      };
      drawEpisodes(seasons[0]);
      if (picker) picker.onchange = () => drawEpisodes(Number(picker.value));
    }

    const id = `Movies:${row.id}`;
    const saved = byId('save-button');
    const isSaved = () => readList('prisma-saved').some(item => item?.id === id)
      || readList('prisma-detail-saved').includes(row.id);
    saved.setAttribute('aria-pressed', String(isSaved()));
    saved.onclick = () => {
      const list = readList('prisma-saved');
      const removing = isSaved();
      const next = removing ? list.filter(item => item?.id !== id) : [...list, {
        id, section: 'Movies', categories: genres, href: `/watch_movie.html?id=${encodeURIComponent(row.id)}`,
        title, rating, year: Number(row.release_year), thumbnailUrl: value(row, 'card_url', 'poster_url'),
        backdropUrl: backdrop, posterUrl: row.poster_url, isSeries, comingSoon: row.is_coming_soon === true,
      }];
      try {
        localStorage.setItem('prisma-saved', JSON.stringify(next));
        if (removing) {
          const old = readList('prisma-detail-saved');
          if (old.includes(row.id)) localStorage.setItem('prisma-detail-saved', JSON.stringify(old.filter(savedId => savedId !== row.id)));
        }
        saved.setAttribute('aria-pressed', String(isSaved()));
      } catch { /* storage unavailable */ }
    };
  }

  async function renderRecommendations(row) {
    const { data } = await _supabase.from('movies')
      .select('id,title,cover_url,card_url,poster_url,genre,release_year,rating,content_type')
      .neq('id', row.id).order('created_at', { ascending: false }).limit(48);
    if (!data?.length) return;
    const genres = movieGenres(row);
    const similar = data.filter(item => movieGenres(item).some(genre => genres.includes(genre)));
    const recommended = data.filter(item => !similar.includes(item)).sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    const target = byId('movie-related');
    target.innerHTML = [
      ['განაგრძე ყურება', 'მსგავსი ფილმები', similar],
      ['შერჩეული შენთვის', 'რეკომენდებული ფილმები', recommended],
    ].filter(([, , items]) => items.length).map(([eyebrow, title, items]) => `
      <section class="movie-section">
        ${movieHeading(eyebrow, title)}
        <div class="movie-rail-frame">
          <div class="movie-rail">${items.slice(0, 12).map(item => {
            const image = value(item, 'cover_url', 'card_url', 'poster_url');
            return `<a class="movie-related-card" href="/watch_movie.html?id=${encodeURIComponent(item.id)}"><span class="movie-related-art">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">` : ''}</span><strong>${escapeHtml(String(item.title || '').split('|')[0].trim())}</strong><small>${escapeHtml([item.release_year, item.content_type === 'series' ? 'სერიალი' : 'ფილმი'].filter(Boolean).join(' · '))}${Number(item.rating) > 0 ? `<span>★ ${Number(item.rating).toFixed(1)}</span>` : ''}</small></a>`;
          }).join('')}</div>
          <button type="button" class="movie-rail-arrow previous" aria-label="წინა"><i data-lucide="chevron-left"></i></button>
          <button type="button" class="movie-rail-arrow next" aria-label="შემდეგი"><i data-lucide="chevron-right"></i></button>
        </div>
      </section>`).join('');
    target.querySelectorAll('.movie-rail-frame').forEach(frame => {
      const rail = frame.querySelector('.movie-rail');
      frame.querySelectorAll('button').forEach(button => {
        button.hidden = rail.scrollWidth <= rail.clientWidth;
        button.onclick = () => rail.scrollBy({
          left: (button.classList.contains('previous') ? -1 : 1) * rail.clientWidth * .86,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        });
      });
    });
    window.lucide?.createIcons();
  }

  function render(row) {
    const title = value(row, 'title');
    currentRow = row;
    posterSrc = value(row, 'poster_url', 'photo_url', 'card_url', 'cover_url');
    const episodes = playlist(row);
    playerEmbed = episodes.length
      ? episodes.find(item => item.video_url)?.video_url || ''
      : prepareRumbleUrl(value(row, videoField));
    if (cinema) renderCinemaDetail(row, episodes);
    else renderLegacyDetail(row);
    byId('watch-button').disabled = false;
    byId('watch-label').textContent = episodes.length ? 'ეპიზოდების ყურება' : cinema ? 'ყურება' : `${kind}ს ყურება`;
    document.title = `${title} — სტუდია პრიზმა`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', value(row, 'description') || title);
    if (!cinema) {
      const saved = readList('prisma-detail-saved');
      byId('save-button').classList.toggle('active', saved.includes(row.id));
      byId('save-label').textContent = saved.includes(row.id) ? 'შენახულია' : 'შენახვა';
      byId('save-button').onclick = () => {
        const current = readList('prisma-detail-saved');
        const next = current.includes(row.id) ? current.filter(id => id !== row.id) : [...current, row.id];
        localStorage.setItem('prisma-detail-saved', JSON.stringify(next));
        byId('save-button').classList.toggle('active', next.includes(row.id));
        byId('save-label').textContent = next.includes(row.id) ? 'შენახულია' : 'შენახვა';
      };
    }
    const playing = new URLSearchParams(location.search).get('play') === '1';
    byId('detail-content').hidden = playing;
    byId('detail-status').hidden = true;
    if (playing) paintWatch(false);
    if (cinema && !playing) renderRecommendations(row).catch(() => {});
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

  const watchPlayer = createWatchPlayer(byId('watch-shell'), {
    onBack() {
      if (history.state?.fromDetail && history.state?.episodeSteps >= 0) {
        history.go(-1 - history.state.episodeSteps);
      } else {
        history.replaceState({}, '', detailHref());
        leaveWatch();
      }
    },
    onEpisodeSelect(episode) { paintWatch(true, episode); },
  });

  function paintWatch(push, explicit) {
    if (!currentRow) return;
    const items = playlist(currentRow);
    const current = explicit || chosenEpisode(items);
    const show = String(value(currentRow, 'title') || kind);
    const title = show.split('|')[0].trim();
    const rating = Number(currentRow.rating);
    const position = current ? `სეზონი ${current.season} · ეპიზოდი ${current.episode}` : '';
    const facts = [currentRow.release_year, rating > 0 ? `${rating.toFixed(1)} ★` : '', currentRow.duration].filter(Boolean).join(' · ');
    if (push) {
      const fromDetail = byId('watch-shell').hidden || Boolean(history.state?.fromDetail);
      const episodeSteps = byId('watch-shell').hidden ? 0 : (history.state?.episodeSteps ?? 0) + 1;
      const href = watchHref(current);
      if (href !== location.pathname + location.search) history.pushState({ fromDetail, episodeSteps }, '', href);
    } else if (current && new URLSearchParams(location.search).get('episode') !== String(current.episode)) {
      history.replaceState(history.state, '', watchHref(current));
    }
    document.body.classList.add('is-watching');
    byId('watch-shell').hidden = false;
    byId('detail-content').hidden = true;
    document.querySelector('.detail-header').hidden = true;
    document.title = current ? `${title} — ს${current.season} ე${current.episode}` : `${title} — ყურება`;
    window.scrollTo(0, 0);
    watchPlayer.show({
      title, heading: current?.title || title, position, facts: position || facts,
      art: !current ? value(currentRow, 'title_image_url') : '',
      backdrop: value(currentRow, 'cover_url', 'photo_url', 'card_url') || posterSrc,
      description: current?.description || value(currentRow, 'description'),
      source: current ? current.video_url : playerEmbed,
      items, current,
    });
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
    watchPlayer.clear();
    document.body.classList.remove('is-watching');
    byId('watch-shell').hidden = true;
    byId('detail-content').hidden = false;
    document.querySelector('.detail-header').hidden = false;
    document.title = `${value(currentRow || {}, 'title') || kind} — სტუდია პრიზმა`;
    if (cinema && !byId('movie-related').hasChildNodes()) renderRecommendations(currentRow).catch(() => {});
  }

  byId('watch-button').addEventListener('click', () => paintWatch(true));
  addEventListener('popstate', () => {
    if (!currentRow) return;
    if (new URLSearchParams(location.search).get('play') === '1') paintWatch(false);
    else leaveWatch();
  });
  byId('share-button').addEventListener('click', async () => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); byId('share-label').textContent = 'ბმული დაკოპირდა'; } } catch {} });
  if (cinema) {
    const theme = byId('movie-theme');
    const syncTheme = (soft) => {
      body.classList.toggle('cinema-soft', soft);
      theme.setAttribute('aria-pressed', String(soft));
      theme.innerHTML = `<i data-lucide="${soft ? 'moon' : 'sun'}"></i>`;
      window.lucide?.createIcons();
    };
    let soft = false;
    try { soft = localStorage.getItem('prisma-theme') === 'soft'; } catch { /* storage unavailable */ }
    syncTheme(soft);
    theme.onclick = () => {
      const next = theme.getAttribute('aria-pressed') !== 'true';
      syncTheme(next);
      try { localStorage.setItem('prisma-theme', next ? 'soft' : 'dark'); } catch { /* storage unavailable */ }
    };
    const nav = document.querySelector('.os-nav');
    addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 24), { passive: true });
    addEventListener('DOMContentLoaded', () => window.lucide?.createIcons());
  }
  load();
})();
