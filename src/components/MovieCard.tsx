/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Plus, Check, Play, Film, Clock } from 'lucide-react';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { getImageUrl, formatRating, formatYear, getMediaTitle, getMediaReleaseDate, isUnreleased } from '../lib/utils';
import { useWatchlist } from '../context/WatchlistContext';

interface MovieCardProps {
  item: TMDBMediaItem;
  onSelect?: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void; // backwards compat
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ item, onSelect, onPlayMovie, onPlayTrailer }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = getMediaTitle(item);
  const releaseDate = getMediaReleaseDate(item);
  const year = formatYear(releaseDate);
  const rating = formatRating(item.vote_average);
  const isMovieType = item.media_type === 'movie' || ('title' in item && Boolean(item.title));
  const mediaType: 'movie' | 'tv' = isMovieType ? 'movie' : 'tv';
  const saved = isInWatchlist(item.id, mediaType);
  const isComingSoon = isUnreleased(item);

  const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'w500') : '';

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await toggleWatchlist(item);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onPlayMovie) {
      onPlayMovie(item);
    } else if (onPlayTrailer) {
      onPlayTrailer(item);
    } else if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={`View details for ${title}`}
      className="group relative flex-none w-36 sm:w-44 md:w-52 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md transition-transform duration-300 ease-out hover:-translate-y-1.5"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-[#1c1c24] border border-white/5 shadow-md">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#181820] text-zinc-500 text-center">
            <Film className="w-10 h-10 mb-2 opacity-50 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 line-clamp-3">{title}</span>
          </div>
        )}

        {/* Media Badge */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
              isComingSoon
                ? 'bg-amber-500 text-black border border-amber-300'
                : 'bg-[#e50914] text-white border border-red-400/30'
            }`}
          >
            {isComingSoon ? 'Coming Soon' : mediaType === 'tv' ? 'Full Series' : 'Full Movie'}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-2">
            {isComingSoon ? (
              <button
                onClick={handleCardClick}
                title={`Coming Soon: ${title}`}
                className="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1 shadow-lg cursor-pointer transition-transform active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" /> Coming Soon
              </button>
            ) : (
              <button
                onClick={handlePlayClick}
                aria-label={`Play full ${mediaType === 'tv' ? 'series' : 'movie'}: ${title}`}
                title={`Play Full ${mediaType === 'tv' ? 'Series' : 'Movie'}`}
                className="p-2.5 rounded-full transition-transform active:scale-95 shadow-lg cursor-pointer bg-[#e50914] text-white hover:bg-red-700"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            )}
            <button
              onClick={handleWatchlistClick}
              aria-label={saved ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
              className={`p-2.5 rounded-full transition-colors border shadow-lg cursor-pointer ${
                saved
                  ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                  : 'bg-black/60 text-white border-white/30 hover:border-white'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xs font-semibold text-white line-clamp-1">{title}</div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-300 mt-1">
            {year && <span>{year}</span>}
            {rating !== 'NR' && (
              <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {rating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title & Metadata below card (visible always) */}
      <div className="mt-2 text-left">
        <h4 className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
          {year && <span>{year}</span>}
          {rating !== 'NR' && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span>{rating}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
