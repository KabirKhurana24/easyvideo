"use client";

import React, { useState } from "react";
import { ArrowLeft, Download, RotateCcw, Check, Clock, FileText, Eye, Copy, CheckCheck, X } from "lucide-react";
import { PublishedVersion } from "@/types";

interface VersionHistoryViewProps {
  history: PublishedVersion[];
  currentVersion: string;
  isPublished: boolean;
  onBackToProject: () => void;
  onRollback: (version: string) => Promise<void>;
}

export function VersionHistoryView({
  history,
  currentVersion,
  isPublished,
  onBackToProject,
  onRollback,
}: VersionHistoryViewProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [rollingBackVersion, setRollingBackVersion] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    format: string;
    downloadUrl: string;
  }>({
    isOpen: false,
    title: "",
    content: "",
    format: "",
    downloadUrl: "",
  });
  const [copied, setCopied] = useState(false);

  const handleDownload = (format: string, lang = "EN", version?: string) => {
    try {
      setDownloadingFormat(`${format}_${version}`);
      const url = `/api/export?format=${format}&lang=${lang}${version ? `&version=${version}` : ""}`;
      window.open(url, "_blank");
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1000);
    }
  };

  const handlePreviewExport = async (format: string, lang = "EN", version?: string) => {
    try {
      const url = `/api/export?format=${format}&lang=${lang}${version ? `&version=${version}` : ""}`;
      const res = await fetch(url);
      const text = await res.text();
      const formatTitles: Record<string, string> = {
        srt: `SRT Subtitles (v${version || currentVersion} · ${lang})`,
        vtt: `WebVTT Subtitles (v${version || currentVersion} · ${lang})`,
        script: `Production Script (v${version || currentVersion})`,
        changelog: `Release Changelog (v${version || currentVersion})`,
      };

      setPreviewModal({
        isOpen: true,
        title: formatTitles[format] || `Export Preview (${format})`,
        content: text,
        format,
        downloadUrl: url,
      });
    } catch (err) {
      console.error("Failed to load export preview:", err);
    }
  };

  const handleCopyContent = () => {
    if (previewModal.content) {
      navigator.clipboard.writeText(previewModal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRollback = async (version: string) => {
    if (
      !confirm(
        `Are you sure you want to rollback scenes and localization to Version ${version}? Prior version history entries will remain preserved.`
      )
    ) {
      return;
    }
    setRollingBackVersion(version);
    try {
      await onRollback(version);
    } finally {
      setRollingBackVersion(null);
    }
  };

  // Reverse list to show newest on top
  const orderedHistory = [...(history || [])].reverse();

  return (
    <section className="flex-1 min-w-0" id="historyView">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] mb-1">
            PROJECT RECORD & AUDIT TRAIL
          </div>
          <h2 className="font-heading font-bold text-xl text-[#1f2b40] tracking-tight">
            Version history
          </h2>
          <p className="text-xs text-[#8791a2] mt-0.5">
            Every published update is preserved as an immutable snapshot with grounded release changelogs.
          </p>
        </div>

        <button
          onClick={onBackToProject}
          className="border border-[#e3e6ed] bg-white hover:bg-[#fafaff] text-[#586479] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to project</span>
        </button>
      </div>

      {/* History Timeline Panel */}
      <div className="bg-white border border-[#e6eaf0] rounded-xl p-6 max-w-3xl shadow-subtle flex flex-col gap-6">
        {orderedHistory.map((item, index) => {
          const isLatest = index === 0;

          return (
            <div key={item.version} className="flex gap-4 relative pb-4 last:pb-0">
              {/* Vertical connector line */}
              {index !== orderedHistory.length - 1 && (
                <div className="absolute left-3 top-7 bottom-0 w-px bg-[#e4e8ef]" />
              )}

              {/* Marker Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 z-10 ${
                  isLatest
                    ? "bg-[#eaf7f1] text-[#219b75] font-bold ring-4 ring-[#eaf7f1]"
                    : "bg-[#eef0f5] text-[#8190a4]"
                }`}
              >
                {isLatest ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Clock className="w-3.5 h-3.5" />}
              </div>

              {/* Detail */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <strong className="text-sm font-semibold text-slate-800">
                    Version {item.version} · {item.title}
                  </strong>
                  {isLatest && (
                    <span className="border border-[#e4e5f1] rounded px-1.5 py-0.5 text-[#7468de] font-bold text-[8px]">
                      LATEST RELEASE
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8792a2] mb-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="text-[11px] text-[#a0a9b6] mb-2.5">
                  Published {item.date} · Authorized by {item.author}
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(Array.isArray(item.tags)
                    ? item.tags
                    : typeof item.tags === "string"
                    ? (item.tags as string).split(" ")
                    : []
                  ).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-[#f4f5f8] text-[#7e8999] rounded font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Version Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handlePreviewExport("script", "EN", item.version)}
                    className="border border-[#e4e7ed] hover:border-[#c9c4f7] bg-white text-[#5f6b80] hover:text-[#5549d4] px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-purple" />
                    <span>Script Preview</span>
                  </button>

                  <button
                    onClick={() => handlePreviewExport("changelog", "EN", item.version)}
                    className="border border-[#e4e7ed] hover:border-[#c9c4f7] bg-white text-[#5f6b80] hover:text-[#5549d4] px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-[#219b75]" />
                    <span>Changelog</span>
                  </button>

                  <button
                    onClick={() => handleDownload("srt", "EN", item.version)}
                    className="border border-[#e4e7ed] hover:border-[#c9c4f7] bg-white text-[#5f6b80] hover:text-[#5549d4] px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>SRT</span>
                  </button>

                  <button
                    onClick={() => handleDownload("vtt", "EN", item.version)}
                    className="border border-[#e4e7ed] hover:border-[#c9c4f7] bg-white text-[#5f6b80] hover:text-[#5549d4] px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>WebVTT</span>
                  </button>

                  {/* Rollback button (for non-current versions) */}
                  {item.version !== currentVersion && (
                    <button
                      onClick={() => handleRollback(item.version)}
                      disabled={rollingBackVersion === item.version}
                      className="border border-amber-200 hover:border-amber-300 bg-amber-50 text-amber-700 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors ml-auto disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore this version</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Preview Modal */}
      {previewModal.isOpen && (
        <div
          className="fixed inset-0 bg-[#0d1627]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewModal((prev) => ({ ...prev, isOpen: false }));
          }}
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-modal overflow-hidden animate-modal-in border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#edf0f4] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] uppercase">
                  EXPORT PREVIEW
                </span>
                <h3 className="font-heading font-bold text-base text-slate-800 tracking-tight mt-0.5">
                  {previewModal.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-7 h-7 rounded-full bg-[#f4f5f8] text-[#778296] hover:bg-[#e7e9ef] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap">{previewModal.content}</pre>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleCopyContent}
                className="border border-slate-200 hover:border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
              </button>

              <a
                href={previewModal.downloadUrl}
                download
                className="bg-purple hover:bg-purple-dark text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
