/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Film,
  Tv,
  Star,
  Calendar,
  MapPin,
  Play,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  TMDBPersonDetail,
  TMDBPersonCombinedCredits,
  TMDBPersonCreditItem,
  TMDBMediaItem
} from '../lib/tmdb-types';
import { fetchPersonDetails, fetchPersonCombinedCredits } from '../lib/tmdb';
import { getImageUrl, formatYear, formatRating } from '../lib/utils';

interface PersonDetailModalProps {
  personId: number;
  onClose: () => void;
  onSelectMedia: (item: TMDBMediaItem) => void;
  onPlayMedia?: (item: TMDBMediaItem) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  personId,
  onClose,
  onSelectMedia,
  onPlayMedia,
}) => {
  const [person, setPerson] = useState<TMDBPersonDetail | null>(null);
  const [credits, setCredits] = useState<TMDBPersonCombinedCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState<boolean>(false);
  const [creditFilter, setCreditFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      fetchPersonDetails(personId),
      fetchPersonCombinedCredits(personId)
    ]).then(([detailRes, creditsRes]) => {
      if (isCancelled) return;

      if (detailRes.status === 'fulfilled') {
        setPerson(detailRes.value);
      } else {
        setError('Could not retrieve actor profile details.');
      }

      if (creditsRes.status === 'fulfilled') {
        // Sort credits by popularity & release date
        const sortedCast = (creditsRes.value.cast || []).sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );
        setCredits({
          ...creditsRes.value,
          cast: sortedCast
        });
      }

      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [personId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredCredits = (credits?.cast || []).filter((item) => {
    if (creditFilter === 'all') return true;
    return item.media_type === creditFilter;
  });

  const photoUrl = person?.profile_path ? getImageUrl(person.profile_path, 'w500') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0d0d14] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col scrollbar-thin">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          aria-label="Close actor profile"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Loading actor details & filmography...</p>
          </div>
        ) : error || !person ? (
          <div className="p-12 text-center text-zinc-400 space-y-3">
            <p className="text-red-400">{error || 'Actor information not found.'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-8">
            {/* ACTOR HEADER PROFILE */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* CIRCLE PROFILE PHOTO (CIRCLE PFP) */}
              <div className="relative flex-none">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#181824] ring-4 ring-blue-500/80 shadow-2xl shadow-blue-900/30 flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={person.name}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-16 h-16 text-zinc-600" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-blue-600 text-white shadow-lg border-2 border-[#0d0d14]" title="Verified Actor">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Bio & Facts */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider">
                    {person.known_for_department || 'Acting'}
                  </span>
                  {person.birthday && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Born {person.birthday}
                    </span>
                  )}
                  {person.place_of_birth && (
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {person.place_of_birth}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {person.name}
                </h2>

                {person.also_known_as && person.also_known_as.length > 0 && (
                  <p className="text-xs text-zinc-400 italic">
                    Also known as: {person.also_known_as.slice(0, 3).join(', ')}
                  </p>
                )}

                {/* About Them / Biography */}
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">About {person.name}</h4>
                  <p className={`text-xs sm:text-sm text-zinc-300 leading-relaxed ${!bioExpanded ? 'line-clamp-3' : ''}`}>
                    {person.biography || `Information and filmography for ${person.name} on CineFree.`}
                  </p>
                  {person.biography && person.biography.length > 220 && (
                    <button
                      onClick={() => setBioExpanded(!bioExpanded)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      {bioExpanded ? (
                        <>Show less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Read full bio <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MOVIES & TV SHOWS THEY PLAYED IN */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <Film className="w-5 h-5 text-blue-500" /> Movies & TV Shows They Played In
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Click any title to open its details and stream in CineFree.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#14141d] border border-white/10 self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setCreditFilter('all')}
                    className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                      creditFilter === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({credits?.cast.length || 0})
                  </button>
                  <button
                    onClick={() => setCreditFilter('movie')}
                    className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                      creditFilter === 'movie'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3" /> Movies
                  </button>
                  <button
                    onClick={() => setCreditFilter('tv')}
                    className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                      creditFilter === 'tv'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Tv className="w-3 h-3" /> Shows
                  </button>
                </div>
              </div>

              {/* Grid of Movies / TV Titles */}
              {filteredCredits.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  No titles found for this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredCredits.map((item) => {
                    const poster = item.poster_path ? getImageUrl(item.poster_path, 'w300') : '';
                    const title = item.title || item.name || 'Untitled';
                    const year = formatYear(item.release_date || item.first_air_date);
                    const rating = formatRating(item.vote_average);

                    return (
                      <div
                        key={`${item.media_type}_${item.id}_${item.character || ''}`}
                        onClick={() => {
                          onSelectMedia(item as TMDBMediaItem);
                          onClose();
                        }}
                        className="group/card relative bg-[#14141e] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 shadow-lg cursor-pointer transition-all hover:-translate-y-1"
                      >
                        {/* Poster */}
                        <div className="aspect-[2/3] w-full bg-[#1c1c28] relative overflow-hidden">
                          {poster ? (
                            <img
                              src={poster}
                              alt={title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Film className="w-8 h-8" />
                            </div>
                          )}

                          {/* Quick Watch Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <span className="p-3 rounded-full bg-blue-600 text-white shadow-xl transform scale-90 group-hover/card:scale-100 transition-transform">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </span>
                          </div>

                          {/* Media Type Badge */}
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                            {item.media_type === 'tv' ? 'TV' : 'Movie'}
                          </span>

                          {rating !== 'NR' && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> {rating}
                            </span>
                          )}
                        </div>

                        {/* Title & Character Info */}
                        <div className="p-2.5 space-y-0.5">
                          <h4 className="text-xs font-bold text-white truncate group-hover/card:text-blue-400 transition-colors">
                            {title}
                          </h4>
                          {item.character && (
                            <p className="text-[11px] text-zinc-400 truncate">
                              as <span className="text-zinc-200">{item.character}</span>
                            </p>
                          )}
                          <p className="text-[10px] text-zinc-500 font-medium">
                            {year || 'Release Date TBA'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
