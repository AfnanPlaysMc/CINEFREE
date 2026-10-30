/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, LayoutGrid, Search, Bookmark, User } from 'lucide-react';
import { NavTab } from '../Navbar';
import { useWatchlist } from '../../context/WatchlistContext';

interface MobileFloatingNavProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const MobileFloatingNav: React.FC<MobileFloatingNavProps> = ({
  currentTab,
  onNavigate,
}) => {
  const { watchlist } = useWatchlist();

  return (
    <div className="fixed bottom-4 left-3 right-3 z-40 max-w-md mx-auto pointer-events-none">
      <nav className="pointer-events-auto rounded-full bg-[#121324]/90 backdrop-blur-2xl border border-white/10 px-4 py-2 shadow-2xl flex items-center justify-between ring-1 ring-white/5">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
          {currentTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
          )}
        </button>

        {/* 2. Categories */}
        <button
          onClick={() => onNavigate('movies')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentTab === 'movies'
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Categories</span>
          {currentTab === 'movies' && (
            <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
          )}
        </button>

        {/* 3. Center Elevated Glowing Purple Search Button */}
        <button
          onClick={() => onNavigate('search')}
          aria-label="Search and Explore"
          className="relative -mt-6 flex flex-col items-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] shadow-xl shadow-purple-600/50 flex items-center justify-center text-white ring-4 ring-[#080914] transform group-active:scale-95 transition-transform">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-semibold text-zinc-400 group-hover:text-white mt-1">
            Explore
          </span>
        </button>

        {/* 4. Watchlist */}
        <button
          onClick={() => onNavigate('watchlist')}
          className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentTab === 'watchlist'
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Watchlist</span>
          {watchlist.length > 0 && (
            <span className="absolute top-0 right-1 px-1 py-0.2 rounded-full text-[8px] font-bold bg-purple-600 text-white">
              {watchlist.length}
            </span>
          )}
          {currentTab === 'watchlist' && (
            <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
          )}
        </button>

        {/* 5. Profile / Settings / Mood */}
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Profile</span>
          {currentTab === 'settings' && (
            <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
          )}
        </button>
      </nav>
    </div>
  );
};
