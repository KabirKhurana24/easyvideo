"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Volume2, Grid3X3, CheckCircle } from "lucide-react";
import { SEEDED_SCENES } from "@/lib/data/seededProject";

interface OriginalVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatVideoTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function OriginalVideoModal({ isOpen, onClose }: OriginalVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalVideoDuration = 272; // 04:32 in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalVideoDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current active scene based on time
  const sceneDuration = totalVideoDuration / SEEDED_SCENES.length;
  const currentSceneIndex = Math.min(
    SEEDED_SCENES.length - 1,
    Math.floor(currentTime / sceneDuration)
  );
  const activeScene = SEEDED_SCENES[currentSceneIndex];

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const progressPercent = Math.min(100, (currentTime / totalVideoDuration) * 100);

  return (
    <div
      className="fixed inset-0 bg-[#0d1627]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
                ORIGINAL BASELINE RELEASE · V1.0
              </span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Published Aug 18, 2026
              </span>
            </div>
            <h2 className="font-heading font-bold text-lg text-slate-800 tracking-tight mt-0.5">
              Remote Work Essentials
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4f5f8] text-[#778296] hover:bg-[#e7e9ef] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Screen */}
        <div className="p-6">
          <div className="rounded-xl overflow-hidden bg-[#131d2e] shadow-inner">
            <div className="h-64 relative overflow-hidden bg-gradient-to-br from-[#bccfe6] via-[#8299bc] to-[#516b94] p-6 flex flex-col justify-between">
              {/* Top Watermark & Scene Title */}
              <div className="flex justify-between items-center text-white text-[10px] font-bold tracking-wider z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>NORTHSTAR TRAINING</span>
                </div>
                <div className="bg-black/40 px-2 py-0.5 rounded text-[9px] font-mono">
                  SCENE {activeScene.number} / 12 · {activeScene.title.toUpperCase()}
                </div>
              </div>

              {/* Storyboard composition center */}
              <div className="my-auto flex flex-col items-center justify-center text-center text-white px-6">
                <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold mb-1">
                  {activeScene.area}
                </span>
                <h3 className="font-heading font-extrabold text-2xl drop-shadow-md mb-2">
                  {activeScene.headline}
                </h3>
                <p className="text-xs text-white/90 max-w-md bg-black/40 backdrop-blur-xs p-2.5 rounded-lg border border-white/10 shadow-sm leading-relaxed">
                  “{activeScene.script}”
                </p>
              </div>

              {/* Bottom Scrubber & Controls */}
              <div className="relative z-10 -mx-6 -mb-6 mt-auto h-12 bg-[#0c1422]/90 backdrop-blur-md text-white flex items-center gap-3 px-4 text-xs">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  className="text-white/70 hover:text-white p-1"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Scrubber bar */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    handleSeek(Math.floor(ratio * totalVideoDuration));
                  }}
                  className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group"
                >
                  <div
                    className="h-full bg-purple rounded-full transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="font-mono text-[10px] text-white/80 shrink-0">
                  {formatVideoTime(currentTime)} / {formatVideoTime(totalVideoDuration)}
                </div>
              </div>
            </div>
          </div>

          {/* Scene Chapter Rail */}
          <div className="mt-4">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>Scene Chapters (12 Scenes)</span>
              <span className="text-[9px] text-purple">Click any chapter to jump</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-28 overflow-y-auto pr-1">
              {SEEDED_SCENES.map((s, idx) => {
                const isActive = idx === currentSceneIndex;
                const isAffected = s.isAffected;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSeek(idx * sceneDuration)}
                    className={`p-1.5 rounded-lg text-left border text-[10px] transition-all ${
                      isActive
                        ? "border-purple bg-purple-soft text-purple font-bold shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>#{s.number}</span>
                      {isAffected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Updated in v1.1" />
                      )}
                    </div>
                    <div className="truncate font-medium">{s.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#9ba4b1] text-center mt-3 pt-3 border-t border-slate-100">
            Original training video (v1.0) published August 18, 2026. Only Scenes 03, 07, and 09 are modified in v1.1.
          </div>
        </div>
      </div>
    </div>
  );
}
