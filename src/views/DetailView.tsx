/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Film,
  Share2,
  Tv,
  X
} from 'lucide-react';
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieSimilar,
  fetchMovieWatchProviders,
  fetchTVDetails,
  fetchTVCredits,
  fetchTVSimilar,
  fetchTVWatchProviders,
  fetchMovieVideos,
  fetchTVVideos
} from '../lib/tmdb';
import {
  TMDBMediaItem,
  TMDBMovie,
  TMDBTVShow,
  TMDBCredits,
  TMDBWatchProvidersResponse,
  TMDBEpisode,
  TMDBVideo
} from '../lib/tmdb-types';
import { getImageUrl, formatRuntime, formatYear, formatRating, getMediaTitle, isUnreleased } from '../lib/utils';
import { useWatchlist } from '../context/WatchlistContext';
import { CastRow } from '../components/CastRow';
import { EpisodeList } from '../components/EpisodeList';
import { WatchProviders } from '../components/WatchProviders';
import { ServerSelectModal } from '../components/ServerSelectModal';
import { getFullMovieStream, MovieStreamSource } from '../lib/providers';
import { MovieRow } from '../components/MovieRow';
import { SpiderManEasterEgg } from '../components/SpiderManEasterEgg';

interface DetailViewProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  onBack: () => void;
  onSelectItem: (item: TMDBMediaItem) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  mediaId,
  mediaType,
  onBack,
  onSelectItem,
}) => {
  const { isInWatchlist, toggleWatchlist, addToHistory } = useWatchlist();

  const [detail, setDetail] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [similar, setSimilar] = useState<TMDBMediaItem[]>([]);
  const [providers, setProviders] = useState<TMDBWatchProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Full Stream Player state
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeStream, setActiveStream] = useState<MovieStreamSource | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setTrailerKey(null);

    const isMovie = mediaType === 'movie';

    const detailPromise = isMovie ? fetchMovieDetails(mediaId) : fetchTVDetails(mediaId);
    const creditsPromise = isMovie ? fetchMovieCredits(mediaId) : fetchTVCredits(mediaId);
    const similarPromise = isMovie ? fetchMovieSimilar(mediaId) : fetchTVSimilar(mediaId);
    const providersPromise = isMovie ? fetchMovieWatchProviders(mediaId) : fetchTVWatchProviders(mediaId);
    const videosPromise = isMovie ? fetchMovieVideos(mediaId) : fetchTVVideos(mediaId);

    Promise.allSettled([detailPromise, creditsPromise, similarPromise, providersPromise, videosPromise])
      .then(([detRes, credRes, simRes, provRes, vidRes]) => {
        if (isCancelled) return;

        if (detRes.status === 'fulfilled') {
          const item = detRes.value;
          setDetail(item);
          addToHistory({ ...item, media_type: mediaType } as TMDBMediaItem);
          const titleStr = getMediaTitle(item);
          setActiveStream(getFullMovieStream(mediaId, titleStr, mediaType));
        } else {
          setError('Unable to load title details. Upstream provider was unavailable.');
        }

        if (credRes.status === 'fulfilled') setCredits(credRes.value);
        if (simRes.status === 'fulfilled') {
          setSimilar(simRes.value.results.map((r) => ({ ...r, media_type: mediaType } as TMDBMediaItem)));
        }
        if (provRes.status === 'fulfilled') setProviders(provRes.value);

        if (vidRes.status === 'fulfilled' && vidRes.value.results && vidRes.value.results.length > 0) {
          const official = vidRes.value.results.find(
            (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
          ) || vidRes.value.results[0];
          if (official && official.key) {
            setTrailerKey(official.key);
          }
        }

        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [mediaId, mediaType]);

  const saved = isInWatchlist(mediaId, mediaType);
  const isComingSoon = isUnreleased(detail as TMDBMediaItem);
  const title = detail ? getMediaTitle(detail as TMDBMediaItem) : '';
  const backdropUrl = detail?.backdrop_path ? getImageUrl(detail.backdrop_path, 'original') : '';
  const posterUrl = detail?.poster_path ? getImageUrl(detail.poster_path, 'w500') : '';
  const rating = formatRating(detail?.vote_average);
  const releaseDateStr = detail
    ? 'release_date' in detail
      ? detail.release_date
      : 'first_air_date' in detail
      ? (detail as { first_air_date?: string }).first_air_date
      : ''
    : '';
  const year = formatYear(releaseDateStr);
  const director = credits?.crew.find((c) => c.job === 'Director')?.name;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const [selectedStreamForModal, setSelectedStreamForModal] = useState<MovieStreamSource | null>(null);

  const handlePlayFullMovie = () => {
    const stream = activeStream || getFullMovieStream(mediaId, title, mediaType);
    setSelectedStreamForModal(stream);
  };

  const handlePlayEpisode = (ep: TMDBEpisode) => {
    const sNum = ep.season_number || 1;
    const eNum = ep.episode_number || 1;
    const stream = getFullMovieStream(
      mediaId,
      title,
      'tv',
      ep.name ? `S${sNum}E${eNum}: ${ep.name}` : `Season ${sNum} Episode ${eNum}`,
      sNum,
      eNum
    );
    setSelectedStreamForModal(stream);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 min-h-screen animate-pulse">
        <div className="h-8 w-24 bg-[#1c1c24] rounded mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 aspect-[2/3] bg-[#1c1c24] rounded-xl flex-none" />
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-[#1c1c24] rounded w-3/4" />
            <div className="h-5 bg-[#1c1c24] rounded w-1/3" />
            <div className="h-24 bg-[#1c1c24] rounded w-full" />
            <div className="h-12 bg-[#1c1c24] rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="p-8 rounded-xl bg-[#141419] border border-white/5 space-y-4">
          <h2 className="text-xl font-bold text-white">Title Not Found</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">{error || 'The requested movie or TV title could not be loaded.'}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e50914] text-white text-sm font-semibold hover:bg-red-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <SpiderManEasterEgg title={title} />
      {/* Header Backdrop Hero */}
      <div className="relative w-full h-[55vh] min-h-[420px] max-h-[600px] overflow-hidden bg-[#0b0b0f]">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-transparent to-transparent w-1/2" />

        {/* Back navigation button */}
        <div className="absolute top-20 left-4 sm:left-8 z-30">
          <button
            onClick={onBack}
            aria-label="Back to previous screen"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-44 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Left: Poster & Actions */}
          <div className="flex-none w-48 sm:w-64 md:w-72 mx-auto md:mx-0">
            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#1c1c24] border border-white/10 shadow-2xl">
              {posterUrl ? (
                <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#141419] text-zinc-500">
                  <Film className="w-12 h-12 mb-2" />
                  <span className="text-xs">{title}</span>
                </div>
              )}
            </div>

            {/* Action buttons below poster */}
            <div className="mt-4 flex flex-col gap-2">
              {isComingSoon ? (
                <div className="w-full py-3.5 px-4 rounded-xl text-amber-300 bg-amber-500/15 border border-amber-500/30 font-bold text-sm flex items-center justify-center gap-2 select-none shadow-md">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Coming Soon {year ? `(${year})` : ''}
                </div>
              ) : (
                <button
                  onClick={handlePlayFullMovie}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer bg-[#e50914] hover:bg-red-700 shadow-red-950/40"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  {mediaType === 'tv' ? 'Play Series' : 'Watch Full Movie'}
                </button>
              )}

              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-blue-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer bg-blue-600/15 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500"
                >
                  <Film className="w-4 h-4" />
                  Watch Official Trailer
                </button>
              )}

              <button
                onClick={() => toggleWatchlist({ ...detail, media_type: mediaType } as TMDBMediaItem)}
                className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  saved
                    ? 'bg-red-600/90 text-white border-red-500 hover:bg-red-700'
                    : 'bg-[#1c1c24] text-white border-white/10 hover:border-white/30'
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {saved ? 'In Your Watchlist' : 'Add to Watchlist'}
              </button>

              <button
                onClick={handleShare}
                className="w-full py-2 px-4 rounded-xl bg-[#141419] border border-white/5 text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'Link Copied to Clipboard!' : 'Share Title'}
              </button>
            </div>
          </div>

          {/* Right: Metadata Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-300">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${
                  isComingSoon
                    ? 'bg-amber-500 text-black border border-amber-300'
                    : 'bg-[#e50914] text-white border border-red-400/40'
                }`}
              >
                {isComingSoon ? 'Coming Soon' : 'Full Playable Stream'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white border border-white/10">
                {mediaType === 'movie' ? 'Movie' : 'Television Series'}
              </span>
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {year}
                </span>
              )}
              {detail && 'runtime' in detail && detail.runtime ? (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {formatRuntime(detail.runtime)}
                  </span>
                </>
              ) : null}
              {detail && 'number_of_seasons' in detail && detail.number_of_seasons ? (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}</span>
                </>
              ) : null}
              {rating !== 'NR' && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rating} <span className="text-zinc-500 font-normal">({detail.vote_count.toLocaleString()} votes)</span>
                  </span>
                </>
              )}
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              {detail.tagline && (
                <p className="text-sm sm:text-base italic text-zinc-400 mt-1 font-normal">
                  "{detail.tagline}"
                </p>
              )}
            </div>

            {/* Genre labels */}
            {detail.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {detail.genres.map((g) => (
                  <span
                    key={g.id}
                    className="px-2.5 py-1 rounded-md bg-[#1c1c24] border border-white/5 text-xs text-zinc-300"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Coming Soon Notice */}
            {isComingSoon && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">Coming Soon — Not Yet Released</span>
                  This title is scheduled for premiere on <strong className="text-white">{releaseDateStr || 'an upcoming date'}</strong>. Full streaming playback servers will activate automatically upon theatrical or digital launch.
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="pt-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-1">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                {detail.overview || 'No synopsis has been provided for this title.'}
              </p>
            </div>

            {/* Director & Creator */}
            {director && (
              <div className="text-xs text-zinc-300">
                <span className="text-zinc-500">Directed by:</span>{' '}
                <span className="font-semibold text-white">{director}</span>
              </div>
            )}

            {/* Top Billed Cast */}
            {credits?.cast && credits.cast.length > 0 && (
              <CastRow cast={credits.cast} onSelectMedia={onSelectItem} />
            )}

            {/* Authorized Streaming Providers Widget */}
            <WatchProviders providersData={providers} title={title} />

            {/* TV Show Episodes List with Season Selector */}
            {mediaType === 'tv' && 'seasons' in detail && detail.seasons && (
              <EpisodeList
                tvId={mediaId}
                seasons={detail.seasons}
                onPlayEpisodePreview={handlePlayEpisode}
              />
            )}

            {/* Similar titles recommendation row */}
            {similar.length > 0 && (
              <div className="mt-8">
                <MovieRow
                  title="Recommended & Similar Titles"
                  items={similar}
                  onSelectItem={onSelectItem}
                  onPlayMovie={(item) => {
                    const type: 'movie' | 'tv' = item.media_type || ('title' in item && item.title ? 'movie' : 'tv');
                    const t = getMediaTitle(item);
                    setSelectedStreamForModal(getFullMovieStream(item.id, t, type));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Official YouTube Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${title} Official Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Server Selection Modal */}
      {selectedStreamForModal && (
        <ServerSelectModal
          stream={selectedStreamForModal}
          onClose={() => setSelectedStreamForModal(null)}
          onSelectServer={(server) => {
            const stream = selectedStreamForModal;
            setSelectedStreamForModal(null);
            const width = 1240;
            const height = 700;
            const left = Math.max(0, (window.screen.width - width) / 2);
            const top = Math.max(0, (window.screen.height - height) / 2);
            window.open(
              server.embedUrl,
              `cinefree_stream_${stream.mediaId}_${server.id}`,
              `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
            );
          }}
        />
      )}
    </div>
  );
};
