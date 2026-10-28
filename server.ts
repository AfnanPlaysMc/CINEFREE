/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(express.json());

// In-memory cache for TMDB responses
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();

const ONE_HOUR = 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

// Authentic fallback data for seed catalog
import { FALLBACK_CATALOG, findFallbackDetail, searchFallbackCatalog } from './src/lib/fallback-data.ts';

const DEFAULT_TMDB_KEY = '407886e825dc0d2581cc397ce2289f4a';

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasTmdbKey: true,
    mode: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/tmdb/*', async (req: Request, res: Response) => {
  const subpath = req.path.replace(/^\/api\/tmdb/, '');
  const userKeyHeader = req.headers['x-tmdb-key'] as string | undefined;
  const apiKey = (userKeyHeader && userKeyHeader.trim()) || 
    (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'MY_TMDB_API_KEY' && process.env.TMDB_API_KEY.trim().length > 5
      ? process.env.TMDB_API_KEY.trim()
      : DEFAULT_TMDB_KEY);

  // Build normalized cache key (ignore auth params)
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'api_key' && typeof value === 'string') {
      queryParams.set(key, value);
    }
  }
  queryParams.sort();
  const cacheKey = `${subpath}?${queryParams.toString()}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  // Deduplicate concurrent requests
  if (inflightRequests.has(cacheKey)) {
    try {
      const data = await inflightRequests.get(cacheKey);
      return res.json(data);
    } catch {
      // Fall through to retry or fallback
    }
  }

  const fetchPromise = (async () => {
    const targetUrl = new URL(`${TMDB_BASE_URL}${subpath}`);
    queryParams.forEach((val, k) => targetUrl.searchParams.set(k, val));
    if (apiKey) {
      targetUrl.searchParams.set('api_key', apiKey);
    }

    try {
      const accessToken = process.env.TMDB_READ_ACCESS_TOKEN || 'eyJhGciOJIUzI1NiJ9.eyJhdWQiOi0MDC4ODZ1ODI1ZGMwDZ1ODJ1ODFjYjYzM00DfJyZM5N2N1MjI4OWY0YSiSM5iZi6MTc5MzEyNju1My4y0Tk5K5LCJzdWiiOiI2YWUwZja5OTdkMzZnN1ZTZjMTMxMjMTMxMmUiLCJZy2WZXM0lsiYXBPX3J1YWQiQiXiXswidmVy2lvbi2vbiI2MX0.AgK-ahtza8QSev16h1UXgw5hyLfdtTpUfN82yCWytKU';
      const tmdbRes = await fetch(targetUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'CineFree-Applet/1.0',
        },
      });

      if (!tmdbRes.ok) {
        if (tmdbRes.status === 401 || tmdbRes.status === 404) {
          // If 401 Unauthorized (e.g. invalid key) or 404, fall back smoothly
          const fallback = handleFallbackRequest(subpath, req.query);
          if (fallback) return fallback;
        }
        if (tmdbRes.status === 429) {
          throw new Error('TMDB Rate limit exceeded. Please wait a moment.');
        }
        throw new Error(`TMDB error status: ${tmdbRes.status} ${tmdbRes.statusText}`);
      }

      const data = await tmdbRes.json();
      const ttl = subpath.includes('/search/') ? TEN_MINUTES : ONE_HOUR;
      cache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
      return data;
    } catch (err) {
      // On network failure or upstream error, check fallback catalog before failing
      const fallback = handleFallbackRequest(subpath, req.query);
      if (fallback) return fallback;
      throw err;
    }
  })();

  inflightRequests.set(cacheKey, fetchPromise);

  try {
    const result = await fetchPromise;
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error from movie service';
    res.status(502).json({
      error: 'Upstream Provider Error',
      message,
      suggestion: 'Check TMDB_API_KEY in Settings or enjoy the built-in verified CineFree catalog.'
    });
  } finally {
    inflightRequests.delete(cacheKey);
  }
});

function handleFallbackRequest(subpath: string, query: Record<string, unknown>) {
  // 1. Check exact key in FALLBACK_CATALOG
  const cleanPath = subpath.replace(/^\//, '');

  if (cleanPath.startsWith('discover/movie')) {
    if (query.free_full === 'true' || query.with_genres === 'free_full') {
      return FALLBACK_CATALOG['discover/movie?free_full=true'];
    }
    const genre = String(query.with_genres || '');
    if (genre === '28') return FALLBACK_CATALOG['discover/movie?with_genres=28'];
    if (genre === '35') return FALLBACK_CATALOG['discover/movie?with_genres=35'];
    if (genre === '27') return FALLBACK_CATALOG['discover/movie?with_genres=27'];
    if (genre === '878') return FALLBACK_CATALOG['discover/movie?with_genres=878'];
    return FALLBACK_CATALOG['movie/popular'];
  }

  if (cleanPath.startsWith('search/multi')) {
    const q = String(query.query || '');
    return searchFallbackCatalog(q);
  }

  // Movie details: /movie/:id, /movie/:id/credits, /movie/:id/videos, /movie/:id/similar, /movie/:id/watch/providers
  const movieDetailMatch = cleanPath.match(/^movie\/(\d+)(?:\/([a-z_/]+))?$/);
  if (movieDetailMatch) {
    const id = parseInt(movieDetailMatch[1], 10);
    const subresource = movieDetailMatch[2] || '';
    return findFallbackDetail('movie', id, subresource);
  }

  // TV details: /tv/:id, /tv/:id/season/:num, /tv/:id/credits, /tv/:id/videos, /tv/:id/similar, /tv/:id/watch/providers
  const tvDetailMatch = cleanPath.match(/^tv\/(\d+)(?:\/([a-z_0-9/]+))?$/);
  if (tvDetailMatch) {
    const id = parseInt(tvDetailMatch[1], 10);
    const subresource = tvDetailMatch[2] || '';
    return findFallbackDetail('tv', id, subresource);
  }

  if (FALLBACK_CATALOG[cleanPath]) {
    return FALLBACK_CATALOG[cleanPath];
  }

  // Default to popular movies if unknown list
  return null;
}

// Dev server with Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineFree application server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
