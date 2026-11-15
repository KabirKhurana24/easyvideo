"use client";

import React, { useState } from "react";
import { Sparkles, Check, ChevronDown, ShieldCheck, ArrowRight } from "lucide-react";
import { Scene, DetectedChange } from "@/types";

interface SceneReviewViewProps {
  scenes: Scene[];
  changes: DetectedChange[];
  allScenesReviewed: boolean;
  onInspectScene: (sceneId: number) => void;
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onContinueToLocalization: () => void;
}

export function SceneReviewView({
  scenes,
  changes,
  allScenesReviewed,
  onInspectScene,
  onAcceptChange,
  onRejectChange,
  onContinueToLocalization,
}: SceneReviewViewProps) {
  const [unchangedOpen, setUnchangedOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"scene" | "impact">("scene");

  // Sorted changes
  const sortedChanges = [...(changes || [])].sort((a, b) => {
    if (sortBy === "impact") {
      const weight: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const weightA = a?.severity ? weight[a.severity] || 0 : 0;
      const weightB = b?.severity ? weight[b.severity] || 0 : 0;
      return weightB - weightA;
    }
    return (a?.sceneId || 0) - (b?.sceneId || 0);
  });

  const unaffectedScenes = (scenes || []).filter((s) => !s.isAffected);

  return (
    <section className="flex-1 min-w-0" id="reviewView">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] mb-1">
            STEP 02 · SCENE REVIEW
          </div>
          <h2 className="font-heading font-bold text-xl text-[#1f2b40] tracking-tight flex items-center gap-2">
            <span>Review detected changes</span>
            <span className="w-5 h-5 rounded-full bg-[#f4efff] text-[#6b5cdd] text-[10px] font-bold flex items-center justify-center">
              {changes.length}
            </span>
          </h2>
          <p className="text-xs text-[#8791a2] mt-0.5">
            We compared your latest policy with the source used to create this video.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-[#919aa8]">
          <span>Sort by</span>
          <button
            onClick={() => setSortBy(sortBy === "scene" ? "impact" : "scene")}
            className="px-2.5 py-1.5 rounded-md border border-[#e2e6ed] bg-white text-[#5f6b80] hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs"
          >
            <span className="capitalize">{sortBy}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Analysis Banner */}
      <div className="bg-[#f4f3ff] border border-[#e9e7ff] rounded-lg p-3.5 flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#e5e2ff] text-[#6c60df] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <strong className="block text-xs font-semibold text-[#413b76] mb-0.5">
            We found {changes.length} meaningful changes across {scenes.length} scenes.
          </strong>
          <span className="text-[11px] text-[#77739c]">
            {unaffectedScenes.length} scenes are unchanged and will be preserved exactly as they are.
          </span>
        </div>
        <div className="border-l border-[#dedbf8] pl-3 text-center shrink-0">
          <strong className="font-heading font-bold text-sm text-[#6155d4] block leading-none">
            96%
          </strong>
          <span className="text-[9px] text-[#827daa]">match confidence</span>
        </div>
      </div>

      {/* Scene Cards List */}
      <div className="flex flex-col gap-3">
        {sortedChanges.map((change) => {
          const scene = scenes.find((s) => s.id === change.sceneId);
          const sceneNumber = scene?.number || String(change.sceneId).padStart(2, "0");
          const title = scene?.title || change.summary;

          const isAccepted = change.status === "accepted";
          const isRejected = change.status === "rejected";

          return (
            <article
              key={change.id}
              className="border border-[#e7eaf0] bg-white rounded-xl p-4 hover:border-[#d5d1fb] hover:shadow-card transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f2f3f7] text-[#68748a] flex items-center justify-center font-heading font-bold text-xs shrink-0">
                  {sceneNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold tracking-wider text-[#929bab] mb-0.5">
                    SCENE {sceneNumber} · {change.area}
                  </div>
                  <h3 className="font-semibold text-sm text-[#2b374b] mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-[#8791a1] leading-relaxed">
                    {change.summary}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${
                    change.severity === "high"
                      ? "bg-[#fff2e6] text-[#ad7130]"
                      : "bg-[#f0efff] text-[#6c61d1]"
                  }`}
                >
                  {change.severity === "high" ? "High impact" : "Medium impact"}
                </span>
              </div>

              {/* Diff Box */}
              <div className="mt-3 ml-0 sm:ml-11 p-3 bg-[#fafbfc] rounded-lg border border-slate-100 flex flex-col gap-2">
                <div className="flex items-start sm:items-center gap-2 text-xs">
                  <span className="text-[9px] font-bold tracking-wider text-[#bb7c76] w-16 shrink-0">
                    BEFORE
                  </span>
                  <span className="text-[#7d8796] truncate">
                    {change.oldHeadline}
                  </span>
                </div>
                <div className="flex items-start sm:items-center gap-2 text-xs">
                  <span className="text-[9px] font-bold tracking-wider text-[#26936e] w-16 shrink-0">
                    SUGGESTED
                  </span>
                  <span className="font-semibold text-[#35465b] truncate">
                    {change.userHeadline || change.newHeadline}
                  </span>
                </div>
              </div>

              {/* Scene Card Footer */}
              <div className="mt-3 ml-0 sm:ml-11 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-[#9aa2af] truncate">
                  ↳ {change.source}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onInspectScene(change.sceneId)}
                    className="border border-[#e4e7ed] bg-white hover:border-[#c9c4f7] hover:text-[#6155d4] text-[#778194] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors"
                  >
                    Inspect scene ↗
                  </button>

                  {isAccepted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#218765] bg-[#ebf8f2] px-2.5 py-1.5 rounded-md">
                      ✓ Accepted
                    </span>
                  ) : isRejected ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a86460] bg-[#fff0ef] px-2.5 py-1.5 rounded-md">
                      ↶ Kept current
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onRejectChange(change.id)}
                        className="border border-[#e4e7ed] bg-white hover:bg-slate-50 text-[#9a6870] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Keep current
                      </button>
                      <button
                        onClick={() => onAcceptChange(change.id)}
                        className="bg-[#f5f4ff] border border-[#e7e4ff] hover:bg-[#eae8ff] text-[#6155d4] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Accept update ✓
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Unchanged Scenes Toggle Drawer */}
      <div className="mt-4">
        <button
          onClick={() => setUnchangedOpen(!unchangedOpen)}
          className={`w-full border border-dashed border-[#dfe4eb] bg-[#fcfcfd] rounded-lg p-3 flex items-center gap-3 text-left transition-colors hover:bg-slate-50 ${
            unchangedOpen ? "rounded-b-none border-b-0" : ""
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#e9f6ef] text-[#26936e] flex items-center justify-center text-xs shrink-0 font-bold">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-xs font-semibold text-[#57657a]">
              {unaffectedScenes.length} scenes are unchanged
            </strong>
            <small className="block text-[10px] text-[#98a1ae]">
              These scenes don't need to be regenerated.
            </small>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              unchangedOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {unchangedOpen && (
          <div className="border border-[#e9edf1] border-t-0 bg-white rounded-b-lg px-4 py-2 flex flex-col divide-y divide-slate-100 text-xs text-[#7a8596]">
            {unaffectedScenes.map((scene) => (
              <div
                key={scene.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-700">
                    {scene.number} · {scene.title}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                    ({scene.area})
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#29916d] font-semibold bg-[#eaf7f1] px-2 py-0.5 rounded">
                    Unchanged
                  </span>
                  <button
                    onClick={() => onInspectScene(scene.id)}
                    className="border border-[#e4e7ed] hover:border-[#c9c4f7] hover:text-[#6155d4] bg-white text-[#778194] rounded px-2 py-1 text-[11px] font-semibold transition-colors"
                  >
                    Inspect ↗
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-line">
        <div className="flex items-center gap-2 text-xs text-[#929baa]">
          <ShieldCheck className="w-4 h-4 text-[#5e9b82]" />
          <span>Nothing gets published until you approve it.</span>
        </div>

        <button
          onClick={onContinueToLocalization}
          disabled={!allScenesReviewed}
          className="w-full sm:w-auto bg-purple hover:bg-purple-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Continue to localization</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
