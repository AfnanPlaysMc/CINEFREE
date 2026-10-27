/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { fetchTrendingTV, fetchPopularTV, fetchTopRatedTV } from '../lib/tmdb';
import { TMDBMediaItem, TMDBTVShow } from '../lib/tmdb-types';
import { MediaGrid } from '../components/MediaGrid';

interface TVShowsViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void;
}

export const TVShowsView: React.FC<TVShowsViewProps> = ({ onSelectItem, onPlayMovie, onPlayTrailer }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'top_rated'>('trending');
  const [shows, setShows] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const playHandler = onPlayMovie || onPlayTrailer;

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const loadPromise =
      activeTab === 'trending'
        ? fetchTrendingTV()
        : activeTab === 'popular'
        ? fetchPopularTV()
        : fetchTopRatedTV();

    loadPromise
      .then((data) => {
        if (!isCancelled && data.results) {
          setShows(data.results.map((t) => ({ ...t, media_type: 'tv' as const })));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading TV shows:', err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Television & Series</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Discover binge-worthy series, limited seasons, and full episode streaming.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141419] border border-white/5 self-start md:self-auto">
          {(['trending', 'popular', 'top_rated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#e50914] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <MediaGrid
        items={shows}
        loading={loading}
        onSelectItem={onSelectItem}
        onPlayMovie={playHandler}
        emptyTitle="No Series Found"
        emptyDescription="We could not load television series from TMDB at this moment. Please try again shortly."
      />
    </div>
  );
};
