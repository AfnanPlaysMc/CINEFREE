/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bookmark, Film, Tv, Trash2, Cloud, HardDrive, Play } from 'lucide-react';
import { useWatchlist, WatchlistEntry } from '../context/WatchlistContext';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { getImageUrl, formatRating, formatYear } from '../lib/utils';
import { EmptyState } from '../components/EmptyState';

interface WatchlistViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onBrowseCatalog: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ onSelectItem, onBrowseCatalog }) => {
  const { watchlist, removeFromWatchlist, isCloudSynced } = useWatchlist();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredItems = watchlist.filter((item) => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-white tracking-tight">My Watchlist</h1>
            {isCloudSynced ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cloud className="w-3 h-3" /> Cloud Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-white/5">
                <HardDrive className="w-3 h-3" /> Local Storage
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400">
            {watchlist.length} saved title{watchlist.length === 1 ? '' : 's'} ready for discovery and playback.
          </p>
        </div>

        {watchlist.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141419] border border-white/5 self-start md:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                filterType === 'all' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                filterType === 'movie' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              Movies ({watchlist.filter((i) => i.mediaType === 'movie').length})
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                filterType === 'tv' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" />
              TV ({watchlist.filter((i) => i.mediaType === 'tv').length})
            </button>
          </div>
        )}
      </div>

      {watchlist.length === 0 ? (
        <EmptyState
          type="watchlist"
          title="Your watchlist is empty"
          description="Click the '+' button on any movie or TV series card to save it here for quick access."
          actionText="Explore Home Catalog"
          onAction={onBrowseCatalog}
        />
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-zinc-400 bg-[#141419] rounded-xl border border-white/5 my-8">
          <p className="text-sm">No {filterType === 'movie' ? 'movies' : 'TV shows'} in your watchlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {filteredItems.map((item) => {
            const posterUrl = item.posterPath ? getImageUrl(item.posterPath, 'w500') : '';
            const year = formatYear(item.releaseDate);
            const rating = formatRating(item.voteAverage);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-lg overflow-hidden bg-[#141419] border border-white/5 transition-all hover:-translate-y-1 hover:border-white/20 shadow-md"
              >
                {/* Poster container */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    onSelectItem({
                      id: Number(item.mediaId),
                      title: item.title,
                      poster_path: item.posterPath,
                      backdrop_path: item.backdropPath,
                      overview: item.overview,
                      vote_average: item.voteAverage,
                      release_date: item.releaseDate,
                      media_type: item.mediaType,
                    } as TMDBMediaItem)
                  }
                  className="relative aspect-[2/3] w-full bg-[#1c1c24] cursor-pointer overflow-hidden focus:outline-none"
                  aria-label={`Open details for ${item.title}`}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 p-4 text-center">
                      <Film className="w-10 h-10 mb-2 opacity-50" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white">
                    {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.id);
                    }}
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details caption */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                      {year && <span>{year}</span>}
                      {rating !== 'NR' && <span className="text-amber-400 font-medium">★ {rating}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onSelectItem({
                        id: Number(item.mediaId),
                        title: item.title,
                        poster_path: item.posterPath,
                        backdrop_path: item.backdropPath,
                        overview: item.overview,
                        vote_average: item.voteAverage,
                        release_date: item.releaseDate,
                        media_type: item.mediaType,
                      } as TMDBMediaItem)
                    }
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-[#1c1c24] hover:bg-[#282834] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current text-red-500" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
