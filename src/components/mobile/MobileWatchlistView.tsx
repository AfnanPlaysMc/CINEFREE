/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Play, Film, Bell, Menu, ArrowLeft } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { TMDBMediaItem } from '../../lib/tmdb-types';
import { fetchMoviesByGenre } from '../../lib/tmdb';
import { getImageUrl } from '../../lib/utils';
import { MobileHeader } from './MobileHeader';
import { NavTab } from '../Navbar';

interface MobileWatchlistViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onNavigate?: (tab: NavTab) => void;
  onBack?: () => void;
}

interface GenreSection {
  name: string;
  genreId: number;
  movies: TMDBMediaItem[];
}

export const MobileWatchlistView: React.FC<MobileWatchlistViewProps> = ({
  onSelectItem,
  onPlayMovie,
  onNavigate,
  onBack,
}) => {
  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist();

  const [sections, setSections] = useState<GenreSection[]>([
    { name: 'Action', genreId: 28, movies: [] },
    { name: 'Romance', genreId: 10749, movies: [] },
    { name: 'Comedy', genreId: 35, movies: [] },
    { name: 'Sci-Fi', genreId: 878, movies: [] }
  ]);

  useEffect(() => {
    let isCancelled = false;

    Promise.allSettled([
      fetchMoviesByGenre(28, 1),
      fetchMoviesByGenre(10749, 1),
      fetchMoviesByGenre(35, 1),
      fetchMoviesByGenre(878, 1)
    ]).then(([act, rom, com, sci]) => {
      if (isCancelled) return;

      setSections([
        {
          name: 'Action',
          genreId: 28,
          movies: act.status === 'fulfilled' ? (act.value.results.slice(0, 6) as TMDBMediaItem[]) : []
        },
        {
          name: 'Romance',
          genreId: 10749,
          movies: rom.status === 'fulfilled' ? (rom.value.results.slice(0, 6) as TMDBMediaItem[]) : []
        },
        {
          name: 'Comedy',
          genreId: 35,
          movies: com.status === 'fulfilled' ? (com.value.results.slice(0, 6) as TMDBMediaItem[]) : []
        },
        {
          name: 'Sci-Fi',
          genreId: 878,
          movies: sci.status === 'fulfilled' ? (sci.value.results.slice(0, 6) as TMDBMediaItem[]) : []
        }
      ]);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080a14] text-white pb-32">
      {/* Header with Watchlist Title */}
      <MobileHeader
        title="Watchlist"
        showBack={Boolean(onBack)}
        onBack={onBack}
        onNavigate={onNavigate}
      />

      <div className="px-4 py-4 space-y-7">
        {/* If user has custom saved items, show My Saved Items first */}
        {watchlist.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                My Saved Collection ({watchlist.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {watchlist.map((entry) => {
                const item: TMDBMediaItem = {
                  id: Number(entry.mediaId),
                  title: entry.title,
                  poster_path: entry.posterPath,
                  backdrop_path: entry.backdropPath,
                  overview: entry.overview,
                  vote_average: entry.voteAverage,
                  media_type: entry.mediaType
                };

                const posterUrl = entry.posterPath
                  ? getImageUrl(entry.posterPath, 'w500')
                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectItem(item)}
                    className="group flex flex-col space-y-1.5 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-lg group-hover:scale-[1.02] transition-transform">
                      <img
                        src={posterUrl}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(item);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-purple-400 hover:text-white border border-white/10 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                        {entry.title}
                      </h3>
                      <div className="text-[10px] text-zinc-400 truncate">
                        ★ {entry.voteAverage?.toFixed(1) || '7.5'} · {entry.releaseDate?.slice(0, 4) || 'HD'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Categorized Genre Rows (Matching Screen 3 in Reference UI) */}
        {sections.map((sec) => (
          <div key={sec.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                {sec.name}
              </h2>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('movies');
                }}
                className="text-xs text-zinc-400 hover:text-purple-400 font-medium transition-colors cursor-pointer"
              >
                See All
              </button>
            </div>

            {/* Horizontal 2-row / scrolling cards matching reference image */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {sec.movies.map((m) => {
                const titleStr = 'title' in m && m.title ? m.title : 'name' in m ? m.name : 'Movie';
                const posterUrl = m.poster_path
                  ? getImageUrl(m.poster_path, 'w500')
                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

                const isSaved = isInWatchlist(m.id, 'movie');
                const releaseYear = m.release_date ? m.release_date.slice(0, 4) : '2023';

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectItem(m)}
                    className="flex-none w-36 sm:w-40 flex flex-col space-y-1.5 cursor-pointer group"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-xl group-hover:scale-[1.02] transition-transform">
                      <img
                        src={posterUrl}
                        alt={titleStr}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Bookmark icon toggle (as seen in Screen 3) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(m);
                        }}
                        className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-md transition-colors ${
                          isSaved
                            ? 'bg-purple-600 text-white'
                            : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                        {titleStr}
                      </h3>
                      <div className="text-[10px] text-zinc-400 truncate">
                        ★ {m.vote_average?.toFixed(1) || '7.5'} · {releaseYear}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
