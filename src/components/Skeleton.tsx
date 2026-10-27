/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="flex-none w-36 sm:w-44 md:w-52 animate-pulse">
    <div className="aspect-[2/3] w-full rounded-md bg-[#1c1c24] border border-white/5" />
    <div className="mt-2 h-4 w-3/4 rounded bg-[#1c1c24]" />
    <div className="mt-1 h-3 w-1/2 rounded bg-[#1c1c24]" />
  </div>
);

export const RowSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading content...' }) => (
  <div className="my-6 px-4 md:px-10">
    <div className="mb-3 h-6 w-48 rounded bg-[#1c1c24] animate-pulse" />
    <div className="flex gap-3 sm:gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative w-full h-[65vh] min-h-[480px] bg-[#141419] animate-pulse flex items-end p-6 md:p-16">
    <div className="w-full max-w-2xl space-y-4">
      <div className="h-6 w-24 rounded bg-[#1c1c24]" />
      <div className="h-10 md:h-14 w-3/4 rounded bg-[#1c1c24]" />
      <div className="h-4 w-full rounded bg-[#1c1c24]" />
      <div className="h-4 w-5/6 rounded bg-[#1c1c24]" />
      <div className="flex gap-3 pt-2">
        <div className="h-11 w-36 rounded-md bg-[#1c1c24]" />
        <div className="h-11 w-32 rounded-md bg-[#1c1c24]" />
      </div>
    </div>
  </div>
);
