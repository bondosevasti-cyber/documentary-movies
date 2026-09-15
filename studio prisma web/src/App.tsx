import { useState, useEffect } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CATEGORIES,
  FEATURED_DOCUMENTARIES,
  POPULAR_DOCUMENTARIES,
  NEW_RELEASES,
  ALL_DOCUMENTARIES,
} from './data/documentaries';
import { Documentary, CategoryType, ActiveNavTab } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { DocumentaryCard } from './components/DocumentaryCard';
import { RightSidebar } from './components/RightSidebar';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DocumentaryDetailsModal } from './components/DocumentaryDetailsModal';
import { NavigationViews } from './components/NavigationViews';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('Home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('Nature');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoDoc, setActiveVideoDoc] = useState<Documentary | null>(null);
  const [detailsDoc, setDetailsDoc] = useState<Documentary | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Watchlist state (initialize with 2 items)
  const [watchlist, setWatchlist] = useState<Documentary[]>([
    POPULAR_DOCUMENTARIES[1], // Planet Earth
    NEW_RELEASES[0], // Frozen Worlds
  ]);

  // History state (initialize with 3 items)
  const [historyDocs, setHistoryDocs] = useState<Documentary[]>([
    POPULAR_DOCUMENTARIES[3], // Ocean Giants
    FEATURED_DOCUMENTARIES[0], // Our Planet
    POPULAR_DOCUMENTARIES[0], // The Last Lions
  ]);

  // Keyboard shortcut for Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('top-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleWatchlist = (doc: Documentary) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === doc.id);
      if (exists) {
        return prev.filter((item) => item.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const handlePlayDoc = (doc: Documentary) => {
    setActiveVideoDoc(doc);
    setHistoryDocs((prev) => {
      const filtered = prev.filter((item) => item.id !== doc.id);
      return [doc, ...filtered];
    });
  };

  const handleExplorePlanet = () => {
    const planetDoc = FEATURED_DOCUMENTARIES[0];
    setDetailsDoc(planetDoc);
  };

  // Filter content if category selected
  const filteredPopular = selectedCategory === 'All'
    ? POPULAR_DOCUMENTARIES
    : POPULAR_DOCUMENTARIES.filter((d) => d.category === selectedCategory);

  const filteredNewReleases = selectedCategory === 'All'
    ? NEW_RELEASES
    : NEW_RELEASES.filter((d) => d.category === selectedCategory);

  // Fallback to original items if filter produces empty list so layout remains beautiful
  const displayPopular = filteredPopular.length > 0 ? filteredPopular : POPULAR_DOCUMENTARIES;
  const displayNewReleases = filteredNewReleases.length > 0 ? filteredNewReleases : NEW_RELEASES;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#07080B]' : 'bg-[#0E1118]'} text-white flex flex-col font-sans relative overflow-x-hidden`}>
      {/* Ambient background glow flares */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[350px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[450px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container Layout */}
      <div className="relative z-10 flex flex-1 w-full max-w-[1920px] mx-auto min-h-screen">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block sticky top-0 self-start h-screen">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            watchlistCount={watchlist.length}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onExplorePlanet={handleExplorePlanet}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -32, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="relative z-10 w-72 h-full bg-[#0A0C12] shadow-2xl overflow-y-auto"
            >
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                watchlistCount={watchlist.length}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
                onExplorePlanet={() => {
                  handleExplorePlanet();
                  setMobileMenuOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-8 py-5 gap-6 overflow-y-auto">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-white/10">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <span className="font-bold text-sm">Documentary Movies</span>
            </div>
          </div>

          {/* TopBar with Search, Notifications & Profile */}
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectDoc={handlePlayDoc}
            allDocs={ALL_DOCUMENTARIES}
            onOpenDetails={setDetailsDoc}
          />

          {/* Navigation views vs home view */}
          {activeTab !== 'Home' ? (
            <NavigationViews
              activeTab={activeTab}
              allDocs={ALL_DOCUMENTARIES}
              watchlistDocs={watchlist}
              historyDocs={historyDocs}
              onPlay={handlePlayDoc}
              onMoreInfo={setDetailsDoc}
              onToggleWatchlist={handleToggleWatchlist}
              onBackToHome={() => setActiveTab('Home')}
            />
          ) : (
            <div className="view-enter flex flex-col gap-7">
              {/* 1. Hero Featured Section with Ambient Bloom */}
              <div className="relative">
                <div className="hero-rim-bloom" />
                <HeroFeatured
                  featuredList={FEATURED_DOCUMENTARIES}
                  onPlay={handlePlayDoc}
                  onMoreInfo={setDetailsDoc}
                />
              </div>

              {/* 2. Category Filter Bar */}
              <CategoryFilterBar
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* 3. Popular Documentaries Row */}
              <section id="popular-documentaries-section" className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-orange-400 transition-colors">
                      Popular Documentaries
                    </h2>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <button
                    onClick={() => setActiveTab('Discover')}
                    className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    See all
                  </button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`popular-${selectedCategory}`}
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -7, filter: 'blur(3px)' }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
                  >
                    {displayPopular.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 14, scale: 0.975 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.055, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <DocumentaryCard
                          documentary={doc}
                          onPlay={handlePlayDoc}
                          onMoreInfo={setDetailsDoc}
                          isWatchlisted={watchlist.some((item) => item.id === doc.id)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </section>

              {/* 4. New Releases Row */}
              <section id="new-releases-section" className="flex flex-col gap-4 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-orange-400 transition-colors">
                      New Releases
                    </h2>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <button
                    onClick={() => setActiveTab('Discover')}
                    className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    See all
                  </button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`releases-${selectedCategory}`}
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -7, filter: 'blur(3px)' }}
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
                  >
                    {displayNewReleases.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 14, scale: 0.975 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.055, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <DocumentaryCard
                          documentary={doc}
                          onPlay={handlePlayDoc}
                          onMoreInfo={setDetailsDoc}
                          isWatchlisted={watchlist.some((item) => item.id === doc.id)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          )}
        </main>

        {/* Right Sidebar (Desktop) */}
        <div className="hidden xl:block">
          <RightSidebar
            continueWatchingDoc={POPULAR_DOCUMENTARIES[3]} // Ocean Giants
            onPlay={handlePlayDoc}
            onMoreInfo={setDetailsDoc}
            onExplorePlanet={handleExplorePlanet}
          />
        </div>
      </div>

      {/* Interactive Video Player Modal */}
      <AnimatePresence mode="wait">
      {activeVideoDoc && (
        <VideoPlayerModal
          key={activeVideoDoc.id}
          documentary={activeVideoDoc}
          onClose={() => setActiveVideoDoc(null)}
        />
      )}
      </AnimatePresence>

      {/* Documentary Details Modal */}
      <AnimatePresence mode="wait">
      {detailsDoc && (
        <DocumentaryDetailsModal
          key={detailsDoc.id}
          documentary={detailsDoc}
          onClose={() => setDetailsDoc(null)}
          onPlay={handlePlayDoc}
          isWatchlisted={watchlist.some((item) => item.id === detailsDoc.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}
      </AnimatePresence>
    </div>
  );
}
