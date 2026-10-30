/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { TVShowsView } from './views/TVShowsView';
import { MoodSearchView } from './views/MoodSearchView';
import { SearchView } from './views/SearchView';
import { WatchlistView } from './views/WatchlistView';
import { SettingsView } from './views/SettingsView';
import { DetailView } from './views/DetailView';
import { CineFreePlayerModal } from './components/CineFreePlayerModal';
import { TMDBMediaItem } from './lib/tmdb-types';
import { MovieStreamSource, getFullMovieStream } from './lib/providers';
import { MobileHomeView } from './components/mobile/MobileHomeView';
import { MobileDetailView } from './components/mobile/MobileDetailView';
import { MobileWatchlistView } from './components/mobile/MobileWatchlistView';
import { MobileFloatingNav } from './components/mobile/MobileFloatingNav';
import { CINEFREE_LOGO_URL, OXA_LOGO_URL } from './components/Navbar';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; mediaType: 'movie' | 'tv' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile viewport detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Cinema Theater Player
  const [activePlayerStream, setActivePlayerStream] = useState<MovieStreamSource | null>(null);

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

      if (['home', 'movies', 'tv', 'mood', 'watchlist', 'settings'].includes(hash)) {
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

  // Surprise Pick: Pick a random trending hit
  const handleRandomPick = async () => {
    try {
      const { fetchTrendingMovies } = await import('./lib/tmdb');
      const randomPage = Math.floor(Math.random() * 3) + 1;
      const res = await fetchTrendingMovies(randomPage);
      if (res.results && res.results.length > 0) {
        const pick = res.results[Math.floor(Math.random() * res.results.length)];
        handleSelectItem(pick as TMDBMediaItem);
      }
    } catch (e) {
      console.warn('Failed to pick random movie:', e);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        navigateToTab('search');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRandomPick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Launch responsive player modal for movie or episode playback
  const handlePlayMovie = (item: TMDBMediaItem, episodeTitle?: string) => {
    const type: 'movie' | 'tv' = item.media_type || ('title' in item && item.title ? 'movie' : 'tv');
    const title = 'title' in item && item.title ? item.title : 'name' in item ? item.name : 'Movie';
    const stream = getFullMovieStream(item.id, String(title), type, episodeTitle);
    setActivePlayerStream(stream);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <div className="min-h-screen bg-[#080a14] text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
            {/* Desktop Navbar (Hidden on Mobile) */}
            {!isMobile && (
              <Navbar
                currentTab={currentTab}
                onNavigate={navigateToTab}
                onSearchSubmit={handleSearchSubmit}
                onSurpriseMe={handleRandomPick}
                searchQuery={searchQuery}
              />
            )}

            {/* Main View Area */}
            <main className="flex-1">
              {isMobile ? (
                /* USER-REQUESTED EXACT MOBILE UI */
                selectedMedia ? (
                  <MobileDetailView
                    mediaId={selectedMedia.id}
                    mediaType={selectedMedia.mediaType}
                    onBack={handleBackFromDetail}
                    onSelectItem={handleSelectItem}
                  />
                ) : currentTab === 'home' ? (
                  <MobileHomeView
                    onSelectItem={handleSelectItem}
                    onPlayMovie={handlePlayMovie}
                    onNavigate={navigateToTab}
                  />
                ) : currentTab === 'watchlist' ? (
                  <MobileWatchlistView
                    onSelectItem={handleSelectItem}
                    onPlayMovie={handlePlayMovie}
                    onNavigate={navigateToTab}
                    onBack={() => navigateToTab('home')}
                  />
                ) : currentTab === 'movies' ? (
                  <div className="pt-2">
                    <MoviesView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
                  </div>
                ) : currentTab === 'tv' ? (
                  <div className="pt-2">
                    <TVShowsView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
                  </div>
                ) : currentTab === 'mood' ? (
                  <MoodSearchView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
                ) : currentTab === 'search' ? (
                  <div className="pt-3">
                    <SearchView
                      initialQuery={searchQuery}
                      onSelectItem={handleSelectItem}
                      onPlayMovie={handlePlayMovie}
                      onQueryChange={setSearchQuery}
                    />
                  </div>
                ) : (
                  <div className="pt-2">
                    <SettingsView />
                  </div>
                )
              ) : (
                /* DESKTOP UI */
                selectedMedia ? (
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
                ) : currentTab === 'mood' ? (
                  <MoodSearchView onSelectItem={handleSelectItem} onPlayMovie={handlePlayMovie} />
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
                )
              )}
            </main>

            {/* Cinema Theater Responsive Player Modal */}
            {activePlayerStream && (
              <CineFreePlayerModal
                stream={activePlayerStream}
                onClose={() => setActivePlayerStream(null)}
              />
            )}

            {/* Desktop Footer (Hidden on Mobile) */}
            {!isMobile && (
              <footer className="bg-[#09090f] border-t border-white/5 py-10 px-4 sm:px-8 mt-auto text-xs text-zinc-400">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-lg">
                      <img src={CINEFREE_LOGO_URL} alt="CineFree Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-lg">
                      <img src={OXA_LOGO_URL} alt="OXA STUDIOS Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="font-black text-white uppercase tracking-tight text-sm block">CINEFREE</span>
                      <span className="text-[10px] text-blue-400 font-bold block -mt-0.5 uppercase tracking-wider">
                        Created by OXA STUDIOS
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400 font-medium">
                    <button onClick={() => navigateToTab('home')} className="hover:text-white transition-colors cursor-pointer">Home</button>
                    <button onClick={() => navigateToTab('movies')} className="hover:text-white transition-colors cursor-pointer">Movies</button>
                    <button onClick={() => navigateToTab('tv')} className="hover:text-white transition-colors cursor-pointer">TV Shows</button>
                    <button onClick={() => navigateToTab('mood')} className="hover:text-white text-blue-400 font-semibold transition-colors cursor-pointer">Mood Match</button>
                    <button onClick={() => navigateToTab('watchlist')} className="hover:text-white transition-colors cursor-pointer">My List</button>
                    <button onClick={() => navigateToTab('settings')} className="hover:text-white transition-colors cursor-pointer">Settings</button>
                  </div>

                  <div className="text-center md:text-right text-[11px] text-zinc-400 max-w-sm">
                    CineFree streaming guide engineered by OXA STUDIOS. Powered by MultiEmbed, VidSrc & 2Embed.
                  </div>
                </div>
              </footer>
            )}

            {/* USER REQUIREMENT: EXACT FLOATING MOBILE BOTTOM NAVIGATION DOCK */}
            {isMobile && (
              <MobileFloatingNav currentTab={currentTab} onNavigate={navigateToTab} />
            )}
          </div>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
