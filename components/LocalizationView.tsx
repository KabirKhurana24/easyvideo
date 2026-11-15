"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Globe, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { LanguageVariant, Scene } from "@/types";

interface LocalizationViewProps {
  languages: LanguageVariant[];
  scenes: Scene[];
  allScenesReviewed?: boolean;
  allLanguagesApproved: boolean;
  onOpenLanguage: (code: string) => void;
  onBackToReview: () => void;
  onOpenPublish: () => void;
  onTranslateAll?: () => Promise<void>;
}

export function LocalizationView({
  languages,
  scenes,
  allScenesReviewed = true,
  allLanguagesApproved,
  onOpenLanguage,
  onBackToReview,
  onOpenPublish,
  onTranslateAll,
}: LocalizationViewProps) {
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const acceptedScenesCount = (scenes || []).filter((s) => s.status === "accepted").length;

  const handleTranslateAllClick = async () => {
    if (!onTranslateAll) return;
    try {
      setIsTranslatingAll(true);
      await onTranslateAll();
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const isReadyToPublish = allScenesReviewed && allLanguagesApproved;

  return (
    <section className="flex-1 min-w-0" id="localizationView">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] mb-1">
            STEP 03 · QUALITY CONTROL
          </div>
          <h2 className="font-heading font-bold text-xl text-[#1f2b40] tracking-tight">
            Make every version feel native.
          </h2>
          <p className="text-xs text-[#8791a2] mt-0.5">
            Review the updated scenes in each language before they go live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onTranslateAll && (
            <button
              onClick={handleTranslateAllClick}
              disabled={isTranslatingAll}
              className="border border-[#d7d2fa] bg-[#faf9ff] hover:bg-[#f0edff] text-purple text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTranslatingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating all…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple" />
                  <span>AI Translate all</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onBackToReview}
            className="border border-[#e3e6ed] bg-white hover:bg-[#fafaff] text-[#586479] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to scene review</span>
          </button>
        </div>
      </div>

      {/* Callout */}
      <div className="bg-[#f3f2ff] border border-[#e6e4ff] rounded-xl p-4 flex items-center gap-3.5 mb-5 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-[#e6e3ff] text-purple flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-purple" />
        </div>
        <div>
          <strong className="block text-xs font-semibold text-[#403b76] mb-0.5">
            Only changed scenes need localization review.
          </strong>
          <span className="text-xs text-[#7d78a1]">
            We carried forward existing approvals and flagged only the {acceptedScenesCount > 0 ? `${acceptedScenesCount} scenes` : "scenes"} affected by your policy update.
          </span>
        </div>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(languages || []).map((language) => {
          const isApproved = language.status === "approved";

          return (
            <article
              key={language.code}
              className="bg-white border border-[#e6eaf0] rounded-xl p-4 hover:shadow-card hover:border-[#d5d1fb] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f1f2f6] flex items-center justify-center text-lg shrink-0">
                      {language.flag}
                    </div>
                    <div>
                      <strong className="block text-sm font-semibold text-slate-800">
                        {language.name}
                      </strong>
                      <small className="block text-[10px] text-[#9aa3b0]">
                        {language.locale}
                      </small>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      isApproved
                        ? "text-[#248966] bg-[#eaf7f1]"
                        : "text-[#aa782f] bg-[#fff6e8]"
                    }`}
                  >
                    {isApproved ? "✓ Reviewed" : "Needs review"}
                  </span>
                </div>

                {/* Segments count */}
                <div className="border-t border-[#f0f2f5] py-2 flex items-center justify-between text-xs">
                  <span className="text-[#8b95a4]">Updated segments</span>
                  <strong className="text-[#647187] font-semibold">
                    {language.translatedSegments?.length || 3} of 12 scenes
                  </strong>
                </div>

                <p className="text-xs text-[#8c96a4] leading-relaxed my-2.5">
                  {language.note}
                </p>
              </div>

              <button
                onClick={() => onOpenLanguage(language.code)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2 ${
                  isApproved
                    ? "bg-white border border-[#e3e6ed] text-[#586479] hover:bg-[#fafaff] hover:border-[#c8c3f8]"
                    : "border border-[#dfe3eb] bg-white text-[#59657a] hover:border-[#bcb6fa] hover:text-[#5448d7]"
                }`}
              >
                <span>{isApproved ? "Review again ↗" : "Review language →"}</span>
              </button>
            </article>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-line">
        <div className="flex items-center gap-2 text-xs text-[#929baa]">
          <ShieldCheck className="w-4 h-4 text-[#5e9b82]" />
          <span>Human review is required before publishing.</span>
        </div>

        {!allScenesReviewed && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Some scene changes are still pending review.</span>
          </div>
        )}

        <button
          onClick={onOpenPublish}
          disabled={!isReadyToPublish}
          className="w-full sm:w-auto bg-purple hover:bg-purple-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Review & publish</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
