"use client";

import React from "react";
import { Check } from "lucide-react";
import { ActiveView } from "./Sidebar";

interface WorkflowStripProps {
  currentView: ActiveView;
  onStepClick: (view: ActiveView) => void;
  allScenesReviewed: boolean;
  allLanguagesApproved: boolean;
  isPublished: boolean;
  onOpenPublish: () => void;
}

export function WorkflowStrip({
  currentView,
  onStepClick,
  allScenesReviewed,
  allLanguagesApproved,
  isPublished,
  onOpenPublish,
}: WorkflowStripProps) {
  const canPublish = allScenesReviewed && allLanguagesApproved;

  return (
    <section
      className="h-[68px] bg-white border border-line rounded-xl flex items-center px-6 mb-6 shadow-subtle select-none overflow-x-auto"
      aria-label="Update workflow"
    >
      {/* Step 1: Source added */}
      <div className="flex items-center gap-2.5 min-w-[150px]">
        <div className="w-6 h-6 rounded-full bg-[#eaf7f1] border border-[#d6efe3] text-[#219b75] flex items-center justify-center text-xs font-bold shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <div>
          <strong className="block text-[11px] font-semibold text-[#53687c]">
            Source added
          </strong>
          <small className="block text-[10px] text-[#a0a8b5]">
            Latest policy uploaded
          </small>
        </div>
      </div>

      <div className="h-px bg-[#bce5d4] flex-1 min-w-[20px] mx-3" />

      {/* Step 2: Review changes */}
      <button
        onClick={() => onStepClick("review")}
        className="flex items-center gap-2.5 min-w-[155px] text-left hover:opacity-90 transition-opacity"
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
            allScenesReviewed
              ? "bg-[#eaf7f1] border border-[#d6efe3] text-[#219b75]"
              : currentView === "review"
              ? "bg-purple text-white ring-4 ring-[#efeeff]"
              : "bg-white border border-[#dce1e9] text-[#98a1af]"
          }`}
        >
          {allScenesReviewed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "2"}
        </div>
        <div>
          <strong
            className={`block text-[11px] font-semibold ${
              currentView === "review" ? "text-[#282f43]" : "text-[#7d8797]"
            }`}
          >
            Review changes
          </strong>
          <small className="block text-[10px] text-[#8d95a6]">
            {allScenesReviewed ? "All changes reviewed" : "Scenes need attention"}
          </small>
        </div>
      </button>

      <div
        className={`h-px flex-1 min-w-[20px] mx-3 transition-colors ${
          allScenesReviewed ? "bg-[#bce5d4]" : "bg-[#e6e9ef]"
        }`}
      />

      {/* Step 3: Localization QA */}
      <button
        onClick={() => onStepClick("localization")}
        className="flex items-center gap-2.5 min-w-[155px] text-left hover:opacity-90 transition-opacity"
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
            allLanguagesApproved
              ? "bg-[#eaf7f1] border border-[#d6efe3] text-[#219b75]"
              : currentView === "localization"
              ? "bg-purple text-white ring-4 ring-[#efeeff]"
              : "bg-white border border-[#dce1e9] text-[#98a1af]"
          }`}
        >
          {allLanguagesApproved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "3"}
        </div>
        <div>
          <strong
            className={`block text-[11px] font-semibold ${
              currentView === "localization" ? "text-[#282f43]" : "text-[#7d8797]"
            }`}
          >
            Localization QA
          </strong>
          <small className="block text-[10px] text-[#8d95a6]">
            {allLanguagesApproved ? "All languages approved" : "4 language versions"}
          </small>
        </div>
      </button>

      <div
        className={`h-px flex-1 min-w-[20px] mx-3 transition-colors ${
          allLanguagesApproved ? "bg-[#bce5d4]" : "bg-[#e6e9ef]"
        }`}
      />

      {/* Step 4: Publish update */}
      <button
        onClick={() => {
          if (canPublish) onOpenPublish();
        }}
        disabled={!canPublish && !isPublished}
        className={`flex items-center gap-2.5 min-w-[145px] text-left transition-opacity ${
          !canPublish && !isPublished ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
            isPublished
              ? "bg-[#eaf7f1] border border-[#d6efe3] text-[#219b75]"
              : canPublish
              ? "bg-purple text-white ring-4 ring-[#efeeff]"
              : "bg-white border border-[#dce1e9] text-[#98a1af]"
          }`}
        >
          {isPublished ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : "4"}
        </div>
        <div>
          <strong
            className={`block text-[11px] font-semibold ${
              isPublished ? "text-[#219b75]" : canPublish ? "text-[#282f43]" : "text-[#7d8797]"
            }`}
          >
            {isPublished ? "Published v1.1" : "Publish update"}
          </strong>
          <small className="block text-[10px] text-[#8d95a6]">
            {isPublished
              ? "Version 1.1 Live"
              : canPublish
              ? "Ready to publish v1.1"
              : !allScenesReviewed
              ? "Review scenes first"
              : "Approve languages"}
          </small>
        </div>
      </button>
    </section>
  );
}
