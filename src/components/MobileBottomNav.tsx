/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Clapperboard, Tv, Bookmark, Settings } from 'lucide-react';
import { NavTab } from './Navbar';
import { useWatchlist } from '../context/WatchlistContext';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onNavigate }) => {
  const { watchlist } = useWatchlist();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'movies', label: 'Movies', icon: <Clapperboard className="w-5 h-5" /> },
    { id: 'tv', label: 'TV Shows', icon: <Tv className="w-5 h-5" /> },
    { id: 'watchlist', label: 'My List', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090b14]/95 dark:bg-[#090b14]/95 light:bg-white/95 backdrop-blur-xl border-t border-white/10 dark:border-white/10 light:border-slate-200 py-2 px-3 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-blue-500 font-bold scale-105'
                : 'text-zinc-400 dark:text-zinc-400 light:text-slate-500 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
            {item.id === 'watchlist' && watchlist.length > 0 && (
              <span className="absolute top-0 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                {watchlist.length}
              </span>
            )}
            {isActive && (
              <span className="absolute -bottom-1 w-6 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
