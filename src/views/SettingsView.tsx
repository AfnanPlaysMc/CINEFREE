/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  HardDrive,
  Cloud,
  CheckCircle2,
  Trash2,
  LogIn,
  LogOut,
  Info,
  Server,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { checkServerConfig, setCustomApiKey } from '../lib/tmdb';

export const SettingsView: React.FC = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { clearLocalData, watchlist, history, isCloudSynced } = useWatchlist();

  const [serverStatus, setServerStatus] = useState<{ hasTmdbKey: boolean; mode: string } | null>(null);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [customKeySaved, setCustomKeySaved] = useState(false);
  const [clearedMessage, setClearedMessage] = useState(false);

  useEffect(() => {
    checkServerConfig().then(setServerStatus);
    const existingKey = localStorage.getItem('cinefree_custom_tmdb_key');
    if (existingKey) {
      setCustomKeyInput(existingKey);
    }
  }, []);

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(customKeyInput.trim() || null);
    setCustomKeySaved(true);
    setTimeout(() => setCustomKeySaved(false), 3000);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear your local watchlist and browsing history?')) {
      clearLocalData();
      setClearedMessage(true);
      setTimeout(() => setClearedMessage(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your account, cloud data synchronization, API credentials, and privacy options.
        </p>
      </div>

      {/* 1. Account & Cloud Synchronization */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Google Account & Cloud Sync</h3>
            <p className="text-xs text-zinc-400">
              Sign in with Google to persist your watchlist across devices with Firebase Firestore.
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1c1c24] border border-white/5">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-10 h-10 rounded-full border border-red-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{user.displayName || 'User'}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Real-time cloud database active</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1c1c24] border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Guest Session (Local Storage)</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your watchlist is currently stored locally in your browser. Sign in to back it up in Firestore.
              </p>
            </div>

            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e50914] hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-900/30 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </button>
          </div>
        )}
      </section>

      {/* 2. TMDB API Configuration */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">The Movie Database (TMDB) Integration</h3>
            <p className="text-xs text-zinc-400">
              Live movie & TV metadata powered by the official TMDB API.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1c1c24] border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" /> Server TMDB Environment Status:
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                serverStatus?.hasTmdbKey
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {serverStatus?.hasTmdbKey ? 'Server Key Configured' : 'Authentic Curated Catalog Active'}
            </span>
          </div>

          <form onSubmit={handleSaveCustomKey} className="pt-2 space-y-3">
            <div>
              <label htmlFor="custom-tmdb-key" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Optional: Personal TMDB API Key Override
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-tmdb-key"
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="Enter TMDB v3 API Key (optional)"
                  className="flex-1 px-3.5 py-2 rounded-lg bg-[#141419] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Saved locally on your machine and sent via secure proxy headers. Leave blank to use server default.
              </p>
            </div>
            {customKeySaved && (
              <p className="text-xs text-emerald-400 font-medium">Preferences updated successfully!</p>
            )}
          </form>
        </div>
      </section>

      {/* 3. Storage & Local Data Management */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Browser Storage & Cache</h3>
            <p className="text-xs text-zinc-400">
              Manage locally saved items and viewing history.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1c1c24] border border-white/5">
          <div className="space-y-1">
            <p className="text-xs text-zinc-300">
              Saved Watchlist Entries: <span className="font-bold text-white">{watchlist.length}</span>
            </p>
            <p className="text-xs text-zinc-300">
              Recently Viewed Titles: <span className="font-bold text-white">{history.length}</span>
            </p>
          </div>

          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium border border-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Local Data
          </button>
        </div>
        {clearedMessage && (
          <p className="text-xs text-amber-400 font-medium">Local storage cleared successfully.</p>
        )}
      </section>

      {/* 4. Privacy & TMDB Legal Attribution */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-4 text-xs text-zinc-400 leading-relaxed">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-zinc-400" />
          <span>Privacy & Copyright Compliance</span>
        </div>

        <p>
          CineFree is designed as a privacy-friendly discovery tool and streaming availability guide. We do not track
          personal browsing habits across the web, nor do we sell user data to advertising third parties.
        </p>

        <p className="p-3 rounded-lg bg-[#1c1c24] border border-white/5 text-zinc-300">
          <strong>TMDB Attribution:</strong> This product uses the TMDB API but is not endorsed or certified by TMDB.
          All movie posters, titles, cast information, and metadata are the intellectual property of their respective
          copyright holders.
        </p>

        <p>
          <strong>Streaming Availability & Authorized Playback:</strong> TMDB metadata does not automatically provide
          rights to stream full films and TV episodes. CineFree embeds verified official trailers provided by authorized
          studios and distributors, verified open archive public domain features, and direct legal links to official
          providers (Netflix, Prime Video, Disney+, Max, Apple TV) via TMDB Watch Providers.
        </p>
      </section>
    </div>
  );
};
