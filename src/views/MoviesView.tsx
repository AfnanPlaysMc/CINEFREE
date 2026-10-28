/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchMoviesByGenre,
  fetchFreeFullMovies,
} from '../lib/tmdb';
import { TMDBMediaItem, TMDBMovie } from '../lib/tmdb-types';
import { MediaGrid } from '../components/MediaGrid';

interface MoviesViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void;
}

const GENRES = [
  { id: 0, name: 'All Movies' },
  { id: -1, name: 'Free Full Movies (Archive)' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Science Fiction' },
  { id: 18, name: 'Drama' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
];

export const MoviesView: React.FC<MoviesViewProps> = ({ onSelectItem, onPlayMovie, onPlayTrailer }) => {
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [sortTab, setSortTab] = useState<'popular' | 'top_rated' | 'now_playing'>('popular');
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const playHandler = onPlayMovie || onPlayTrailer;

  // Load movies on genre or sort change (reset page to 1)
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setPage(1);

    const loadPromise =
      selectedGenre === -1
        ? fetchFreeFullMovies(1)
        : selectedGenre !== 0
        ? fetchMoviesByGenre(selectedGenre, 1)
        : sortTab === 'popular'
        ? fetchPopularMovies(1)
        : sortTab === 'top_rated'
        ? fetchTopRatedMovies(1)
        : fetchNowPlayingMovies(1);

    loadPromise
      .then((data) => {
        if (!isCancelled && data.results) {
          setMovies(data.results.map((m) => ({ ...m, media_type: 'movie' as const })));
          setTotalPages(data.total_pages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading movies:', err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedGenre, sortTab]);

  // Load more for unlimited scrolling / pagination
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    const loadPromise =
      selectedGenre === -1
        ? fetchFreeFullMovies(nextPage)
        : selectedGenre !== 0
        ? fetchMoviesByGenre(selectedGenre, nextPage)
        : sortTab === 'popular'
        ? fetchPopularMovies(nextPage)
        : sortTab === 'top_rated'
        ? fetchTopRatedMovies(nextPage)
        : fetchNowPlayingMovies(nextPage);

    loadPromise
      .then((data) => {
        if (data.results) {
          setMovies((prev) => [
            ...prev,
            ...data.results.map((m) => ({ ...m, media_type: 'movie' as const })),
          ]);
          setPage(nextPage);
        }
        setLoadingMore(false);
      })
      .catch(() => {
        setLoadingMore(false);
      });
  }, [loadingMore, page, totalPages, selectedGenre, sortTab]);

  // Infinite scroll trigger
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Movies Catalog</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Unlimited cinematic streaming and discovery with multi-server authorized playback.
          </p>
        </div>

        {/* Sort Filter Tabs */}
        {selectedGenre === 0 && (
          <div className="flex items-center gap-1 p-1 bg-[#141419] rounded-lg border border-white/5 self-start sm:self-auto">
            <button
              onClick={() => setSortTab('popular')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sortTab === 'popular' ? 'bg-[#e50914] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortTab('top_rated')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sortTab === 'top_rated' ? 'bg-[#e50914] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setSortTab('now_playing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                sortTab === 'now_playing' ? 'bg-[#e50914] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Now Playing
            </button>
          </div>
        )}
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-4">
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={`flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
              selectedGenre === g.id
                ? 'bg-white text-black border-white font-bold'
                : 'bg-[#181820] text-zinc-300 border-white/5 hover:border-white/20'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <MediaGrid
        items={movies}
        loading={loading}
        onSelectItem={onSelectItem}
        onPlayMovie={playHandler}
        emptyTitle="No Movies Found"
        emptyDescription="We couldn't find any movie results for this category. Try switching filters."
      />

      {/* Unlimited Loading Indicator / Button */}
      {!loading && page < totalPages && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 rounded-xl bg-[#1c1c24] hover:bg-[#282834] text-white font-bold text-xs border border-white/10 transition-all cursor-pointer shadow-xl disabled:opacity-50"
          >
            {loadingMore ? 'Loading More Movies...' : 'Load More Movies'}
          </button>
        </div>
      )}
    </div>
  );
};
