/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Film, Search, Bookmark, Settings, LogIn, LogOut, User as UserIcon, Home, Tv, Clapperboard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { SearchBar } from './SearchBar';

export type NavTab = 'home' | 'movies' | 'tv' | 'watchlist' | 'search' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearchSubmit: (query: string) => void;
  searchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onSearchSubmit,
  searchQuery = '',
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { watchlist, isCloudSynced } = useWatchlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
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
    { id: 'watchlist', label: 'My List', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b0b0f]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/5 py-3'
            : 'bg-gradient-to-b from-[#0b0b0f]/90 via-[#0b0b0f]/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
              aria-label="CineFree Home"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-red-700 to-[#e50914] text-white shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase flex items-center">
                  CINE<span className="text-[#e50914]">FREE</span>
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase -mt-1">
                  Discover • Watch
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {link.id === 'watchlist' && watchlist.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#e50914] text-white">
                        {watchlist.length}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#e50914] rounded-full" />
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

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => onNavigate('search')}
              aria-label="Open search"
              className="sm:hidden p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Google Sign-in / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Open user profile menu"
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-[#1c1c24] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <span className="hidden lg:inline text-xs font-medium text-white max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User profile'}
                      className="w-7 h-7 rounded-full object-cover border border-red-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1c1c24] border border-white/10 shadow-2xl p-2 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName || 'User'}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      {isCloudSynced && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Watchlist synced to Cloud</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('watchlist');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer mt-1"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      My Watchlist ({watchlist.length})
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      Settings & Preferences
                    </button>

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                aria-label="Sign in with Google"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1c24] hover:bg-[#252530] text-white text-xs font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow"
              >
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0b0f]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {navLinks.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-[#e50914]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                {link.icon}
                {link.id === 'watchlist' && watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-bold bg-[#e50914] text-white">
                    {watchlist.length}
                  </span>
                )}
              </div>
              <span className="mt-1">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
