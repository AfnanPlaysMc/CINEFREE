/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchMoviesByGenre,
  fetchTrendingTV,
  fetchPopularTV,
  fetchTopRatedTV,
  fetchFreeFullMovies,
} from '../lib/tmdb';
import { TMDBMediaItem, TMDBMovie, TMDBTVShow } from '../lib/tmdb-types';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { HeroSkeleton } from '../components/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';
import { History, Film } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

interface HomeViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void; // backwards compat
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectItem, onPlayMovie, onPlayTrailer }) => {
  const { history } = useWatchlist();
  const playHandler = onPlayMovie || onPlayTrailer;

  // Categories
  const [heroMovie, setHeroMovie] = useState<TMDBMovie | null>(null);
  const [freeFullMovies, setFreeFullMovies] = useState<TMDBMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TMDBMovie[]>([]);
  const [actionMovies, setActionMovies] = useState<TMDBMovie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<TMDBMovie[]>([]);
  const [horrorMovies, setHorrorMovies] = useState<TMDBMovie[]>([]);
  const [scifiMovies, setScifiMovies] = useState<TMDBMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TMDBTVShow[]>([]);
  const [popularTV, setPopularTV] = useState<TMDBTVShow[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<TMDBTVShow[]>([]);

  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingRows, setLoadingRows] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    // Load trending hero first
    fetchTrendingMovies(1)
      .then((data) => {
        if (!isCancelled && data.results && data.results.length > 0) {
          const suitableHero = data.results.find((m) => Boolean(m.backdrop_path)) || data.results[0];
          setHeroMovie(suitableHero);
          setTrendingMovies(data.results.map((m) => ({ ...m, media_type: 'movie' as const })));
          setLoadingHero(false);
        }
      })
      .catch((err) => {
        console.warn('Error fetching hero movie:', err);
        setLoadingHero(false);
      });

    // Concurrently fetch all 11 required catalog rows
    Promise.allSettled([
      fetchPopularMovies(1),
      fetchTopRatedMovies(1),
      fetchNowPlayingMovies(1),
      fetchMoviesByGenre(28, 1), // Action
      fetchMoviesByGenre(35, 1), // Comedy
      fetchMoviesByGenre(27, 1), // Horror
      fetchMoviesByGenre(878, 1), // Sci-Fi
      fetchTrendingTV(1),
      fetchPopularTV(1),
      fetchTopRatedTV(1),
      fetchFreeFullMovies(),
    ]).then(([popM, topM, nowM, actM, comM, horM, sciM, trenT, popT, topT, freeM]) => {
      if (isCancelled) return;

      if (popM.status === 'fulfilled') setPopularMovies(popM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (topM.status === 'fulfilled') setTopRatedMovies(topM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (nowM.status === 'fulfilled') setNowPlayingMovies(nowM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (actM.status === 'fulfilled') setActionMovies(actM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (comM.status === 'fulfilled') setComedyMovies(comM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (horM.status === 'fulfilled') setHorrorMovies(horM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (sciM.status === 'fulfilled') setScifiMovies(sciM.value.results.map((m) => ({ ...m, media_type: 'movie' })));
      if (trenT.status === 'fulfilled') setTrendingTV(trenT.value.results.map((t) => ({ ...t, media_type: 'tv' })));
      if (popT.status === 'fulfilled') setPopularTV(popT.value.results.map((t) => ({ ...t, media_type: 'tv' })));
      if (topT.status === 'fulfilled') setTopRatedTV(topT.value.results.map((t) => ({ ...t, media_type: 'tv' })));
      if (freeM.status === 'fulfilled') setFreeFullMovies(freeM.value.results.map((m) => ({ ...m, media_type: 'movie' })));

      setLoadingRows(false);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="pb-16">
      {/* 1. Cinematic Hero Banner with Direct Play */}
      {loadingHero ? (
        <HeroSkeleton />
      ) : (
        <Hero
          movie={heroMovie}
          onPlayMovie={playHandler}
          onMoreInfo={(m) => onSelectItem(m as TMDBMediaItem)}
        />
      )}

      {/* 2. Recently Viewed (if local history exists) */}
      {history.length > 0 && (
        <section className="relative my-4 px-4 md:px-10">
          <div className="flex items-center gap-2 mb-2 text-zinc-300">
            <History className="w-4 h-4 text-[#e50914]" />
            <h3 className="text-lg font-bold text-white tracking-tight">Continue Watching</h3>
          </div>
          <div
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {history.slice(0, 10).map((hist) => (
              <button
                key={hist.id}
                onClick={() =>
                  onSelectItem({
                    id: Number(hist.mediaId),
                    title: hist.title,
                    poster_path: hist.posterPath,
                    media_type: hist.mediaType,
                  } as TMDBMediaItem)
                }
                className="flex-none flex items-center gap-2.5 p-2 rounded-lg bg-[#141419] border border-white/5 hover:border-white/20 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-14 rounded bg-[#1c1c24] overflow-hidden flex-none flex items-center justify-center text-zinc-500">
                  {hist.posterPath ? (
                    <img
                      src={getImageUrl(hist.posterPath, 'w300')}
                      alt={hist.title}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Film className="w-4 h-4 opacity-40 text-zinc-400" />
                  )}
                </div>
                <div className="max-w-[140px] truncate">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-red-400">
                    {hist.title}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">{hist.mediaType}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. The 11 Required Horizontal Sections */}
      <div className="space-y-2 mt-2">
        <MovieRow
          title="Trending Movies This Week"
          items={trendingMovies as TMDBMediaItem[]}
          loading={loadingRows && trendingMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        {freeFullMovies.length > 0 && (
          <MovieRow
            title="Free Full Movies (Public Domain & Open Source Archive)"
            items={freeFullMovies as TMDBMediaItem[]}
            loading={loadingRows && freeFullMovies.length === 0}
            onSelectItem={onSelectItem}
            onPlayMovie={playHandler}
          />
        )}

        <MovieRow
          title="Popular Movies"
          items={popularMovies as TMDBMediaItem[]}
          loading={loadingRows && popularMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Top Rated Masterpieces"
          items={topRatedMovies as TMDBMediaItem[]}
          loading={loadingRows && topRatedMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Now Playing in Theaters"
          items={nowPlayingMovies as TMDBMediaItem[]}
          loading={loadingRows && nowPlayingMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Action & Adrenaline"
          items={actionMovies as TMDBMediaItem[]}
          loading={loadingRows && actionMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Laugh Out Loud Comedies"
          items={comedyMovies as TMDBMediaItem[]}
          loading={loadingRows && comedyMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Horror & Thrillers"
          items={horrorMovies as TMDBMediaItem[]}
          loading={loadingRows && horrorMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Sci-Fi & Cosmic Explorations"
          items={scifiMovies as TMDBMediaItem[]}
          loading={loadingRows && scifiMovies.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Trending TV Series"
          items={trendingTV as TMDBMediaItem[]}
          loading={loadingRows && trendingTV.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Popular TV Shows"
          items={popularTV as TMDBMediaItem[]}
          loading={loadingRows && popularTV.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />

        <MovieRow
          title="Critically Acclaimed TV"
          items={topRatedTV as TMDBMediaItem[]}
          loading={loadingRows && topRatedTV.length === 0}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
        />
      </div>
    </div>
  );
};
