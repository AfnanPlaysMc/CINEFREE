/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react';
import { TMDBMediaItem, TMDBMovie } from '../../lib/tmdb-types';
import { getImageUrl } from '../../lib/utils';

interface MobileCoverFlowProps {
  items: (TMDBMovie | TMDBMediaItem)[];
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
}

export const MobileCoverFlow: React.FC<MobileCoverFlowProps> = ({
  items,
  onSelectItem,
  onPlayMovie,
}) => {
  const [activeIndex, setActiveIndex] = useState(2);
  const touchStartX = useRef<number | null>(null);

  if (!items || items.length === 0) return null;

  // Use top 5 items for the cover flow
  const displayItems = items.slice(0, 5);
  const activeItem = displayItems[activeIndex] || displayItems[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 40) {
      // Swiped right -> go to previous
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (diff < -40) {
      // Swiped left -> go to next
      setActiveIndex((prev) => Math.min(displayItems.length - 1, prev + 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full py-4 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: '1000px' }}
    >
      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
        {displayItems.map((item, index) => {
          const offset = index - activeIndex;
          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isFarLeft = offset < -1;
          const isFarRight = offset > 1;

          let transform = '';
          let zIndex = 10;
          let opacity = 0.5;

          if (isCenter) {
            transform = 'translateX(0) scale(1.08) rotateY(0deg)';
            zIndex = 30;
            opacity = 1;
          } else if (isLeft) {
            transform = 'translateX(-70px) scale(0.88) rotateY(22deg)';
            zIndex = 20;
            opacity = 0.75;
          } else if (isRight) {
            transform = 'translateX(70px) scale(0.88) rotateY(-22deg)';
            zIndex = 20;
            opacity = 0.75;
          } else if (isFarLeft) {
            transform = 'translateX(-120px) scale(0.75) rotateY(35deg)';
            zIndex = 10;
            opacity = 0.4;
          } else if (isFarRight) {
            transform = 'translateX(120px) scale(0.75) rotateY(-35deg)';
            zIndex = 10;
            opacity = 0.4;
          }

          const posterUrl = item.poster_path
            ? getImageUrl(item.poster_path, 'w500')
            : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isCenter) {
                  onSelectItem(item as TMDBMediaItem);
                } else {
                  setActiveIndex(index);
                }
              }}
              style={{
                transform,
                zIndex,
                opacity,
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                position: 'absolute',
              }}
              className="w-40 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
            >
              <img
                src={posterUrl}
                alt={'title' in item ? item.title : 'name' in item ? item.name : 'Movie'}
                className="w-full h-full object-cover rounded-2xl"
                loading="eager"
              />

              {/* Gloss / Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 rounded-2xl" />

              {/* Center Card Play Badge */}
              {isCenter && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-2xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlayMovie) onPlayMovie(item as TMDBMediaItem);
                      else onSelectItem(item as TMDBMediaItem);
                    }}
                    className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition-transform"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {displayItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              activeIndex === idx
                ? 'w-6 bg-purple-500'
                : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
