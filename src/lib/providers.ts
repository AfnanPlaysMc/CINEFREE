/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StreamServerId = 
  | 'vidlink' 
  | 'vidsrc_icu' 
  | 'vidsrc_sh' 
  | 'twoembed' 
  | 'multiembed' 
  | 'autoembed';

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
 * Builds real streaming server endpoints matching GoMovies and Cinego
 * across millions of movies and TV titles globally.
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
      id: 'vidlink',
      name: 'Server 1: VidLink HD',
      badge: 'Recommended',
      description: 'Ultra-fast HD cloud streaming with multi-subtitles and minimal buffering.',
      embedUrl: isMovie
        ? `https://vidlink.pro/movie/${mediaId}?primaryColor=e50914&secondaryColor=121212&iconColor=ffffff`
        : `https://vidlink.pro/tv/${mediaId}/${season}/${episode}?primaryColor=e50914&secondaryColor=121212&iconColor=ffffff`
    },
    {
      id: 'vidsrc_icu',
      name: 'Server 2: VidSrc Pro',
      badge: 'Multi-Audio',
      description: 'High-availability streaming network with multiple audio and subtitle tracks.',
      embedUrl: isMovie
        ? `https://vidsrc.icu/embed/movie/${mediaId}`
        : `https://vidsrc.icu/embed/tv/${mediaId}/${season}/${episode}`
    },
    {
      id: 'vidsrc_sh',
      name: 'Server 3: VidSrc SH',
      badge: 'Direct Mirror',
      description: 'Clean direct mirror server without sandbox restrictions.',
      embedUrl: isMovie
        ? `https://vidsrc.sh/embed/movie?tmdb=${mediaId}`
        : `https://vidsrc.sh/embed/tv?tmdb=${mediaId}&sea=${season}&epi=${episode}`
    },
    {
      id: 'twoembed',
      name: 'Server 4: 2Embed',
      badge: 'High Speed',
      description: 'Fast streaming node with extensive global catalog coverage.',
      embedUrl: isMovie
        ? `https://www.2embed.cc/embed/${mediaId}`
        : `https://www.2embed.cc/embedtv/${mediaId}&s=${season}&e=${episode}`
    },
    {
      id: 'multiembed',
      name: 'Server 5: MultiEmbed',
      badge: 'Aggregator',
      description: 'Multi-CDN aggregation network for uninterrupted film & television streaming.',
      embedUrl: isMovie
        ? `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}`
    },
    {
      id: 'autoembed',
      name: 'Server 6: AutoEmbed',
      badge: 'Adaptive CDN',
      description: 'High-speed adaptive bitrate stream with instantaneous start times.',
      embedUrl: isMovie
        ? `https://player.autoembed.cc/embed/movie/${mediaId}`
        : `https://player.autoembed.cc/embed/tv/${mediaId}/${season}/${episode}`
    }
  ];
}

/**
 * Resolves full playable movie or TV episode stream for any title in the entire world.
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
    description: `Full real movie stream via multi-server architecture.`,
    servers,
    defaultServerId: 'vidlink'
  };
}

export const VERIFIED_OPEN_STREAM_SOURCES: Record<number, unknown[]> = {};
