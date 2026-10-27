/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { MovieCard } from './MovieCard';
import { RowSkeleton } from './Skeleton';

interface MovieRowProps {
  title: string;
  items: TMDBMediaItem[];
  loading?: boolean;
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  items,
  loading = false,
  onSelectItem,
  onPlayMovie,
  onPlayTrailer,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return <RowSkeleton title={title} />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  const playHandler = onPlayMovie || onPlayTrailer;

  return (
    <section className="relative my-6 px-4 md:px-10 group" aria-label={title}>
      <h3 className="text-lg md:text-xl font-bold text-white mb-3 tracking-tight flex items-center gap-2">
        <span>{title}</span>
        <span className="text-xs font-normal text-zinc-500">({items.length})</span>
      </h3>

      {/* Navigation Chevrons */}
      <button
        onClick={() => scroll('left')}
        aria-label={`Scroll left in ${title}`}
        className="absolute left-1 md:left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 shadow-xl border border-white/10 cursor-pointer hover:scale-105"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        aria-label={`Scroll right in ${title}`}
        className="absolute right-1 md:right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 shadow-xl border border-white/10 cursor-pointer hover:scale-105"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={rowRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 px-1 -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <MovieCard
            key={`${item.media_type || 'm'}_${item.id}`}
            item={item}
            onSelect={onSelectItem}
            onPlayMovie={playHandler}
          />
        ))}
      </div>
    </section>
  );
};
