import { useEffect, useMemo, useState } from 'react';
import { Triangle } from 'lucide-react';
import './cinema.css';
import { AppHeader } from './components/AppHeader';
import { CatalogSkeleton } from './components/CatalogSkeleton';
import { GenreRail } from './components/GenreRail';
import { HeroCarousel } from './components/HeroCarousel';
import { InlinePlayerModal } from './components/InlinePlayerModal';
import { MediaCard } from './components/MediaCard';
import { MediaRail } from './components/MediaRail';
import { SearchOverlay } from './components/SearchOverlay';
import { TopRankRail } from './components/TopRankRail';
import { loadSection, sectionLabels, type CatalogItem, type Section } from './data/catalog';
import type { ActiveNavTab } from './types';

const isSection = (value: string): value is Section => Object.hasOwn(sectionLabels, value);

function initialTab(): ActiveNavTab {
  const value = new URLSearchParams(location.search).get('section') || 'Movies';
  return isSection(value) || value === 'Watchlist' || value === 'History' ? value : 'Movies';
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
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [saved, setSaved] = useState(() => readSaved('prisma-saved'));
  const [history, setHistory] = useState(() => readSaved('prisma-history'));
  const [player, setPlayer] = useState<CatalogItem | null>(null);

  const selectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setCategory(null);
    const url = new URL(location.href);
    url.searchParams.set('section', tab);
    window.history.pushState({}, '', url);
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
    if (!isSection(activeTab)) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    loadSection(activeTab, controller.signal).then(result => {
      if (!controller.signal.aborted) { setItems(result.items); setCategories(result.categories); setWarning(result.categoryWarning); }
    }).catch(loadError => { if (!controller.signal.aborted) setError(loadError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [activeTab, retry]);

  useEffect(() => {
    if (!category) return;
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [category]);

  useEffect(() => { try { localStorage.setItem('prisma-saved', JSON.stringify(saved)); } catch { /* ignore quota */ } }, [saved]);
  useEffect(() => { try { localStorage.setItem('prisma-history', JSON.stringify(history)); } catch { /* ignore quota */ } }, [history]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setPlayer(null); setSearchOpen(false); }
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const remember = (item: CatalogItem) => {
    const next = [item, ...history.filter(entry => entry.id !== item.id)].slice(0, 50);
    try { localStorage.setItem('prisma-history', JSON.stringify(next)); } catch { /* ignore quota */ }
    setHistory(next);
    return next;
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

  const source = activeTab === 'Watchlist' ? saved : activeTab === 'History' ? history : items;
  const availableCategories = isSection(activeTab) ? categories : [...new Set(source.flatMap(item => item.categories))];
  const filtered = source.filter(item => !category || item.categories.includes(category));
  const title = isSection(activeTab) ? sectionLabels[activeTab] : activeTab === 'Watchlist' ? 'შენახული' : 'ისტორია';
  const savedIds = useMemo(() => new Set(saved.map(item => item.id)), [saved]);
  const ranked = items.filter(item => item.topPosition != null).sort((a, b) => a.topPosition! - b.topPosition!).slice(0, 10);
  const featured = (activeTab === 'Movies' && ranked.length ? ranked : items.filter(item => !item.comingSoon)).slice(0, 5);
  const browsing = !category && isSection(activeTab);
  const fresh = items.filter(item => !item.comingSoon).slice(0, 14);
  const categoryRails = availableCategories
    .map(name => ({ name, items: items.filter(item => item.categories.includes(name) && !item.comingSoon).slice(0, 14) }))
    .filter(rail => rail.items.length >= 3)
    .slice(0, 4);
  const recent = history.filter(item => item.section === activeTab).slice(0, 12);
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
                items={featured}
                savedIds={savedIds}
                actionLabel={activeTab === 'Articles' ? 'წაკითხვა' : 'ყურება'}
                onPlay={open}
                onMore={visit}
                onToggleSave={toggleSaved}
              />
            )}
            <div className={`cinema-content ${browsing && featured.length ? 'with-hero' : 'without-hero'}`}>
              {browsing && ranked.length > 0 && <TopRankRail title="TOP 5" items={ranked} onOpen={visit} />}
              {browsing && recent.length > 0 && <MediaRail title="ბოლოს გახსნილი" onSeeAll={() => selectTab('History')}>{recent.map(card)}</MediaRail>}
              {browsing && fresh.length > 0 && <MediaRail title="ახალი დამატებული">{fresh.map(card)}</MediaRail>}
              {browsing && categoryRails.map(rail => (
                <MediaRail key={rail.name} title={rail.name} onSeeAll={() => setCategory(rail.name)}>{rail.items.map(card)}</MediaRail>
              ))}
              {browsing && activeTab === 'Movies' && items.some(item => item.comingSoon) && (
                <MediaRail title="მალე დაემატება">{items.filter(item => item.comingSoon).map(card)}</MediaRail>
              )}
              {browsing && <GenreRail categories={availableCategories} items={items} onSelect={setCategory} />}
              <section className="catalog-section">
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
              </section>
            </div>
          </>
        )}
      </main>
      <footer className="cinema-footer">
        <div><div className="footer-brand"><Triangle size={16} /> სტუდია პრიზმა</div><p>სხვა კუთხით დანახული სამყარო.</p></div>
        <nav><a href="/about.html">ჩვენ შესახებ</a><a href="/privacy.html">კონფიდენციალურობა</a><a href="/terms.html">სარგებლობის წესები</a></nav>
        <p className="footer-note">ფილმები, ვიდეოები და სტატიები — ერთ სივრცეში.</p>
      </footer>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onOpen={visit} />
      <InlinePlayerModal item={player} onClose={() => setPlayer(null)} />
    </div>
  );
}
