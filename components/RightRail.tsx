"use client";

import React, { useRef, useState } from "react";
import { Upload, Sparkles, Clock, Check, ArrowRight, Loader2 } from "lucide-react";
import { SourceDocument, AuditLogItem } from "@/types";

interface RightRailProps {
  sourceFile: SourceDocument;
  auditLogs: AuditLogItem[];
  onUploadFile: (file: File) => Promise<void>;
  onOpenMethodology: () => void;
}

export function RightRail({
  sourceFile,
  auditLogs,
  onUploadFile,
  onOpenMethodology,
}: RightRailProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUploadFile(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const extension = sourceFile?.name
    ? sourceFile.name.split(".").pop()?.toUpperCase() || "PDF"
    : "PDF";

  return (
    <aside className="w-full lg:w-[286px] shrink-0 flex flex-col gap-3">
      {/* 1. Updated Source Card */}
      <div className="bg-white border border-[#e7eaf0] rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#f0efff] text-purple flex items-center justify-center text-xs font-bold">
              ⇧
            </span>
            <strong className="text-xs font-semibold text-[#344156]">
              Updated source
            </strong>
          </div>
          <span className="text-[#a4adba] text-xs">•••</span>
        </div>

        {/* File Card */}
        <div className="flex items-center gap-2.5 p-2.5 bg-[#fafbfc] border border-[#edf0f4] rounded-lg">
          <div className="w-7 h-8 bg-[#ffefed] text-[#cc6a64] rounded flex items-center justify-center font-extrabold text-[8px] shrink-0">
            {extension}
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-xs font-medium text-[#48556a] truncate">
              {sourceFile.name}
            </strong>
            <small className="block text-[10px] text-[#9aa3b0] truncate">
              {sourceFile.meta}
            </small>
          </div>
          <span className="w-4 h-4 rounded-full bg-[#e8f6ef] text-[#29956f] flex items-center justify-center text-[10px] shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        </div>

        {/* Source Compare Mini Row */}
        <div className="flex items-center gap-1.5 py-3 text-xs">
          <div className="flex-1 min-w-0">
            <span className="block text-[9px] text-[#9ca5b2] mb-0.5">
              Original source
            </span>
            <strong className="block text-[10px] text-[#68758a] truncate">
              Remote_Work_Policy_v1.pdf
            </strong>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#a5adba] shrink-0 mt-3" />
          <div className="flex-1 min-w-0">
            <span className="block text-[9px] text-[#9ca5b2] mb-0.5">
              New source
            </span>
            <strong className="block text-[10px] text-[#68758a] truncate">
              {sourceFile.versionLabel}
            </strong>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border border-[#dfe3eb] bg-white hover:border-[#bcb6fa] hover:text-[#5448d7] text-[#59657a] rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Parsing document…</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload a newer source</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-[9px] text-[#a5adba] text-center mt-2">
          PDF, DOCX, PPTX or TXT · Up to 25 MB
        </p>
      </div>

      {/* 2. AI Change Summary Card */}
      <div className="bg-white border border-[#e7eaf0] rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#fff4e4] text-[#b98238] flex items-center justify-center text-xs font-bold">
              ✧
            </span>
            <strong className="text-xs font-semibold text-[#344156]">
              AI change summary
            </strong>
          </div>
          <span className="text-[8px] font-bold tracking-wider text-[#968bce]">
            AI GENERATED
          </span>
        </div>

        <p className="text-xs text-[#7d8797] leading-relaxed mb-3">
          Most updates relate to how employees work from the office and request time away. Your existing introduction and security guidance remain accurate.
        </p>

        <div className="flex gap-1.5 mb-2">
          <span className="text-[10px] text-[#8a7b61] bg-[#fff7ea] rounded px-2 py-0.5 font-medium">
            Policy update
          </span>
          <span className="text-[10px] text-[#8a7b61] bg-[#fff7ea] rounded px-2 py-0.5 font-medium">
            Low complexity
          </span>
        </div>

        <button
          onClick={onOpenMethodology}
          className="text-xs font-semibold text-purple hover:underline pt-2 flex items-center gap-1"
        >
          <span>How did AI find these?</span>
          <span>↗</span>
        </button>
      </div>

      {/* 3. Recent Activity Audit Trail */}
      <div className="bg-white border border-[#e7eaf0] rounded-xl p-3.5 shadow-subtle">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-6 h-6 rounded-md bg-[#eaf7f1] text-[#26936e] flex items-center justify-center text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <strong className="text-xs font-semibold text-[#344156]">
            Recent activity
          </strong>
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {(auditLogs || []).slice(0, 4).map((log) => (
            <div key={log.id} className="py-2 flex items-start gap-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                  log.isAi
                    ? "bg-[#f0efff] text-purple"
                    : "bg-[#e8e0d9] text-[#745747]"
                }`}
              >
                {log.isAi ? <Sparkles className="w-3 h-3 text-purple" /> : log.avatar || "KK"}
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-[11px] font-semibold text-[#5f6c80] truncate">
                  {log.action}
                </strong>
                <p className="text-[10px] text-[#8e9ab0] line-clamp-2 leading-tight mt-0.5">
                  {log.details}
                </p>
                <span className="block text-[9px] text-[#a0a8b5] mt-0.5">
                  {log.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
