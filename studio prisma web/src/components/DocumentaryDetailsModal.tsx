import React from 'react';
import { X, Play, Bookmark, Star, Clock, Eye, Film, Award, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Documentary } from '../types';

interface DocumentaryDetailsModalProps {
  documentary: Documentary | null;
  onClose: () => void;
  onPlay: (doc: Documentary) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (doc: Documentary) => void;
}

export const DocumentaryDetailsModal: React.FC<DocumentaryDetailsModalProps> = ({
  documentary,
  onClose,
  onPlay,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  if (!documentary) return null;

  return (
    <motion.div
      id="doc-details-modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div
        id="doc-details-card"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        transition={{ type: 'spring', stiffness: 260, damping: 27 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0E1017] border border-orange-500/30 rounded-3xl shadow-[0_0_50px_rgba(255,107,0,0.2)] text-white"
      >
        {/* Close Button */}
        <button
          id="close-details-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center border border-white/15 transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-t-3xl">
          <img
            src={documentary.backdropUrl}
            alt={documentary.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1017] via-[#0E1017]/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-0.5 text-xs font-bold uppercase tracking-wider bg-orange-500/30 text-orange-400 border border-orange-500/50 rounded-full">
                {documentary.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/15 text-neutral-300 rounded-full">
                {documentary.quality}
              </span>
              <span className="text-xs text-neutral-300">{documentary.year}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
              {documentary.title}
            </h1>
            {documentary.nativeTitle && (
              <p className="text-sm text-neutral-400 font-medium">
                {documentary.nativeTitle}
              </p>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="details-watch-now-btn"
              onClick={() => {
                onClose();
                onPlay(documentary);
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A1E] text-white font-semibold flex items-center gap-2.5 shadow-[0_0_20px_rgba(255,107,0,0.5)] hover:shadow-[0_0_30px_rgba(255,107,0,0.7)] hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              id="details-toggle-watchlist-btn"
              onClick={() => onToggleWatchlist(documentary)}
              className={`px-5 py-3 rounded-full border transition-all duration-200 flex items-center gap-2 font-medium text-sm cursor-pointer ${
                isWatchlisted
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-white/30 text-neutral-200'
              }`}
            >
              {isWatchlisted ? <Check className="w-4 h-4 text-orange-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <div className="ml-auto flex items-center gap-4 text-xs sm:text-sm text-neutral-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {documentary.rating}/10
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                {documentary.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-neutral-400" />
                {documentary.views}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Overview
            </h3>
            <p className="text-neutral-200 text-base leading-relaxed">
              {documentary.longDescription || documentary.description}
            </p>
          </div>

          {/* Meta details grid */}
          <div className="lit-panel grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm">
            {documentary.narrator && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 uppercase font-medium">Narrator</span>
                <span className="text-white font-semibold">{documentary.narrator}</span>
              </div>
            )}
            {documentary.director && (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 uppercase font-medium">Director</span>
                <span className="text-white font-semibold">{documentary.director}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-neutral-400 uppercase font-medium">Audio & Subtitles</span>
              <span className="text-white">Dolby Atmos 7.1 • English, Georgian, Spanish</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-400 uppercase font-medium">Stream Format</span>
              <span className="text-white font-semibold text-orange-400">{documentary.quality} 60FPS</span>
            </div>
          </div>

          {/* Tags */}
          {documentary.tags && documentary.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Themes & Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {documentary.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {documentary.awards && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs text-orange-300">
              <Award className="w-5 h-5 text-orange-400 shrink-0" />
              <span>{documentary.awards.join(' • ')}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
