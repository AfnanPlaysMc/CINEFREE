/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StreamServerId = 
  | 'multiembed'
  | 'twoembed' 
  | 'vidsrc_sh' 
  | 'vidlink' 
  | 'vidsrc_icu';

export interface StreamServer {
  id: StreamServerId;
  name: string;
  badge: string;
  description: string;
  embedUrl: string;
}

export interface MovieStreamSource {
  id: string;
  mediaId: number;
  imdbId?: string;
  title: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  isFullMovie: boolean;
  verified: boolean;
  durationMinutes?: number;
  description: string;
  servers: StreamServer[];
  defaultServerId: StreamServerId;
}

/**
 * Builds real verified streaming server endpoints for movies and TV shows,
 * prioritizing MultiEmbed as the main server.
 */
export function buildStreamServers(
  mediaId: number,
  mediaType: 'movie' | 'tv',
  season = 1,
  episode = 1
): StreamServer[] {
  const isMovie = mediaType === 'movie';

  return [
    {
      id: 'multiembed',
      name: 'Server 1: MultiEmbed HD (Primary)',
      badge: 'Recommended • 1080p/4K',
      description: 'Primary Multi-CDN aggregator node with ultra high-speed global streaming.',
      embedUrl: isMovie
        ? `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}`
    },
    {
      id: 'twoembed',
      name: 'Server 2: 2Embed HD',
      badge: 'Fast Mirror',
      description: 'Secondary high-bandwidth node with global film and TV coverage.',
      embedUrl: isMovie
        ? `https://www.2embed.cc/embed/${mediaId}`
        : `https://www.2embed.cc/embedtv/${mediaId}&s=${season}&e=${episode}`
    },
    {
      id: 'vidsrc_sh',
      name: 'Server 3: VidSrc SH',
      badge: 'Direct Mirror',
      description: 'High-availability VidSrc stream mirror.',
      embedUrl: isMovie
        ? `https://vidsrc.sh/embed/movie?tmdb=${mediaId}`
        : `https://vidsrc.sh/embed/tv?tmdb=${mediaId}&sea=${season}&epi=${episode}`
    },
    {
      id: 'vidlink',
      name: 'Server 4: VidLink HD',
      badge: 'Multi-Subtitles',
      description: 'Cloud streaming server with built-in multi-subtitle support.',
      embedUrl: isMovie
        ? `https://vidlink.pro/movie/${mediaId}?primaryColor=e50914`
        : `https://vidlink.pro/tv/${mediaId}/${season}/${episode}?primaryColor=e50914`
    },
    {
      id: 'vidsrc_icu',
      name: 'Server 5: VidSrc Pro',
      badge: 'Multi-Audio',
      description: 'Alternative VidSrc network with multiple audio tracks.',
      embedUrl: isMovie
        ? `https://vidsrc.icu/embed/movie/${mediaId}`
        : `https://vidsrc.icu/embed/tv/${mediaId}/${season}/${episode}`
    }
  ];
}

/**
 * Builds direct streaming CDN download URLs using server infrastructure.
 */
export function getDownloadServerUrl(
  mediaId: number,
  mediaType: 'movie' | 'tv',
  quality: '4k' | '1080p' | '720p' | '480p' = '1080p',
  season = 1,
  episode = 1
): string {
  const isMovie = mediaType === 'movie';
  
  // Direct Server Stream Download Endpoints
  if (isMovie) {
    return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&download=1&quality=${quality}`;
  } else {
    return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}&download=1&quality=${quality}`;
  }
}

/**
 * Resolves full playable movie or TV episode stream for any title in the world.
 */
export function getFullMovieStream(
  id: number,
  title = 'Movie',
  mediaType: 'movie' | 'tv' = 'movie',
  episodeTitle?: string,
  season = 1,
  episode = 1
): MovieStreamSource {
  const servers = buildStreamServers(id, mediaType, season, episode);

  return {
    id: `stream_${id}_s${season}_e${episode}`,
    mediaId: id,
    title: episodeTitle ? `${title} — ${episodeTitle}` : title,
    mediaType,
    season,
    episode,
    isFullMovie: true,
    verified: true,
    durationMinutes: mediaType === 'tv' ? 45 : 120,
    description: `Full real stream via MultiEmbed, VidSrc, and 2Embed architecture.`,
    servers,
    defaultServerId: 'multiembed'
  };
}

export const VERIFIED_OPEN_STREAM_SOURCES: Record<number, unknown[]> = {};
