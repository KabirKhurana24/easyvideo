"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, RotateCcw, Check, Sparkles, Volume2, Save } from "lucide-react";
import { Scene, DetectedChange } from "@/types";

interface SceneEditorModalProps {
  scene: Scene | null;
  change?: DetectedChange;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (headline: string, script: string, visual?: string) => void;
  onReject: () => void;
  onRegenerate: (sceneId: number) => Promise<{ headline: string; narration: string; visualDescription: string } | null>;
  onSaveDirectScene?: (sceneId: number, headline: string, script: string, visual?: string) => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SceneEditorModal({
  scene,
  change,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onRegenerate,
  onSaveDirectScene,
}: SceneEditorModalProps) {
  const [headline, setHeadline] = useState("");
  const [script, setScript] = useState("");
  const [visual, setVisual] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scene) {
      setHeadline(change?.userHeadline || change?.newHeadline || scene.suggestedHeadline || scene.headline);
      setScript(change?.userScript || change?.newText || scene.suggestedScript || scene.script);
      setVisual(change?.suggestedVisual || scene.suggestedVisual || scene.visualDescription);
    }
  }, [scene, change]);

  // Clean up audio when modal closes or unmounts
  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlaybackSeconds(0);
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  if (!isOpen || !scene) return null;

  const totalDuration = scene.durationSeconds || 22;

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const result = await onRegenerate(scene.id);
      if (result) {
        setHeadline(result.headline);
        setScript(result.narration);
        setVisual(result.visualDescription);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSpeakAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setPlaybackSeconds(0);
      progressTimerRef.current = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= totalDuration) {
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    };

    utterance.onend = () => {
      stopAudio();
    };

    utterance.onerror = () => {
      stopAudio();
    };

    window.speechSynthesis.speak(utterance);
  };

  const isChangedScene = !!change;
  const progressPercent = Math.min(100, Math.round((playbackSeconds / totalDuration) * 100));

  const handleCloseModal = () => {
    stopAudio();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-[#0d1627]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
                SCENE EDITOR · SCENE {scene.number}
              </span>
              <span
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isChangedScene
                    ? "bg-purple-soft text-purple border border-purple/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isChangedScene ? "Detected Change" : "Preserved Scene"}
              </span>
            </div>
            <h2 className="font-heading font-bold text-lg text-slate-800 tracking-tight mt-0.5">
              {scene.title}
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-7 h-7 rounded-full bg-[#f4f5f8] text-[#778296] hover:bg-[#e7e9ef] flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Storyboard Visual Preview Screen */}
          <div className="rounded-xl overflow-hidden bg-[#1b2a42] p-4 shadow-sm">
            <div className="h-44 relative overflow-hidden rounded-lg bg-gradient-to-br from-[#afc3df] via-[#8095bd] to-[#657da8] p-4 flex flex-col justify-between">
              <div className="flex justify-between text-white text-[9px] font-bold tracking-wider z-10">
                <span>REMOTE WORK ESSENTIALS</span>
                <span className="opacity-70">
                  SCENE {scene.number} / 12
                </span>
              </div>

              {/* Storyboard Composition */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 pointer-events-none px-4">
                <div className="w-36 h-24 rounded-lg bg-white/95 shadow-lg p-2.5 flex flex-col shrink-0">
                  <div className="flex gap-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-11 rounded-t-xl bg-[#5a6d91] relative flex items-center justify-center">
                      <span className="w-4 h-4 rounded-full bg-[#d6a68e] absolute -top-2" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className="h-1.5 w-11/12 bg-slate-200 rounded" />
                      <span className="h-1.5 w-9/12 bg-slate-200 rounded" />
                      <span className="h-1.5 w-10/12 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>

                <div className="max-w-[220px] text-white">
                  <p className="font-heading font-bold text-base leading-snug drop-shadow-md">
                    {headline || "Updated training content"}
                  </p>
                  <small className="block text-[10px] text-white/80 mt-1 line-clamp-2">
                    {visual || scene.visualDescription}
                  </small>
                </div>
              </div>

              {/* Storyboard Video Controls Bar */}
              <div className="relative z-10 -mx-4 -mb-4 mt-auto h-8 bg-[#141f32]/80 backdrop-blur-xs text-white flex items-center gap-3 px-3 text-[10px]">
                <button
                  onClick={handleSpeakAudio}
                  className="flex items-center gap-1.5 hover:text-purple transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded"
                  title="Audition spoken script"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-emerald-400 animate-pulse" : ""}`} />
                  <span className="text-[10px] font-semibold">{isPlayingAudio ? "Stop TTS" : "Audition Voiceover"}</span>
                </button>
                <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{ width: `${isPlayingAudio ? progressPercent : 35}%` }}
                  />
                </div>
                <span className="text-[9px] opacity-90 font-mono">
                  {formatTime(playbackSeconds)} / {formatTime(totalDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Compare Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Current Baseline Version */}
            <div className="p-3.5 border border-[#e9ecf1] rounded-xl bg-slate-50/60">
              <div className="text-[9px] font-bold tracking-wider text-[#929bab] flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#d58c83]" />
                <span>BASELINE (V1.0)</span>
              </div>
              <h3 className="font-heading font-bold text-xs text-[#47536a] mb-1.5">
                {change?.oldHeadline || scene.headline}
              </h3>
              <p className="text-xs text-[#8590a1] leading-relaxed">
                {change?.oldText || scene.script}
              </p>
            </div>

            {/* Editable / AI Suggestion */}
            <div className="p-3.5 border border-[#e4e1ff] rounded-xl bg-[#fbfaff]">
              <div className="text-[9px] font-bold tracking-wider text-purple flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#54ae89]" />
                <span>{isChangedScene ? "AI SUGGESTION" : "ACTIVE SCENE SCRIPT"}</span>
                <Sparkles className="w-2.5 h-2.5 text-purple" />
              </div>

              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Scene headline caption"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2f7] bg-white text-xs font-heading font-bold text-[#364158] mb-2 focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
              />

              <textarea
                rows={3}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Scene narration voiceover script"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2f7] bg-white text-xs text-[#67748b] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
              />

              <div className="text-[10px] text-[#9a9eaf] mt-1">
                Instructional tone: Clear, professional workplace training.
              </div>
            </div>
          </div>

          {/* Grounded Source Quote Reference */}
          <div className="p-3 rounded-lg bg-[#f7f8fa] border border-slate-100 flex items-start gap-2.5 text-xs">
            <span className="text-purple font-bold text-sm shrink-0 leading-none mt-0.5">
              ↳
            </span>
            <div>
              <strong className="block text-[11px] font-semibold text-[#68748a] mb-0.5">
                Source Reference & Grounded Evidence
              </strong>
              <p className="text-[11px] text-[#8b95a4] leading-relaxed m-0 italic">
                {change?.source || scene.sourceRef}: “{change?.sourceQuote || scene.sourceQuote || "Employees are expected to work from an office or hub at least three days per week."}”
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-[#edf0f4] flex items-center justify-between">
          {isChangedScene ? (
            <button
              onClick={() => {
                stopAudio();
                onReject();
                onClose();
              }}
              className="text-xs text-[#8d96a5] hover:text-[#596479] font-medium px-2 py-1 transition-colors"
            >
              Reject suggestion
            </button>
          ) : (
            <button
              onClick={handleCloseModal}
              className="text-xs text-[#8d96a5] hover:text-[#596479] font-medium px-2 py-1 transition-colors"
            >
              Close
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="border border-[#e3e6ed] hover:border-[#c8c3f8] bg-white text-[#586479] hover:text-[#5549d4] px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>{isRegenerating ? "Generating preview…" : "↻ Regenerate preview"}</span>
            </button>

            {isChangedScene ? (
              <button
                onClick={() => {
                  stopAudio();
                  onAccept(headline, script, visual);
                  onClose();
                }}
                className="bg-purple hover:bg-purple-dark text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Use this version</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  stopAudio();
                  if (onSaveDirectScene) {
                    onSaveDirectScene(scene.id, headline, script, visual);
                  }
                  onClose();
                }}
                className="bg-purple hover:bg-purple-dark text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Save scene updates</span>
                <Save className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
