import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Clapperboard, Info, Play, Star } from 'lucide-react';
import type { CatalogItem } from '../data/catalog';

const slideTime = 9500;

export function HeroCarousel({ items, savedIds, actionLabel, onPlay, onMore, onToggleSave }: {
  items: CatalogItem[];
  savedIds: Set<string>;
  actionLabel: string;
  onPlay: (item: CatalogItem) => void;
  onMore: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
}) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const count = items.length;
  const current = items[index];
  const paused = hovering || focused || hidden || reduced;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReduced(preference.matches);
    const onVisibility = () => setHidden(document.hidden);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!current) return null;
  const go = (next: number) => setIndex((next + count) % count);
  const upcoming = Array.from({ length: Math.min(3, count - 1) }, (_, step) => (index + step + 1) % count);

  return (
    <>
      <div className="os-ambient" aria-hidden="true">
        {items.map((item, position) => item.backdropUrl && (
          <img key={item.id} className={position === index ? 'is-active' : ''} src={item.backdropUrl} alt="" decoding="async" />
        ))}
      </div>
      <section className="os-hero" aria-roledescription="კარუსელი" aria-label="რჩეული"
        onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
        onTouchStart={event => {
          const touch = event.touches[0];
          startTouch.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={event => {
          const start = startTouch.current;
          const touch = event.changedTouches[0];
          startTouch.current = null;
          if (!start || !touch) return;
          const deltaX = touch.clientX - start.x;
          if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(touch.clientY - start.y) * 1.5) go(index + (deltaX < 0 ? 1 : -1));
        }}
        onFocus={event => setFocused(event.target.matches(':focus-visible'))} onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}>
        <div className="os-hero-media" aria-hidden="true">
          {items.map((item, position) => (
            <div key={item.id} className={`os-hero-slide ${position === index ? 'is-active' : ''}`}>
              {item.backdropUrl && <img src={item.backdropUrl} alt="" fetchPriority={position === 0 ? 'high' : 'low'} decoding="async" />}
            </div>
          ))}
          <div className="os-hero-shade" />
        </div>
        <span className="hero-watermark" aria-hidden="true">STUDIO PRISMA</span>
        <div className="os-hero-inner">
          <div className="os-hero-copy">
            <div key={current.id} className="hero-reveal">
              <p className="hero-kicker">
                <span className="hero-brand"><Clapperboard size={12} /> PRISMA</span>
                <span className="hero-kicker-facts">{[
                  current.topPosition ? `#${current.topPosition} ტრენდული` : 'რჩეული',
                  current.isSeries ? 'სერიალი' : current.section === 'Movies' ? 'ფილმი' : current.categories[0],
                  current.year || null,
                ].filter(Boolean).join(' · ')}</span>
              </p>
              {current.titleImageUrl && !current.hideHeroTitle
                ? <h1><img className="hero-title-image" src={current.titleImageUrl} alt={current.title} /></h1>
                : <h1 className={current.hideHeroTitle ? 'sr-only' : ''}>{current.title.split('|')[0].trim()}</h1>}
              <div className="hero-metadata">
                {current.rating > 0 && <span className="hero-score">
                  <span className="hero-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, position) => (
                    <Star key={position} size={14} fill={position < Math.round(current.rating / 2) ? 'currentColor' : 'none'} />
                  ))}</span>
                  {Math.round(current.rating * 10)}%
                </span>}
                {current.categories.slice(0, 3).map(category => <span key={category} className="pill">{category}</span>)}
              </div>
              {current.description && <p className="hero-description">{current.description}</p>}
            </div>
            <div className="hero-actions">
              {(!current.comingSoon || current.playable) && <button type="button" className="os-play" onClick={() => onPlay(current)}><Play size={15} fill="currentColor" />{actionLabel}</button>}
              <button type="button" className="os-info" onClick={() => onMore(current)}><Info size={15} />მეტი ინფორმაცია</button>
              <button type="button" className="os-icon" aria-label={`შენახვა: ${current.title}`} aria-pressed={savedIds.has(current.id)} onClick={() => onToggleSave(current)}>
                <Bookmark size={15} fill={savedIds.has(current.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            {count > 1 && (
              <div className={`hero-progress ${paused ? 'is-paused' : ''}`}>
                <div className="hero-steps" style={{ '--slide-time': `${slideTime}ms` } as CSSProperties}>
                  {items.map((item, position) => (
                    <button type="button" key={item.id} className={position < index ? 'is-past' : ''} aria-label={`${position + 1} / ${count}: ${item.title}`}
                      aria-current={position === index ? 'true' : undefined} onClick={() => go(position)}>
                      {position === index && <span onAnimationEnd={() => go(index + 1)} />}
                    </button>
                  ))}
                </div>
                <button type="button" className="hero-arrow" aria-label="წინა" onClick={() => go(index - 1)}><ChevronLeft size={15} /></button>
                <button type="button" className="hero-arrow" aria-label="შემდეგი" onClick={() => go(index + 1)}><ChevronRight size={15} /></button>
              </div>
            )}
          </div>
          {upcoming.length > 0 && (
            <div className="os-upnext">
              <p className="eyebrow">შემდეგი</p>
              <div>
                {upcoming.map(position => {
                  const item = items[position];
                  const image = item.backdropUrl || item.thumbnailUrl;
                  return (
                    <button type="button" key={item.id} onClick={() => go(position)}>
                      <span className="upnext-art">{image && <img src={image} alt="" decoding="async" />}</span>
                      <span className="upnext-title">{item.title.split('|')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
