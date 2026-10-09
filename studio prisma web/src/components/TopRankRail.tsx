import { useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { sectionLabels, type CatalogItem } from '../data/catalog';
import { scrollRail, useRailWheel } from './useRailWheel';

const kind: Record<CatalogItem['section'], string> = { Movies: 'ფილმი', Videos: 'ვიდეო', Articles: 'სტატია' };

export function TopRankRail({ title, items, onOpen, onSeeAll }: {
  title: string;
  items: CatalogItem[];
  onOpen: (item: CatalogItem) => void;
  onSeeAll?: () => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  useRailWheel(rail);
  if (!items.length) return null;
  return (
    <section className="content-rail rank-rail" aria-label={title}>
      <div className="rail-heading">
        <div>
          <p className="eyebrow">დღეს ტრენდული</p>
          <h2>{title}</h2>
        </div>
        <div className="rail-actions">
          {onSeeAll && <button type="button" className="see-all" onClick={onSeeAll}>ყველას ნახვა <ArrowRight size={14} /></button>}
          <button type="button" aria-label={`${title}: წინა`} onClick={() => scrollRail(rail, -1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label={`${title}: შემდეგი`} onClick={() => scrollRail(rail, 1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={rail} className="rank-track">
        {items.map(item => <RankCard key={item.id} item={item} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function RankCard({ item, onOpen }: { item: CatalogItem; onOpen: (item: CatalogItem) => void }) {
  const [loaded, setLoaded] = useState(false);
  const src = item.backdropUrl || item.thumbnailUrl;
  const rank = item.topPosition ?? 0;
  return (
    <article className="rank-card">
      <div className="rank-visual">
        <span className="rank-num" aria-hidden="true">{rank}</span>
        <button type="button" className="rank-art" onClick={() => onOpen(item)} aria-label={`${rank}. ${item.title}`}>
          {src && <img src={src} alt="" loading="lazy" decoding="async" className={loaded ? 'is-loaded' : ''} onLoad={() => setLoaded(true)} />}
        </button>
      </div>
      <div className="rank-meta">
        <button type="button" onClick={() => onOpen(item)}>{item.title.split('|')[0].trim()}</button>
        <span className="kind">{kind[item.section]}</span>
        {item.year > 0 && <span>{item.year}</span>}
        {item.rating > 0 && <span className="rating"><Star size={11} fill="currentColor" /> {item.rating}</span>}
        <span className="sr-only">{sectionLabels[item.section]}</span>
      </div>
    </article>
  );
}
