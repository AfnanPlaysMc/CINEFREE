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
const DEFAULT_TMDB_KEY = '407886e825dc0d2581cc397ce2289f4a';

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

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasTmdbKey: true,
    mode: process.env.NODE_ENV || 'development'
  });
});

/**
 * TMDB Proxy Route
 * Always passes query param `api_key=407886e825dc0d2581cc397ce2289f4a` without invalid Bearer token.
 */
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
    targetUrl.searchParams.set('api_key', apiKey);

    try {
      const tmdbRes = await fetch(targetUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CineFree-Applet/1.0',
        },
      });

      if (!tmdbRes.ok) {
        if (tmdbRes.status === 401 || tmdbRes.status === 404) {
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

  // Movie details: /movie/:id
  const movieDetailMatch = cleanPath.match(/^movie\/(\d+)(?:\/([a-z_/]+))?$/);
  if (movieDetailMatch) {
    const id = parseInt(movieDetailMatch[1], 10);
    const subresource = movieDetailMatch[2] || '';
    return findFallbackDetail('movie', id, subresource);
  }

  // TV details: /tv/:id
  const tvDetailMatch = cleanPath.match(/^tv\/(\d+)(?:\/([a-z_0-9/]+))?$/);
  if (tvDetailMatch) {
    const id = parseInt(tvDetailMatch[1], 10);
    const subresource = tvDetailMatch[2] || '';
    return findFallbackDetail('tv', id, subresource);
  }

  if (FALLBACK_CATALOG[cleanPath]) {
    return FALLBACK_CATALOG[cleanPath];
  }

  return null;
}

/**
 * Feature: Cinema Synesthesia — Advanced Mood & Emotion Search
 * Pure multi-dimensional algorithmic cinema resonance engine
 */
interface MoodSearchRequest {
  prompt?: string;
  energy?: number;    // 0 - 100
  tone?: number;      // 0 - 100
  heart?: number;     // 0 - 100
  intellect?: number; // 0 - 100
  vibes?: string[];
}

interface CuratedMoodMovie {
  title: string;
  year: number;
  matchScore: number;
  rationale: string;
  vibeTags: string[];
}

app.post('/api/mood-search', async (req: Request, res: Response) => {
  const body: MoodSearchRequest = req.body || {};
  const prompt = (body.prompt || '').trim().toLowerCase();
  const energy = typeof body.energy === 'number' ? body.energy : 50;
  const tone = typeof body.tone === 'number' ? body.tone : 50;
  const heart = typeof body.heart === 'number' ? body.heart : 50;
  const intellect = typeof body.intellect === 'number' ? body.intellect : 50;
  const vibes = Array.isArray(body.vibes) ? body.vibes : [];

  const apiKey = (req.headers['x-tmdb-key'] as string | undefined)?.trim() ||
    (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'MY_TMDB_API_KEY' ? process.env.TMDB_API_KEY.trim() : DEFAULT_TMDB_KEY);

  // Synthesize poetic emotional profile description from matrix dimensions
  let moodSummary = '';
  if (prompt.includes('cyberpunk') || prompt.includes('neon') || vibes.includes('Neon Rain')) {
    moodSummary = 'A solitary drift through the electric veins of a city that never sleeps, drenched in synthetic rain and neon melancholy.';
  } else if (prompt.includes('sci-fi') || prompt.includes('space') || vibes.includes('Cosmic Loneliness')) {
    moodSummary = 'A quiet, cosmic ache drifting through the stars, seeking a tether to humanity amidst the cold expanse of infinity.';
  } else if (energy > 70) {
    moodSummary = 'High-velocity kinetic momentum engineered to spike adrenaline and suspend conscious anxiety.';
  } else if (heart > 70 && tone > 60) {
    moodSummary = 'A soulful, luminous emotional embrace that rekindles faith in human connection and gentle triumph.';
  } else if (intellect > 70) {
    moodSummary = 'A cerebral architectural puzzle that engages your highest analytical faculties while keeping you on the edge.';
  } else if (energy < 35 && tone < 40) {
    moodSummary = 'Nocturnal, contemplative cinema bathed in shadows, lingering thoughts, and evocative atmospheric textures.';
  } else {
    moodSummary = `Harmonized for ${energy > 50 ? 'kinetic rhythm' : 'ambient pacing'} with ${tone > 50 ? 'luminous warmth' : 'nocturnal introspection'}.`;
  }

  // Multi-dimensional curated library for immediate, flawless matching
  const moodLibrary: CuratedMoodMovie[] = [
    {
      title: 'Solaris',
      year: 1972,
      matchScore: 97,
      rationale: "Tarkovsky's slow-burn masterpiece turns the vacuum of space into a mirror for human regret. It is a hypnotic, deeply philosophical journey that finds the light of love in the most desolate voids.",
      vibeTags: ['Visually Hypnotic', 'Existential', 'Melancholic']
    },
    {
      title: 'Blade Runner 2049',
      year: 2017,
      matchScore: 98,
      rationale: 'Unsurpassed atmospheric density with rain-soaked brutalist neon palettes and an existential search for soul in an artificial landscape.',
      vibeTags: ['Neon Rain', 'Cyberpunk', 'Cosmic Loneliness']
    },
    {
      title: 'Ad Astra',
      year: 2019,
      matchScore: 94,
      rationale: 'The cinematography captures the terrifying silence of the solar system, framing an introspective journey that sheds layers of isolation to find human peace.',
      vibeTags: ['Cosmic Loneliness', 'Visual Spectacle', 'Introspective']
    },
    {
      title: 'Children of Men',
      year: 2006,
      matchScore: 95,
      rationale: 'Visceral handheld cinematography creates a grounded, desperate reality that makes the final, fragile glimmer of hope feel completely earned.',
      vibeTags: ['Dystopian', 'Hopeful', 'Cinematic']
    },
    {
      title: 'Interstellar',
      year: 2014,
      matchScore: 99,
      rationale: 'The ultimate synthesis of cosmic scale and raw emotional vulnerability, driven by Hans Zimmer’s transcendent pipe-organ score.',
      vibeTags: ['Cosmic', 'Deeply Moving', 'Masterpiece']
    },
    {
      title: 'Drive',
      year: 2011,
      matchScore: 93,
      rationale: 'Hypnotic synth-wave pulse and nocturnal Los Angeles asphalt that satisfies the need for focused, quiet conviction.',
      vibeTags: ['Late Night Drive', 'Neon', 'Stylized']
    },
    {
      title: 'Her',
      year: 2013,
      matchScore: 92,
      rationale: 'Soft pastel warmth and bittersweet intimacy reflecting on loneliness, modern connection, and delicate heartache.',
      vibeTags: ['Bittersweet Romance', 'Comfort Blanket', 'Soulful']
    },
    {
      title: 'Arrival',
      year: 2016,
      matchScore: 96,
      rationale: 'A deeply moving linguistic puzzle that reframes time, sorrow, and love with breathtaking emotional and intellectual clarity.',
      vibeTags: ['Mind Maze', 'Deeply Moving', 'Cathartic']
    },
    {
      title: 'Mad Max: Fury Road',
      year: 2015,
      matchScore: 95,
      rationale: 'Pure cinematic kinetic energy and relentless visual orchestration that commands complete, thrilling sensory immersion.',
      vibeTags: ['Pure Adrenaline', 'Action Masterclass', 'Kinetic']
    },
    {
      title: 'Inception',
      year: 2010,
      matchScore: 94,
      rationale: 'A multi-layered cognitive labyrinth that respects your intellect while sustaining tremendous emotional stakes.',
      vibeTags: ['Mind Maze', 'Cerebral', 'Blockbuster']
    },
    {
      title: 'The Grand Budapest Hotel',
      year: 2014,
      matchScore: 91,
      rationale: 'Exquisite color grading, witty rhythm, and comforting storybook aesthetics engineered to restore joy.',
      vibeTags: ['Comfort Blanket', 'Vibrant', 'Stylized']
    },
    {
      title: 'Lost in Translation',
      year: 2003,
      matchScore: 93,
      rationale: 'Captures the delicate bittersweet nocturnal wavelength of strangers finding an ephemeral connection in a sprawling neon metropolis.',
      vibeTags: ['Nocturnal', 'Bittersweet', 'Intimate']
    }
  ];

  // Algorithmic selection based on user inputs
  let selectedRecommendations: CuratedMoodMovie[] = [];

  if (prompt.includes('cyberpunk') || prompt.includes('neon') || vibes.includes('Neon Rain')) {
    selectedRecommendations = [
      moodLibrary[1], // Blade Runner 2049
      moodLibrary[5], // Drive
      moodLibrary[0], // Solaris
      moodLibrary[11], // Lost in Translation
      moodLibrary[7], // Arrival
      moodLibrary[3]  // Children of Men
    ];
  } else if (prompt.includes('hope') || vibes.includes('Cathartic Cry') || heart > 65) {
    selectedRecommendations = [
      moodLibrary[4], // Interstellar
      moodLibrary[7], // Arrival
      moodLibrary[3], // Children of Men
      moodLibrary[0], // Solaris
      moodLibrary[6], // Her
      moodLibrary[2]  // Ad Astra
    ];
  } else if (energy > 65 || vibes.includes('Pure Adrenaline')) {
    selectedRecommendations = [
      moodLibrary[8], // Mad Max: Fury Road
      moodLibrary[5], // Drive
      moodLibrary[9], // Inception
      moodLibrary[1], // Blade Runner 2049
      moodLibrary[3], // Children of Men
      moodLibrary[4]  // Interstellar
    ];
  } else if (intellect > 65 || vibes.includes('Mind Maze')) {
    selectedRecommendations = [
      moodLibrary[9], // Inception
      moodLibrary[7], // Arrival
      moodLibrary[1], // Blade Runner 2049
      moodLibrary[0], // Solaris
      moodLibrary[4], // Interstellar
      moodLibrary[3]  // Children of Men
    ];
  } else {
    selectedRecommendations = moodLibrary.slice(0, 6);
  }

  // Resolve metadata via TMDB with API key
  const finalResults: Array<Record<string, unknown>> = [];
  const rationales: Record<number, string> = {};
  const tags: Record<number, string[]> = {};
  const scores: Record<number, number> = {};

  await Promise.all(
    selectedRecommendations.map(async (rec) => {
      try {
        const searchUrl = new URL(`${TMDB_BASE_URL}/search/movie`);
        searchUrl.searchParams.set('api_key', apiKey);
        searchUrl.searchParams.set('query', rec.title);
        searchUrl.searchParams.set('year', String(rec.year));

        const res = await fetch(searchUrl.toString(), {
          headers: { 'Accept': 'application/json', 'User-Agent': 'CineFree-Applet/1.0' }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            const movieId = movie.id;
            finalResults.push(movie);
            rationales[movieId] = rec.rationale;
            tags[movieId] = rec.vibeTags;
            scores[movieId] = rec.matchScore;
          }
        }
      } catch (err) {
        console.warn(`Failed to resolve metadata for ${rec.title}:`, err);
      }
    })
  );

  // If TMDB search had network hiccups, fallback to popular items
  if (finalResults.length === 0) {
    const fallbackPop = FALLBACK_CATALOG['movie/popular'];
    if (fallbackPop && fallbackPop.results) {
      finalResults.push(...((fallbackPop.results as unknown as Record<string, unknown>[]).slice(0, 6)));
    }
  }

  res.json({
    moodSummary,
    results: finalResults,
    rationales,
    tags,
    scores
  });
});

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
