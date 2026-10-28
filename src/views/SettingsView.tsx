/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  HardDrive,
  Cloud,
  CheckCircle2,
  Trash2,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Laptop,
  AlertTriangle,
  Keyboard,
  Info,
  RefreshCw,
  Sparkles,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useTheme } from '../context/ThemeContext';
import { OXA_LOGO_URL } from '../components/Navbar';

export const SettingsView: React.FC = () => {
  const { user, signInWithGoogle, logout, loading: authLoading } = useAuth();
  const { clearLocalData, clearCloudData, syncLocalToCloud, watchlist, history } = useWatchlist();
  const { themeMode, setThemeMode } = useTheme();

  const [localClearedStatus, setLocalClearedStatus] = useState(false);
  const [cloudClearedStatus, setCloudClearedStatus] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Easily and unconditionally clear local data with instant visual feedback
  const handleClearLocalData = () => {
    clearLocalData();
    setLocalClearedStatus(true);
    setTimeout(() => setLocalClearedStatus(false), 3000);
  };

  const handleClearCloudData = async () => {
    try {
      await clearCloudData();
      setCloudClearedStatus(true);
      setTimeout(() => setCloudClearedStatus(false), 3000);
    } catch (err) {
      console.warn('Clear cloud error:', err);
    }
  };

  const handleSyncToCloud = async () => {
    try {
      setSyncStatus('Syncing...');
      const count = await syncLocalToCloud();
      setSyncStatus(`Successfully synced ${count} items to Firestore!`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      setSyncStatus('Sync failed. Please check connection.');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your CineFree cloud account, theme appearance, local storage, and streaming options.
        </p>
      </div>

      {/* 1. FIREBASE CLOUD DATA & ACCOUNT (FULL CLOUD SYNC) */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/10 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase Cloud Data & Sync</h3>
              <p className="text-xs text-zinc-400">
                Connected to Firestore database: <code className="text-blue-400 font-mono text-[11px]">ai-studio-cinefree</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Database Online
          </div>
        </div>

        {user ? (
          <div className="p-5 rounded-xl bg-[#1c1c26] border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full ring-2 ring-blue-500 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">{user.displayName || 'Authenticated CineFree User'}</h4>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Real-time Cloud Synchronization Active
                  </p>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncToCloud}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Local Data to Cloud
              </button>

              <button
                onClick={handleClearCloudData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cloud Watchlist
              </button>

              {syncStatus && (
                <span className="text-xs text-blue-400 font-medium animate-in fade-in">{syncStatus}</span>
              )}
              {cloudClearedStatus && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cloud watchlist cleared!
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-[#1c1c26] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> Guest Mode (Local Storage Only)
              </h4>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Sign in with Google to enable automatic cloud data backup to Firestore. Your watchlist and history will sync seamlessly across all your devices.
              </p>
            </div>

            <button
              onClick={() => signInWithGoogle()}
              disabled={authLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 cursor-pointer flex-none"
            >
              <LogIn className="w-4 h-4" />
              {authLoading ? 'Connecting...' : 'Sign In with Google'}
            </button>
          </div>
        )}
      </section>

      {/* 2. BROWSER LOCAL STORAGE & CACHE (EASILY WORKABLE CLEAR BUTTON) */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Browser Storage & Local Data</h3>
            <p className="text-xs text-zinc-400">
              Instantly clear locally cached watchlist entries, browsing history, and preferences.
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

          <div className="flex items-center gap-3">
            {localClearedStatus && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> All Local Data Cleared!
              </span>
            )}

            {/* EASILY WORKING ONE-CLICK CLEAR BUTTON */}
            <button
              onClick={handleClearLocalData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear LOCAL DATA
            </button>
          </div>
        </div>
      </section>

      {/* 3. Theme & Appearance (Black & Blue vs White & Blue) */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Theme Appearance</h3>
            <p className="text-xs text-zinc-400">
              Choose between Black & Blue (Dark) and White & Blue (Light), or sync with your device settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setThemeMode('auto')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              themeMode === 'auto'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                : 'bg-[#1c1c24] border-white/5 text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-bold">Auto (Device)</p>
                <p className="text-[10px] text-zinc-400">Matches system setting</p>
              </div>
            </div>
            {themeMode === 'auto' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </button>

          <button
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              themeMode === 'dark'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                : 'bg-[#1c1c24] border-white/5 text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-bold">Black & Blue</p>
                <p className="text-[10px] text-zinc-400">Cinematic dark mode</p>
              </div>
            </div>
            {themeMode === 'dark' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </button>

          <button
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              themeMode === 'light'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                : 'bg-[#1c1c24] border-white/5 text-zinc-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-bold">White & Blue</p>
                <p className="text-[10px] text-zinc-400">Crisp daytime mode</p>
              </div>
            </div>
            {themeMode === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </section>

      {/* 4. ADVERTISING & STREAMING SITES TRANSPARENCY NOTICE */}
      <section className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4 text-xs text-zinc-300 leading-relaxed shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-black flex-none">
            <AlertTriangle className="w-5 h-5 font-bold" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
              STREAMING SITES & ADS NOTICE
            </h3>
            <p className="text-sm sm:text-base font-black text-white leading-snug">
              "THE MAIN APP DOES NOT HAVE ANY ADS, HOWEVER THE STREAMING SITES HAVE IT AND THERE IS NOTHING WE CAN DO"
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              CineFree itself is completely clean and does not place any banner ads, popups, or commercial tracking in our application. However, when you launch streams through third-party media mirrors (such as MultiEmbed, 2Embed, VidSrc, or VidLink), those external hosting providers monetize their own servers with popups or video overlays.
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-[11px] text-amber-200">
              <Info className="w-4 h-4 text-amber-400 flex-none" />
              <span>
                <strong>Pro-tip:</strong> We recommend using a browser ad-blocker like <strong>uBlock Origin</strong> or the <strong>Brave Browser</strong> to block intrusive third-party popups while streaming.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Keyboard Shortcuts Helper */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
            <p className="text-xs text-zinc-400">Quick keys for navigation and stream playback</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-white/5 flex items-center justify-between">
            <span className="text-zinc-400">Search:</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white">/</kbd>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-white/5 flex items-center justify-between">
            <span className="text-zinc-400">Close Player:</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white">Esc</kbd>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-white/5 flex items-center justify-between">
            <span className="text-zinc-400">Fullscreen:</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white">F</kbd>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-white/5 flex items-center justify-between">
            <span className="text-zinc-400">Surprise Pick:</span>
            <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white">R</kbd>
          </div>
        </div>
      </section>

      {/* 6. Creator Info: OXA STUDIOS */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-4 text-xs text-zinc-400 leading-relaxed shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center border border-white/20 shadow-xl flex-none">
            <img
              src={OXA_LOGO_URL}
              alt="OXA STUDIOS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Created & Crafted by OXA STUDIOS</h3>
            <p className="text-xs text-blue-400 font-medium mt-0.5">Creative Studio Architecture & Production</p>
          </div>
        </div>
        <p className="text-xs text-zinc-300">
          CineFree is an official application created and engineered by <strong>OXA STUDIOS</strong>. Designed as a high-performance, privacy-first cinematic streaming discovery platform.
        </p>
      </section>

      {/* 7. Privacy & Legal */}
      <section className="p-6 rounded-2xl bg-[#141419] border border-white/5 space-y-4 text-xs text-zinc-400 leading-relaxed">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Platform Privacy Policy</span>
        </div>

        <p>
          CineFree by OXA STUDIOS is designed as a privacy-respecting movie & television discovery guide. We do not track personal browsing habits or collect private telemetry.
        </p>
      </section>
    </div>
  );
};
