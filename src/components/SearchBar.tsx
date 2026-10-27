/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onSearch,
  placeholder = 'Search movies, TV shows...',
  autoFocus = false,
  className = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setQuery(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce by 350ms as specified in requirements
    debounceTimerRef.current = setTimeout(() => {
      onSearch(nextVal.trim());
    }, 350);
  };

  const handleClear = () => {
    setQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <label htmlFor="cinefree-search-input" className="sr-only">
        Search movies and TV shows
      </label>
      <div className="absolute left-3.5 pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        id="cinefree-search-input"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="w-full pl-10 pr-9 py-2 rounded-full bg-[#1c1c24] border border-white/10 text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute right-3 text-zinc-400 hover:text-white p-0.5 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};
