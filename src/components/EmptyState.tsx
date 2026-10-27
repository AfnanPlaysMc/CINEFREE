/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, AlertCircle, RefreshCw, Bookmark } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'watchlist' | 'error' | 'generic';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionText,
  onAction,
}) => {
  let icon = <Film className="w-12 h-12 text-zinc-500" />;
  let defaultTitle = 'No titles found';
  let defaultDesc = 'Try adjusting your search terms or filters to find movies and TV shows.';

  if (type === 'watchlist') {
    icon = <Bookmark className="w-12 h-12 text-zinc-500" />;
    defaultTitle = 'Your watchlist is empty';
    defaultDesc = 'Explore movies and TV shows to add them to your personal watchlist.';
  } else if (type === 'error') {
    icon = <AlertCircle className="w-12 h-12 text-red-500" />;
    defaultTitle = 'Unable to load content';
    defaultDesc = 'An error occurred while fetching information from the upstream movie database.';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-[#141419]/60 border border-white/5 my-8">
      <div className="p-4 rounded-full bg-[#1c1c24] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title || defaultTitle}</h3>
      <p className="text-zinc-400 max-w-md text-sm mb-6 leading-relaxed">
        {description || defaultDesc}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e50914] text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 text-sm cursor-pointer"
        >
          {type === 'error' && <RefreshCw className="w-4 h-4" />}
          {actionText}
        </button>
      )}
    </div>
  );
};
