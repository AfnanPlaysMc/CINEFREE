/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { User, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { TMDBCastMember, TMDBMediaItem } from '../lib/tmdb-types';
import { getImageUrl } from '../lib/utils';
import { PersonDetailModal } from './PersonDetailModal';

interface CastRowProps {
  cast: TMDBCastMember[];
  onSelectMedia?: (item: TMDBMediaItem) => void;
}

export const CastRow: React.FC<CastRowProps> = ({ cast, onSelectMedia }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);

  if (!cast || cast.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.7;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <div className="relative my-6 group">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" /> Top Billed Cast (Click for Bio & Movies)
        </h3>

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll cast left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll('right')}
          aria-label="Scroll cast right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cast.slice(0, 16).map((member) => {
            const photoUrl = member.profile_path ? getImageUrl(member.profile_path, 'w300') : '';
            return (
              <div
                key={member.id}
                onClick={() => setSelectedActorId(member.id)}
                className="flex-none w-28 sm:w-32 text-center cursor-pointer group/actor transition-transform hover:-translate-y-1"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden bg-[#1c1c24] ring-2 ring-white/10 group-hover/actor:ring-4 group-hover/actor:ring-blue-500 shadow-xl transition-all mb-2">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover/actor:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h5 className="text-xs font-semibold text-white truncate group-hover/actor:text-blue-400 transition-colors">
                  {member.name}
                </h5>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{member.character || 'Self'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actor Detail Modal */}
      {selectedActorId && (
        <PersonDetailModal
          personId={selectedActorId}
          onClose={() => setSelectedActorId(null)}
          onSelectMedia={(item) => {
            if (onSelectMedia) {
              onSelectMedia(item);
            }
          }}
        />
      )}
    </>
  );
};
