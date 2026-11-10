import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export function MediaRail({ title, eyebrow, onSeeAll, ranked = false, children }: {
  title: string;
  eyebrow?: string;
  onSeeAll?: () => void;
  ranked?: boolean;
  children: ReactNode;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  const updateEdges = () => {
    const track = rail.current;
    if (!track) return;
    const previous = track.scrollLeft > 2;
    const next = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
    setEdges(current => current.previous === previous && current.next === next ? current : { previous, next });
  };

  useEffect(() => {
    const track = rail.current;
    if (!track) return;
    updateEdges();
    const resize = new ResizeObserver(updateEdges);
    resize.observe(track);
    return () => resize.disconnect();
  }, [children]);

  const scroll = (direction: number) => {
    const track = rail.current;
    track?.scrollBy({
      left: direction * track.clientWidth * .86,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <section className={`content-rail ${ranked ? 'rank-rail' : ''}`} aria-label={title}>
      <div className="rail-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        {onSeeAll && <button type="button" className="see-all" onClick={onSeeAll}>ყველას ნახვა <ArrowUpRight size={13} /></button>}
      </div>
      <div className="rail-frame">
        <div ref={rail} onScroll={updateEdges} className={ranked ? 'rank-track' : 'rail-track'}>{children}</div>
        {edges.previous && <button type="button" className="rail-edge previous" aria-label={`${title}: წინა`} onClick={() => scroll(-1)}><ChevronLeft size={18} /></button>}
        {edges.next && <button type="button" className="rail-edge next" aria-label={`${title}: შემდეგი`} onClick={() => scroll(1)}><ChevronRight size={18} /></button>}
      </div>
    </section>
  );
}
