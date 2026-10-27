/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock, Film } from 'lucide-react';
import { TMDBSeasonSummary, TMDBSeasonDetail, TMDBEpisode } from '../lib/tmdb-types';
import { fetchTVSeasonDetails } from '../lib/tmdb';
import { getImageUrl, formatRuntime, formatYear } from '../lib/utils';

interface EpisodeListProps {
  tvId: number;
  seasons: TMDBSeasonSummary[];
  onPlayEpisodePreview?: (episode: TMDBEpisode) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  tvId,
  seasons,
  onPlayEpisodePreview,
}) => {
  const regularSeasons = (seasons || []).filter((s) => s.season_number > 0);
  const initialSeason = regularSeasons[0]?.season_number || 1;

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [seasonDetail, setSeasonDetail] = useState<TMDBSeasonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetchTVSeasonDetails(tvId, selectedSeason)
      .then((data) => {
        if (!isCancelled) {
          setSeasonDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'Failed to load season episodes');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [tvId, selectedSeason]);

  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      {/* Header and Season Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Episodes</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select a season to view official episodes and broadcast info.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="season-select" className="text-xs text-zinc-400">
            Season:
          </label>
          <select
            id="season-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#1c1c24] border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.season_number}>
                {s.name || `Season ${s.season_number}`} ({s.episode_count || 0} eps)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Episode Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-[#141419] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-zinc-400 bg-[#141419] rounded-xl border border-white/5">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <button
            onClick={() => setSelectedSeason(selectedSeason)}
            className="px-3 py-1 rounded bg-white/10 text-white text-xs hover:bg-white/20"
          >
            Retry Loading Season
          </button>
        </div>
      ) : seasonDetail?.episodes && seasonDetail.episodes.length > 0 ? (
        <div className="space-y-3">
          {seasonDetail.episodes.map((ep) => {
            const stillUrl = ep.still_path ? getImageUrl(ep.still_path, 'w500') : '';
            return (
              <div
                key={ep.id}
                className="group flex flex-col sm:flex-row gap-4 p-3 sm:p-4 rounded-xl bg-[#141419] hover:bg-[#1a1a22] transition-colors border border-white/5"
              >
                {/* Still Thumbnail */}
                <div className="relative flex-none w-full sm:w-44 md:w-52 aspect-video rounded-lg overflow-hidden bg-[#1c1c24] border border-white/5">
                  {stillUrl ? (
                    <img
                      src={stillUrl}
                      alt={ep.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <Film className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  {onPlayEpisodePreview && (
                    <button
                      onClick={() => onPlayEpisodePreview(ep)}
                      aria-label={`Preview episode ${ep.episode_number}: ${ep.name}`}
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="p-2.5 rounded-full bg-white text-black shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </button>
                  )}

                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                    EP {ep.episode_number}
                  </div>
                </div>

                {/* Episode Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                        {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        {ep.runtime ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRuntime(ep.runtime)}
                          </span>
                        ) : null}
                        {ep.air_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatYear(ep.air_date)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {ep.overview || 'No synopsis provided by upstream broadcaster.'}
                    </p>
                  </div>

                  {onPlayEpisodePreview && (
                    <div className="pt-2">
                      <button
                        onClick={() => onPlayEpisodePreview(ep)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Watch Episode Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-zinc-400 bg-[#141419] rounded-xl border border-white/5">
          <p className="text-sm">No episode data available for this season.</p>
        </div>
      )}
    </div>
  );
};
