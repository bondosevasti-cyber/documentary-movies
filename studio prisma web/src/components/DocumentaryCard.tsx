import React, { useState } from 'react';
import { Play, MoreVertical, Bookmark, Check, Info, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Documentary } from '../types';

interface DocumentaryCardProps {
  documentary: Documentary;
  onPlay: (doc: Documentary) => void;
  onMoreInfo: (doc: Documentary) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (doc: Documentary) => void;
}

export const DocumentaryCard: React.FC<DocumentaryCardProps> = ({
  documentary,
  onPlay,
  onMoreInfo,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  return (
    <div
      id={`doc-card-${documentary.id}`}
      className="group relative flex flex-col gap-2.5 select-none"
    >
      {/* Thumbnail Container */}
      <div
        onClick={() => onPlay(documentary)}
        className="reference-thumbnail relative w-full aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden bg-[#12141C] border transition-all duration-300 cursor-pointer"
      >
        <img
          src={documentary.thumbnailUrl}
          alt={documentary.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.7)] transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Watchlist Quick Button (Top Left on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(documentary);
          }}
          className={`absolute top-2.5 left-2.5 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isWatchlisted
              ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(255,107,0,0.5)]'
              : 'bg-black/50 text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          {isWatchlisted ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Duration Badge on Bottom-Right */}
        <div className="reference-duration absolute bottom-2.5 right-2.5 px-2 py-0.5 text-xs font-semibold font-mono tracking-tight backdrop-blur-md text-neutral-200 rounded-md">
          {documentary.duration}
        </div>
      </div>

      {/* Info & Options Row */}
      <div className="flex items-start justify-between gap-2 px-0.5">
        <div className="flex flex-col min-w-0 flex-1">
          <h3
            onClick={() => onMoreInfo(documentary)}
            className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate cursor-pointer"
          >
            {documentary.title}
          </h3>
          <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
            <span>{documentary.category}</span>
            <span className="text-neutral-600">•</span>
            <span>{documentary.views}</span>
          </p>
        </div>

        {/* 3 Vertical Dots Menu */}
        <div className="relative shrink-0">
          <button
            id={`doc-options-${documentary.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Dropdown */}
          <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 31 }}
              onClick={(e) => e.stopPropagation()}
              className="lit-panel absolute right-0 bottom-full mb-1 w-44 bg-[#12141D] border border-orange-500/30 rounded-xl shadow-2xl p-1.5 z-30"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onPlay(documentary);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/5 hover:text-orange-400 rounded-lg cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onMoreInfo(documentary);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/5 hover:text-orange-400 rounded-lg cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>

              <button
                onClick={() => {
                  onToggleWatchlist(documentary);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/5 hover:text-orange-400 rounded-lg cursor-pointer"
              >
                {isWatchlisted ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/5 hover:text-orange-400 rounded-lg cursor-pointer border-t border-white/5 mt-1 pt-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
