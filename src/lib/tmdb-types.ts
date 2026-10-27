/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  adult?: boolean;
  media_type?: 'movie';
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  media_type?: 'tv';
  seasons?: TMDBSeasonSummary[];
}

export interface TMDBSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime?: number;
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  episodes: TMDBEpisode[];
}

export interface AnyMedia {
  id?: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  media_type?: 'movie' | 'tv';
  runtime?: number;
  genres?: { id: number; name: string }[];
  tagline?: string;
  status?: string;
}

export type TMDBMediaItem = AnyMedia & { id: number };

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at?: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface WatchProvidersCountry {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  free?: WatchProviderItem[];
  ads?: WatchProviderItem[];
}

export interface TMDBWatchProvidersResponse {
  id: number;
  results: Record<string, WatchProvidersCountry>;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PlaybackSource {
  id: string;
  name: string;
  type: 'youtube_trailer' | 'official_embed' | 'public_domain';
  url: string;
  quality?: string;
  verified: boolean;
  notes?: string;
}
