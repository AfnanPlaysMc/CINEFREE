/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchMoviesByGenre
} from '../../lib/tmdb';
import { TMDBMediaItem, TMDBMovie } from '../../lib/tmdb-types';
import { getImageUrl } from '../../lib/utils';
import { MobileHeader } from './MobileHeader';
import { MobileCoverFlow } from './MobileCoverFlow';
import { NavTab } from '../Navbar';

interface MobileHomeViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onNavigate: (tab: NavTab) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All', genreId: null },
  { id: 'action', name: 'Action', genreId: 28 },
  { id: 'comedy', name: 'Comedy', genreId: 35 },
  { id: 'drama', name: 'Drama', genreId: 18 },
  { id: 'romance', name: 'Romance', genreId: 10749 },
  { id: 'scifi', name: 'Sci-Fi', genreId: 878 },
  { id: 'horror', name: 'Horror', genreId: 27 },
];

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  onSelectItem,
  onPlayMovie,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [latestMovies, setLatestMovies] = useState<TMDBMovie[]>([]);
  const [categoryFilteredMovies, setCategoryFilteredMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    Promise.allSettled([
      fetchTrendingMovies(1),
      fetchNowPlayingMovies(1),
    ]).then(([trendRes, nowRes]) => {
      if (isCancelled) return;

      if (trendRes.status === 'fulfilled' && trendRes.value.results) {
        setTrendingMovies(trendRes.value.results);
      }
      if (nowRes.status === 'fulfilled' && nowRes.value.results) {
        setLatestMovies(nowRes.value.results);
      }
      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // When category changes, fetch genre movies if not 'all'
  useEffect(() => {
    let isCancelled = false;
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);

    if (!cat || cat.id === 'all' || !cat.genreId) {
      setCategoryFilteredMovies([]);
      return;
    }

    fetchMoviesByGenre(cat.genreId, 1).then((res) => {
      if (!isCancelled && res.results) {
        setCategoryFilteredMovies(res.results);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#080a14] text-white pb-32">
      {/* 1. Mobile Header (Hello 👋 User + Bell + Menu) */}
      <MobileHeader onNavigate={onNavigate} />

      {/* 2. 3D Cover Flow Carousel (Screen 1 in Reference) */}
      <div className="pt-2">
        <MobileCoverFlow
          items={trendingMovies}
          onSelectItem={onSelectItem}
          onPlayMovie={onPlayMovie}
        />
      </div>

      <div className="px-4 space-y-6 pt-2">
        {/* 3. Categories Pill Row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Categories
            </h2>
            <button
              onClick={() => onNavigate('movies')}
              className="text-xs text-zinc-400 hover:text-purple-400 font-medium transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Latest Movie Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Latest Movie
            </h2>
            <button
              onClick={() => onNavigate('movies')}
              className="text-xs text-zinc-400 hover:text-purple-400 font-medium transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {(categoryFilteredMovies.length > 0 ? categoryFilteredMovies : latestMovies).map((m) => {
              const titleStr: string = String(('title' in m && m.title ? m.title : 'name' in m ? m.name : 'Movie') || 'Movie');
              const posterUrl = m.poster_path
                ? getImageUrl(m.poster_path, 'w500')
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectItem(m as TMDBMediaItem)}
                  className="flex-none w-32 sm:w-36 flex flex-col space-y-1.5 cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={posterUrl}
                      alt={titleStr}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                    {titleStr}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Trending Now Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Trending Now
            </h2>
            <button
              onClick={() => onNavigate('movies')}
              className="text-xs text-zinc-400 hover:text-purple-400 font-medium transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none">
            {trendingMovies.slice(4, 14).map((m) => {
              const titleStr: string = String(('title' in m && m.title ? m.title : 'name' in m ? m.name : 'Movie') || 'Movie');
              const posterUrl = m.poster_path
                ? getImageUrl(m.poster_path, 'w500')
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectItem(m as TMDBMediaItem)}
                  className="flex-none w-36 sm:w-44 flex flex-col space-y-1.5 cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={posterUrl}
                      alt={titleStr}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-bold shadow-md">
                      ★ {m.vote_average?.toFixed(1) || '7.5'}
                    </div>
                  </div>
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                    {titleStr}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
