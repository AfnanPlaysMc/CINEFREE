/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TMDBMovie,
  TMDBTVShow,
  TMDBMediaItem,
  TMDBCredits,
  TMDBVideo,
  TMDBSeasonDetail,
  TMDBWatchProvidersResponse,
  TMDBPaginatedResponse
} from './tmdb-types';

const API_BASE = '/api/tmdb';

function getCustomApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cinefree_custom_tmdb_key');
}

export function setCustomApiKey(key: string | null) {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem('cinefree_custom_tmdb_key');
  } else {
    localStorage.setItem('cinefree_custom_tmdb_key', key.trim());
  }
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  });

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const customKey = getCustomApiKey();
  if (customKey) {
    headers['x-tmdb-key'] = customKey;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to fetch from ${endpoint} (Status ${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function checkServerConfig(): Promise<{ hasTmdbKey: boolean; mode: string }> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return { hasTmdbKey: false, mode: 'fallback' };
    return res.json();
  } catch {
    return { hasTmdbKey: false, mode: 'fallback' };
  }
}

// 1. Trending Movies
export function fetchTrendingMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/trending/movie/week', { page });
}

// 2. Popular Movies
export function fetchPopularMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { page });
}

// 3. Top Rated Movies
export function fetchTopRatedMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { page });
}

// 4. Now Playing Movies
export function fetchNowPlayingMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { page });
}

// 5. Genre-based Movies
export function fetchMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
    with_genres: genreId,
    page,
    sort_by: 'popularity.desc'
  });
}

// Free Full Movies (Open Source & Public Domain Archives)
export function fetchFreeFullMovies() {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
    free_full: 'true',
  });
}

// 6. Trending TV Shows
export function fetchTrendingTV(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/trending/tv/week', { page });
}

// 7. Popular TV Shows
export function fetchPopularTV(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { page });
}

// 8. Top Rated TV Shows
export function fetchTopRatedTV(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { page });
}

// Movie Details
export function fetchMovieDetails(id: number) {
  return tmdbFetch<TMDBMovie>(`/movie/${id}`);
}

export function fetchMovieCredits(id: number) {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`);
}

export function fetchMovieVideos(id: number) {
  return tmdbFetch<{ id: number; results: TMDBVideo[] }>(`/movie/${id}/videos`);
}

export function fetchMovieSimilar(id: number) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`);
}

export function fetchMovieWatchProviders(id: number) {
  return tmdbFetch<TMDBWatchProvidersResponse>(`/movie/${id}/watch/providers`);
}

// TV Details
export function fetchTVDetails(id: number) {
  return tmdbFetch<TMDBTVShow>(`/tv/${id}`);
}

export function fetchTVSeasonDetails(id: number, seasonNumber: number) {
  return tmdbFetch<TMDBSeasonDetail>(`/tv/${id}/season/${seasonNumber}`);
}

export function fetchTVCredits(id: number) {
  return tmdbFetch<TMDBCredits>(`/tv/${id}/credits`);
}

export function fetchTVVideos(id: number) {
  return tmdbFetch<{ id: number; results: TMDBVideo[] }>(`/tv/${id}/videos`);
}

export function fetchTVSimilar(id: number) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/similar`);
}

export function fetchTVWatchProviders(id: number) {
  return tmdbFetch<TMDBWatchProvidersResponse>(`/tv/${id}/watch/providers`);
}

// Multi-Search (Movies & TV, removes people)
export async function fetchMultiSearch(query: string, page = 1) {
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBMediaItem & { media_type: string }>>('/search/multi', {
    query,
    page,
    include_adult: 'false',
  });

  // Filter out 'person' results as mandated
  const filteredResults = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');

  return {
    ...data,
    results: filteredResults
  };
}
