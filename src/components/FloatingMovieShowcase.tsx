/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { getImageUrl } from '../lib/utils';
import { Sparkles, Play } from 'lucide-react';

interface FloatingMovieShowcaseProps {
  items: TMDBMediaItem[];
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
}

export const FloatingMovieShowcase: React.FC<FloatingMovieShowcaseProps> = ({
  items,
  onSelectItem,
  onPlayMovie,
}) => {
  if (!items || items.length < 4) return null;

  const showcaseItems = items.slice(0, 5);

  return (
    <div className="relative my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-blue-900/20 border border-blue-500/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Copy */}
        <div className="max-w-md text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 2D Motion Spotlight
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Trending Cinema in Motion
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-300 light:text-slate-600 leading-relaxed">
            Curated featured showcase powered by OXA STUDIOS streaming architecture with instant 1080p playback.
          </p>
        </div>

        {/* Right Floating Poster Cards */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {showcaseItems.map((item, idx) => {
            const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'w300') : '';
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-110 hover:z-20 hover:border-blue-500 animate-float-poster`}
                style={{ animationDelay: `${idx * 0.6}s` }}
              >
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={item.title || item.name || 'Poster'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-white p-2 text-center">
                    {item.title || item.name}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left">
                  {onPlayMovie && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayMovie(item);
                      }}
                      className="p-1.5 rounded-full bg-blue-600 text-white self-center mb-2 shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  )}
                  <p className="text-[10px] font-bold text-white truncate">{item.title || item.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
