"use client";

import React, { useState } from "react";
import { ArrowRight, BookOpen, Play, Search, Plus, Filter, ShieldCheck, Clock, Globe } from "lucide-react";
import { SEEDED_LIBRARY_PROJECTS, LibraryCourse } from "@/lib/data/seededProjectsList";

interface TrainingLibraryViewProps {
  onOpenProject: () => void;
}

export function TrainingLibraryView({ onOpenProject }: TrainingLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Policy & Operations", "Security & Legal", "Leadership", "Engineering & Ops"];

  const filteredCourses = SEEDED_LIBRARY_PROJECTS.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="flex-1 min-w-0" id="libraryView">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] mb-1">
            ENTERPRISE REPOSITORY
          </div>
          <h2 className="font-heading font-bold text-2xl text-[#1f2b40] tracking-tight">
            Training Library
          </h2>
          <p className="text-xs text-[#8791a2] mt-0.5">
            Manage your organization's video curriculum and keep all training content synchronized with policy changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProject}
            className="bg-purple hover:bg-purple-dark text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Open active update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#e6eaf0] rounded-xl p-3 mb-6 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topics, or guidelines…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-purple text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course: LibraryCourse) => {
          const isActiveProject = course.id === "proj_remote_work_essentials";

          return (
            <article
              key={course.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
                isActiveProject
                  ? "border-[#c4bdfa] ring-2 ring-purple/10"
                  : "border-[#e6eaf0] hover:border-[#d5d1fb]"
              }`}
            >
              <div>
                {/* Course Banner Artwork */}
                <div
                  className={`h-32 bg-gradient-to-br ${course.bannerGradient} relative p-3 flex flex-col justify-between text-white overflow-hidden`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider backdrop-blur-xs ${course.badgeColor}`}
                    >
                      {course.badgeText}
                    </span>
                    <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                      v{course.currentVersion}
                    </span>
                  </div>

                  <div className="z-10 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/90">
                      {course.category}
                    </span>
                    <span className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded text-white/80">
                      {course.duration}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-4">
                  <h3 className="font-heading font-bold text-sm text-slate-800 leading-snug mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#8b95a4] leading-relaxed line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#7d8798] border-t border-slate-100 pt-2.5">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[#949eb0]" />
                      <span>{course.sceneCount} scenes</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#949eb0]" />
                      <span>{course.languageCount} languages</span>
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-[10px] text-slate-400">
                      {course.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                {isActiveProject ? (
                  <button
                    onClick={onOpenProject}
                    className="w-full bg-[#f4f2ff] hover:bg-[#ede9fe] text-purple border border-[#e2dffc] font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Continue Policy Update</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenProject}
                    className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Course</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No training courses found</h4>
          <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or category.</p>
        </div>
      )}
    </section>
  );
}
