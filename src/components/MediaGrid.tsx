/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TMDBMediaItem } from '../lib/tmdb-types';
import { MovieCard } from './MovieCard';
import { CardSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

interface MediaGridProps {
  items: TMDBMediaItem[];
  loading?: boolean;
  onSelectItem: (item: TMDBMediaItem) => void;
  onPlayMovie?: (item: TMDBMediaItem) => void;
  onPlayTrailer?: (item: TMDBMediaItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionText?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  loading = false,
  onSelectItem,
  onPlayMovie,
  onPlayTrailer,
  emptyTitle,
  emptyDescription,
  onEmptyAction,
  emptyActionText,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onAction={onEmptyAction}
        actionText={emptyActionText}
      />
    );
  }

  const playHandler = onPlayMovie || onPlayTrailer;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {items.map((item) => (
        <MovieCard
          key={`${item.media_type || 'm'}_${item.id}`}
          item={item}
          onSelect={onSelectItem}
          onPlayMovie={playHandler}
        />
      ))}
    </div>
  );
};
