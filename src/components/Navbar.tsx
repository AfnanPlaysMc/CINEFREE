/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Settings, LogIn, LogOut, Home, Tv, Clapperboard, CheckCircle2, Dices, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { SearchBar } from './SearchBar';

export type NavTab = 'home' | 'movies' | 'tv' | 'mood' | 'watchlist' | 'search' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearchSubmit: (query: string) => void;
  onSurpriseMe?: () => void;
  searchQuery?: string;
}

export const CINEFREE_LOGO_URL = 'https://raw.githubusercontent.com/AfnanPlaysMc/GAME/main/Black%20and%20White%20Minimalist%20Simple%20Modern%20Bold%20Typographic%20Chic%20Logo.png';
export const OXA_LOGO_URL = 'https://raw.githubusercontent.com/AfnanPlaysMc/GAME/main/Black%20Beige%20Minimalist%20Typographic%20Creative%20Studio%20Logo.png';

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onSearchSubmit,
  onSurpriseMe,
  searchQuery = '',
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'movies', label: 'Movies', icon: <Clapperboard className="w-4 h-4" /> },
    { id: 'tv', label: 'TV Shows', icon: <Tv className="w-4 h-4" /> },
    { id: 'mood', label: 'Mood Match', icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
    { id: 'watchlist', label: 'My List', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#050811]/95 dark:bg-[#050811]/95 light:bg-white/95 backdrop-blur-md shadow-xl border-b border-white/10 dark:border-white/10 light:border-slate-200 py-2.5'
            : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo & Creator Badge */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
              aria-label="CineFree Home"
            >
              {/* Official CineFree Typographic Logo */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform shadow-lg">
                <img
                  src={CINEFREE_LOGO_URL}
                  alt="CineFree Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white dark:text-white light:text-slate-900 uppercase flex items-center gap-1.5">
                  CINE<span className="text-blue-500">FREE</span>
                </span>
                {/* OXA Studios Creator Tagline */}
                <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-blue-400 dark:text-blue-400 light:text-blue-600 uppercase -mt-0.5">
                  <span>BY OXA STUDIOS</span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white dark:text-white light:text-blue-600 bg-blue-600/20 font-bold'
                        : 'text-zinc-300 dark:text-zinc-300 light:text-slate-600 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {link.id === 'watchlist' && watchlist.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        {watchlist.length}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Search & Auth */}
          <div className="flex items-center gap-3">
            {/* Desktop Inline Search Bar */}
            <div className="hidden sm:block w-48 md:w-64">
              <SearchBar
                initialQuery={searchQuery}
                onSearch={(q) => {
                  onSearchSubmit(q);
                  if (q) onNavigate('search');
                }}
              />
            </div>

            {/* Surprise Me / Random Pick button */}
            {onSurpriseMe && (
              <button
                onClick={onSurpriseMe}
                title="Surprise Pick: Play a random trending hit!"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all text-xs font-bold cursor-pointer shadow-lg active:scale-95"
              >
                <Dices className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Surprise Pick</span>
              </button>
            )}

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => onNavigate('search')}
              aria-label="Open search"
              className="sm:hidden p-2 rounded-full text-zinc-300 dark:text-zinc-300 light:text-slate-700 hover:bg-white/10 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Google Sign-in / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Open user profile menu"
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-300 hover:border-blue-500 transition-all cursor-pointer"
                >
                  <span className="hidden lg:inline text-xs font-medium text-white dark:text-white light:text-slate-900 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User profile'}
                      className="w-7 h-7 rounded-full object-cover border border-blue-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.[0] || 'O'}
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-white/5 dark:border-white/5 light:border-slate-200 mb-1">
                      <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">{user.displayName || 'CineFree Member'}</p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-slate-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                        <CheckCircle2 className="w-3 h-3" /> OXA Cloud Sync Active
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('watchlist');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 dark:text-zinc-300 light:text-slate-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                      My Watchlist ({watchlist.length})
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 dark:text-zinc-300 light:text-slate-700 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-400" />
                      Settings & Theme Mode
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer mt-1 border-t border-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
