"use client";

import React from "react";
import { X, CheckCircle, ShieldCheck } from "lucide-react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0d1627]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200">
        <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
              HOW IT WORKS
            </span>
            <h2 className="font-heading font-bold text-lg text-slate-800 tracking-tight mt-0.5">
              Grounded in your source material.
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4f5f8] text-[#778296] hover:bg-[#e7e9ef] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
            <span className="font-heading font-bold text-sm text-purple w-6 shrink-0 pt-0.5">
              01
            </span>
            <div>
              <strong className="block text-xs font-semibold text-[#4a576d] mb-1">
                Compare source versions
              </strong>
              <p className="text-xs text-[#8791a0] leading-relaxed m-0">
                Extract text from the new document and compare it with the source attached to the existing video, extracting specific section and paragraph citations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
            <span className="font-heading font-bold text-sm text-purple w-6 shrink-0 pt-0.5">
              02
            </span>
            <div>
              <strong className="block text-xs font-semibold text-[#4a576d] mb-1">
                Map changes to scenes
              </strong>
              <p className="text-xs text-[#8791a0] leading-relaxed m-0">
                Match changed sections to the scenes, narration, and on-screen text they directly affect. Unchanged scenes are flagged to be preserved without re-rendering.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="font-heading font-bold text-sm text-purple w-6 shrink-0 pt-0.5">
              03
            </span>
            <div>
              <strong className="block text-xs font-semibold text-[#4a576d] mb-1">
                Keep a human in control
              </strong>
              <p className="text-xs text-[#8791a0] leading-relaxed m-0">
                Present source evidence next to every suggested change. Instructional designers inspect, edit, approve, or reject changes scene by scene before publication.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#fff7e9] rounded-lg text-[11px] text-[#927545] leading-relaxed mt-2 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              EasyVideo enforces strict grounding rules: AI never fabricates facts or flags a scene as outdated without verifiable source evidence.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
