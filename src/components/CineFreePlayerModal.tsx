/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Download,
  Moon,
  Sun,
  Clock,
  Server,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { MovieStreamSource, StreamServerId, getDownloadServerUrl } from '../lib/providers';

interface CineFreePlayerModalProps {
  stream: MovieStreamSource;
  onClose: () => void;
}

export const CineFreePlayerModal: React.FC<CineFreePlayerModalProps> = ({
  stream,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Server
  const [activeServerId, setActiveServerId] = useState<StreamServerId>(stream.defaultServerId || 'multiembed');
  
  // TV Episode navigation
  const [season, setSeason] = useState<number>(stream.season || 1);
  const [episode, setEpisode] = useState<number>(stream.episode || 1);

  // Player Utilities
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLightsDimmed, setIsLightsDimmed] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepSecondsRemaining, setSleepSecondsRemaining] = useState<number | null>(null);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [showServerSwitcher, setShowServerSwitcher] = useState<boolean>(false);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepSecondsRemaining === null) return;
    if (sleepSecondsRemaining <= 0) {
      onClose();
      return;
    }
    const timer = setInterval(() => {
      setSleepSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sleepSecondsRemaining, onClose]);

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepSecondsRemaining(null);
    } else {
      setSleepSecondsRemaining(minutes * 60);
    }
  };

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut: Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute embed URL for current server and season/episode
  const computeEmbedUrl = (serverId: StreamServerId, sNum: number, eNum: number): string => {
    const isMovie = stream.mediaType === 'movie';
    const id = stream.mediaId;

    switch (serverId) {
      case 'multiembed':
        return isMovie
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${sNum}&e=${eNum}`;
      case 'twoembed':
        return isMovie
          ? `https://www.2embed.cc/embed/${id}`
          : `https://www.2embed.cc/embedtv/${id}&s=${sNum}&e=${eNum}`;
      case 'vidsrc_sh':
        return isMovie
          ? `https://vidsrc.sh/embed/movie?tmdb=${id}`
          : `https://vidsrc.sh/embed/tv?tmdb=${id}&sea=${sNum}&epi=${eNum}`;
      case 'vidlink':
        return isMovie
          ? `https://vidlink.pro/movie/${id}?primaryColor=2563eb`
          : `https://vidlink.pro/tv/${id}/${sNum}/${eNum}?primaryColor=2563eb`;
      case 'vidsrc_icu':
        return isMovie
          ? `https://vidsrc.icu/embed/movie/${id}`
          : `https://vidsrc.icu/embed/tv/${id}/${sNum}/${eNum}`;
      default:
        return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    }
  };

  const currentEmbedUrl = computeEmbedUrl(activeServerId, season, episode);

  const handleReload = () => {
    setIsReloading(true);
    setIframeKey(Date.now());
    setTimeout(() => setIsReloading(false), 600);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleOpenMobileTab = () => {
    // Open clean native tab without window dimensions constraint so mobile handles player controls natively
    window.open(currentEmbedUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadUrl = getDownloadServerUrl(stream.mediaId, stream.mediaType, '1080p', season, episode);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-colors duration-300 ${
        isLightsDimmed ? 'bg-black' : 'bg-black/90 backdrop-blur-md'
      }`}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl bg-[#090d1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-white/10 bg-[#0c1020] gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-none" />
            <h3 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
              {stream.title}
              {stream.mediaType === 'tv' && (
                <span className="text-blue-400 font-normal ml-2">
                  (Season {season}, Episode {episode})
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-none">
            {/* Lights dim toggle */}
            <button
              onClick={() => setIsLightsDimmed(!isLightsDimmed)}
              title={isLightsDimmed ? 'Restore lights' : 'Cinema lights off'}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              {isLightsDimmed ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="hidden md:inline">{isLightsDimmed ? 'Lights On' : 'Dim Lights'}</span>
            </button>

            {/* Sleep Timer */}
            <div className="relative group">
              <button
                className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  sleepSecondsRemaining !== null
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                }`}
                title="Auto Sleep Timer"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sleepSecondsRemaining !== null ? formatTimer(sleepSecondsRemaining) : 'Sleep'}
                </span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#141829] border border-white/10 rounded-xl p-1.5 shadow-xl hidden group-hover:flex group-focus-within:flex flex-col gap-1 z-50 text-xs">
                <div className="text-[10px] text-zinc-400 px-2 py-1 font-semibold uppercase tracking-wider">
                  Sleep Timer
                </div>
                {[15, 30, 45, 60, 90].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSetSleepTimer(m)}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      sleepTimerMinutes === m
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-white/10 text-zinc-300'
                    }`}
                  >
                    {m} Minutes
                  </button>
                ))}
                {sleepTimerMinutes !== null && (
                  <button
                    onClick={() => handleSetSleepTimer(null)}
                    className="text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Turn Off Timer
                  </button>
                )}
              </div>
            </div>

            {/* Reload Stream */}
            <button
              onClick={handleReload}
              title="Reload stream / unfreeze"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Reload</span>
            </button>

            {/* Mobile Native Clean Tab */}
            <button
              onClick={handleOpenMobileTab}
              title="Open full native stream tab"
              className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Open Clean Tab</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="Close player"
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Display Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <iframe
            key={iframeKey}
            src={currentEmbedUrl}
            title={stream.title}
            className="w-full h-full border-0 select-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Mobile & Desktop Control Bar (Below Video) */}
        <div className="px-3 sm:px-6 py-3 bg-[#0a0e1c] border-t border-white/10 flex flex-col gap-3">
          {/* Server Switcher Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                Stream Mirror:
              </span>
            </div>

            {/* Responsive Server Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {stream.servers.map((server) => {
                const isActive = activeServerId === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => setActiveServerId(server.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{server.name.replace(/Server \d+: /, '')}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TV Shows Season / Episode Controller */}
          {stream.mediaType === 'tv' && (
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <span>TV Controls:</span>
                <span className="text-white font-bold">
                  Season {season} · Episode {episode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={episode <= 1}
                  onClick={() => setEpisode((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Episode
                </button>
                <button
                  onClick={() => setEpisode((prev) => prev + 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Next Episode <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Controller & Assistance Guidance Bar */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Multi-Mirror Redundancy
              </span>
              <span>·</span>
              <span className="hidden sm:inline">If buffering or audio issues occur on mobile, switch to Server 2 or 3.</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Direct Server Download Link */}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Offline Download Link</span>
              </a>

              {/* Direct clean tab for mobile */}
              <button
                onClick={handleOpenMobileTab}
                className="flex sm:hidden items-center gap-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mobile Fullscreen Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
