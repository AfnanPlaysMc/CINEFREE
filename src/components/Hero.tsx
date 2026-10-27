/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Info, Plus, Check, Star, Clock } from 'lucide-react';
import { TMDBMovie } from '../lib/tmdb-types';
import { getImageUrl, formatYear, formatRating, truncateText, isUnreleased } from '../lib/utils';
import { useWatchlist } from '../context/WatchlistContext';

interface HeroProps {
  movie: TMDBMovie | null;
  onPlayMovie?: (movie: TMDBMovie) => void;
  onWatchTrailer?: (movie: TMDBMovie) => void;
  onMoreInfo: (movie: TMDBMovie) => void;
}

export const Hero: React.FC<HeroProps> = ({ movie, onPlayMovie, onWatchTrailer, onMoreInfo }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageFailed, setImageFailed] = React.useState(false);

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path ? getImageUrl(movie.backdrop_path, 'w1280') : '';
  const year = formatYear(movie.release_date);
  const rating = formatRating(movie.vote_average);
  const saved = isInWatchlist(movie.id, 'movie');
  const isComingSoon = isUnreleased(movie);
  const playHandler = onPlayMovie || onWatchTrailer;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden select-none bg-[#0b0b0f]">
      {/* Backdrop Image */}
      {backdropUrl && !imageFailed ? (
        <img
          src={backdropUrl}
          alt={movie.title}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 opacity-90"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c24] via-[#141419] to-[#0b0b0f]" />
      )}

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-[#0b0b0f]/80 to-transparent w-full md:w-3/4 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-transparent to-black/30 z-10" />

      {/* Content Container */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-zinc-300">
            <span
              className={`px-2 py-0.5 rounded font-extrabold text-[11px] uppercase tracking-wider shadow ${
                isComingSoon
                  ? 'bg-amber-500 text-black border border-amber-300'
                  : 'bg-[#e50914] text-white'
              }`}
            >
              {isComingSoon ? 'Coming Soon' : 'Full Playable Feature'}
            </span>
            {year && <span>{year}</span>}
            <span className="text-zinc-500">•</span>
            {rating !== 'NR' && (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rating} TMDB
              </span>
            )}
            {movie.status && (
              <>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{movie.status}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none text-balance drop-shadow-md">
            {movie.title}
          </h1>

          {/* Tagline or Overview */}
          {movie.tagline && (
            <p className="text-sm md:text-base italic text-zinc-300 font-normal">
              "{movie.tagline}"
            </p>
          )}

          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
            {truncateText(movie.overview, 240)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isComingSoon ? (
              <button
                onClick={() => onMoreInfo(movie)}
                aria-label={`Coming soon: ${movie.title}`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all active:scale-95 shadow-2xl cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Coming Soon {year ? `(${year})` : ''}
              </button>
            ) : (
              playHandler && (
                <button
                  onClick={() => playHandler(movie)}
                  aria-label={`Watch movie: ${movie.title}`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-95 shadow-2xl cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Watch Movie
                </button>
              )
            )}

            <button
              onClick={() => onMoreInfo(movie)}
              aria-label={`View full details for ${movie.title}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c1c24]/80 backdrop-blur-md text-white font-medium text-sm hover:bg-[#282834] transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              More Info
            </button>

            <button
              onClick={() => toggleWatchlist(movie)}
              aria-label={saved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              className={`p-3 rounded-xl backdrop-blur-md transition-all border active:scale-95 cursor-pointer ${
                saved
                  ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                  : 'bg-[#1c1c24]/80 text-white border-white/10 hover:border-white/30'
              }`}
              title={saved ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {saved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
