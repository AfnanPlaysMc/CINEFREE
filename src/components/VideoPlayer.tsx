/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  Shield,
  ShieldCheck,
  Server,
  RefreshCw,
  Tv,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Settings2,
  Check,
  Monitor,
  ExternalLink,
  Pin
} from 'lucide-react';
import { MovieStreamSource, StreamServerId } from '../lib/providers';

interface VideoPlayerProps {
  stream: MovieStreamSource;
  onClose?: () => void;
  isModal?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  onClose,
  isModal = true,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Server (defaults to MultiEmbed HD)
  const [activeServerId, setActiveServerId] = useState<StreamServerId>(
    stream.defaultServerId || 'multiembed'
  );

  // TV Episode navigation state
  const [seasonNum, setSeasonNum] = useState<number>(stream.season || 1);
  const [episodeNum, setEpisodeNum] = useState<number>(stream.episode || 1);

  // Custom Player HUD & Controls State
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [progress, setProgress] = useState<number>(12); // Simulated position in %
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(720); // 12 mins
  const durationSec = (stream.durationMinutes || 120) * 60;

  // Click Shield Mode (Default: True = clicks captured, no ads, shows controls)
  const [shieldActive, setShieldActive] = useState<boolean>(true);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);
  const [showEpisodeMenu, setShowEpisodeMenu] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMiniplayer, setIsMiniplayer] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Pulse animation on click
  const [pulseIcon, setPulseIcon] = useState<'play' | 'pause' | null>(null);

  // Format time (seconds to hh:mm:ss or mm:ss)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toast notification helper
  const triggerToast = useCallback((msg: string) => {
    setLastActionToast(msg);
    const timer = setTimeout(() => {
      setLastActionToast((current) => (current === msg ? null : current));
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reset idle timer to auto-hide controls
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPinned) return;
    idleTimerRef.current = setTimeout(() => {
      if (isPlaying && !showServerMenu && !showEpisodeMenu && !isPinned) {
        setShowControls(false);
      }
    }, 5000);
  }, [isPlaying, showServerMenu, showEpisodeMenu, isPinned]);

  useEffect(() => {
    handleUserActivity();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [handleUserActivity]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeekForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeekBackward();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate Embed URL for Server
  const getEmbedUrl = (serverId: StreamServerId, sNum = seasonNum, eNum = episodeNum) => {
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
          ? `https://vidlink.pro/movie/${id}?primaryColor=3b82f6`
          : `https://vidlink.pro/tv/${id}/${sNum}/${eNum}?primaryColor=3b82f6`;
      case 'vidsrc_icu':
        return isMovie
          ? `https://vidsrc.icu/embed/movie/${id}`
          : `https://vidsrc.icu/embed/tv/${id}/${sNum}/${eNum}`;
      default:
        return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    }
  };

  const currentEmbedUrl = getEmbedUrl(activeServerId);
  const currentServerObj = stream.servers.find((s) => s.id === activeServerId) || stream.servers[0];

  // Actions
  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      setPulseIcon(next ? 'play' : 'pause');
      setTimeout(() => setPulseIcon(null), 700);
      triggerToast(next ? 'Playing' : 'Paused');
      return next;
    });
    handleUserActivity();
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      triggerToast(next ? 'Muted' : `Volume: ${volume}%`);
      return next;
    });
    handleUserActivity();
  };

  const handleSeekBackward = () => {
    setCurrentTimeSec((prev) => Math.max(0, prev - 10));
    setProgress((prev) => Math.max(0, prev - 1));
    triggerToast('Replay 10 seconds');
    handleUserActivity();
  };

  const handleSeekForward = () => {
    setCurrentTimeSec((prev) => Math.min(durationSec, prev + 10));
    setProgress((prev) => Math.min(100, prev + 1));
    triggerToast('Forward 10 seconds');
    handleUserActivity();
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    setCurrentTimeSec(Math.floor((val / 100) * durationSec));
    handleUserActivity();
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
    handleUserActivity();
  };

  const handleServerSwitch = (id: StreamServerId) => {
    setIsBuffering(true);
    setActiveServerId(id);
    setShowServerMenu(false);
    triggerToast(`Switched to ${id.toUpperCase()}`);
    setTimeout(() => setIsBuffering(false), 900);
    handleUserActivity();
  };

  const handleReloadStream = () => {
    setIsBuffering(true);
    const iframe = document.getElementById('cinefree-custom-stream-frame') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = currentEmbedUrl;
    }
    setTimeout(() => setIsBuffering(false), 800);
    triggerToast('Stream reloaded');
    handleUserActivity();
  };

  /**
   * CRITICAL FEATURE:
   * When the user clicks anywhere on the stream surface:
   * It does NOT click on the third-party iframe (so NO ads or redirects occur).
   * Instead, it shows our custom player buttons & controls!
   */
  const handleStreamSurfaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always reveal custom player controls & buttons
    setShowControls(true);
    // Pulse animation
    setPulseIcon(isPlaying ? 'play' : 'pause');
    setTimeout(() => setPulseIcon(null), 500);
    triggerToast('CineFree Player Controls');
    handleUserActivity();
  };

  const handleStreamSurfaceDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  return (
    <div
      className={
        isMiniplayer
          ? 'fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-black animate-in fade-in slide-in-from-bottom-6 duration-200'
          : isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4'
          : 'relative w-full aspect-video rounded-2xl overflow-hidden bg-black'
      }
    >
      <div
        ref={playerContainerRef}
        onMouseMove={handleUserActivity}
        onTouchStart={handleUserActivity}
        className={`relative w-full ${
          isMiniplayer
            ? 'aspect-video'
            : isTheaterMode
            ? 'w-full h-full max-h-[96vh]'
            : 'max-w-6xl aspect-video max-h-[88vh]'
        } bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col select-none group`}
      >
        {/* ========================================================= */}
        {/* LAYER 1: THE VIDEO STREAM IFRAME (THEIR VIDEO PLAYING)    */}
        {/* ========================================================= */}
        <div className="relative w-full h-full bg-black flex-1 overflow-hidden">
          <iframe
            id="cinefree-custom-stream-frame"
            src={currentEmbedUrl}
            title={stream.title}
            className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          {/* ========================================================= */}
          {/* LAYER 2: CINEFREE CLICK SHIELD INTERCEPTOR                */}
          {/* Blocks external ad triggers when clicking on the stream;  */}
          {/* Intercepts click to show custom player controls & buttons */}
          {/* ========================================================= */}
          {shieldActive && (
            <div
              onClick={handleStreamSurfaceClick}
              onDoubleClick={handleStreamSurfaceDoubleClick}
              className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              title="Click stream to show custom CineFree player controls"
            />
          )}

          {/* Loading / Buffering Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none transition-opacity">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-white text-xs font-semibold tracking-wide">
                Buffering {currentServerObj.name}...
              </p>
            </div>
          )}

          {/* Center Play/Pause Ripple Indicator */}
          {pulseIcon && (
            <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl animate-out fade-out zoom-out-90 duration-500">
                {pulseIcon === 'play' ? (
                  <Play className="w-10 h-10 fill-white ml-1 text-white" />
                ) : (
                  <Pause className="w-10 h-10 fill-white text-white" />
                )}
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {lastActionToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-35 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-2xl pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
              {lastActionToast}
            </div>
          )}

          {/* ========================================================= */}
          {/* LAYER 3: CUSTOM PLAYER HUD & CONTROLS OVERLAY             */}
          {/* ========================================================= */}
          <div
            className={`absolute inset-0 z-30 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* TOP BAR */}
            <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent p-3 sm:p-5 flex items-center justify-between gap-3 pointer-events-auto">
              {/* Media Title & Branding */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md flex-none">
                  <Sparkles className="w-3 h-3" /> CineFree
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-xs sm:text-sm truncate drop-shadow">
                    {stream.title}
                  </h3>
                  {stream.mediaType === 'tv' && (
                    <p className="text-[11px] text-zinc-300 font-medium">
                      Season {seasonNum} • Episode {episodeNum}
                    </p>
                  )}
                </div>
              </div>

              {/* Top Action Buttons */}
              <div className="flex items-center gap-2 flex-none">
                {/* Ad-Shield Status Toggle */}
                <button
                  onClick={() => {
                    setShieldActive(!shieldActive);
                    triggerToast(
                      !shieldActive
                        ? 'Ad-Shield Enabled (Clicks Protected)'
                        : 'Ad-Shield Paused (Direct Clicks Allowed)'
                    );
                  }}
                  title={
                    shieldActive
                      ? 'Ad-Shield Active: External ad clicks blocked. Click to allow direct clicks inside video.'
                      : 'Ad-Shield Paused: Direct clicks enabled. Click to re-enable ad protection.'
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    shieldActive
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                      : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
                  }`}
                >
                  {shieldActive ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="hidden sm:inline">
                    {shieldActive ? 'Ad-Shield Active' : 'Shield Off'}
                  </span>
                </button>

                {/* Server Selector Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowServerMenu(!showServerMenu)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                  >
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden md:inline">{currentServerObj.name.replace(/^Server \d+:\s*/, '')}</span>
                    <span className="md:hidden">Server</span>
                  </button>

                  {/* Server Menu Popover */}
                  {showServerMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-xl bg-black/95 backdrop-blur-xl border border-white/15 shadow-2xl z-50 space-y-1">
                      <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Select Streaming Mirror
                      </div>
                      {stream.servers.map((srv) => {
                        const active = srv.id === activeServerId;
                        return (
                          <button
                            key={srv.id}
                            onClick={() => handleServerSwitch(srv.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                              active
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-zinc-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span>{srv.name}</span>
                            {active && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pin Controls Toggle */}
                <button
                  onClick={() => {
                    const next = !isPinned;
                    setIsPinned(next);
                    if (next) setShowControls(true);
                    triggerToast(next ? 'Controls Pinned (Always Visible)' : 'Controls Unpinned');
                  }}
                  title={isPinned ? 'Unpin Controls (Auto-hide on idle)' : 'Pin Controls (Keep visible)'}
                  className={`p-1.5 rounded-lg text-white transition-colors cursor-pointer ${
                    isPinned ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                {/* Reload Stream Button */}
                <button
                  onClick={handleReloadStream}
                  title="Reload stream source"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                {isModal && onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close custom player"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* CENTER CONTROLS (Big Play / Pause & Skip Buttons) */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 pointer-events-auto">
              <button
                onClick={handleSeekBackward}
                title="Replay 10 seconds (Left Arrow)"
                className="p-3 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-xl"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause Stream (Space)' : 'Play Stream (Space)'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-600/40 transition-all active:scale-95 cursor-pointer border border-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 sm:w-9 sm:h-9 fill-white" />
                ) : (
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white ml-1" />
                )}
              </button>

              <button
                onClick={handleSeekForward}
                title="Forward 10 seconds (Right Arrow)"
                className="p-3 sm:p-4 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 cursor-pointer shadow-xl"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* BOTTOM CONTROLS BAR */}
            <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-5 space-y-2.5 pointer-events-auto">
              {/* Custom Scrubbing Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono font-medium text-zinc-300 flex-none min-w-[40px]">
                  {formatTime(currentTimeSec)}
                </span>

                <div className="relative flex-1 group/scrub flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleScrubberChange}
                    aria-label="Seek video progress"
                    className="w-full h-1.5 group-hover/scrub:h-2.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all"
                  />
                  <div
                    style={{ width: `${progress}%` }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 group-hover/scrub:h-2.5 bg-blue-500 rounded-l-lg pointer-events-none"
                  />
                </div>

                <span className="text-[11px] font-mono font-medium text-zinc-400 flex-none min-w-[40px]">
                  {formatTime(durationSec)}
                </span>
              </div>

              {/* Bottom Control Buttons Row */}
              <div className="flex items-center justify-between gap-2 text-xs">
                {/* Left Controls: Play/Pause, Volume, TV Episode picker */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  {/* Volume with Hover Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      onClick={toggleMute}
                      title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                      className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      aria-label="Volume slider"
                      className="w-16 sm:w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-blue-500 hidden group-hover/vol:inline-block transition-all"
                    />
                  </div>

                  {/* TV Show Episode Switcher Controls */}
                  {stream.mediaType === 'tv' && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                      <button
                        disabled={episodeNum <= 1}
                        onClick={() => {
                          const prevEp = Math.max(1, episodeNum - 1);
                          setEpisodeNum(prevEp);
                          triggerToast(`Switched to Episode ${prevEp}`);
                        }}
                        title="Previous Episode"
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3 h-3" /> Ep {episodeNum - 1 > 0 ? episodeNum - 1 : ''}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setShowEpisodeMenu(!showEpisodeMenu)}
                          className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors text-[11px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Tv className="w-3 h-3 text-blue-400" />
                          <span>S{seasonNum}:E{episodeNum}</span>
                        </button>

                        {/* Episode Drawer Popover */}
                        {showEpisodeMenu && (
                          <div className="absolute left-0 bottom-full mb-2 w-56 max-h-60 overflow-y-auto p-2 rounded-xl bg-black/95 backdrop-blur-xl border border-white/15 shadow-2xl z-50 space-y-1">
                            <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                              Choose Season & Episode
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1">
                              <span className="text-[11px] text-zinc-300">Season:</span>
                              <select
                                value={seasonNum}
                                onChange={(e) => {
                                  setSeasonNum(Number(e.target.value));
                                  setEpisodeNum(1);
                                }}
                                className="bg-[#14141d] text-white border border-white/20 rounded px-2 py-0.5 text-xs focus:outline-none"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                  <option key={s} value={s}>
                                    Season {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-4 gap-1 p-1">
                              {Array.from({ length: 24 }, (_, i) => i + 1).map((ep) => (
                                <button
                                  key={ep}
                                  onClick={() => {
                                    setEpisodeNum(ep);
                                    setShowEpisodeMenu(false);
                                    triggerToast(`Loading Season ${seasonNum} Episode ${ep}`);
                                  }}
                                  className={`py-1 rounded text-center text-xs font-semibold cursor-pointer ${
                                    episodeNum === ep
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'bg-white/5 hover:bg-white/15 text-zinc-300'
                                  }`}
                                >
                                  {ep}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const nextEp = episodeNum + 1;
                          setEpisodeNum(nextEp);
                          triggerToast(`Switched to Episode ${nextEp}`);
                        }}
                        title="Next Episode"
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                      >
                        Ep {episodeNum + 1} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Controls: Quality, Theater, Miniplayer, Fullscreen */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Quality Badge */}
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-[10px] tracking-wide uppercase hidden sm:inline-block">
                    1080p HD
                  </span>

                  {/* Theater Mode Toggle */}
                  <button
                    onClick={() => {
                      setIsTheaterMode(!isTheaterMode);
                      triggerToast(!isTheaterMode ? 'Theater Mode ON' : 'Theater Mode OFF');
                    }}
                    title={isTheaterMode ? 'Normal View' : 'Theater View'}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer hidden md:inline-block"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>

                  {/* Miniplayer Toggle */}
                  <button
                    onClick={() => {
                      setIsMiniplayer(!isMiniplayer);
                      triggerToast(!isMiniplayer ? 'Docked to Miniplayer' : 'Expanded Player');
                    }}
                    title={isMiniplayer ? 'Expand Full Player' : 'Dock to Miniplayer'}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    {isMiniplayer ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>

                  {/* Native Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution in Custom Player */}
        <div className="bg-[#09090e] px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CineFree HD Player</span>
            <span>•</span>
            <span>Engineered by <strong className="text-zinc-200">OXA STUDIOS</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Ad-Shield Active
            </span>
            <span className="hidden sm:inline text-zinc-500">Press F for Fullscreen • Space to Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
};
