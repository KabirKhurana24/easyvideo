"use client";

import React from "react";

export interface ToastMessage {
  id: string;
  message: string;
  kind?: "success" | "warning" | "error";
}

interface ToastRegionProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastRegion({ toasts, onDismiss }: ToastRegionProps) {
  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className="pointer-events-auto cursor-pointer flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#202b3e] text-white text-xs shadow-floating animate-toast-in border border-slate-700/60"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              backgroundColor:
                t.kind === "warning" ? "#e5aa57" : t.kind === "error" ? "#e06c75" : "#68c39b",
            }}
          />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
