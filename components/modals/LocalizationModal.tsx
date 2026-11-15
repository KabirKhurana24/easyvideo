"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Check, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { LanguageVariant, Scene } from "@/types";

interface LocalizationModalProps {
  language: LanguageVariant | null;
  scenes: Scene[];
  isOpen: boolean;
  onClose: () => void;
  onToggleApproval: (code: string, updatedSegments?: LanguageVariant["translatedSegments"]) => void;
  onRefreshTranslations?: (code: string) => Promise<LanguageVariant | null>;
}

export function LocalizationModal({
  language,
  scenes,
  isOpen,
  onClose,
  onToggleApproval,
  onRefreshTranslations,
}: LocalizationModalProps) {
  const [segments, setSegments] = useState<LanguageVariant["translatedSegments"]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (language) {
      setSegments(structuredClone(language.translatedSegments || []));
    }
  }, [language]);

  if (!isOpen || !language) return null;

  const isApproved = language.status === "approved";

  const handleHeadlineChange = (index: number, val: string) => {
    const updated = [...segments];
    updated[index].headline = val;
    setSegments(updated);
  };

  const handleNarrationChange = (index: number, val: string) => {
    const updated = [...segments];
    updated[index].narration = val;
    setSegments(updated);
  };

  const handleAiRetranslate = async () => {
    try {
      setIsTranslating(true);
      if (onRefreshTranslations) {
        const updated = await onRefreshTranslations(language.code);
        if (updated?.translatedSegments) {
          setSegments(updated.translatedSegments);
        }
      } else {
        const res = await fetch(`/api/localization/${language.code}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "translate_changed_scenes" }),
        });
        const json = await res.json();
        if (json.success && json.data?.language?.translatedSegments) {
          setSegments(json.data.language.translatedSegments);
        }
      }
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#0d1627]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
              LOCALIZATION QUALITY CHECK
            </span>
            <h2 className="font-heading font-bold text-lg text-slate-800 tracking-tight mt-0.5 flex items-center gap-2">
              <span>{language.flag}</span>
              <span>
                {language.name} · {language.locale}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4f5f8] text-[#778296] hover:bg-[#e7e9ef] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Intro Callout with AI Retranslate Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#f4f3ff] border border-[#e7e5ff] rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple shrink-0" />
              <div>
                <strong className="block font-semibold text-[#4b467f] mb-0.5">
                  Review the changed segments.
                </strong>
                <span className="text-[11px] text-[#8380a2]">
                  {language.note || "Check translated narration and on-screen text before approval."}
                </span>
              </div>
            </div>

            <button
              onClick={handleAiRetranslate}
              disabled={isTranslating}
              className="border border-[#d7d2fa] bg-white hover:bg-[#faf9ff] text-purple px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-purple" />
                  <span>Translating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-purple" />
                  <span>AI Re-translate</span>
                </>
              )}
            </button>
          </div>

          {/* Segments List */}
          <div className="flex flex-col gap-3">
            {segments.length === 0 ? (
              <p className="text-xs text-[#8d97a5] text-center py-6 bg-slate-50 rounded-lg">
                No scene changes were accepted. Existing translated scenes will be preserved.
              </p>
            ) : (
              segments.map((seg, idx) => {
                const scene = scenes.find((s) => s.id === seg.sceneId);
                const sceneNumber = seg.sceneNumber || scene?.number || String(seg.sceneId).padStart(2, "0");

                return (
                  <div
                    key={seg.sceneId}
                    className="p-3.5 border border-[#e9ecf1] rounded-xl bg-slate-50/50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-wider text-[#969faf]">
                        SCENE {sceneNumber} · {scene?.title || `Scene ${sceneNumber}`}
                      </span>
                      <span className="text-[10px] text-[#a0a8b5]">
                        {language.code === "EN" ? "Original English" : "AI Localization"}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={seg.headline}
                      onChange={(e) => handleHeadlineChange(idx, e.target.value)}
                      placeholder="Translated headline"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2f7] bg-white text-xs font-heading font-bold text-[#4c5870]"
                    />

                    <textarea
                      rows={2}
                      value={seg.narration}
                      onChange={(e) => handleNarrationChange(idx, e.target.value)}
                      placeholder="Translated narration script"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#e4e2f7] bg-white text-xs text-[#7d899b] leading-relaxed resize-y"
                    />

                    {/* Layout Risk Warnings */}
                    {seg.warnings && seg.warnings.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 p-2 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>{seg.warnings.join(", ")}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-[#a1a9b4] text-center">
            Grounded in approved company glossary. Review by a fluent speaker is recommended before public release.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-[#edf0f4] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-[#8d96a5] hover:text-[#596479] font-medium px-2 py-1"
          >
            Back to languages
          </button>

          <button
            onClick={() => {
              onToggleApproval(language.code, segments);
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
              isApproved
                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-purple hover:bg-purple-dark text-white"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isApproved ? "Mark as needs review" : "Approve language review ✓"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
