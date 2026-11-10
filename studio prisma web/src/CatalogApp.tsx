import { useEffect, useMemo, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import '../../cinema-shell.css';
import './cinema.css';
import { AppHeader } from './components/AppHeader';
import { CatalogSkeleton } from './components/CatalogSkeleton';
import { GenreRail } from './components/GenreRail';
import { HeroCarousel } from './components/HeroCarousel';
import { MediaCard } from './components/MediaCard';
import { MediaRail } from './components/MediaRail';
import { SearchOverlay } from './components/SearchOverlay';
import { StudioRail } from './components/StudioRail';
import { TopRankRail } from './components/TopRankRail';
import { loadSection, sectionLabels, type CatalogItem, type Section } from './data/catalog';
import type { ActiveNavTab } from './types';

const isSection = (value: string): value is Section => Object.hasOwn(sectionLabels, value);

function initialTab(): ActiveNavTab {
  const value = new URLSearchParams(location.search).get('section') || 'Home';
  return isSection(value) || value === 'Watchlist' || value === 'History' || value === 'TV Series' || value === 'Discover' ? value : 'Home';
}

function readSaved(key: string): CatalogItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter(item => item && isSection(item.section) && typeof item.href === 'string' && Array.isArray(item.categories)) : [];
  } catch { return []; }
}

