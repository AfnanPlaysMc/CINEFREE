/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.json());

// In-memory cache for TMDB responses
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const ONE_HOUR = 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

import { FALLBACK_CATALOG, findFallbackDetail, searchFallbackCatalog } from '../src/lib/fallback-data.ts';

const DEFAULT_TMDB_KEY = '407886e825dc0d2581cc397ce2289f4a';

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasTmdbKey: true,
    mode: 'production'
  });
});

app.get('/api/tmdb/*', async (req: Request, res: Response) => {
  const subpath = req.path.replace(/^\/api\/tmdb/, '');
  const userKeyHeader = req.headers['x-tmdb-key'] as string | undefined;
  const apiKey = (userKeyHeader && userKeyHeader.trim()) || 
    (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'MY_TMDB_API_KEY' && process.env.TMDB_API_KEY.trim().length > 5
      ? process.env.TMDB_API_KEY.trim()
      : DEFAULT_TMDB_KEY);

  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'api_key' && typeof value === 'string') {
      queryParams.set(key, value);
    }
  }
  queryParams.sort();
  const cacheKey = `${subpath}?${queryParams.toString()}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  const targetUrl = new URL(`${TMDB_BASE_URL}${subpath}`);
  queryParams.forEach((val, k) => targetUrl.searchParams.set(k, val));
  if (apiKey) {
    targetUrl.searchParams.set('api_key', apiKey);
  }

  try {
    const tmdbRes = await fetch(targetUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CineFree-Applet/1.0',
      },
    });

    if (!tmdbRes.ok) {
      const fallback = handleFallbackRequest(subpath, req.query);
      if (fallback) return res.json(fallback);
      throw new Error(`TMDB error status: ${tmdbRes.status}`);
    }

    const data = await tmdbRes.json();
    const ttl = subpath.includes('/search/') ? TEN_MINUTES : ONE_HOUR;
    cache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
    return res.json(data);
  } catch (err) {
    const fallback = handleFallbackRequest(subpath, req.query);
    if (fallback) return res.json(fallback);
    return res.status(502).json({ error: 'Upstream Provider Error', message: String(err) });
  }
});

function handleFallbackRequest(subpath: string, query: Record<string, unknown>) {
  const cleanPath = subpath.replace(/^\//, '');
  if (cleanPath.startsWith('discover/movie')) {
    if (query.free_full === 'true' || query.with_genres === 'free_full') {
      return FALLBACK_CATALOG['discover/movie?free_full=true'];
    }
    return FALLBACK_CATALOG['movie/popular'];
  }
  if (cleanPath.startsWith('search/multi')) {
    return searchFallbackCatalog(String(query.query || ''));
  }
  const movieDetailMatch = cleanPath.match(/^movie\/(\d+)(?:\/([a-z_/]+))?$/);
  if (movieDetailMatch) {
    return findFallbackDetail('movie', parseInt(movieDetailMatch[1], 10), movieDetailMatch[2] || '');
  }
  const tvDetailMatch = cleanPath.match(/^tv\/(\d+)(?:\/([a-z_0-9/]+))?$/);
  if (tvDetailMatch) {
    return findFallbackDetail('tv', parseInt(tvDetailMatch[1], 10), tvDetailMatch[2] || '');
  }
  return FALLBACK_CATALOG[cleanPath] || null;
}

export default app;
