/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Bookmark,
  Check,
  Flame,
  Compass,
  Sliders,
  RotateCcw,
  Zap,
  Heart,
  Brain,
  Sun,
  Moon,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TMDBMediaItem, TMDBMovie } from '../lib/tmdb-types';
import { fetchMoodSearch, MoodSearchResult } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';

interface MoodSearchViewProps {
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie: (item: TMDBMediaItem) => void;
}

const QUICK_PROMPTS = [
  'Melancholic sci-fi with a glimmer of hope',
  'Late night rain aesthetic with bittersweet neon vibes',
  'High-octane adrenaline with zero emotional burden',
  'Mind-bending cerebral puzzle that respects my intellect',
  'Cozy rainy Sunday comforting laugh'
];

const VIBE_ARCHETYPES = [
  'Cosmic Loneliness',
  'Neon Rain',
  'Cathartic Cry',
  'Pure Adrenaline',
  'Mind Maze',
  'Comfort Blanket',
  'Dark Satire',
  'Visually Hypnotic',
  'Bittersweet Romance',
  'Late Night Drive'
];

export const MoodSearchView: React.FC<MoodSearchViewProps> = ({
  onSelectItem,
  onPlayMovie
}) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Emotion Matrix state
  const [prompt, setPrompt] = useState<string>('Melancholic sci-fi with a glimmer of hope');
  const [energy, setEnergy] = useState<number>(35); // 0 (Ambient) to 100 (Adrenaline)
  const [tone, setTone] = useState<number>(40);   // 0 (Dark) to 100 (Luminous)
  const [heart, setHeart] = useState<number>(75);  // 0 (Cold) to 100 (Soulful)
  const [intellect, setIntellect] = useState<number>(85); // 0 (Popcorn) to 100 (Philosophical)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Cosmic Loneliness', 'Visually Hypnotic']);

  // Results state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<MoodSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleExecuteMoodSearch = async (customPrompt?: string) => {
    const activePrompt = customPrompt !== undefined ? customPrompt : prompt;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchMoodSearch({
        prompt: activePrompt,
        energy,
        tone,
        heart,
        intellect,
        vibes: selectedVibes
      });
      setSearchResult(data);
    } catch (err) {
      console.error('Mood search failed:', err);
      setError('Unable to harmonize mood at this moment. Please adjust your parameters or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search on mount so user sees immediate results
  useEffect(() => {
    handleExecuteMoodSearch();
  }, []);

  const handleReset = () => {
    setPrompt('');
    setEnergy(50);
    setTone(50);
    setHeart(50);
    setIntellect(50);
    setSelectedVibes([]);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-white pb-24 pt-24 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Exclusive Feature · Netflix Doesn't Have This</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Cinema Synesthesia
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          Don't search for boring genres. Tune your exact emotional wavelength, psychological need, or late-night vibe. Our Synesthesia Engine translates your mental state into tailored cinematic curations.
        </p>
      </div>

      {/* Interactive Mood Engine Console */}
      <div className="bg-[#0b1021] border border-white/10 rounded-3xl p-5 sm:p-8 mb-12 shadow-2xl space-y-8">
        {/* Natural Language Prompt Input */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            1. Describe Your Current Headspace or Desired Vibe
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteMoodSearch();
                }}
                placeholder="e.g. Heartbroken but wanting hope, or late-night cyberpunk drive..."
                className="w-full bg-[#141b33] border border-white/10 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
            </div>
            <button
              onClick={() => handleExecuteMoodSearch()}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30 flex-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tuning Vibe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Mood</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Inspiration Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-500 font-medium">Quick Prompts:</span>
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                onClick={() => {
                  setPrompt(qp);
                  handleExecuteMoodSearch(qp);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-600/20 hover:text-blue-300 text-zinc-400 border border-white/5 transition-colors cursor-pointer text-[11px]"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Axis Emotion Matrix Sliders */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              2. 4-Axis Emotional Matrix
            </label>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Matrix
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Slider */}
            <div className="bg-[#10172e] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy & Pace
                </span>
                <span className="text-amber-400">
                  {energy < 35 ? 'Ambient / Slow Cinema' : energy > 65 ? 'High Voltage Adrenaline' : 'Balanced Flow'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 · Ambient & Zen</span>
                <span>50 · Steady</span>
                <span>100 · Pure Adrenaline</span>
              </div>
            </div>

            {/* Tone Slider */}
            <div className="bg-[#10172e] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Emotional Tone
                </span>
                <span className="text-indigo-400">
                  {tone < 35 ? 'Nocturnal & Melancholic' : tone > 65 ? 'Luminous & Uplifting' : 'Nuanced Shading'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tone}
                onChange={(e) => setTone(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 · Dark & Gritty</span>
                <span>50 · Bittersweet</span>
                <span>100 · Pure Joy & Warmth</span>
              </div>
            </div>

            {/* Heart Slider */}
            <div className="bg-[#10172e] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Soul & Vulnerability
                </span>
                <span className="text-rose-400">
                  {heart < 35 ? 'Cerebral & Cold' : heart > 65 ? 'Deeply Moving Tearjerker' : 'Balanced Feeling'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={heart}
                onChange={(e) => setHeart(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 · Cold & Detached</span>
                <span>50 · Emotional</span>
                <span>100 · Soul-Stirring Catharsis</span>
              </div>
            </div>

            {/* Intellect Slider */}
            <div className="bg-[#10172e] p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" /> Cognitive Complexity
                </span>
                <span className="text-cyan-400">
                  {intellect < 35 ? 'Turn-Brain-Off Escapism' : intellect > 65 ? 'Mind-Bending Puzzle' : 'Thoughtful Story'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intellect}
                onChange={(e) => setIntellect(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 · Easy Popcorn</span>
                <span>50 · Engaging Plot</span>
                <span>100 · Philosophical Masterpiece</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vibe Archetypes */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-400" />
            3. Vibe Archetypes (Select Any)
          </label>
          <div className="flex flex-wrap gap-2">
            {VIBE_ARCHETYPES.map((vibe) => {
              const isSelected = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{vibe}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mood Synesthesia Synthesis Bar */}
      {searchResult && (
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-[#10172e] to-purple-900/30 border border-blue-500/20 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 flex-none mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                Synthesized Emotional Profile
              </div>
              <p className="text-sm sm:text-base font-medium text-zinc-200 italic leading-snug">
                "{searchResult.moodSummary}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Results Deck */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Curated Resonances</span>
            {searchResult && (
              <span className="text-xs font-normal text-zinc-400">
                ({searchResult.results.length} Films Matched)
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#0b1021] border border-white/5 rounded-2xl p-4 animate-pulse space-y-4"
              >
                <div className="w-full aspect-[16/10] bg-white/5 rounded-xl" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-12 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : searchResult && searchResult.results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResult.results.map((movie) => {
              const rationale = searchResult.rationales[movie.id];
              const tags = searchResult.tags[movie.id] || [];
              const score = searchResult.scores[movie.id] || 95;
              const inWatchlist = isInWatchlist(movie.id, 'movie');

              const posterUrl = movie.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
                : movie.poster_path
                ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';

              const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : '';

              return (
                <div
                  key={movie.id}
                  className="group bg-[#0c1122] hover:bg-[#111830] border border-white/10 hover:border-blue-500/40 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Poster / Backdrop Image */}
                  <div
                    onClick={() => onSelectItem(movie as TMDBMediaItem)}
                    className="relative aspect-[16/10] w-full overflow-hidden cursor-pointer"
                  >
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1122] via-black/40 to-transparent" />

                    {/* Match Score Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-xs font-black shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{score}% Mood Match</span>
                    </div>

                    {/* Quick Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayMovie(movie as TMDBMediaItem);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Instant Play</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => onSelectItem(movie as TMDBMediaItem)}
                          className="font-bold text-base text-white hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {movie.title}
                        </h3>
                        {releaseYear && (
                          <span className="text-xs text-zinc-400 flex-none font-medium">
                            {releaseYear}
                          </span>
                        )}
                      </div>

                      {/* Unboxed Metadata: rating, votes */}
                      <div className="text-xs text-zinc-400 flex items-center gap-2">
                        <span className="text-amber-400 font-bold">★ {movie.vote_average?.toFixed(1) || '7.5'}</span>
                        <span>·</span>
                        <span>MultiEmbed HD</span>
                      </div>

                      {/* "Why This Fits Your Mood" section */}
                      {rationale && (
                        <div className="p-3 rounded-xl bg-[#141b33] border border-white/5 space-y-1 mt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Why this fits your headspace:
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {rationale}
                          </p>
                        </div>
                      )}

                      {/* Vibe Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onPlayMovie(movie as TMDBMediaItem)}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Film</span>
                      </button>

                      <button
                        onClick={() => toggleWatchlist(movie as TMDBMediaItem)}
                        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          inWatchlist
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                        }`}
                      >
                        {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onSelectItem(movie as TMDBMediaItem)}
                        title="View Full Details"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0b1021] rounded-3xl border border-white/5">
            <Compass className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No resonances found for this wavelength</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Try adjusting the sliders or typing a broader prompt in the mood console above.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Reset Matrix
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
