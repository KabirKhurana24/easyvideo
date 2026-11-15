"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Sparkles, ChevronDown, LogOut, Menu, Check } from "lucide-react";
import { ActiveView } from "./Sidebar";
import { useAuth } from "@/lib/auth/AuthContext";
import { DUMMY_USERS } from "@/lib/data/seededUsers";

interface TopBarProps {
  currentView: ActiveView;
  aiProviderName?: string;
  isExternalAi?: boolean;
  onToggleMobileSidebar?: () => void;
}

export function TopBar({
  currentView,
  aiProviderName = "EasyVideo Grounded Semantic Engine",
  isExternalAi = false,
  onToggleMobileSidebar,
}: TopBarProps) {
  const { user, logout, loginAs } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const viewTitle =
    currentView === "review"
      ? "Change Studio"
      : currentView === "localization"
      ? "Localization QA"
      : currentView === "history"
      ? "Version history"
      : "Training library";

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "editor"
      ? "Editor"
      : "Reviewer";

  const roleBadgeStyle =
    user?.role === "admin"
      ? "bg-purple-soft text-purple border-purple/20"
      : user?.role === "editor"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="sm:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-[#9aa3b2] truncate">
          <span className="hidden md:inline">Training library</span>
          <span className="hidden md:inline text-[#c4cad3]">/</span>
          <span className="text-[#657188] truncate max-w-[140px] sm:max-w-none">
            Remote Work Essentials
          </span>
          <span className="text-[#c4cad3]">/</span>
          <strong className="text-[#39465b] font-semibold">{viewTitle}</strong>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4" ref={profileMenuRef}>
        {/* AI Provider Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f3ff] border border-[#e5e1fc] text-[10px] text-purple font-medium">
          <Sparkles className="w-3 h-3 text-purple" />
          <span>{aiProviderName}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isExternalAi ? "bg-emerald-500" : "bg-purple"
            }`}
          />
        </div>

        {/* All changes saved */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#8b95a5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5ebc91]" />
          <span>All changes saved</span>
        </div>

        {/* Notification Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-[#657188] hover:text-[#182235] transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ed8c77] ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 text-xs animate-modal-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <strong className="font-semibold text-slate-800 text-xs">
                  Notifications
                </strong>
                <span className="text-[10px] text-purple font-semibold">
                  2 new
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 bg-[#f4f3ff] rounded-lg">
                  <div className="font-semibold text-[#3b328a] text-[11px]">
                    AI Comparison Complete
                  </div>
                  <div className="text-[10px] text-[#696495] mt-0.5">
                    Found 3 policy changes in Remote Work Policy v2.pdf
                  </div>
                  <span className="text-[9px] text-[#938fae] mt-1 block">
                    Just now
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <div className="font-semibold text-slate-700 text-[11px]">
                    German Localization Ready
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    3 updated segments ready for QA review
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    10m ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7469f3] to-[#5143d4] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {user?.avatarUrl || "KK"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 leading-none">
                  {user?.fullName || "Kabir Khurana"}
                </span>
                <span
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${roleBadgeStyle}`}
                >
                  {roleLabel}
                </span>
              </div>
              <small className="text-[9px] text-slate-400 leading-tight mt-0.5">
                {user?.title || "Head of Learning"}
              </small>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-40 text-xs animate-modal-in">
              {/* Current user header */}
              <div className="p-2.5 bg-slate-50 rounded-lg mb-2 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#7469f3] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user?.avatarUrl || "KK"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-xs font-bold text-slate-800 truncate">
                      {user?.fullName}
                    </strong>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {user?.email}
                    </span>
                    <span className="inline-block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-soft text-purple border border-purple/20 uppercase tracking-wider">
                      {user?.role} · {user?.department || "People & Culture"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Persona Switcher Section */}
              <div className="px-2 py-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                Switch Demo Persona
              </div>
              <div className="space-y-1">
                {DUMMY_USERS.map((demoUser) => {
                  const isCurrent = user?.id === demoUser.id;
                  return (
                    <button
                      key={demoUser.id}
                      onClick={() => {
                        loginAs(demoUser);
                        setProfileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? "bg-[#f4f2ff] text-purple font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {demoUser.avatarUrl}
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[11px] truncate leading-tight">
                            {demoUser.fullName}
                          </span>
                          <span className="block text-[9px] text-slate-400 truncate leading-tight">
                            {demoUser.role} · {demoUser.department}
                          </span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-purple shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Divider & Sign out */}
              <div className="my-1.5 border-t border-slate-100" />
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-600 hover:bg-rose-50 text-left transition-colors font-medium text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
