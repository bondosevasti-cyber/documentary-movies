import React from 'react';
import { Bookmark, Clock, Tv, Compass, Play, Trash2 } from 'lucide-react';
import { Documentary, ActiveNavTab } from '../types';
import { DocumentaryCard } from './DocumentaryCard';

interface NavigationViewsProps {
  activeTab: ActiveNavTab;
  allDocs: Documentary[];
  watchlistDocs: Documentary[];
  historyDocs: Documentary[];
  onPlay: (doc: Documentary) => void;
  onMoreInfo: (doc: Documentary) => void;
  onToggleWatchlist: (doc: Documentary) => void;
  onBackToHome: () => void;
}

export const NavigationViews: React.FC<NavigationViewsProps> = ({
  activeTab,
  allDocs,
  watchlistDocs,
  historyDocs,
  onPlay,
  onMoreInfo,
  onToggleWatchlist,
  onBackToHome,
}) => {
  if (activeTab === 'Watchlist') {
    return (
      <div className="view-enter flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Watchlist</h2>
              <p className="text-xs text-neutral-400">
                {watchlistDocs.length} saved {watchlistDocs.length === 1 ? 'documentary' : 'documentaries'}
              </p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10"
          >
            ← Back to Home
          </button>
        </div>

        {watchlistDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
              <Bookmark className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold text-neutral-300">Your watchlist is empty</p>
            <p className="text-sm text-neutral-500 max-w-sm">
              Click the bookmark icon on any documentary to save it for later viewing.
            </p>
            <button
              onClick={onBackToHome}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#FF6B00] text-white text-sm font-semibold shadow-[0_0_15px_rgba(255,107,0,0.5)]"
            >
              Explore Documentaries
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {watchlistDocs.map((doc) => (
              <DocumentaryCard
                key={doc.id}
                documentary={doc}
                onPlay={onPlay}
                onMoreInfo={onMoreInfo}
                isWatchlisted={true}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'History') {
    return (
      <div className="view-enter flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Watch History</h2>
              <p className="text-xs text-neutral-400">Recently streamed documentaries</p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {historyDocs.map((doc) => (
            <DocumentaryCard
              key={doc.id}
              documentary={doc}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
              isWatchlisted={watchlistDocs.some((w) => w.id === doc.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'TV Series') {
    const seriesDocs = allDocs.filter((d) => d.category === 'Nature' || d.category === 'Space');
    return (
      <div className="view-enter flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Documentary TV Series</h2>
              <p className="text-xs text-neutral-400">Multi-episode expeditions and chronicles</p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {seriesDocs.map((doc) => (
            <DocumentaryCard
              key={doc.id}
              documentary={doc}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
              isWatchlisted={watchlistDocs.some((w) => w.id === doc.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'Discover') {
    return (
      <div className="view-enter flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Discover Documentaries</h2>
              <p className="text-xs text-neutral-400">Hand-curated collections from global archives</p>
            </div>
          </div>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 border border-white/10"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allDocs.map((doc) => (
            <DocumentaryCard
              key={doc.id}
              documentary={doc}
              onPlay={onPlay}
              onMoreInfo={onMoreInfo}
              isWatchlisted={watchlistDocs.some((w) => w.id === doc.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
