import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, User, Sparkles, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Documentary } from '../types';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDoc: (doc: Documentary) => void;
  allDocs: Documentary[];
  onOpenDetails: (doc: Documentary) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectDoc,
  allDocs,
  onOpenDetails,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [greetingLang, setGreetingLang] = useState<'ka' | 'en'>('ka');

  const filteredDocs = searchQuery.trim()
    ? allDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.narrator && doc.narrator.toLowerCase().includes(searchQuery.toLowerCase())) ||
          doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header className="relative z-30 flex items-center justify-between gap-4 w-full py-1">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-2xl">
        <div className="flex items-center w-full h-12 px-4 rounded-full bg-[#14161E]/80 border border-white/10 hover:border-orange-500/40 focus-within:border-orange-500 focus-within:shadow-[0_0_20px_rgba(255,107,0,0.25)] transition-all duration-200">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            id="top-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documentaries, people, topics..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-neutral-400 hover:text-white mr-2 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-neutral-400 bg-white/5 border border-white/10 rounded-md">
            ⌘ K
          </kbd>
        </div>

        {/* Live Search Quick Results Dropdown */}
        <AnimatePresence>
        {searchQuery.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lit-panel absolute top-full left-0 right-0 mt-2 p-2 bg-[#10121A] border border-orange-500/30 rounded-2xl shadow-2xl z-40 max-h-80 overflow-y-auto backdrop-blur-xl"
          >
            {filteredDocs.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Matching Documentaries ({filteredDocs.length})
                </div>
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onSelectDoc(doc);
                      onSearchChange('');
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <img
                      src={doc.thumbnailUrl}
                      alt={doc.title}
                      className="w-14 h-9 rounded-lg object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-orange-400 truncate">
                        {doc.title}
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-2">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.duration}</span>
                        <span>•</span>
                        <span className="text-amber-400">★ {doc.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(doc);
                        onSearchChange('');
                      }}
                      className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10"
                    >
                      Info
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-neutral-400">
                No documentaries found matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-12 h-12 rounded-full bg-[#14161E]/80 border border-white/10 hover:border-orange-500/40 hover:bg-white/5 flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF6B00] shadow-[0_0_8px_#FF6B00]" />
          </button>

          <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -9, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -7, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 390, damping: 30 }}
              className="lit-panel absolute right-0 top-full mt-2 w-80 bg-[#12141C] border border-orange-500/30 rounded-2xl shadow-2xl p-4 z-40"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-semibold text-sm text-white">Notifications</span>
                <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="flex flex-col gap-2.5 mt-3 text-xs">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-neutral-200 font-medium">New 4K Release: Frozen Worlds</p>
                    <p className="text-neutral-400 text-[11px]">Just added to Antarctic expedition catalog</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-neutral-200 font-medium">Continue Ocean Giants</p>
                    <p className="text-neutral-400 text-[11px]">You have 32 minutes remaining</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-neutral-200 font-medium">IMAX Sound Remaster</p>
                    <p className="text-neutral-400 text-[11px]">The Space Within is now available in Dolby Atmos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="user-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-[#14161E]/80 border border-white/10 hover:border-orange-500/40 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-orange-500/40 p-0.5 shadow-[0_0_10px_rgba(255,107,0,0.3)]">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200&auto=format&fit=crop"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-neutral-400 leading-tight">Welcome back,</span>
              <span className="text-xs font-bold text-white tracking-wide leading-tight">
                {greetingLang === 'ka' ? 'გამარჯობა' : 'Explorer'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -9, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -7, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="lit-panel absolute right-0 top-full mt-2 w-56 bg-[#12141C] border border-orange-500/30 rounded-2xl shadow-2xl p-2 z-40"
            >
              <div className="p-2 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">Alexander Rossi</p>
                <p className="text-[11px] text-orange-400">Premium 4K HDR Plan</p>
              </div>
              <button
                onClick={() => setGreetingLang(greetingLang === 'ka' ? 'en' : 'ka')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300 hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <span>Greeting Language</span>
                <span className="text-orange-400 font-bold">{greetingLang === 'ka' ? 'ქართული' : 'English'}</span>
              </button>
              <div className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300">
                <span>Audio Engine</span>
                <span className="text-neutral-400">Dolby 7.1</span>
              </div>
              <div className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-300">
                <span>Stream Cache</span>
                <span className="text-emerald-400">Optimal (84 MB)</span>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
