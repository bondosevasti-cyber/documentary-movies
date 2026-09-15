import React from 'react';
import {
  Home,
  Film,
  FileText,
  Compass,
  LayoutGrid,
  Tv,
  Bookmark,
  Clock,
  Moon,
  Sun,
  Play,
  ArrowRight,
} from 'lucide-react';
import { ActiveNavTab } from '../types';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  watchlistCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExplorePlanet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  watchlistCount,
  darkMode,
  onToggleDarkMode,
  onExplorePlanet,
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'Movies', label: 'ფილმები', icon: <Film className="w-5 h-5" /> },
    { id: 'Videos', label: 'ვიდეოები', icon: <Tv className="w-5 h-5" /> },
    { id: 'Articles', label: 'სტატიები', icon: <FileText className="w-5 h-5" /> },
    { id: 'Watchlist', label: 'შენახული', icon: <Bookmark className="w-5 h-5" />, badge: watchlistCount },
    { id: 'History', label: 'ისტორია', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 shrink-0 flex flex-col justify-between py-6 px-4 bg-[#0A0C12]/90 border-r border-white/5 backdrop-blur-xl h-screen overflow-hidden select-none"
    >
      {/* Top Section: Brand Logo & Navigation */}
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 px-3 cursor-pointer group" onClick={() => onSelectTab('Movies')}>
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#E55000] p-0.5 shadow-[0_0_20px_rgba(255,107,0,0.5)] group-hover:shadow-[0_0_28px_rgba(255,107,0,0.8)] transition-all duration-300">
            <div className="w-full h-full bg-[#12141C] rounded-[14px] flex items-center justify-center">
              {/* Triangular glowing play emblem */}
              <div className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[15px] border-l-[#FF7A00] ml-1 drop-shadow-[0_0_8px_#FF7A00]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wide text-white leading-tight">
              სტუდია
            </span>
            <span className="text-sm font-semibold tracking-wider text-neutral-300 leading-tight">
              სენაკი
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`sidebar-nav-item relative flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'glow-amber-pill bg-gradient-to-r from-[#FF7A00]/30 via-[#FF6B00]/15 to-transparent text-white'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={isActive ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(255,107,0,0.85)]' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                </div>

              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Promo Card & Dark Mode Toggle */}
      <div className="flex flex-col gap-4 mt-6">
        {/* Promo Card: "A Bigger Brighter Kinder Planet" with Horizon Glow */}
        <div
          id="planet-promo-card"
          onClick={onExplorePlanet}
          className="reference-promo relative overflow-hidden rounded-3xl p-5 group hover:border-orange-300 transition-all duration-300 cursor-pointer"
        >
          {/* Earth curve backdrop with atmospheric glow arc */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tl from-orange-500/40 via-amber-400/20 to-transparent blur-xl pointer-events-none" />
          {/* Atmospheric rim line */}
          <div className="absolute -bottom-10 -right-8 w-44 h-44 rounded-full border-t-2 border-amber-300/60 blur-[1px] pointer-events-none -rotate-12" />

          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"
            alt="Planet Earth"
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 pointer-events-none mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />

          {/* Text lines */}
          <div className="relative z-10 flex flex-col justify-between h-36">
            <div className="flex flex-col text-white font-bold text-base leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span>A</span>
              <span>Bigger</span>
              <span>Brighter</span>
              <span>Kinder</span>
              <span>Planet</span>
            </div>

            {/* Circular button with glowing border */}
            <div className="flex justify-end">
              <div className="reference-promo-arrow w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(255,107,0,0.8)] transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Dark Mode Switcher */}
        <div className={`dark-mode-control ${darkMode ? 'is-dark' : 'is-light'} flex items-center justify-between px-4 py-3 rounded-2xl`}>
          <div className="flex items-center gap-2.5 text-neutral-300 text-sm font-medium">
            {darkMode ? (
              <Moon className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>მუქი რეჟიმი</span>
          </div>

          <button
            id="dark-mode-toggle-btn"
            onClick={onToggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
              darkMode
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8A1E] shadow-[0_0_12px_rgba(255,107,0,0.4)]'
                : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};
