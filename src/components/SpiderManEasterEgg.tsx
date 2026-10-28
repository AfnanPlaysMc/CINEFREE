/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface SpiderManEasterEggProps {
  title?: string;
}

export const SPIDER_IMAGE_URL = 'https://raw.githubusercontent.com/AfnanPlaysMc/GAME/main/spider-top-view-2d-illustration-vector-removebg-preview.png';

export const SpiderManEasterEgg: React.FC<SpiderManEasterEggProps> = ({ title }) => {
  const [active, setActive] = useState(false);
  const [randomXPos, setRandomXPos] = useState(50); // percentage

  useEffect(() => {
    if (!title) {
      setActive(false);
      return;
    }

    const normalized = title.toLowerCase();
    const isSpiderMan =
      normalized.includes('spider-man') ||
      normalized.includes('spiderman') ||
      normalized.includes('spider man') ||
      normalized.includes('spider-verse') ||
      normalized.includes('spiderverse') ||
      normalized.includes('far from home') ||
      normalized.includes('no way home') ||
      normalized.includes('homecoming') ||
      normalized.includes('spider');

    if (isSpiderMan) {
      // Pick random top horizontal X position between 15% and 80%
      const newX = Math.floor(Math.random() * 65) + 15;
      setRandomXPos(newX);
      setActive(true);

      const timer = setTimeout(() => {
        setActive(false);
      }, 7200);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [title]);

  if (!active) return null;

  return (
    <div
      className="fixed top-0 z-50 pointer-events-none flex flex-col items-center animate-spider transition-all duration-300"
      style={{ left: `${randomXPos}%`, transform: 'translateX(-50%)' }}
    >
      {/* Spider Web Silk Thread */}
      <div className="w-0.5 h-72 bg-gradient-to-b from-white/90 via-zinc-200/70 to-white/90 shadow-[0_0_10px_rgba(255,255,255,0.9)]" />

      {/* Spider Illustration Image */}
      <div className="relative w-24 h-24 -mt-2 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(229,9,20,0.8)]">
        <img
          src={SPIDER_IMAGE_URL}
          alt="Spider-Man Easter Egg"
          className="w-full h-full object-contain transform rotate-180 animate-pulse"
        />
      </div>

      {/* Spider-Man Banner Tag */}
      <div className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-blue-600 to-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xl border border-white/30">
        🕷️ Spider-Sense Triggered!
      </div>
    </div>
  );
};
