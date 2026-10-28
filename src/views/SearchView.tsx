/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Film, Tv, Users, RefreshCw, User, Sparkles } from 'lucide-react';
import { fetchMultiSearch, fetchPersonSearch } from '../lib/tmdb';
import { TMDBMediaItem, TMDBPerson } from '../lib/tmdb-types';
import { SearchBar } from '../components/SearchBar';
import { MediaGrid } from '../components/MediaGrid';
import { PersonDetailModal } from '../components/PersonDetailModal';
import { getImageUrl } from '../lib/utils';

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
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv' | 'person'>('all');
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [people, setPeople] = useState<TMDBPerson[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
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
      setPeople([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      fetchMultiSearch(trimmed),
      fetchPersonSearch(trimmed)
    ])
      .then(([multiRes, personRes]) => {
        if (isCancelled) return;

        let mediaList: TMDBMediaItem[] = [];
        let peopleList: TMDBPerson[] = [];

        if (multiRes.status === 'fulfilled') {
          mediaList = (multiRes.value.results || []).filter(
            (item: any) =>
              item.media_type === 'movie' ||
              item.media_type === 'tv' ||
              (!item.media_type && (item.title || item.name))
          );
          if (multiRes.value.people) {
            peopleList = [...multiRes.value.people];
          }
        }

        if (personRes.status === 'fulfilled') {
          const directPeople = personRes.value.results || [];
          // Deduplicate people
          const existingIds = new Set(peopleList.map((p) => p.id));
          for (const p of directPeople) {
            if (!existingIds.has(p.id)) {
              peopleList.push(p);
              existingIds.add(p.id);
            }
          }
        }

        setResults(mediaList);
        setPeople(peopleList);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || 'An error occurred while searching titles and actors.');
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

  const filteredMedia = results.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'person') return false;
    return item.media_type === filterType;
  });

  const showPeopleSection = (filterType === 'all' || filterType === 'person') && people.length > 0;
  const showMediaSection = filterType !== 'person';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pt-24 min-h-screen">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Search CineFree</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Find any movie, TV show, or actor with circular profile pictures, biographies, and instant streaming.
        </p>
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          placeholder="Search by actor name (e.g. Tom Holland, Zendaya, Nolan) or movie title..."
          autoFocus={!query}
          className="shadow-2xl"
        />
      </div>

      {/* Filter Tabs when query exists */}
      {query && (results.length > 0 || people.length > 0) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-3">
          <p className="text-sm text-zinc-400">
            Found <span className="text-white font-semibold">{results.length}</span> titles and{' '}
            <span className="text-white font-semibold">{people.length}</span> actors for "
            <span className="text-white font-medium">{query}</span>"
          </p>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#141419] border border-white/5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({results.length + people.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                filterType === 'movie' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              Movies ({results.filter((r) => r.media_type === 'movie').length})
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                filterType === 'tv' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" />
              TV ({results.filter((r) => r.media_type === 'tv').length})
            </button>
            <button
              onClick={() => setFilterType('person')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors ${
                filterType === 'person' ? 'bg-blue-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              Actors & People ({people.length})
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
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
            Search actors, directors, movies, and TV shows with instant results.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ========================================================= */}
          {/* ACTORS & CREATORS SECTION (CIRCLE PFP ROW / GRID)        */}
          {/* ========================================================= */}
          {showPeopleSection && (
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-[#0f111a] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-blue-400" />
                  Actors & People ({people.length})
                </h3>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Click actor's circular photo to view full biography & movies played in
                </span>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {people.map((actor) => {
                  const pfp = actor.profile_path ? getImageUrl(actor.profile_path, 'w300') : '';
                  const knownTitles = (actor.known_for || [])
                    .map((item: any) => item.title || item.name)
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(', ');

                  return (
                    <button
                      key={actor.id}
                      onClick={() => setSelectedPersonId(actor.id)}
                      className="flex-none flex flex-col items-center group/actor cursor-pointer text-center w-24 sm:w-28 transition-transform hover:-translate-y-1 focus:outline-none"
                    >
                      {/* CIRCLE PROFILE PHOTO */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#1a1a26] ring-2 ring-white/15 group-hover/actor:ring-4 group-hover/actor:ring-blue-500 shadow-xl transition-all duration-300 mb-2">
                        {pfp ? (
                          <img
                            src={pfp}
                            alt={actor.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top group-hover/actor:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-[9px] font-black uppercase text-white py-0.5 opacity-0 group-hover/actor:opacity-100 transition-opacity">
                          View Bio
                        </span>
                      </div>

                      {/* Actor Name */}
                      <h4 className="text-xs font-bold text-white group-hover/actor:text-blue-400 transition-colors truncate w-full">
                        {actor.name}
                      </h4>

                      {/* Known Department */}
                      <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                        {actor.known_for_department || 'Actor'}
                      </p>

                      {/* Known For preview */}
                      {knownTitles && (
                        <p className="text-[10px] text-zinc-400 truncate w-full mt-0.5" title={knownTitles}>
                          {knownTitles}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MOVIES & TV SHOWS MEDIA GRID                             */}
          {/* ========================================================= */}
          {showMediaSection && (
            <div>
              {people.length > 0 && filterType === 'all' && (
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Film className="w-4 h-4 text-blue-400" /> Movies & TV Shows
                </h3>
              )}
              <MediaGrid
                items={filteredMedia}
                loading={loading}
                onSelectItem={onSelectItem}
                onPlayMovie={playHandler}
                emptyTitle={`No movie or TV titles matching "${query}"`}
                emptyDescription="Try selecting an actor above to see movies they played in, or try another title."
              />
            </div>
          )}
        </div>
      )}

      {/* ACTOR / PERSON DETAIL MODAL */}
      {selectedPersonId && (
        <PersonDetailModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onSelectMedia={onSelectItem}
          onPlayMedia={playHandler}
        />
      )}
    </div>
  );
};
