/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { TMDBMediaItem, TMDBMovie, TMDBTVShow } from '../lib/tmdb-types';
import { getMediaTitle, getMediaReleaseDate } from '../lib/utils';

export interface WatchlistEntry {
  id: string; // e.g. "movie_693134" or "tv_126308"
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  overview: string;
  addedAt: string;
  userId?: string;
}

export interface HistoryEntry {
  id: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  viewedAt: string;
  userId?: string;
}

interface WatchlistContextType {
  watchlist: WatchlistEntry[];
  history: HistoryEntry[];
  isInWatchlist: (mediaId: number | string, mediaType: 'movie' | 'tv') => boolean;
  toggleWatchlist: (item: TMDBMediaItem) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  addToHistory: (item: TMDBMediaItem) => Promise<void>;
  clearLocalData: () => void;
  isCloudSynced: boolean;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  history: [],
  isInWatchlist: () => false,
  toggleWatchlist: async () => {},
  removeFromWatchlist: async () => {},
  addToHistory: async () => {},
  clearLocalData: () => {},
  isCloudSynced: false,
});

const LOCAL_STORAGE_WATCHLIST = 'cinefree_local_watchlist';
const LOCAL_STORAGE_HISTORY = 'cinefree_local_history';

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WATCHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep local storage in sync for offline/guest persistence
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WATCHLIST, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('LocalStorage save failed for watchlist:', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage save failed for history:', e);
    }
  }, [history]);

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!user) return;

    const watchlistPath = `users/${user.uid}/watchlist`;
    const unsubscribeWatchlist = onSnapshot(
      collection(db, 'users', user.uid, 'watchlist'),
      (snapshot) => {
        const cloudItems: WatchlistEntry[] = [];
        snapshot.forEach((docSnap) => {
          cloudItems.push(docSnap.data() as WatchlistEntry);
        });
        cloudItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        setWatchlist(cloudItems);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, watchlistPath);
      }
    );

    const historyPath = `users/${user.uid}/history`;
    const unsubscribeHistory = onSnapshot(
      collection(db, 'users', user.uid, 'history'),
      (snapshot) => {
        const cloudItems: HistoryEntry[] = [];
        snapshot.forEach((docSnap) => {
          cloudItems.push(docSnap.data() as HistoryEntry);
        });
        cloudItems.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        setHistory(cloudItems);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, historyPath);
      }
    );

    return () => {
      unsubscribeWatchlist();
      unsubscribeHistory();
    };
  }, [user]);

  const isInWatchlist = (mediaId: number | string, mediaType: 'movie' | 'tv') => {
    const key = `${mediaType}_${mediaId}`;
    return watchlist.some((item) => item.id === key || (item.mediaId === String(mediaId) && item.mediaType === mediaType));
  };

  const toggleWatchlist = async (item: TMDBMediaItem) => {
    const mediaType: 'movie' | 'tv' = item.media_type || (item.title ? 'movie' : 'tv');
    const itemId = `${mediaType}_${item.id}`;
    const alreadySaved = isInWatchlist(item.id, mediaType);

    if (alreadySaved) {
      await removeFromWatchlist(itemId);
    } else {
      const newEntry: WatchlistEntry = {
        id: itemId,
        mediaId: String(item.id),
        mediaType,
        title: getMediaTitle(item),
        posterPath: item.poster_path || null,
        backdropPath: item.backdrop_path || null,
        voteAverage: item.vote_average || 0,
        releaseDate: getMediaReleaseDate(item),
        overview: item.overview || '',
        addedAt: new Date().toISOString(),
        userId: user ? user.uid : undefined,
      };

      if (user) {
        const docPath = `users/${user.uid}/watchlist/${itemId}`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'watchlist', itemId), {
            ...newEntry,
            userId: user.uid,
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, docPath);
        }
      } else {
        setWatchlist((prev) => [newEntry, ...prev.filter((i) => i.id !== itemId)]);
      }
    }
  };

  const removeFromWatchlist = async (id: string) => {
    if (user) {
      const docPath = `users/${user.uid}/watchlist/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'watchlist', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    } else {
      setWatchlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const addToHistory = async (item: TMDBMediaItem) => {
    const mediaType: 'movie' | 'tv' = item.media_type || (item.title ? 'movie' : 'tv');
    const itemId = `${mediaType}_${item.id}`;

    const newEntry: HistoryEntry = {
      id: itemId,
      mediaId: String(item.id),
      mediaType,
      title: getMediaTitle(item),
      posterPath: item.poster_path || null,
      viewedAt: new Date().toISOString(),
      userId: user ? user.uid : undefined,
    };

    if (user) {
      const docPath = `users/${user.uid}/history/${itemId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'history', itemId), {
          ...newEntry,
          userId: user.uid,
        });
      } catch (error) {
        // Silently catch history logging errors so UI isn't interrupted
        console.warn('History tracking error:', error);
      }
    } else {
      setHistory((prev) => [newEntry, ...prev.filter((i) => i.id !== itemId)].slice(0, 30));
    }
  };

  const clearLocalData = () => {
    localStorage.removeItem(LOCAL_STORAGE_WATCHLIST);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY);
    if (!user) {
      setWatchlist([]);
      setHistory([]);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        history,
        isInWatchlist,
        toggleWatchlist,
        removeFromWatchlist,
        addToHistory,
        clearLocalData,
        isCloudSynced: Boolean(user),
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
