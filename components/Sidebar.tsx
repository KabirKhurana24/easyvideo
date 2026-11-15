"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Globe2,
  Clock,
  HelpCircle,
  Play,
  ChevronDown,
  Check,
  RotateCcw,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { DUMMY_ORGANIZATIONS } from "@/lib/data/seededUsers";

export type ActiveView = "review" | "localization" | "history" | "library";

interface SidebarProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onResetDemo: () => void;
  onOpenMethodology: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  onResetDemo,
  onOpenMethodology,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user, organization, switchOrganization, logout } = useAuth();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: ActiveView) => {
    onViewChange(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-[252px] bg-sidebar text-white p-4 flex flex-col z-50 select-none border-r border-[#1d293d] transition-transform duration-200 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Brand Lockup */}
        <div className="flex items-center justify-between px-2 pt-2 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7469f3] flex items-center justify-center gap-[2px] -rotate-6 shadow-sm">
              <span className="block w-[3.5px] h-[11px] bg-white rounded-sm -skew-x-12" />
              <span className="block w-[3.5px] h-[18px] bg-white rounded-sm -skew-x-12" />
              <span className="block w-[3.5px] h-[14px] bg-white rounded-sm -skew-x-12" />
            </div>
            <div className="flex flex-col">
              <strong className="font-heading font-extrabold text-[17px] tracking-tight leading-none text-white">
                easyvideo
              </strong>
              <small className="text-[8px] font-bold tracking-[2.2px] text-[#929eb2] mt-1">
                CHANGE STUDIO
              </small>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="sm:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="relative mb-5">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="w-full h-[52px] border border-[#2c394d] rounded-xl px-2.5 flex items-center gap-2.5 bg-[#192538] hover:bg-[#1f2e45] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#e9e7ff] text-[#5446d6] flex items-center justify-center font-bold text-xs shrink-0">
              {organization?.logoUrl || "N"}
            </div>
            <div className="flex-1 min-w-0">
              <strong className="block text-[11px] font-semibold text-slate-100 truncate">
                {organization?.workspaceName || "Northstar People"}
              </strong>
              <small className="block text-[10px] text-[#8290a5] truncate">
                Learning workspace
              </small>
            </div>
            <ChevronDown className="w-4 h-4 text-[#8491a7] shrink-0" />
          </button>

          {workspaceOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1b273b] border border-[#2c3d55] rounded-xl shadow-xl p-1 z-40 text-xs animate-modal-in">
              <div className="px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-slate-400">
                SWITCH WORKSPACE
              </div>
              {DUMMY_ORGANIZATIONS.map((org) => {
                const isSelected = organization?.id === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setWorkspaceOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-[#273852] text-white font-medium"
                        : "text-slate-300 hover:bg-[#202f45]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-[#e9e7ff] text-[#5446d6] font-bold text-[9px] flex items-center justify-center shrink-0">
                        {org.logoUrl}
                      </span>
                      <span className="truncate text-xs">{org.workspaceName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#7469f3] shrink-0" />}
                  </button>
                );
              })}

              <div className="my-1 border-t border-[#26354b]" />
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  onResetDemo();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-amber-300 hover:bg-[#25344a] text-left transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset demo state</span>
              </button>
            </div>
          )}
        </div>

        {/* Workspace Navigation */}
        <div className="text-[9px] font-bold tracking-[1.5px] text-[#758299] px-2.5 mb-1.5 uppercase">
          Workspace
        </div>
        <nav className="flex flex-col gap-1" aria-label="Workspace navigation">
          <button
            onClick={() => handleNavClick("library")}
            className={`h-[38px] rounded-lg px-2.5 flex items-center gap-3 text-xs transition-colors ${
              currentView === "library"
                ? "bg-[#292b50] text-white font-semibold"
                : "text-[#aab4c4] hover:bg-[#1b293d] hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#93a0b5]" />
            <span className="flex-1 text-left">Training library</span>
            <span className="bg-[#26344a] text-[#b7c1d0] px-2 py-0.5 rounded-full text-[10px]">
              5
            </span>
          </button>

          <button
            onClick={() => handleNavClick("review")}
            className={`h-[38px] rounded-lg px-2.5 flex items-center gap-3 text-xs transition-colors ${
              currentView === "review"
                ? "bg-[#292b50] text-white font-semibold"
                : "text-[#aab4c4] hover:bg-[#1b293d] hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#aaa4ff]" />
            <span className="flex-1 text-left">Change Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#938aff]" />
          </button>

          <button
            onClick={() => handleNavClick("localization")}
            className={`h-[38px] rounded-lg px-2.5 flex items-center gap-3 text-xs transition-colors ${
              currentView === "localization"
                ? "bg-[#292b50] text-white font-semibold"
                : "text-[#aab4c4] hover:bg-[#1b293d] hover:text-white"
            }`}
          >
            <Globe2 className="w-4 h-4 text-[#93a0b5]" />
            <span className="flex-1 text-left">Localization QA</span>
          </button>

          <button
            onClick={() => handleNavClick("history")}
            className={`h-[38px] rounded-lg px-2.5 flex items-center gap-3 text-xs transition-colors ${
              currentView === "history"
                ? "bg-[#292b50] text-white font-semibold"
                : "text-[#aab4c4] hover:bg-[#1b293d] hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4 text-[#93a0b5]" />
            <span className="flex-1 text-left">Version history</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="h-px bg-[#273449] my-4 mx-1" />

        {/* Current Project Mini Card */}
        <div className="text-[9px] font-bold tracking-[1.5px] text-[#758299] px-2.5 mb-1.5 uppercase">
          Active Project
        </div>
        <div
          onClick={() => handleNavClick("review")}
          className="p-2.5 rounded-xl bg-[#1a283a] hover:bg-[#203248] cursor-pointer transition-colors flex items-center gap-2.5 border border-[#23354c]"
        >
          <div className="w-9 h-8 rounded-lg bg-gradient-to-br from-[#c7d6ef] via-[#6c7ba9] to-[#3e4968] relative overflow-hidden flex items-center justify-center shrink-0">
            <Play className="w-3 h-3 text-white fill-white ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-[11px] font-medium text-slate-100 truncate">
              Remote Work Essentials
            </strong>
            <small className="block text-[9.5px] text-[#8e9bb0] truncate">
              12 scenes · 4 languages
            </small>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#64c79e] shrink-0" />
        </div>

        {/* Sidebar Bottom Cards */}
        <div className="mt-auto flex flex-col gap-2.5">
          <button
            onClick={onOpenMethodology}
            className="border border-[#2c3b50] rounded-xl p-2.5 flex items-center gap-2.5 bg-[#162234] hover:bg-[#1c2d44] transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-[#293c51] text-[#aab8cb] flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <strong className="block text-[10px] font-semibold text-slate-200">
                Need a hand?
              </strong>
              <small className="block text-[9px] text-[#8593a7]">
                How AI detects changes
              </small>
            </div>
            <span className="text-xs text-[#8494a9]">↗</span>
          </button>

          {/* User Profile Mini Bar */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full pt-2.5 border-t border-[#273449] flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7469f3] to-[#5546e0] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {user?.avatarUrl || "KK"}
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-[11px] font-semibold text-slate-200 truncate">
                  {user?.fullName || "Kabir Khurana"}
                </strong>
                <small className="block text-[9.5px] text-[#8290a5] truncate">
                  {user?.department || "People & Culture"}
                </small>
              </div>
              <span className="text-[#8591a5] text-xs px-1">•••</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1b273b] border border-[#2d3f57] rounded-xl shadow-xl p-2 text-xs animate-modal-in z-50">
                <div className="p-1.5 text-[10px] text-slate-400">
                  Logged in as <strong className="text-white">{user?.fullName}</strong> ({user?.role})
                </div>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-400 hover:bg-[#28384f] text-left transition-colors text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
