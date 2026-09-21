import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { CatalogItem } from '../data/catalog';
import './top5-coverflow.css';

interface Top5CoverflowProps {
  items: CatalogItem[];
  saved: CatalogItem[];
  onOpen: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
}

const COPIES = 3;
const AUTO_SPEED = 0.05;
const CARD = { desktop: 248, mobile: 176 };
const GAP = { desktop: 18, mobile: 14 };

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobile() {
  return window.matchMedia('(max-width: 700px)').matches;
}

export function Top5Coverflow({ items, saved, onOpen, onToggleSave }: Top5CoverflowProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const readyRef = useRef(false);
  const pointerRef = useRef({ id: 0, x: 0, moved: 0, lastX: 0, lastT: 0 });
  const animRef = useRef<number | null>(null);
  const metricsRef = useRef({ width: 0, card: CARD.desktop, stride: CARD.desktop + GAP.desktop, loop: 0 });

  const slides = items.length ? Array.from({ length: COPIES }, () => items).flat() : [];

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !items.length) return;
    const mobile = isMobile();
    const card = mobile ? CARD.mobile : CARD.desktop;
    const stride = card + (mobile ? GAP.mobile : GAP.desktop);
    const loop = items.length * stride;
    metricsRef.current = { width: stage.clientWidth, card, stride, loop };
    stage.style.setProperty('--top5-card-w', `${card}px`);
    if (!readyRef.current && stage.clientWidth) {
      const focus = stage.clientWidth * 0.58;
      const featured = Math.min(2, Math.max(0, items.length - 1));
      offsetRef.current = focus - featured * stride - card / 2;
      readyRef.current = true;
    }
  }, [items.length]);

  const paint = useCallback(() => {
    const { width, card, stride, loop } = metricsRef.current;
    if (!width || !loop) return;

    let x = offsetRef.current;
    while (x < -loop) x += loop;
    while (x >= 0) x -= loop;
    offsetRef.current = x;

    const focus = width * 0.58;
    const reduced = prefersReducedMotion();

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = x + i * stride + card / 2;
      const dist = (center - focus) / stride;
      const abs = Math.abs(dist);
      const rotateY = reduced ? 0 : Math.max(-38, Math.min(38, dist * 14));
      const scale = Math.max(0.78, 1 - abs * 0.07);
      const tz = reduced ? 0 : -abs * 64;
      const ty = abs * 4;
      const hidden = center < -card * 1.2 || center > width + card * 1.2 || abs > 3.4;
      el.style.opacity = hidden ? '0' : String(Math.max(0.35, 1 - abs * 0.12));
      el.style.zIndex = String(Math.round(80 - abs * 10));
      el.style.filter = `brightness(${Math.max(0.55, 1 - abs * 0.14)})`;
      el.style.pointerEvents = hidden || abs > 4 ? 'none' : 'auto';
      el.style.transform = `translate3d(${x + i * stride}px, ${ty}px, ${tz}px) rotateY(${rotateY}deg) scale(${scale})`;
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    paint();
    stageRef.current?.classList.add('is-ready');
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      measure();
      paint();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [measure, paint, slides.length]);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const last = animRef.current ?? now;
      const dt = Math.min(32, now - last);
      animRef.current = now;

      const auto = !prefersReducedMotion() && !draggingRef.current && document.visibilityState === 'visible';
      if (auto) {
        const blend = 1 - Math.pow(0.84, dt / 16);
        velocityRef.current += (-AUTO_SPEED * 16 - velocityRef.current) * blend;
      } else if (!draggingRef.current) {
        velocityRef.current *= Math.pow(0.92, dt / 16);
        if (Math.abs(velocityRef.current) < 0.02) velocityRef.current = 0;
      }

      if (velocityRef.current) {
        offsetRef.current += velocityRef.current * (dt / 16);
        paint();
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paint]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    draggingRef.current = true;
    pointerRef.current = { id: event.pointerId, x: event.clientX, moved: 0, lastX: event.clientX, lastT: performance.now() };
    velocityRef.current = 0;
    stageRef.current?.setPointerCapture(event.pointerId);
    stageRef.current?.classList.add('is-dragging');
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!draggingRef.current || event.pointerId !== pointerRef.current.id) return;
    const now = performance.now();
    const dx = event.clientX - pointerRef.current.lastX;
    const dt = Math.max(8, now - pointerRef.current.lastT);
    offsetRef.current += dx;
    pointerRef.current.moved += Math.abs(dx);
    velocityRef.current = dx / (dt / 16);
    pointerRef.current.lastX = event.clientX;
    pointerRef.current.lastT = now;
    paint();
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!draggingRef.current || event.pointerId !== pointerRef.current.id) return;
    draggingRef.current = false;
    stageRef.current?.classList.remove('is-dragging');
    try { stageRef.current?.releasePointerCapture(event.pointerId); } catch {}
  };

  const nudge = (direction: number) => {
    velocityRef.current -= direction * 14;
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
      event.preventDefault();
      offsetRef.current -= event.deltaX;
      velocityRef.current = 0;
      paint();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [paint]);

  if (!items.length) return null;

  return (
    <section className="top5-coverflow" aria-label="TOP 5 გამორჩეული ფილმები">
      <div className="rail-heading">
        <h2>TOP 5<span>გამორჩეული ფილმები</span></h2>
        <div>
          <button type="button" aria-label="TOP 5: წინა" onClick={() => nudge(-1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="TOP 5: შემდეგი" onClick={() => nudge(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="top5-viewport">
        <div
          ref={stageRef}
          className="top5-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
        {slides.map((item, index) => {
          const rank = item.topPosition ?? (index % items.length) + 1;
          const savedNow = saved.some(entry => entry.id === item.id);
          return (
            <article
              key={`${item.id}-${index}`}
              className="top5-card"
              ref={el => { cardRefs.current[index] = el; }}
            >
              <button
                type="button"
                className="top5-card-hit"
                aria-label={`${item.title} — დეტალები`}
                onClick={() => {
                  if (pointerRef.current.moved > 8) return;
                  onOpen(item);
                }}
              >
                {(item.posterUrl || item.thumbnailUrl) && (
                  <img src={item.posterUrl || item.thumbnailUrl} alt="" draggable={false} loading="lazy" decoding="async" />
                )}
                <span className="top5-card-rank">{String(rank).padStart(2, '0')}</span>
                <div className="top5-card-copy">
                  <h3>{item.title}</h3>
                  <p>
                    {(item.categories[0] || item.category || 'ფილმი').toUpperCase()}
                    {item.year > 0 ? ` · ${item.year}` : ''}
                    {item.rating > 0 && (
                      <span className="top5-card-rating"><Star size={11} fill="currentColor" /> {item.rating}</span>
                    )}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="top5-card-save"
                aria-label={`შენახვა: ${item.title}`}
                aria-pressed={savedNow}
                onClick={event => {
                  event.stopPropagation();
                  onToggleSave(item);
                }}
                onPointerDown={event => event.stopPropagation()}
              >
                <Bookmark size={16} fill={savedNow ? 'currentColor' : 'none'} />
              </button>
            </article>
          );
        })}
        </div>
      </div>
      <p className="top5-hint">გადაათრიე და აღმოაჩინე</p>
    </section>
  );
}
