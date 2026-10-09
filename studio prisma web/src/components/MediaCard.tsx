import { useState } from 'react';
import { Bookmark, Star } from 'lucide-react';
import { sectionLabels, type CatalogItem } from '../data/catalog';

const kind: Record<CatalogItem['section'], string> = { Movies: 'ფილმი', Videos: 'ვიდეო', Articles: 'სტატია' };

export function MediaCard({ item, saved, onOpen, onToggleSave }: {
  item: CatalogItem;
  saved: boolean;
  onOpen: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = item.posterUrl || item.thumbnailUrl;
  return (
    <article className="media-card">
      <div className="media-card-art">
        <button type="button" onClick={() => onOpen(item)} aria-label={`${item.title} — დეტალები`}>
          {src && <img src={src} alt="" loading="lazy" decoding="async" className={loaded ? 'is-loaded' : ''} onLoad={() => setLoaded(true)} />}
          <span className="media-card-hover">
            <strong>{item.title.split('|')[0].trim()}</strong>
            <span>{item.year > 0 ? item.year : sectionLabels[item.section]}{item.rating > 0 ? ` · ★ ${item.rating}` : ''}</span>
          </span>
        </button>
        <button type="button" className="card-save" aria-label={`შენახვა: ${item.title}`} aria-pressed={saved} onClick={() => onToggleSave(item)}>
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button type="button" className="card-title" onClick={() => onOpen(item)}>{item.title.split('|')[0].trim()}</button>
      <div className="card-meta">
        <span className="kind">{kind[item.section]}</span>
        {item.year > 0 && <span>{item.year}</span>}
        {item.rating > 0 && <span className="rating"><Star size={11} fill="currentColor" /> {item.rating}</span>}
      </div>
    </article>
  );
}
