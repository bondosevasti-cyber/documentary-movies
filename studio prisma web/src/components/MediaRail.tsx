import { useRef, type ReactNode } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { scrollRail, useRailWheel } from './useRailWheel';

export function MediaRail({ title, eyebrow, onSeeAll, children }: {
  title: string;
  eyebrow?: string;
  onSeeAll?: () => void;
  children: ReactNode;
}) {
  const rail = useRef<HTMLDivElement>(null);
  useRailWheel(rail);
  return (
    <section className="content-rail">
      <div className="rail-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        <div className="rail-actions">
          {onSeeAll && <button type="button" className="see-all" onClick={onSeeAll}>ყველას ნახვა <ArrowRight size={14} /></button>}
          <button type="button" aria-label={`${title}: წინა`} onClick={() => scrollRail(rail, -1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label={`${title}: შემდეგი`} onClick={() => scrollRail(rail, 1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={rail} className="rail-track">{children}</div>
    </section>
  );
}
