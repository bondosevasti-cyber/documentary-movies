import { useEffect, useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Info, Play } from 'lucide-react';
import type { CatalogItem } from '../data/catalog';

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HeroCarousel({ items, savedIds, actionLabel, onPlay, onMore, onToggleSave }: {
  items: CatalogItem[];
  savedIds: Set<string>;
  actionLabel: string;
  onPlay: (item: CatalogItem) => void;
  onMore: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const current = items[index] || items[0];

  useEffect(() => { setIndex(0); }, [items.map(item => item.id).join('|')]);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion()) return;
    let timer = 0;
    const start = () => { timer = window.setInterval(() => setIndex(value => (value + 1) % count), 9000); };
    const onVisibility = () => {
      window.clearInterval(timer);
      if (document.visibilityState === 'visible') start();
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, paused, items.map(item => item.id).join('|')]);

  if (!current) return null;
  const upcoming = Array.from({ length: Math.min(3, count - 1) }, (_, step) => items[(index + step + 1) % count]);
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section className="os-hero" aria-roledescription="კარუსელი" aria-label="რჩეული" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="os-hero-media">
        {items.map((item, itemIndex) => (
          <div key={item.id} className={`os-hero-slide ${itemIndex === index ? 'is-active' : ''}`} aria-hidden={itemIndex !== index}>
            {item.backdropUrl && <img src={item.backdropUrl} alt="" fetchPriority={itemIndex === 0 ? 'high' : 'low'} decoding="async" />}
          </div>
        ))}
        <div className="os-hero-shade" />
      </div>
      <div className="os-hero-copy">
        <p className="hero-kicker">
          {current.topPosition ? `#${current.topPosition} ტრენდული` : 'რჩეული'}
          <span>{current.categories[0]}</span>
          {current.year > 0 && <span>{current.year}</span>}
        </p>
        {current.titleImageUrl
          ? <img className="hero-title-image" src={current.titleImageUrl} alt={current.title} />
          : !current.hideHeroTitle && <h1>{current.title.split('|')[0].trim()}</h1>}
        <div className="hero-metadata">
          {current.rating > 0 && <span className="rating">★ {current.rating.toFixed(1)}</span>}
          {current.categories.slice(0, 3).map(category => <span key={category} className="pill">{category}</span>)}
        </div>
        {current.description && <p className="hero-description">{current.description}</p>}
        <div className="hero-actions">
          <button type="button" className="os-play" onClick={() => onPlay(current)}><Play size={18} fill="currentColor" /> {actionLabel}</button>
          <button type="button" className="os-info" onClick={() => onMore(current)}><Info size={16} /> მეტი ინფორმაცია</button>
          <button type="button" className="os-icon" aria-label={`შენახვა: ${current.title}`} aria-pressed={savedIds.has(current.id)} onClick={() => onToggleSave(current)}>
            <Bookmark size={16} fill={savedIds.has(current.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        {count > 1 && (
          <div className="hero-progress">
            {items.map((item, itemIndex) => (
              <button type="button" key={item.id} aria-label={`${itemIndex + 1} / ${count}`} aria-current={itemIndex === index} onClick={() => go(itemIndex)} />
            ))}
            <button type="button" aria-label="წინა" onClick={() => go(index - 1)}><ChevronLeft size={16} /></button>
            <button type="button" aria-label="შემდეგი" onClick={() => go(index + 1)}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
      {count > 1 && (
        <div className="os-upnext">
          <p>შემდეგი</p>
          {upcoming.map(item => {
            const itemIndex = items.findIndex(entry => entry.id === item.id);
            return (
              <button type="button" key={item.id} onClick={() => go(itemIndex)}>
                {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" />}
                <span>{item.title.split('|')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
