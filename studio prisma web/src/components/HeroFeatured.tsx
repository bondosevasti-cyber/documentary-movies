import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Documentary } from '../types';

interface HeroFeaturedProps {
  actionLabel?: string;
  featuredList: Documentary[];
  onPlay: (doc: Documentary) => void;
  onMoreInfo: (doc: Documentary) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  featuredList,
  onPlay,
  onMoreInfo,
  actionLabel = 'ყურება',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDoc = featuredList[currentIndex] || featuredList[0];

  // Auto-advance hero carousel gently every 10s if user doesn't interact
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [featuredList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  if (!currentDoc) return null;

  // Split title into two lines if it contains space (e.g. "OUR PLANET")
  return (
    <section
      id="hero-featured-card"
      className="cinema-hero"
    >
      {/* Background Image with Cinematic Solar Flare */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          key={currentDoc.id}
          src={currentDoc.backdropUrl}
          alt={currentDoc.title}
          className="w-full h-full object-cover object-center scale-100 animate-in fade-in zoom-in-95 duration-700 brightness-110 contrast-110 saturate-110"
        />
        {/* Dark Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

      </div>

      {/* Top Bar inside Featured: "FEATURED" tag & Numbered Navigation (01, 02, 03, 04, 05) */}
      <div className="relative z-10 flex items-start justify-between w-full">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
          რჩეული
        </span>

        {/* Carousel Indicators on Top Right */}
        <div className="reference-carousel-rail flex flex-col items-end gap-3 font-mono text-sm font-semibold">
          {featuredList.map((doc, idx) => {
            const isActive = idx === currentIndex;
            const numberLabel = `0${idx + 1}`;
            return (
              <button
                key={doc.id}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#ffd0a6] font-bold scale-110 glow-amber-text'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {numberLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom controls intentionally stay text-free so the artwork remains unobstructed. */}
      <div className="cinema-hero-copy relative z-10 flex flex-col justify-end gap-4">
        <p className="eyebrow">სტუდია პრიზმა · რჩეული</p>
        {currentDoc.titleImageUrl
          ? <img className="hero-title-image" src={currentDoc.titleImageUrl} alt={currentDoc.title} />
          : !currentDoc.hideHeroTitle && <h1>{currentDoc.title.split('|')[0].trim()}</h1>}
        <div className="hero-metadata">{currentDoc.rating > 0 && <span>★ {currentDoc.rating.toFixed(1)}</span>}{currentDoc.year > 0 && <span>{currentDoc.year}</span>}<span>{currentDoc.category}</span></div>
        {currentDoc.description && <p className="hero-description">{currentDoc.description}</p>}
        {/* Action Buttons & Bottom Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Action buttons */}
          <div className="flex items-center gap-3.5">
            <button
              id="hero-watch-now-btn"
              onClick={() => onPlay(currentDoc)}
              className="reference-watch-button px-7 py-3 rounded-full text-white text-sm sm:text-base font-bold flex items-center gap-2.5 hover:scale-[1.025] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Play className="relative w-5 h-5 fill-white text-white ml-0.5 drop-shadow-[0_0_7px_rgba(255,255,255,0.72)]" />
              <span>{actionLabel}</span>
            </button>

            <button
              id="hero-more-info-btn"
              onClick={() => onMoreInfo(currentDoc)}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm sm:text-base font-semibold flex items-center gap-2 backdrop-blur-md border border-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <Info className="w-4 h-4 text-neutral-300" />
              <span>ვრცლად</span>
            </button>
          </div>

          {/* Carousel arrows (< >) on Bottom Right */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              id="hero-prev-btn"
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-black/50 border border-white/15 hover:border-orange-500/60 hover:bg-black/80 flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="hero-next-btn"
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-black/50 border border-orange-500/70 hover:bg-[#FF6B00] hover:border-transparent glow-amber-pill flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
