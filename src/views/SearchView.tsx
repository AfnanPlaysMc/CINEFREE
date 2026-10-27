/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, RefreshCw } from 'lucide-react';
import { fetchMultiSearch } from '../lib/tmdb';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { SearchBar } from '../components/SearchBar';
import { MediaGrid } from '../components/MediaGrid';

interface SearchViewProps {
  initialQuery?: string;
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void;
  onQueryChange?: (query: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onSelectItem,
  onPlayMovie,
  onPlayTrailer,
  onQueryChange,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playHandler = onPlayMovie || onPlayTrailer;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetchMultiSearch(trimmed)
      .then((data) => {
        if (!isCancelled) {
          const list = (data.results || []).filter(
            (item) => item.media_type === 'movie' || item.media_type === 'tv' || (!item.media_type && (item.title || item.name))
          );
          setResults(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'An error occurred while searching titles.');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [query]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (onQueryChange) {
      onQueryChange(newQuery);
    }
  };

  const filteredResults = results.filter((item) => {
    if (filterType === 'all') return true;
    return item.media_type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Search CineFree</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Find any movie or series with instant full streaming in the CineFree custom player.
        </p>
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          placeholder="Type title, actor, or genre (e.g. Dune, Stranger Things, Nolan)..."
          autoFocus={!query}
          className="shadow-2xl"
        />
      </div>

      {/* Filter Tabs when query exists */}
      {query && results.length > 0 && (
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <p className="text-sm text-zinc-400">
            Found <span className="text-white font-semibold">{filteredResults.length}</span> results for "
            <span className="text-white font-medium">{query}</span>"
          </p>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141419] border border-white/5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                filterType === 'all' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                filterType === 'movie' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              Movies ({results.filter((r) => r.media_type === 'movie').length})
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 ${
                filterType === 'tv' ? 'bg-[#e50914] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" />
              TV ({results.filter((r) => r.media_type === 'tv').length})
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="p-8 text-center rounded-xl bg-[#141419] border border-white/5 max-w-md mx-auto my-8">
          <p className="text-red-400 text-sm font-medium mb-3">{error}</p>
          <button
            onClick={() => handleSearch(query)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e50914] text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Search
          </button>
        </div>
      ) : !query.trim() ? (
        <div className="p-12 text-center text-zinc-500 max-w-md mx-auto">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-400" />
          <h3 className="text-base font-semibold text-zinc-300 mb-1">Start Typing to Search</h3>
          <p className="text-xs text-zinc-500">
            Real-time search across the entire CineFree movie and television library.
          </p>
        </div>
      ) : (
        <MediaGrid
          items={filteredResults}
          loading={loading}
          onSelectItem={onSelectItem}
          onPlayMovie={playHandler}
          emptyTitle={`No results matching "${query}"`}
          emptyDescription="Check your spelling or try searching for a different movie, franchise, or show title."
        />
      )}
    </div>
  );
};
