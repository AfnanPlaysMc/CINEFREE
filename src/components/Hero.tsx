/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { TMDBMovie } from '../lib/tmdb-types';
import { getImageUrl, formatYear, formatRating, truncateText, isUnreleased } from '../lib/utils';
import { useWatchlist } from '../context/WatchlistContext';

interface HeroProps {
  movie?: TMDBMovie | null;
  items?: TMDBMovie[];
  onPlayMovie?: (movie: TMDBMovie) => void;
  onWatchTrailer?: (movie: TMDBMovie) => void;
  onMoreInfo: (movie: TMDBMovie) => void;
}

export const Hero: React.FC<HeroProps> = ({
  movie,
  items,
  onPlayMovie,
  onWatchTrailer,
  onMoreInfo,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Active trending items pool
  const activePool = items && items.length > 0 ? items.slice(0, 8) : movie ? [movie] : [];

  // Random initial index on mount
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (activePool.length > 1) {
      return Math.floor(Math.random() * activePool.length);
    }
    return 0;
  });

  // Auto-rotate every 7 seconds if multiple items
  useEffect(() => {
    if (activePool.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePool.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [activePool.length]);

  if (activePool.length === 0) return null;

  const activeMovie = activePool[currentIndex] || activePool[0];
  const year = formatYear(activeMovie.release_date);
  const rating = formatRating(activeMovie.vote_average);
  const saved = isInWatchlist(activeMovie.id, 'movie');
  const isComingSoon = isUnreleased(activeMovie);
  const playHandler = onPlayMovie || onWatchTrailer;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePool.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePool.length) % activePool.length);
  };

  return (
    <div className="hero-cinematic relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden select-none bg-[#050811] group">
      {/* Smooth Cross-fading Backdrops for 60fps Carousel */}
      {activePool.map((item, idx) => {
        const bgUrl = item.backdrop_path ? getImageUrl(item.backdrop_path, 'w1280') : '';
        const isCurrent = idx === currentIndex;
        if (!bgUrl) return null;

        return (
          <img
            key={item.id}
            src={bgUrl}
            alt={item.title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out animate-kenburns ${
              isCurrent ? 'opacity-90 z-0' : 'opacity-0 pointer-events-none'
            }`}
          />
        );
      })}

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#050811]/80 to-transparent w-full md:w-3/4 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-black/40 z-10" />

      {/* Hero Next / Prev Controls */}
      {activePool.length > 1 && (
        <div className="absolute inset-y-0 right-4 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePrev}
            aria-label="Previous trending movie"
            className="p-3 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/15 transition-all cursor-pointer shadow-2xl active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next trending movie"
            className="p-3 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/15 transition-all cursor-pointer shadow-2xl active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-16 sm:pb-20">
        <div key={activeMovie.id} className="max-w-2xl space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-left-6 duration-700">
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-zinc-300">
            <span
              className={`px-2.5 py-0.5 rounded font-black text-[11px] uppercase tracking-wider shadow flex items-center gap-1 ${
                isComingSoon
                  ? 'bg-amber-500 text-black border border-amber-300'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {isComingSoon ? 'Coming Soon' : 'Trending Billboard'}
            </span>
            {year && <span>{year}</span>}
            <span className="text-zinc-500">•</span>
            {rating !== 'NR' && (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating} TMDB
              </span>
            )}
            {activeMovie.status && (
              <>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{activeMovie.status}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none text-balance drop-shadow-md">
            {activeMovie.title}
          </h1>

          {/* Tagline or Overview */}
          {activeMovie.tagline && (
            <p className="text-sm md:text-base italic text-zinc-300 font-normal">
              "{activeMovie.tagline}"
            </p>
          )}

          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
            {truncateText(activeMovie.overview, 240)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isComingSoon ? (
              <button
                onClick={() => onMoreInfo(activeMovie)}
                aria-label={`Coming soon: ${activeMovie.title}`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all active:scale-95 shadow-2xl cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Coming Soon {year ? `(${year})` : ''}
              </button>
            ) : (
              playHandler && (
                <button
                  onClick={() => playHandler(activeMovie)}
                  aria-label={`Watch movie: ${activeMovie.title}`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-95 shadow-2xl cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Watch Movie
                </button>
              )
            )}

            <button
              onClick={() => onMoreInfo(activeMovie)}
              aria-label={`View full details for ${activeMovie.title}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c1c24]/80 backdrop-blur-md text-white font-medium text-sm hover:bg-[#282834] transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              More Info
            </button>

            <button
              onClick={() => toggleWatchlist(activeMovie)}
              aria-label={saved ? `Remove ${activeMovie.title} from watchlist` : `Add ${activeMovie.title} to watchlist`}
              className={`p-3 rounded-xl backdrop-blur-md transition-all border active:scale-95 cursor-pointer ${
                saved
                  ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                  : 'bg-[#1c1c24]/80 text-white border-white/10 hover:border-white/30'
              }`}
              title={saved ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Carousel Pagination Dots */}
          {activePool.length > 1 && (
            <div className="flex items-center gap-1.5 pt-2">
              {activePool.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
