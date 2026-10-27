/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { TVShowsView } from './views/TVShowsView';
import { SearchView } from './views/SearchView';
import { WatchlistView } from './views/WatchlistView';
import { SettingsView } from './views/SettingsView';
import { DetailView } from './views/DetailView';
import { VideoPlayer } from './components/VideoPlayer';
import { TMDBMediaItem } from './lib/tmdb-types';
import { MovieStreamSource, getFullMovieStream } from './lib/providers';
import { Film } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; mediaType: 'movie' | 'tv' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Native Full Movie Player
  const [activeStream, setActiveStream] = useState<MovieStreamSource | null>(null);

  // Sync state with URL hash for browser back/forward and deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setSelectedMedia(null);
        return;
      }

      const movieMatch = hash.match(/^movie\/(\d+)/);
      if (movieMatch) {
        setSelectedMedia({ id: Number(movieMatch[1]), mediaType: 'movie' });
        return;
      }

      const tvMatch = hash.match(/^tv\/(\d+)/);
      if (tvMatch) {
        setSelectedMedia({ id: Number(tvMatch[1]), mediaType: 'tv' });
        return;
      }

      const searchMatch = hash.match(/^search(?:\?q=(.*))?/);
      if (searchMatch) {
        setCurrentTab('search');
        setSelectedMedia(null);
        if (searchMatch[1]) {
          setSearchQuery(decodeURIComponent(searchMatch[1]));
        }
        return;
      }

      if (['home', 'movies', 'tv', 'watchlist', 'settings'].includes(hash)) {
        setCurrentTab(hash as NavTab);
        setSelectedMedia(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setSelectedMedia(null);
    if (tab !== 'search') {
      setSearchQuery('');
    }
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeStream) {
        setActiveStream(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStream]);

  const handleSelectItem = (item: TMDBMediaItem) => {
    const type: 'movie' | 'tv' = item.media_type || ('title' in item && item.title ? 'movie' : 'tv');
    setSelectedMedia({ id: item.id, mediaType: type });
    window.location.hash = `#/${type}/${item.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedMedia(null);
    window.location.hash = `#/${currentTab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setCurrentTab('search');
    setSelectedMedia(null);
    window.location.hash = query ? `#/search?q=${encodeURIComponent(query)}` : '#/search';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch full movie playback in CineFree native player
  const handlePlayMovie = (item: TMDBMediaItem, episodeTitle?: string) => {
    const type: 'movie' | 'tv' = item.media_type || ('title' in item && item.title ? 'movie' : 'tv');
    const title = 'title' in item && item.title ? item.title : 'name' in item ? item.name : 'Movie';
    const stream = getFullMovieStream(item.id, String(title), type, episodeTitle);
    setActiveStream(stream);
  };

  return (
    <AuthProvider>
      <WatchlistProvider>
        <div className="min-h-screen bg-[#0b0b0f] text-white flex flex-col font-sans selection:bg-[#e50914] selection:text-white">
          {/* Main Top Navigation Header */}
          <Navbar
            currentTab={currentTab}
            onNavigate={navigateToTab}
            onSearchSubmit={handleSearchSubmit}
            searchQuery={searchQuery}
          />

          {/* Active View */}
          <main className="flex-1 w-full" id="main-content">
            {selectedMedia ? (
              <DetailView
                mediaId={selectedMedia.id}
                mediaType={selectedMedia.mediaType}
                onBack={handleBackFromDetail}
                onSelectItem={handleSelectItem}
              />
            ) : currentTab === 'home' ? (
              <HomeView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
            ) : currentTab === 'movies' ? (
              <MoviesView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
            ) : currentTab === 'tv' ? (
              <TVShowsView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
            ) : currentTab === 'search' ? (
              <SearchView
                initialQuery={searchQuery}
                onSelectItem={handleSelectItem}
                onPlayMovie={handlePlayMovie}
                onQueryChange={setSearchQuery}
              />
            ) : currentTab === 'watchlist' ? (
              <WatchlistView onSelectItem={handleSelectItem} onBrowseCatalog={() => navigateToTab('home')} />
            ) : (
              <SettingsView />
            )}
          </main>

          {/* CineFree Native Video Player Modal (No YouTube, No branding except CineFree) */}
          {activeStream && (
            <VideoPlayer
              stream={activeStream}
              onClose={() => setActiveStream(null)}
            />
          )}

          {/* Footer */}
          <footer className="bg-[#0e0e13] border-t border-white/5 py-10 px-4 sm:px-8 mt-auto text-xs text-zinc-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#e50914] text-white">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-white uppercase tracking-tight">CINEFREE</span>
                  <span className="text-[10px] text-zinc-400 block -mt-0.5">
                    Authorized Streaming & Discovery
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
                <button
                  onClick={() => navigateToTab('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  onClick={() => navigateToTab('movies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Movies
                </button>
                <button
                  onClick={() => navigateToTab('tv')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  TV Shows
                </button>
                <button
                  onClick={() => navigateToTab('watchlist')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My List
                </button>
                <button
                  onClick={() => navigateToTab('settings')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy & Settings
                </button>
              </div>

              <div className="text-center md:text-right text-[11px] text-zinc-400 max-w-sm">
                This product uses open data and public streams with zero third-party brandings. All copyrights belong to their respective rights holders.
              </div>
            </div>
          </footer>
        </div>
      </WatchlistProvider>
    </AuthProvider>
  );
}
