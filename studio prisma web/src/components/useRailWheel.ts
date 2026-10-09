import { useEffect, type RefObject } from 'react';

export function useRailWheel(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (el.scrollWidth <= el.clientWidth + 8) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ref]);
}

export function scrollRail(ref: RefObject<HTMLDivElement | null>, direction: number) {
  const el = ref.current;
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollBy({ left: direction * el.clientWidth * 0.86, behavior: reduce ? 'auto' : 'smooth' });
}
