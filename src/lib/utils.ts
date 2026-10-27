/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TMDBMediaItem, TMDBMovie, TMDBTVShow, AnyMedia } from './tmdb-types';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w1280' | 'original' = 'w500'
): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatYear(dateStr?: string | null): string {
  if (!dateStr) return '';
  const year = dateStr.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '';
}

export function formatRating(rating?: number | null): string {
  if (rating == null || isNaN(rating) || rating === 0) return 'NR';
  return rating.toFixed(1);
}

export function getMediaTitle(item: AnyMedia): string {
  return item.title || item.name || item.original_title || item.original_name || 'Untitled';
}

export function getMediaReleaseDate(item: AnyMedia): string {
  return item.release_date || item.first_air_date || '';
}

export function isMovie(item: AnyMedia): boolean {
  if (item.title) return true;
  return item.media_type === 'movie';
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function isUnreleased(item?: AnyMedia | null): boolean {
  if (!item) return false;
  if ('status' in item && typeof item.status === 'string') {
    const unreleasedStatuses = ['Post Production', 'In Production', 'Planned', 'Rumored'];
    if (unreleasedStatuses.includes(item.status)) return true;
  }

  const dateStr = item.release_date || item.first_air_date;
  if (!dateStr) return false;

  const releaseTime = new Date(dateStr).getTime();
  if (isNaN(releaseTime)) return false;

  return releaseTime > Date.now();
}
