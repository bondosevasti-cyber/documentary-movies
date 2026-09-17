import { useEffect, useState } from 'react';
import { Menu, X, Search, Bookmark, Play, BookOpen, ArrowRight, Film, Tv, FileText, Clock, Sun, Moon, Triangle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import './cinema.css';
import { HeroFeatured } from './components/HeroFeatured';
import { InlinePlayerModal } from './components/InlinePlayerModal';
import { loadSection, sectionLabels, type CatalogItem, type Section } from './data/catalog';
import type { ActiveNavTab } from './types';

const isSection = (value: string): value is Section => Object.hasOwn(sectionLabels, value);
function initialTab(): ActiveNavTab {
  const value = new URLSearchParams(location.search).get('section') || 'Movies';
  return isSection(value) || value === 'Watchlist' || value === 'History' ? value : 'Movies';
}
function readSaved(key: string): CatalogItem[] {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter(item => item && isSection(item.section) && typeof item.href === 'string' && Array.isArray(item.categories)) : []; }
  catch { return []; }
}

export default function CatalogApp() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(initialTab);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [retry, setRetry] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(() => readSaved('prisma-saved'));
  const [history, setHistory] = useState(() => readSaved('prisma-history'));
  const [details, setDetails] = useState<CatalogItem | null>(null);
  const [player, setPlayer] = useState<CatalogItem | null>(null);
  const selectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab); setCategory(null); setSearch(''); setMobileOpen(false);
    const url = new URL(location.href); url.searchParams.set('section', tab); window.history.pushState({}, '', url);
  };
  useEffect(() => {
    const onPop = () => { setActiveTab(initialTab()); setCategory(null); setSearch(''); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setError(''); setWarning(''); setItems([]); setCategories([]);
    if (!isSection(activeTab)) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    loadSection(activeTab, controller.signal).then(result => {
      if (!controller.signal.aborted) { setItems(result.items); setCategories(result.categories); setWarning(result.categoryWarning); }
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [activeTab, retry]);
  useEffect(() => { try { localStorage.setItem('prisma-saved', JSON.stringify(saved)); } catch {} }, [saved]);
  useEffect(() => { try { localStorage.setItem('prisma-history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setDetails(null); setPlayer(null); setMobileOpen(false); }
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); document.getElementById('catalog-search')?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const open = (item: CatalogItem) => {
    const next = [item, ...history.filter(entry => entry.id !== item.id)].slice(0, 50);
    try { localStorage.setItem('prisma-history', JSON.stringify(next)); } catch {}
    setHistory(next);
    if (item.section === 'Articles') location.assign(item.href);
    else setPlayer(item);
  };
  const visit = (item: CatalogItem) => {
    const next = [item, ...history.filter(entry => entry.id !== item.id)].slice(0, 50);
    try { localStorage.setItem('prisma-history', JSON.stringify(next)); } catch {}
    setHistory(next);
    location.assign(item.href);
  };
  const toggleSaved = (item: CatalogItem) => setSaved(prev => prev.some(entry => entry.id === item.id) ? prev.filter(entry => entry.id !== item.id) : [...prev, item]);
  const source = activeTab === 'Watchlist' ? saved : activeTab === 'History' ? history : items;
  const availableCategories = isSection(activeTab) ? categories : [...new Set(source.flatMap(item => item.categories))];
  const filtered = source.filter(item => (!category || item.categories.includes(category)) && `${item.title} ${item.description} ${item.categories.join(' ')}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const title = isSection(activeTab) ? sectionLabels[activeTab] : activeTab === 'Watchlist' ? 'შენახული' : 'ისტორია';

  const ranked = items.filter(item => item.topPosition != null).sort((a,b) => a.topPosition! - b.topPosition!).slice(0,5);
  const featured = (activeTab === 'Movies' && ranked.length ? ranked : filtered).slice(0,5);
  const browsing = !search && !category && isSection(activeTab);
  const card = (item: CatalogItem, rank?: number) => <article className="cinema-card" key={item.id}>
    <div className="cinema-card-art">
      <button onClick={() => visit(item)} aria-label={`დეტალების გახსნა: ${item.title}`}>
        {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" loading="lazy" decoding="async" />}
        <span className="card-play">{item.section === 'Articles' ? <BookOpen /> : <Play />}</span>
        {rank && <span className="rank-number">{rank}</span>}
      </button>
      <button className="card-save" aria-label={`შენახვა: ${item.title}`} aria-pressed={saved.some(entry => entry.id === item.id)} onClick={() => toggleSaved(item)}><Bookmark size={17} fill={saved.some(entry => entry.id === item.id) ? 'currentColor' : 'none'} /></button>
    </div>
    <button className="card-title" onClick={() => visit(item)}>{item.title}</button>
    <div className="card-meta"><span>{sectionLabels[item.section]}</span>{item.year > 0 && <span>{item.year}</span>}{item.rating > 0 && <span className="rating"><Star size={12} fill="currentColor" /> {item.rating}</span>}</div>
    <p className="card-category">{item.categories.join(' · ')}</p>
  </article>;

  return <div className={`cinema-app ${darkMode ? '' : 'cinema-soft'}`}>
    <header className="cinema-nav">
      <button className="cinema-brand" onClick={() => selectTab('Movies')} aria-label="სტუდია პრიზმა — მთავარი"><Triangle /><span>პრიზმა<small>STUDIO PRISMA</small></span></button>
      <nav aria-label="მთავარი ნავიგაცია">
        {([{id:'Movies',label:'ფილმები',Icon:Film},{id:'Videos',label:'ვიდეოები',Icon:Tv},{id:'Articles',label:'სტატიები',Icon:FileText}] as const).map(({id,label,Icon}) => <button key={id} onClick={() => selectTab(id)} aria-current={activeTab === id ? 'page' : undefined}><Icon size={16}/>{label}</button>)}
      </nav>
      <div className="nav-tools">
        <button aria-label="ძებნის გახსნა" onClick={() => document.getElementById('catalog-search')?.focus()}><Search size={19}/></button>
        <button aria-label="შენახული" aria-pressed={activeTab === 'Watchlist'} onClick={() => selectTab('Watchlist')}><Bookmark size={19}/></button>
        <button aria-label="ისტორია" aria-pressed={activeTab === 'History'} onClick={() => selectTab('History')}><Clock size={19}/></button>
        <button aria-label="ფონის შეცვლა" onClick={() => setDarkMode(value => !value)}>{darkMode ? <Sun size={19}/> : <Moon size={19}/>}</button>
      </div>
    </header>
    <main>
      {loading ? <div className="cinema-status" role="status">იტვირთება…</div> : error ? <div className="cinema-status" role="alert">{error}<button onClick={() => setRetry(value => value+1)}>ხელახლა ცდა</button></div> : <>
        {browsing && featured.length > 0 && <HeroFeatured key={activeTab} featuredList={featured} onPlay={doc => open(doc as CatalogItem)} onMoreInfo={doc => visit(doc as CatalogItem)} actionLabel={activeTab === 'Articles' ? 'წაკითხვა' : 'ყურება'} />}
        <div className={`cinema-content ${browsing && featured.length ? 'with-hero' : ''}`}>
          {browsing && history.some(item => item.section === activeTab) && <ContentRail title="ბოლოს გახსნილი" onSeeAll={() => selectTab('History')}>{history.filter(item => item.section === activeTab).slice(0,8).map(item => card(item))}</ContentRail>}
          {browsing && activeTab === 'Movies' && ranked.length > 0 && <ContentRail title="TOP 5" subtitle="გამორჩეული ფილმები">{ranked.map((item,index) => card(item,index+1))}</ContentRail>}
          {browsing && activeTab === 'Movies' && items.some(item => item.comingSoon) && <ContentRail title="მალე დაემატება">{items.filter(item => item.comingSoon).map(item => card(item))}</ContentRail>}
          <section className="catalog-section">
            <div className="catalog-heading"><div><p className="eyebrow">აღმოაჩინე მეტი</p><h2>{title}</h2></div>
              <label className="cinema-search"><Search size={18}/><input id="catalog-search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`ძებნა — ${title}`} aria-label="ძებნა" />{search && <button aria-label="ძებნის გასუფთავება" onClick={() => setSearch('')}><X size={16}/></button>}</label>
            </div>
            <div className="cinema-categories" aria-label="კატეგორიები">{[null,...availableCategories].map(value => <button key={value ?? '__all'} aria-pressed={category === value} onClick={() => setCategory(value)}>{value ?? 'ყველა'}</button>)}</div>
            {warning && <p role="status">{warning}</p>}
            <div className="catalog-count">{filtered.length} ჩანაწერი</div>
            {filtered.length ? <div className="cinema-grid">{filtered.map(item => card(item))}</div> : <p className="cinema-empty" role="status">{search || category ? 'ამ არჩევანით ჩანაწერი ვერ მოიძებნა.' : 'ამ განყოფილებაში ჯერ ჩანაწერები არ არის.'}</p>}
          </section>
        </div>
      </>}
    </main>
    <footer className="cinema-footer"><div><div className="footer-brand"><Triangle /> სტუდია პრიზმა</div><p>სხვა კუთხით დანახული სამყარო.</p></div><nav><a href="/about.html">ჩვენ შესახებ</a><a href="/privacy.html">კონფიდენციალურობა</a><a href="/terms.html">სარგებლობის წესები</a></nav><p className="footer-note">ფილმები, ვიდეოები და სტატიები — ერთ სივრცეში.</p></footer>
    {details && <div className="cinema-modal-backdrop" onClick={() => setDetails(null)}><section role="dialog" aria-modal="true" aria-label={details.title} className="cinema-details" onClick={event => event.stopPropagation()}><button autoFocus className="detail-close" aria-label="დახურვა" onClick={() => setDetails(null)}><X /></button>{details.backdropUrl && <img src={details.backdropUrl} alt="" />}<div><p className="eyebrow">{details.category}</p><h2>{details.title}</h2><p>{details.description || 'აღწერა არ არის დამატებული.'}</p><button className="cinema-primary" onClick={() => { open(details); setDetails(null); }}><Play size={18}/>{details.section === 'Articles' ? 'წაკითხვა' : 'ყურება'}</button></div></section></div>}
    <InlinePlayerModal item={player} onClose={() => setPlayer(null)} />
  </div>;
}

function ContentRail({title, subtitle, children, onSeeAll}: {title:string; subtitle?:string; children:React.ReactNode; onSeeAll?:()=>void}) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction:number) => rail.current?.scrollBy({left: direction * rail.current.clientWidth * .85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  return <section className="content-rail"><div className="rail-heading"><h2>{title}<span>{subtitle}</span></h2><div>{onSeeAll && <button onClick={onSeeAll}>ყველას ნახვა <ArrowRight size={14}/></button>}<button aria-label={`${title}: წინა`} onClick={() => scroll(-1)}><ChevronLeft size={18}/></button><button aria-label={`${title}: შემდეგი`} onClick={() => scroll(1)}><ChevronRight size={18}/></button></div></div><div ref={rail} className="rail-track">{children}</div></section>;
}
