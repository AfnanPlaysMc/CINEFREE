/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Play,
  Star,
  Share2,
  Sparkles,
  Film,
  ExternalLink
} from 'lucide-react';
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchTVDetails,
  fetchTVCredits,
  fetchMovieVideos,
  fetchTVVideos
} from '../../lib/tmdb';
import {
  TMDBMediaItem,
  TMDBMovie,
  TMDBTVShow,
  TMDBCredits,
  TMDBCastMember
} from '../../lib/tmdb-types';
import { getImageUrl, getMediaTitle } from '../../lib/utils';
import { useWatchlist } from '../../context/WatchlistContext';
import { getFullMovieStream, MovieStreamSource } from '../../lib/providers';
import { CineFreePlayerModal } from '../CineFreePlayerModal';

interface MobileDetailViewProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  onBack: () => void;
  onSelectItem: (item: TMDBMediaItem) => void;
}

export const MobileDetailView: React.FC<MobileDetailViewProps> = ({
  mediaId,
  mediaType,
  onBack,
  onSelectItem,
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [detail, setDetail] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStream, setActiveStream] = useState<MovieStreamSource | null>(null);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const isMovie = mediaType === 'movie';
    const detailPromise = isMovie ? fetchMovieDetails(mediaId) : fetchTVDetails(mediaId);
    const creditsPromise = isMovie ? fetchMovieCredits(mediaId) : fetchTVCredits(mediaId);

    Promise.allSettled([detailPromise, creditsPromise]).then(([detRes, credRes]) => {
      if (isCancelled) return;

      if (detRes.status === 'fulfilled') {
        const item = detRes.value;
        setDetail(item);
        const titleStr = getMediaTitle(item);
        setActiveStream(getFullMovieStream(mediaId, titleStr, mediaType));
      }

      if (credRes.status === 'fulfilled') {
        setCredits(credRes.value);
      }

      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [mediaId, mediaType]);

  const saved = isInWatchlist(mediaId, mediaType);
  const title = detail ? getMediaTitle(detail as TMDBMediaItem) : 'Movie';
  const backdropUrl = detail?.backdrop_path
    ? getImageUrl(detail.backdrop_path, 'original')
    : detail?.poster_path
    ? getImageUrl(detail.poster_path, 'original')
    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80';

  const voteAvg = detail?.vote_average ? detail.vote_average.toFixed(1) : '7.5';

  const releaseDateStr = detail
    ? 'release_date' in detail && detail.release_date
      ? new Date(detail.release_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'first_air_date' in detail && detail.first_air_date
      ? new Date(detail.first_air_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Recently Released'
    : '';

  const genres = detail?.genres || [
    { id: 28, name: 'Action' },
    { id: 14, name: 'Fantasy' },
    { id: 35, name: 'Comedy' },
    { id: 878, name: 'Sci-Fi' }
  ];

  const castMembers: TMDBCastMember[] = credits?.cast?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-[#080a14] text-white pb-32">
      {/* Top Hero Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] max-h-[580px] overflow-hidden select-none">
        {/* Full Bleed Backdrop Artwork */}
        <img
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-top"
          loading="eager"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#080a14]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a14] via-[#080a14]/60 to-transparent" />

        {/* Top Floating Glass Action Buttons */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              if (detail) toggleWatchlist(detail as TMDBMediaItem);
            }}
            aria-label="Save to watchlist"
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xl border ${
              saved
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-black/50 text-white border-white/10'
            }`}
          >
            {saved ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* USER REQUIREMENT: EXACT REPLACEMENT OF IMAX WITH CINEFREE */}
        <div className="absolute top-12 left-0 right-0 z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          {/* Slanted Stylized Subtitle (matching "ЗНЯТО ДЛЯ" in reference) */}
          <div className="text-[12px] sm:text-sm font-semibold tracking-widest uppercase italic text-cyan-200/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            STREAM ON
          </div>

          {/* GIGANTIC GLOWING FUTURISTIC CINEFREE TYPOGRAPHY */}
          <div className="relative">
            <h1
              className="text-4xl sm:text-6xl font-black uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-[#e0f2fe] via-[#38bdf8] to-[#0284c7] drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                WebkitTextStroke: '1px rgba(255,255,255,0.2)',
              }}
            >
              CINEFREE
            </h1>
            {/* Subtle Neon Underglow */}
            <div className="absolute -inset-1 blur-xl bg-cyan-500/20 -z-10 rounded-full" />
          </div>
        </div>

        {/* Floating Quick Play Button on Hero */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
          <button
            onClick={() => setShowPlayer(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-2xl shadow-purple-600/50 active:scale-95 transition-transform cursor-pointer border border-white/20"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Watch Movie Now</span>
          </button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="px-5 space-y-6 -mt-2 relative z-20">
        {/* Genre Pills Row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          {genres.slice(0, 4).map((g) => (
            <span
              key={g.id}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 backdrop-blur-md text-xs font-semibold"
            >
              {g.name}
            </span>
          ))}
        </div>

        {/* Title & IMDb Rating Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {title}
            </h2>

            {/* Yellow IMDb Rating Badge (Exact match to reference UI) */}
            <div className="px-2.5 py-1 rounded bg-[#f5c518] text-black font-black text-xs flex items-center gap-1 shadow-md flex-none">
              <span>IMDb:</span>
              <Star className="w-3.5 h-3.5 fill-black text-black" />
              <span>{voteAvg}/10</span>
            </div>
          </div>

          {/* Release Date Info */}
          {releaseDateStr && (
            <div className="text-xs text-zinc-400 font-medium">
              Released: {releaseDateStr}
            </div>
          )}
        </div>

        {/* Storyline Section */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <h3 className="text-base font-bold text-white tracking-tight">
            Storyline
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {detail?.overview ||
              'An epic cinematic adventure featuring breathtaking visuals, world-class performances, and high-definition streaming on CineFree.'}
          </p>
        </div>

        {/* Cast & Characters Section */}
        {castMembers.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h3 className="text-base font-bold text-white tracking-tight">
              Cast & Characters
            </h3>

            {/* Horizontal Cast Row */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {castMembers.map((member) => {
                const photoUrl = member.profile_path
                  ? getImageUrl(member.profile_path, 'w300')
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-[#141525]/90 border border-white/10 flex-none min-w-[170px] shadow-lg"
                  >
                    <img
                      src={photoUrl}
                      alt={member.name}
                      className="w-11 h-11 rounded-xl object-cover flex-none bg-zinc-800"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {member.character || 'Actor'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CineFree Full Real Stream Player Modal */}
      {showPlayer && activeStream && (
        <CineFreePlayerModal
          stream={activeStream}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};
