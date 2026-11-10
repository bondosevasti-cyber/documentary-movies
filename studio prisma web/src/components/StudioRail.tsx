import { useState, type ReactNode } from 'react';
import { Clapperboard } from 'lucide-react';
import type { CatalogItem } from '../data/catalog';
import { MediaRail } from './MediaRail';

export function StudioRail({ items, renderCard }: { items: CatalogItem[]; renderCard: (item: CatalogItem) => ReactNode }) {
  const [selected, setSelected] = useState('');
  const studios = [...new Map(items.filter(item => item.studioName).map(item => [item.studioName!, item.studioLogoUrl])).entries()];
  const active = studios.some(([name]) => name === selected) ? selected : studios[0]?.[0];
  if (!active) return null;

  return (
    <div className="studio-block">
      <div className="rail-heading">
        <div><p className="eyebrow">აღმოაჩინე</p><h2>სტუდიები</h2></div>
      </div>
      <div className="studio-track" aria-label="სტუდიები">
        {studios.map(([name, logo]) => (
          <button type="button" key={name} aria-pressed={name === active} onClick={() => setSelected(name)}>
            {logo ? <img src={logo} alt="" loading="lazy" /> : <Clapperboard size={18} />}
            {name}
          </button>
        ))}
      </div>
      <MediaRail key={active} title={active} eyebrow="ამ სტუდიიდან">
        {items.filter(item => item.studioName === active).slice(0, 12).map(renderCard)}
      </MediaRail>
    </div>
  );
}
