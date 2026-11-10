import { useState } from 'react';
import { Star } from 'lucide-react';
import { sectionLabels, type CatalogItem } from '../data/catalog';
import { MediaRail } from './MediaRail';

const kind: Record<CatalogItem['section'], string> = { Movies: 'ფილმი', Videos: 'ვიდეო', Articles: 'სტატია' };

export function TopRankRail({ title, items, eyebrow = 'დღეს ტრენდული', onOpen, onSeeAll }: {
  title: string;
  eyebrow?: string;
  items: CatalogItem[];
  onOpen: (item: CatalogItem) => void;
  onSeeAll?: () => void;
}) {
  if (!items.length) return null;
  return (
    <MediaRail title={title} eyebrow={eyebrow} onSeeAll={onSeeAll} ranked>
      {items.map(item => <RankCard key={item.id} item={item} onOpen={onOpen} />)}
    </MediaRail>
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
        <span className="kind">{item.isSeries ? 'სერიალი' : kind[item.section]}</span>
        {item.year > 0 && <span>{item.year}</span>}
        {item.rating > 0 && <span className="rating"><Star size={11} fill="currentColor" /> {item.rating}</span>}
        <span className="sr-only">{sectionLabels[item.section]}</span>
      </div>
    </article>
  );
}
