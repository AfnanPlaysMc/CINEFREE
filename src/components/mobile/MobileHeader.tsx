/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Menu, X, ArrowLeft, Bookmark, Sparkles, Settings, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../Navbar';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onNavigate,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'CineFree 4K Streams Ready', time: 'Just now', desc: 'All 5 ultra-fast global mirrors are active.' },
    { id: 2, title: 'Trending This Week', time: '2h ago', desc: 'New blockbuster releases added to the catalog.' },
    { id: 3, title: 'Cinema Synesthesia', time: '1d ago', desc: 'Try mood discovery to match your exact vibe.' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090a14]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between gap-3">
        {showBack ? (
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {title && (
              <h1 className="text-lg font-bold text-white tracking-tight truncate">
                {title}
              </h1>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/50 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user?.displayName ? user.displayName[0].toUpperCase() : '⚡'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090a14]" />
            </div>

            {/* Greeting */}
            <div>
              <div className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                <span>Hello</span>
                <span>👋</span>
              </div>
              <div className="text-sm font-bold text-white tracking-tight">
                {user?.displayName ? user.displayName.split(' ')[0] : 'User'}
              </div>
            </div>
          </div>
        )}

        {/* Right Actions: Notifications & Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            aria-label="View notifications"
            className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#090a14]" />
          </button>

          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(true)}
            aria-label="Open mobile menu"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#121324] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{n.title}</span>
                    <span className="text-[10px] text-zinc-500">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{n.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Menu Drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-72 bg-[#0e101f] border-l border-white/10 h-full p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-black text-white uppercase text-base tracking-wider">
                  CINE<span className="text-purple-400">FREE</span>
                </span>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="space-y-1">
                {[
                  { id: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
                  { id: 'movies', label: 'Categories & Movies', icon: <Menu className="w-4 h-4 text-blue-400" /> },
                  { id: 'mood', label: 'Cinema Synesthesia', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
                  { id: 'watchlist', label: 'My Watchlist', icon: <Bookmark className="w-4 h-4 text-rose-400" /> },
                  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 text-zinc-400" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMenu(false);
                      if (onNavigate) onNavigate(item.id as NavTab);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Auth */}
            <div className="pt-4 border-t border-white/10">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-zinc-400 truncate">
                    Signed in as <span className="text-white font-bold">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setShowMenu(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
