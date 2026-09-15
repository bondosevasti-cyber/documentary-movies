import React from 'react';
import {
  ChevronRight,
  ArrowRight,
  Play,
} from 'lucide-react';
import { Documentary } from '../types';

interface RightSidebarProps {
  continueWatchingDoc: Documentary;
  onPlay: (doc: Documentary) => void;
  onMoreInfo: (doc: Documentary) => void;
  onExplorePlanet: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  continueWatchingDoc,
  onPlay,
  onMoreInfo,
  onExplorePlanet,
}) => {
  return (
    <aside
      id="right-sidebar"
      className="w-80 shrink-0 flex flex-col gap-5 py-6 px-4 bg-[#08090E]/60 border-l border-white/5 select-none"
    >
      {/* 1. Date / Quote Card */}
      <div
        id="date-quote-card"
        className="p-5 rounded-3xl bg-[#12141E]/90 border border-white/10 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(255,107,0,0.15)] transition-all duration-300 shadow-lg flex flex-col justify-between group relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight leading-none">
              9/08
            </div>
            <div className="text-xs text-neutral-400 mt-1 font-medium">Monday</div>
          </div>
          <div className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-neutral-300 border border-white/20 rounded-full bg-white/5 shadow-inner">
            R 24
          </div>
        </div>

        <div className="flex items-end justify-between mt-5 pt-3 border-t border-white/5">
          <p className="text-xs italic text-neutral-300 max-w-[170px] leading-relaxed">
            &ldquo;Real stories change real people.&rdquo;
          </p>
          <button
            onClick={() => onMoreInfo(continueWatchingDoc)}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 group-hover:border-orange-500/70 group-hover:bg-[#FF6B00] group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,107,0,0.6)] flex items-center justify-center text-neutral-400 transition-all duration-200 cursor-pointer"
            title="Read Story"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Continue Watching Card */}
      <div
        id="continue-watching-card"
        className="p-4 rounded-3xl glow-amber-border bg-[#10121A]/95 shadow-[0_0_30px_rgba(255,107,0,0.18)] flex flex-col gap-3 group relative overflow-hidden"
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-tight">
            Continue Watching
          </span>
          <button
            onClick={() => onPlay(continueWatchingDoc)}
            className="text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Video Thumbnail with glowing play button */}
        <div
          onClick={() => onPlay(continueWatchingDoc)}
          className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group/thumb border border-white/10 group-hover/thumb:border-orange-500/50 transition-all duration-300"
        >
          <img
            src={continueWatchingDoc.thumbnailUrl}
            alt={continueWatchingDoc.title}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Glowing Amber Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-end pr-5">
            <div className="w-11 h-11 rounded-full glow-button-orange text-white flex items-center justify-center group-hover/thumb:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title and Georgian translation with Progress */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-200 truncate max-w-[190px]">
              {continueWatchingDoc.nativeTitle || continueWatchingDoc.title}
            </span>
            <span className="font-mono text-orange-400 font-bold glow-amber-text">
              {continueWatchingDoc.progressPercentage || 42}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.9)]"
              style={{ width: `${continueWatchingDoc.progressPercentage || 42}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Mini Planet Promo Card */}
      <div
        id="side-planet-promo-card"
        onClick={onExplorePlanet}
        className="reference-promo relative overflow-hidden rounded-3xl p-5 group hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        {/* Atmospheric horizon glow arc */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tl from-orange-500/40 via-amber-400/20 to-transparent blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-8 w-44 h-44 rounded-full border-t-2 border-amber-300/60 blur-[1px] pointer-events-none -rotate-12" />

        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"
          alt="Planet Earth"
          className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 pointer-events-none mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-36">
          <div className="flex flex-col text-white font-bold text-base leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span>A</span>
            <span>Bigger</span>
            <span>Brighter</span>
            <span>Kinder</span>
            <span>Planet</span>
          </div>

          <div className="flex justify-end">
            <div className="reference-promo-arrow w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(255,107,0,0.8)] transition-all duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
