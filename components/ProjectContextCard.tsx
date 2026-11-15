"use client";

import React from "react";
import { Play, Grid3X3, Globe, Clock } from "lucide-react";
import { Project } from "@/types";

interface ProjectContextCardProps {
  project: Project;
  reviewedCount: number;
  totalChanges: number;
  unaffectedCount: number;
  languageCount: number;
  onViewOriginalVideo: () => void;
}

export function ProjectContextCard({
  project,
  reviewedCount,
  totalChanges,
  unaffectedCount,
  languageCount,
  onViewOriginalVideo,
}: ProjectContextCardProps) {
  const readinessPercent =
    totalChanges > 0 ? Math.round((reviewedCount / totalChanges) * 100) : 100;

  return (
    <section className="bg-white border border-line rounded-xl p-4 flex flex-col md:flex-row items-stretch gap-4 mb-6 shadow-subtle">
      {/* Video Cover Artwork */}
      <div className="w-full md:w-[146px] h-28 relative rounded-lg overflow-hidden bg-gradient-to-br from-[#dce7f4] via-[#b3c2dc] to-[#8296bb] shrink-0 flex items-center justify-center">
        {/* Decorative orbits */}
        <div className="absolute w-36 h-16 rounded-full border border-white/60 -rotate-[32deg] left-3 top-3 pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full border border-white/50 rotate-45 left-8 top-1 pointer-events-none" />

        {/* Person silhouette */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-[#d5a68f] z-10 -mb-0.5" />
          <div className="w-12 h-14 rounded-t-2xl bg-[#394d74]" />
        </div>

        {/* Play Button */}
        <button
          onClick={onViewOriginalVideo}
          className="absolute z-20 w-7 h-7 rounded-full bg-white/30 backdrop-blur-sm border border-white/80 text-white flex items-center justify-center pl-0.5 hover:scale-105 transition-transform"
          aria-label="Play original video preview"
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
        </button>

        <span className="absolute left-2 top-2 text-[7px] font-bold tracking-widest text-[#526581]">
          SERIES
        </span>
        <span className="absolute right-1.5 bottom-1.5 bg-[#141e31]/80 text-white text-[8px] px-1.5 py-0.5 rounded">
          {project.duration || "04:32"}
        </span>
      </div>

      {/* Context Main */}
      <div className="flex-1 min-w-[220px] flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[8px] font-bold tracking-wider text-[#8d97a8] flex items-center gap-2 mb-1">
                <span>EXISTING TRAINING VIDEO</span>
                <span className="border border-[#e4e5f1] rounded px-1.5 py-0.5 text-[#7468de] font-bold text-[8px]">
                  v{project.currentVersion}
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg text-[#1b2639] tracking-tight leading-tight mb-1">
                {project.title}
              </h2>
              <p className="text-[11px] text-[#8993a2] m-0">
                {project.description}
              </p>
            </div>
            <button
              onClick={onViewOriginalVideo}
              className="text-xs font-semibold text-purple hover:underline pt-1 shrink-0"
            >
              View original video ↗
            </button>
          </div>

          {/* Context Meta */}
          <div className="flex items-center gap-4 mt-2.5 text-[10px] text-[#808b9d]">
            <span className="flex items-center gap-1.5">
              <Grid3X3 className="w-3 h-3 text-[#8f98a9]" />
              <span>{project.sceneCount || 12} scenes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#8f98a9]" />
              <span>{project.languageCount || 4} languages</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#8f98a9]" />
              <span>Last updated {project.lastUpdated}</span>
            </span>
          </div>
        </div>

        {/* Update Readiness Progress */}
        <div className="mt-3 max-w-sm">
          <div className="flex justify-between text-[9px] text-[#8e98a7] mb-1">
            <span>Update readiness</span>
            <strong className="font-semibold text-[#657188]">
              {reviewedCount} of {totalChanges} changes reviewed
            </strong>
          </div>
          <div className="h-1.5 rounded-full bg-[#eff0f5] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#756ae9] transition-all duration-300"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Context Stats */}
      <div className="border-t md:border-t-0 md:border-l border-[#edf0f4] pt-3 md:pt-0 md:pl-5 flex md:grid grid-cols-2 gap-4 items-center justify-around md:justify-center md:w-[200px] shrink-0">
        <div>
          <strong className="font-heading font-bold text-xl text-[#bb812f] block leading-none">
            {totalChanges}
          </strong>
          <span className="text-[10px] text-[#8791a1] mt-1 block">
            Changes detected
          </span>
        </div>
        <div>
          <strong className="font-heading font-bold text-xl text-[#29364b] block leading-none">
            {unaffectedCount}
          </strong>
          <span className="text-[10px] text-[#8791a1] mt-1 block">
            Scenes unaffected
          </span>
        </div>
        <div>
          <strong className="font-heading font-bold text-xl text-[#29364b] block leading-none">
            {languageCount}
          </strong>
          <span className="text-[10px] text-[#8791a1] mt-1 block">
            Language versions
          </span>
        </div>
      </div>
    </section>
  );
}
