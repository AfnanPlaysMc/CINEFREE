/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { MovieStreamSource, StreamServer } from '../lib/providers';

interface ServerSelectModalProps {
  stream: MovieStreamSource;
  onClose: () => void;
  onSelectServer: (server: StreamServer) => void;
}

export const ServerSelectModal: React.FC<ServerSelectModalProps> = ({
  stream,
  onClose,
  onSelectServer,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#14141d] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-white space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close server selector"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Select Streaming Player / Mirror
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
            {stream.title}
          </h2>
          <p className="text-xs text-zinc-400">
            Choose your preferred streaming server below. Each server provides full HD / 4K playback.
          </p>
        </div>

        {/* Server List */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
          {stream.servers.map((server, idx) => (
            <button
              key={server.id}
              onClick={() => onSelectServer(server)}
              className="w-full text-left p-4 rounded-2xl bg-[#1c1c28] hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/50 transition-all cursor-pointer group flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-none shadow-md">
                  <Server className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {server.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      {server.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{server.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md group-hover:bg-blue-700 transition-colors flex-none">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>Play</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Ad-Shield Protected Mirrors
          </span>
          <span>5 High-Speed Nodes Available</span>
        </div>
      </div>
    </div>
  );
};
