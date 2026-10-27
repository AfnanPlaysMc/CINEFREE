/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Server,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Tv,
  Maximize,
  Minimize2,
  X,
  Play,
  Info,
  Maximize2
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Server (defaults to VidLink HD)
  const [activeServerId, setActiveServerId] = useState<StreamServerId>(
    stream.defaultServerId || 'vidlink'
  );

  // TV Episode navigation state
  const [seasonNum, setSeasonNum] = useState<number>(stream.season || 1);
  const [episodeNum, setEpisodeNum] = useState<number>(stream.episode || 1);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // YouTube-style Miniplayer (floating dock in bottom-right)
  const [isMiniplayer, setIsMiniplayer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Find active server object
  const currentServer = stream.servers.find((s) => s.id === activeServerId) || stream.servers[0];

  // Dynamic embed URL calculation
  const getEmbedUrlForServer = (serverId: StreamServerId) => {
    const isMovie = stream.mediaType === 'movie';
    const id = stream.mediaId;

    switch (serverId) {
      case 'vidlink':
        return isMovie
          ? `https://vidlink.pro/movie/${id}?primaryColor=e50914&secondaryColor=121212&iconColor=ffffff`
          : `https://vidlink.pro/tv/${id}/${seasonNum}/${episodeNum}?primaryColor=e50914&secondaryColor=121212&iconColor=ffffff`;
      case 'vidsrc_icu':
        return isMovie
          ? `https://vidsrc.icu/embed/movie/${id}`
          : `https://vidsrc.icu/embed/tv/${id}/${seasonNum}/${episodeNum}`;
      case 'vidsrc_sh':
        return isMovie
          ? `https://vidsrc.sh/embed/movie?tmdb=${id}`
          : `https://vidsrc.sh/embed/tv?tmdb=${id}&sea=${seasonNum}&epi=${episodeNum}`;
      case 'twoembed':
        return isMovie
          ? `https://www.2embed.cc/embed/${id}`
          : `https://www.2embed.cc/embedtv/${id}&s=${seasonNum}&e=${episodeNum}`;
      case 'multiembed':
        return isMovie
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${seasonNum}&e=${episodeNum}`;
      case 'autoembed':
        return isMovie
          ? `https://player.autoembed.cc/embed/movie/${id}`
          : `https://player.autoembed.cc/embed/tv/${id}/${seasonNum}/${episodeNum}`;
      default:
        return '';
    }
  };

  const activeEmbedUrl = getEmbedUrlForServer(activeServerId);

  // Handle server change
  const handleServerChange = (serverId: StreamServerId) => {
    setActiveServerId(serverId);
    setIframeKey((prev) => prev + 1);
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  // YouTube-style Popout Window
  const handleOpenYouTubePopout = () => {
    const url = activeEmbedUrl;
    if (!url) return;

    const width = 1120;
    const height = 630;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    // Open dedicated YouTube-styled chromeless popup window
    const popoutWin = window.open(
      '',
      `cinefree_popout_${stream.mediaId}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );

    if (popoutWin) {
      popoutWin.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${stream.title} — CineFree Player</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                background: #0f0f0f;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                overflow: hidden;
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
              }
              header {
                height: 44px;
                background: #181818;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 14px;
                font-size: 13px;
                flex-none: 0;
              }
              .logo {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 800;
                color: #ffffff;
                text-decoration: none;
              }
              .logo-dot {
                width: 12px;
                height: 12px;
                background: #e50914;
                border-radius: 3px;
              }
              .title {
                color: #aaaaaa;
                font-size: 12px;
                margin-left: 10px;
                max-width: 400px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .servers {
                display: flex;
                align-items: center;
                gap: 6px;
              }
              .btn-server {
                background: rgba(255,255,255,0.08);
                color: #ffffff;
                border: 1px solid rgba(255,255,255,0.1);
                padding: 4px 10px;
                border-radius: 14px;
                font-size: 11px;
                cursor: pointer;
                transition: background 0.15s;
              }
              .btn-server.active {
                background: #e50914;
                border-color: #e50914;
                font-weight: bold;
              }
              .iframe-container {
                flex: 1;
                width: 100%;
                height: 100%;
                position: relative;
                background: #000000;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: 0;
                position: absolute;
                inset: 0;
              }
            </style>
          </head>
          <body>
            <header>
              <div style="display:flex; align-items:center;">
                <div class="logo">
                  <div class="logo-dot"></div>
                  <span>CINEFREE</span>
                </div>
                <span class="title">${stream.title}</span>
              </div>
              <div class="servers">
                <button class="btn-server active" onclick="location.reload()">Reload Player</button>
              </div>
            </header>
            <div class="iframe-container">
              <iframe
                src="${url}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowfullscreen
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          </body>
        </html>
      `);
      popoutWin.document.close();
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={
        isMiniplayer
          ? 'fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-black animate-in fade-in slide-in-from-bottom-6 duration-200'
          : isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 sm:p-4'
          : 'relative w-full aspect-video rounded-xl overflow-hidden bg-black'
      }
    >
      <div
        ref={containerRef}
        className={`relative w-full ${
          isMiniplayer
            ? 'aspect-video'
            : 'max-w-6xl aspect-video max-h-[88vh]'
        } bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col select-none group`}
      >
        {/* TOP SERVER SELECTOR BAR */}
        <div className="flex-none bg-[#111116] border-b border-white/10 px-3 py-2 z-30 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Server Switcher Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-wider mr-1 flex-none">
              <Server className="w-3.5 h-3.5 text-[#e50914]" /> Servers:
            </span>

            {stream.servers.map((srv) => {
              const isActive = srv.id === activeServerId;
              return (
                <button
                  key={srv.id}
                  onClick={() => handleServerChange(srv.id)}
                  title={srv.description}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5'
                  }`}
                >
                  {srv.name.replace(/^Server \d+:\s*/, '')}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions (Reload, Popout, YouTube Miniplayer, Close) */}
          <div className="flex items-center gap-1.5 flex-none ml-auto">
            <button
              onClick={handleReload}
              title="Reload current stream"
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* YouTube-style Pop-out Window Button */}
            <button
              onClick={handleOpenYouTubePopout}
              title="Open YouTube-style Pop-out Window (bypasses sandbox & ad blockers)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 transition-colors cursor-pointer text-[11px] font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Pop-out Player
            </button>

            {/* YouTube-style Miniplayer Toggle */}
            <button
              onClick={() => setIsMiniplayer(!isMiniplayer)}
              title={isMiniplayer ? 'Expand to Full Player' : 'Dock to YouTube-style Miniplayer'}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              {isMiniplayer ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {!isMiniplayer && (
              <button
                onClick={toggleFullscreen}
                title="Fullscreen"
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            )}

            {isModal && onClose && (
              <button
                onClick={onClose}
                aria-label="Close Player"
                className="p-1.5 rounded-md bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* TV SHOW SEASON & EPISODE SELECTOR BAR */}
        {stream.mediaType === 'tv' && (
          <div className="flex-none bg-[#14141d] border-b border-white/5 px-3 py-1.5 z-20 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-white text-[11px]">
                <Tv className="w-3.5 h-3.5 text-[#e50914]" /> {stream.title}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[11px]">Season:</span>
                <select
                  value={seasonNum}
                  onChange={(e) => {
                    setSeasonNum(Number(e.target.value));
                    setEpisodeNum(1);
                    setIframeKey((k) => k + 1);
                  }}
                  className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs text-white cursor-pointer focus:outline-none focus:border-[#e50914]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s} className="bg-[#141419] text-white">
                      Season {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[11px]">Episode:</span>
                <select
                  value={episodeNum}
                  onChange={(e) => {
                    setEpisodeNum(Number(e.target.value));
                    setIframeKey((k) => k + 1);
                  }}
                  className="bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs text-white cursor-pointer focus:outline-none focus:border-[#e50914]"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((ep) => (
                    <option key={ep} value={ep} className="bg-[#141419] text-white">
                      Ep {ep}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={episodeNum <= 1}
                onClick={() => {
                  setEpisodeNum((e) => Math.max(1, e - 1));
                  setIframeKey((k) => k + 1);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-0.5"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <button
                onClick={() => {
                  setEpisodeNum((e) => e + 1);
                  setIframeKey((k) => k + 1);
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-0.5"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* MAIN VIDEO PLAYBACK IFRAME (NO RESTRICTIVE SANDBOX ATTRIBUTE) */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <iframe
            key={`${activeServerId}-${seasonNum}-${episodeNum}-${iframeKey}`}
            src={activeEmbedUrl}
            title={stream.title}
            className="w-full h-full border-0 absolute inset-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
          />

          {/* Persistent Watermark Badge */}
          <div className="absolute top-3 right-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            <span className="text-[10px] font-black tracking-wider text-white uppercase">CINEFREE HD</span>
          </div>

          {/* Clean Tips Overlay (Auto-fades) */}
          <div className="absolute bottom-2 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400">
            <Info className="w-3 h-3 text-[#e50914]" />
            <span>If stream buffers or fails, switch to another Server or click <strong>Pop-out Player</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