export default function CatalogApp() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(initialTab);
  const [category, setCategory] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [retry, setRetry] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('prisma-theme') !== 'soft'; } catch { return true; }
  });
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(() => new URLSearchParams(location.search).has('search'));
  const [saved, setSaved] = useState(() => readSaved('prisma-saved'));
  const [history, setHistory] = useState(() => readSaved('prisma-history'));
  const [genre, setGenre] = useState<string | null>(null);
  const home = activeTab === 'Home';
  const section = isSection(activeTab) ? activeTab
    : home || activeTab === 'TV Series' || activeTab === 'Discover' ? 'Movies' : null;

  useEffect(() => {
    try { localStorage.setItem('prisma-theme', darkMode ? 'dark' : 'soft'); } catch { /* storage unavailable */ }
  }, [darkMode]);

  const selectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setCategory(null);
    const url = new URL(location.href);
    if (tab === 'Home') url.searchParams.delete('section');
    else url.searchParams.set('section', tab);
    url.searchParams.delete('search');
    if (url.href !== location.href) window.history.pushState({}, '', url);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPop = () => { setActiveTab(initialTab()); setCategory(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setWarning('');
    setItems([]);
    setCategories([]);
    if (!section) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    loadSection(section, controller.signal).then(result => {
      if (!controller.signal.aborted) { setItems(result.items); setCategories(result.categories); setWarning(result.categoryWarning); }
    }).catch(loadError => { if (!controller.signal.aborted) setError(loadError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [section, retry]);

  useEffect(() => {
    if (!category) return;
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [category]);

  useEffect(() => { try { localStorage.setItem('prisma-saved', JSON.stringify(saved)); } catch { /* ignore quota */ } }, [saved]);
  useEffect(() => { try { localStorage.setItem('prisma-history', JSON.stringify(history)); } catch { /* ignore quota */ } }, [history]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const remember = (item: CatalogItem) => {
    const next = [item, ...history.filter(entry => entry.id !== item.id)].slice(0, 50);
    try { localStorage.setItem('prisma-history', JSON.stringify(next)); } catch { /* ignore quota */ }
    setHistory(next);
  };
  const open = (item: CatalogItem) => {
    remember(item);
    if (item.section === 'Articles') location.assign(item.href);
    else location.assign(`${item.href}${item.href.includes('?') ? '&' : '?'}play=1`);
  };
  const visit = (item: CatalogItem) => {
    remember(item);
    location.assign(item.href);
  };
  const toggleSaved = (item: CatalogItem) => setSaved(prev => prev.some(entry => entry.id === item.id) ? prev.filter(entry => entry.id !== item.id) : [...prev, item]);

  const source = activeTab === 'Watchlist' ? saved
    : activeTab === 'History' ? history
    : activeTab === 'TV Series' ? items.filter(item => item.isSeries)
    : activeTab === 'Movies' ? items.filter(item => !item.isSeries) : items;
  const availableCategories = section === 'Articles' ? categories : [...new Set(source.flatMap(item => item.categories))];
  const filtered = source.filter(item => !category || item.categories.includes(category));
  const title = isSection(activeTab) ? sectionLabels[activeTab]
    : { Watchlist: 'შენახული', History: 'ისტორია', 'TV Series': 'სერიალები', Discover: 'აღმოაჩინე', Home: 'კატალოგი', Categories: 'კატეგორიები' }[activeTab];
  const savedIds = useMemo(() => new Set(saved.map(item => item.id)), [saved]);
  const fresh = source.filter(item => !item.comingSoon);
  const freshMovies = fresh.filter(item => !item.isSeries);
  const freshSeries = fresh.filter(item => item.isSeries);
  const ranked = source.filter(item => item.topPosition != null).sort((a, b) => a.topPosition! - b.topPosition!);
  const topMovies = ranked.filter(item => !item.isSeries).slice(0, 10);
  const topSeries = ranked.filter(item => item.isSeries).slice(0, 10);
  const topRated = fresh.filter(item => item.rating > 0).sort((a, b) => b.rating - a.rating)
    .slice(0, 10).map((item, index) => ({ ...item, topPosition: index + 1 }));
  const browsing = !category && !!section && activeTab !== 'Discover';
  const featured = browsing ? [...ranked, ...fresh.filter(item => item.topPosition == null)].slice(0, 10) : [];
  const comingSoon = source.filter(item => item.comingSoon);
  const recent = home ? history.slice(0, 12) : history.filter(item => item.section === section).slice(0, 12);
  const activeGenre = genre && availableCategories.includes(genre) ? genre : fresh[0]?.categories[0];
  const genreItems = activeGenre ? source.filter(item => item.categories.includes(activeGenre)) : [];
  const card = (item: CatalogItem) => (
    <MediaCard key={item.id} item={item} saved={savedIds.has(item.id)} onOpen={visit} onToggleSave={toggleSaved} />
  );

  return (
    <div className={`cinema-app ${darkMode ? '' : 'cinema-soft'}`}>
      <AppHeader active={activeTab} scrolled={scrolled || !browsing} dark={darkMode} onSelect={selectTab} onSearch={() => setSearchOpen(true)} onToggleTheme={() => setDarkMode(value => !value)} />
      <main>
        {loading ? <CatalogSkeleton /> : error ? (
          <div className="cinema-status" role="alert">{error}<button type="button" onClick={() => setRetry(value => value + 1)}>ხელახლა ცდა</button></div>
        ) : (
          <>
            {browsing && featured.length > 0 && (
              <HeroCarousel
                key={featured.map(item => item.id).join('|')}
                items={featured}
                savedIds={savedIds}
                actionLabel={activeTab === 'Articles' ? 'წაკითხვა' : 'ყურება'}
                onPlay={open}
                onMore={visit}
                onToggleSave={toggleSaved}
              />
            )}
            <div className={`cinema-content ${browsing && featured.length ? 'with-hero' : 'without-hero'}`}>
              {browsing && recent.length > 0 && <MediaRail eyebrow="განაგრძე" title="ბოლოს გახსნილი" onSeeAll={() => selectTab('History')}>{recent.map(card)}</MediaRail>}
              {browsing && freshMovies.length > 0 && (
                <MediaRail eyebrow="უკვე ხელმისაწვდომია" title={home ? 'ახლად დამატებული ფილმები' : 'ახალი დამატებული'}>{freshMovies.slice(0, 12).map(card)}</MediaRail>
              )}
              {browsing && freshSeries.length > 0 && <MediaRail eyebrow="უკვე ხელმისაწვდომია" title="ახალი სერიალები">{freshSeries.slice(0, 12).map(card)}</MediaRail>}
              {browsing && <TopRankRail title="ტოპ ფილმები" items={topMovies} onOpen={visit} onSeeAll={() => selectTab('Movies')} />}
              {browsing && <TopRankRail title="ტოპ სერიალები" items={topSeries} onOpen={visit} onSeeAll={() => selectTab('TV Series')} />}
              {home && !category && <StudioRail items={source} renderCard={card} />}
              {home && !category && <TopRankRail eyebrow="მაყურებლის რჩეული" title="მაღალრეიტინგული" items={topRated} onOpen={visit} onSeeAll={() => selectTab('Discover')} />}
              {browsing && comingSoon.length > 0 && <MediaRail eyebrow="ანონსი" title="მალე დაემატება">{comingSoon.map(card)}</MediaRail>}
              {browsing && activeGenre && (
                <div className="genre-block">
                  <GenreRail categories={availableCategories} items={source} active={activeGenre} onSelect={setGenre} />
                  <MediaRail key={activeGenre} title={activeGenre} onSeeAll={() => setCategory(activeGenre)}>
                    {genreItems.slice(0, 12).map(card)}
                  </MediaRail>
                </div>
              )}
              {(!home || category || !fresh.length) && <section className="catalog-section">
                <div className="catalog-heading">
                  <div>
                    <p className="eyebrow">{category ? 'კატეგორია' : 'კატალოგი'}</p>
                    <h2>{category || title}</h2>
                  </div>
                </div>
                <div className="cinema-categories" aria-label="კატეგორიები">
                  {[null, ...availableCategories].map(value => (
                    <button type="button" key={value ?? '__all'} aria-pressed={category === value} onClick={() => setCategory(value)}>{value ?? 'ყველა'}</button>
                  ))}
                </div>
                {warning && <p role="status">{warning}</p>}
                <div className="catalog-count">{filtered.length} ჩანაწერი</div>
                {filtered.length
                  ? <div className="cinema-grid">{filtered.map(card)}</div>
                  : <p className="cinema-empty" role="status">{category ? 'ამ არჩევანით ჩანაწერი ვერ მოიძებნა.' : 'ამ განყოფილებაში ჯერ ჩანაწერები არ არის.'}</p>}
              </section>}
            </div>
          </>
        )}
      </main>
      <footer className="cinema-footer">
        <div><div className="footer-brand"><Clapperboard size={18} /> სტუდია პრიზმა</div><p>სხვა კუთხით დანახული სამყარო.</p></div>
        <nav><a href="/about.html">ჩვენ შესახებ</a><a href="/privacy.html">კონფიდენციალურობა</a><a href="/terms.html">სარგებლობის წესები</a></nav>
        <p className="footer-note">ფილმები, ვიდეოები და სტატიები — ერთ სივრცეში.</p>
      </footer>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onOpen={visit} />
    </div>
  );
}
