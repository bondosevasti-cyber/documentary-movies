import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { loadSection, type CatalogItem, type Section } from '../data/catalog';

const kind: Record<Section, string> = { Movies: 'ფილმი', Videos: 'ვიდეო', Articles: 'სტატია' };

export function SearchOverlay({ open, onClose, onOpen }: {
  open: boolean;
  onClose: () => void;
  onOpen: (item: CatalogItem) => void;
}) {
  const [query, setQuery] = useState('');
  const [pool, setPool] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || pool.length) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all((['Movies', 'Videos', 'Articles'] as Section[]).map(section =>
      loadSection(section, controller.signal).then(result => result.items).catch(() => [] as CatalogItem[]),
    )).then(groups => {
      if (!controller.signal.aborted) setPool(groups.flat());
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, pool.length]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const list = q
      ? pool.filter(item => `${item.title} ${item.description} ${item.categories.join(' ')}`.toLocaleLowerCase().includes(q))
      : pool;
    return list.slice(0, 24);
  }, [pool, query]);

  if (!open) return null;
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="ძებნა">
      <div className="search-panel">
        <label className="search-field">
          <Search size={22} />
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="ფილმი, ვიდეო ან სტატია" aria-label="ძებნა" />
          <button type="button" aria-label="ძებნის დახურვა" onClick={onClose}><X size={18} /></button>
        </label>
        <p className="search-count">{loading && !pool.length ? 'იტვირთება…' : `${results.length} შედეგი`}</p>
        <div className="search-grid">
          {results.map(item => (
            <button type="button" key={item.id} className="search-hit" onClick={() => { onOpen(item); onClose(); }}>
              {(item.posterUrl || item.thumbnailUrl) && <img src={item.posterUrl || item.thumbnailUrl} alt="" />}
              <span className="kind">{kind[item.section]}</span>
              <strong>{item.title.split('|')[0].trim()}</strong>
            </button>
          ))}
        </div>
        {!loading && query && !results.length && <p className="cinema-empty">ამ სიტყვით ჩანაწერი ვერ მოიძებნა.</p>}
      </div>
    </div>
  );
}
