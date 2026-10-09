import { useState } from 'react';
import type { CatalogItem } from '../data/catalog';

export function GenreRail({ categories, items, onSelect }: {
  categories: string[];
  items: CatalogItem[];
  onSelect: (category: string) => void;
}) {
  if (!categories.length) return null;
  return (
    <section className="content-rail genre-rail">
      <div className="rail-heading">
        <div>
          <p className="eyebrow">აღმოაჩინე</p>
          <h2>კატეგორიები</h2>
        </div>
      </div>
      <div className="genre-track">
        {categories.map(name => {
          const sample = items.find(item => item.categories.includes(name) && (item.backdropUrl || item.thumbnailUrl));
          return <GenreTile key={name} name={name} image={sample?.backdropUrl || sample?.thumbnailUrl || ''} onSelect={onSelect} />;
        })}
      </div>
    </section>
  );
}

function GenreTile({ name, image, onSelect }: { name: string; image: string; onSelect: (category: string) => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button type="button" className="genre-tile" onClick={() => onSelect(name)}>
      {image && <img src={image} alt="" loading="lazy" decoding="async" className={loaded ? 'is-loaded' : ''} onLoad={() => setLoaded(true)} />}
      <span>{name}</span>
    </button>
  );
}
