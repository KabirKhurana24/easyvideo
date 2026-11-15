"use client";

import React, { useState } from "react";
import { X, Check, ArrowRight, Loader2 } from "lucide-react";

interface PublishModalProps {
  isOpen: boolean;
  acceptedCount: number;
  totalChanges: number;
  reviewedLanguagesCount: number;
  totalLanguages: number;
  unaffectedCount: number;
  onClose: () => void;
  onConfirmPublish: (note: string) => Promise<void>;
}

export function PublishModal({
  isOpen,
  acceptedCount,
  totalChanges,
  reviewedLanguagesCount,
  totalLanguages,
  unaffectedCount,
  onClose,
  onConfirmPublish,
}: PublishModalProps) {
  const [note, setNote] = useState("Updated remote work and leave policy guidance.");
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await onConfirmPublish(note);
      onClose();
    } finally {
      setIsPublishing(false);
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
              FINAL CHECK
            </span>
            <h2 className="font-heading font-bold text-lg text-slate-800 tracking-tight mt-0.5">
              Ready to publish?
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
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#eaf7f1] text-[#25946e] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h3 className="font-heading font-bold text-base text-slate-800 flex items-center justify-center gap-2 mb-1">
            <span>Remote Work Essentials</span>
            <span className="border border-[#e4e5f1] rounded px-1.5 py-0.5 text-[#7468de] font-bold text-[9px]">
              v1.1
            </span>
          </h3>

          <p className="text-xs text-[#929baa] mb-5">
            Your updated training video is ready for its next version.
          </p>

          {/* Publish Readiness Summary */}
          <div className="bg-[#f8f9fb] border border-[#edf0f4] rounded-xl p-3 text-left mb-4 divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-2 first:pt-1">
              <span className="text-[#7d8798]">Approved scene updates</span>
              <strong className="text-[#455269] font-semibold">
                {acceptedCount} of {totalChanges}
              </strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#7d8798]">Language versions reviewed</span>
              <strong className="text-[#455269] font-semibold">
                {reviewedLanguagesCount} of {totalLanguages}
              </strong>
            </div>
            <div className="flex justify-between py-2 last:pb-1">
              <span className="text-[#7d8798]">Unaffected scenes preserved</span>
              <strong className="text-[#455269] font-semibold">
                {unaffectedCount} scenes
              </strong>
            </div>
          </div>

          <label className="block text-left text-xs font-semibold text-[#637086] mb-1.5">
            Version release note
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#e2e6ed] text-xs text-[#58657a] focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple leading-relaxed"
          />

          <div className="text-[10px] text-[#9ca4b0] text-left leading-relaxed mt-3">
            Publishing creates a full snapshot of scenes, narration, and localizations. Historical versions remain preserved for audit and rollback.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-[#edf0f4] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-[#8d96a5] hover:text-[#596479] font-medium px-2 py-1"
          >
            Keep reviewing
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-purple hover:bg-purple-dark text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing…</span>
              </>
            ) : (
              <>
                <span>Publish version 1.1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
