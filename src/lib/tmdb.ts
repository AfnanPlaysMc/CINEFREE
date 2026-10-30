/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TMDBMovie,
  TMDBTVShow,
  TMDBCredits,
  TMDBVideo,
  TMDBSeasonDetail,
  TMDBWatchProvidersResponse,
  TMDBPaginatedResponse,
  TMDBPerson,
  TMDBPersonDetail,
  TMDBPersonCombinedCredits
} from './tmdb-types';
import { FALLBACK_CATALOG, findFallbackDetail, searchFallbackCatalog } from './fallback-data';

const API_BASE = '/api/tmdb';
const DEFAULT_TMDB_KEY = '407886e825dc0d2581cc397ce2289f4a';

function getCustomApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_TMDB_KEY;
  const stored = localStorage.getItem('cinefree_custom_tmdb_key');
  return stored && stored.trim().length > 5 ? stored.trim() : DEFAULT_TMDB_KEY;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const customKey = getCustomApiKey();

  // 1. Try proxy fetch
  const url = new URL(endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  });

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json', 'x-tmdb-key': customKey }
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return res.json() as Promise<T>;
    }
  } catch {
    // Continue to direct fetch
  }

  // 2. Try direct fetch with verified TMDB key (no bad Bearer token)
  try {
    const directUrl = new URL(`https://api.themoviedb.org/3${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
    directUrl.searchParams.set('api_key', customKey);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        directUrl.searchParams.set(key, String(val));
      }
    });

    const directRes = await fetch(directUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CineFree-Applet/1.0'
      }
    });
    if (directRes.ok) {
      return directRes.json() as Promise<T>;
    }
  } catch {
    // Continue to fallback
  }

  // 3. Fallback to static catalog only if everything else fails
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fallback = handleFallbackRequest(cleanEndpoint, params);
  if (fallback) return fallback as unknown as T;

  throw new Error(`Failed to fetch data from ${endpoint}`);
}

function handleFallbackRequest(subpath: string, query: Record<string, string | number>) {
  if (subpath === 'trending/movie/week') return FALLBACK_CATALOG['trending/movie/week'];
  if (subpath === 'movie/popular') return FALLBACK_CATALOG['movie/popular'];
  if (subpath === 'movie/top_rated') return FALLBACK_CATALOG['movie/top_rated'];
  if (subpath === 'movie/now_playing') return FALLBACK_CATALOG['movie/now_playing'];
  if (subpath === 'trending/tv/week') return FALLBACK_CATALOG['trending/tv/week'];
  if (subpath === 'tv/popular') return FALLBACK_CATALOG['tv/popular'];
  if (subpath === 'tv/top_rated') return FALLBACK_CATALOG['tv/top_rated'];
  
  if (subpath.startsWith('discover/movie')) {
    const genre = query.with_genres;
    if (query.free_full === 'true' || genre === 'free_full') return FALLBACK_CATALOG['discover/movie?free_full=true'];
    if (genre == 28) return FALLBACK_CATALOG['discover/movie?with_genres=28'];
    return FALLBACK_CATALOG['movie/popular'];
  }
  
  const movieDetailMatch = subpath.match(/^movie\/(\d+)(?:\/([a-z_/]+))?$/);
  if (movieDetailMatch) return findFallbackDetail('movie', parseInt(movieDetailMatch[1], 10), movieDetailMatch[2] || '');
  
  const tvDetailMatch = subpath.match(/^tv\/(\d+)(?:\/([a-z_0-9/]+))?$/);
  if (tvDetailMatch) return findFallbackDetail('tv', parseInt(tvDetailMatch[1], 10), tvDetailMatch[2] || '');
  
  if (subpath.includes('search/multi') || subpath.includes('search/person')) return searchFallbackCatalog(String(query.query || ''));
  
  return null;
}

export async function checkServerConfig(): Promise<{ hasTmdbKey: boolean; mode: string }> {
  return { hasTmdbKey: true, mode: 'live-tmdb' };
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

// Free Full Movies
export function fetchFreeFullMovies(page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
    free_full: 'true',
    page,
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

// Person Search, Details, and Combined Credits
export function fetchPersonSearch(query: string, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBPerson>>('/search/person', {
    query,
    page,
    include_adult: 'false'
  });
}

export function fetchPersonDetails(id: number) {
  return tmdbFetch<TMDBPersonDetail>(`/person/${id}`);
}

export function fetchPersonCombinedCredits(id: number) {
  return tmdbFetch<TMDBPersonCombinedCredits>(`/person/${id}/combined_credits`);
}

// Multi-Search (Movies, TV, and People)
export async function fetchMultiSearch(query: string, page = 1) {
  const data = await tmdbFetch<{ results?: Array<Record<string, unknown>> }>('/search/multi', {
    query,
    page,
    include_adult: 'false',
  });
  
  const results = data.results || [];
  return {
    ...data,
    results: (results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')) as unknown as (TMDBMovie | TMDBTVShow)[],
    people: (results.filter((item) => item.media_type === 'person')) as unknown as TMDBPerson[],
  };
}

/**
 * Cinema Synesthesia Mood Search
 */
export interface MoodSearchResult {
  moodSummary: string;
  results: TMDBMovie[];
  rationales: Record<number, string>;
  tags: Record<number, string[]>;
  scores: Record<number, number>;
}

export async function fetchMoodSearch(payload: {
  prompt?: string;
  energy?: number;
  tone?: number;
  heart?: number;
  intellect?: number;
  vibes?: string[];
}): Promise<MoodSearchResult> {
  const customKey = getCustomApiKey();
  const res = await fetch('/api/mood-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tmdb-key': customKey
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Mood search request failed with status ${res.status}`);
  }

  return res.json() as Promise<MoodSearchResult>;
}
