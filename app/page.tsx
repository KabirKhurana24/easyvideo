"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, ActiveView } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { WorkflowStrip } from "@/components/WorkflowStrip";
import { ProjectContextCard } from "@/components/ProjectContextCard";
import { SceneReviewView } from "@/components/SceneReviewView";
import { RightRail } from "@/components/RightRail";
import { LocalizationView } from "@/components/LocalizationView";
import { VersionHistoryView } from "@/components/VersionHistoryView";
import { TrainingLibraryView } from "@/components/TrainingLibraryView";
import { SceneEditorModal } from "@/components/modals/SceneEditorModal";
import { LocalizationModal } from "@/components/modals/LocalizationModal";
import { PublishModal } from "@/components/modals/PublishModal";
import { MethodologyModal } from "@/components/modals/MethodologyModal";
import { OriginalVideoModal } from "@/components/modals/OriginalVideoModal";
import { ToastRegion, ToastMessage } from "@/components/ToastRegion";
import { LoginView } from "@/components/auth/LoginView";
import { useAuth } from "@/lib/auth/AuthContext";
import { ProjectStoreState } from "@/lib/db/store";
import {
  SEEDED_PROJECT,
  SEEDED_SCENES,
  SEEDED_CHANGES,
  SEEDED_LANGUAGES,
  SEEDED_SOURCE_FILE,
  SEEDED_HISTORY,
  SEEDED_AUDIT_LOGS,
} from "@/lib/data/seededProject";
import { RotateCcw } from "lucide-react";

export default function EasyVideoChangeStudio() {
  const { user, isAuthenticated, organization } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>("review");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [storeState, setStoreState] = useState<ProjectStoreState>({
    project: structuredClone(SEEDED_PROJECT),
    scenes: structuredClone(SEEDED_SCENES),
    changes: structuredClone(SEEDED_CHANGES),
    languages: structuredClone(SEEDED_LANGUAGES),
    sourceFile: structuredClone(SEEDED_SOURCE_FILE),
    history: structuredClone(SEEDED_HISTORY),
    auditLogs: structuredClone(SEEDED_AUDIT_LOGS),
    isPublished: false,
  });

  const [aiProviderInfo, setAiProviderInfo] = useState<{
    name: string;
    isExternal: boolean;
  }>({
    name: "EasyVideo Grounded Semantic Engine",
    isExternal: false,
  });

  // Modal states
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null);
  const [activeLanguageCode, setActiveLanguageCode] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [isOriginalVideoModalOpen, setIsOriginalVideoModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, kind: "success" | "warning" | "error" = "success") => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch project state from server
  const fetchProjectState = useCallback(async () => {
    try {
      const res = await fetch("/api/project");
      const json = await res.json();
      if (json.success && json.data) {
        setStoreState(json.data);
        if (json.aiProvider) {
          setAiProviderInfo(json.aiProvider);
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial state:", err);
    }
  }, []);

  useEffect(() => {
    fetchProjectState();
  }, [fetchProjectState]);

  // Handle demo reset
  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data);
        setCurrentView("review");
        addToast("Demo reset. Back at the start of the update workflow.");
      }
    } catch {
      addToast("Failed to reset demo", "error");
    }
  };

  // Handle file upload
  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (user) {
        formData.append("userId", user.id);
        formData.append("userName", user.fullName);
        formData.append("avatar", user.avatarUrl || "KK");
      }

      const res = await fetch("/api/document/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.updatedState);
        addToast(
          `Uploaded ${file.name}. AI comparison detected ${json.data.comparison.detectedChanges.length} grounded changes.`
        );
      } else {
        addToast(json.error || "Upload failed", "error");
      }
    } catch {
      addToast("Failed to upload document", "error");
    }
  };

  // Handle change accept
  const handleAcceptChange = async (
    changeId: string,
    headline?: string,
    script?: string,
    visual?: string
  ) => {
    try {
      const res = await fetch(`/api/changes/${changeId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          headline,
          script,
          visual,
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        addToast("Change accepted and incorporated into scene script.");
      }
    } catch {
      addToast("Failed to accept change", "error");
    }
  };

  // Handle change reject
  const handleRejectChange = async (changeId: string) => {
    try {
      const res = await fetch(`/api/changes/${changeId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        addToast("Change rejected. Baseline video scene retained.", "warning");
      }
    } catch {
      addToast("Failed to reject change", "error");
    }
  };

  // Handle direct scene update (for non-change scenes)
  const handleSaveDirectScene = async (
    sceneId: number,
    headline: string,
    script: string,
    visual?: string
  ) => {
    try {
      const res = await fetch(`/api/scene/${sceneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          script,
          visualDescription: visual,
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        addToast(`Scene ${json.data.scene.number} updated successfully!`);
      }
    } catch {
      addToast("Failed to update scene", "error");
    }
  };

  // Handle scene regeneration
  const handleRegenerateScene = async (sceneId: number) => {
    try {
      const res = await fetch(`/api/scene/${sceneId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("Preview refreshed using AI regeneration.");
        return json.data.regenerated;
      }
      return null;
    } catch {
      addToast("Failed to regenerate scene", "error");
      return null;
    }
  };

  // Handle language approval toggle
  const handleToggleLanguageApproval = async (code: string, updatedSegments?: any) => {
    if (!storeState) return;
    const currentLang = storeState.languages.find((l) => l.code === code);
    const nextStatus = currentLang?.status === "approved" ? "review" : "approved";

    try {
      const res = await fetch(`/api/localization/${code}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          segments: updatedSegments,
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        const approvedCount = json.data.state.languages.filter((l: any) => l.status === "approved").length;
        const total = json.data.state.languages.length;
        addToast(
          nextStatus === "approved"
            ? `${code} review approved (${approvedCount} of ${total} ready).`
            : `${code} returned to review.`,
          nextStatus === "approved" ? "success" : "warning"
        );
      }
    } catch {
      addToast("Failed to update language review", "error");
    }
  };

  // Handle re-translating single language
  const handleRefreshLanguageTranslations = async (code: string) => {
    try {
      const res = await fetch(`/api/localization/${code}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "translate_changed_scenes" }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        addToast(`AI re-translated ${code} segments based on updated scene copy.`);
        return json.data.language;
      }
      return null;
    } catch {
      addToast("Failed to translate language", "error");
      return null;
    }
  };

  // Handle re-translating all languages with AI
  const handleTranslateAllLanguages = async () => {
    try {
      for (const lang of storeState.languages) {
        await fetch(`/api/localization/${lang.code}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "translate_changed_scenes" }),
        });
      }
      await fetchProjectState();
      addToast("AI generated updated translations for all 4 languages.");
    } catch {
      addToast("Failed to batch translate languages", "error");
    }
  };

  // Handle publishing
  const handleConfirmPublish = async (note: string) => {
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        setCurrentView("history");
        addToast(`Version ${json.data.publishedVersion.version} published successfully to version history!`);
      } else {
        addToast(json.error || "Publishing failed", "error");
      }
    } catch {
      addToast("Failed to publish version", "error");
    }
  };

  // Handle rollback
  const handleRollback = async (version: string) => {
    try {
      const res = await fetch("/api/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          user: user
            ? {
                id: user.id,
                name: user.fullName,
                avatar: user.avatarUrl,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStoreState(json.data.state);
        addToast(`Restored snapshot to Version ${version}.`);
      } else {
        addToast(json.error || "Rollback failed", "error");
      }
    } catch {
      addToast("Rollback error", "error");
    }
  };

  // If not logged in, render the login view
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Computed state helpers with defensive fallbacks
  const project = storeState?.project || SEEDED_PROJECT;
  const scenes = storeState?.scenes || SEEDED_SCENES;
  const changes = storeState?.changes || SEEDED_CHANGES;
  const languages = storeState?.languages || SEEDED_LANGUAGES;
  const sourceFile = storeState?.sourceFile || SEEDED_SOURCE_FILE;
  const history = storeState?.history || SEEDED_HISTORY;
  const auditLogs = storeState?.auditLogs || SEEDED_AUDIT_LOGS;

  const reviewedChangesCount = changes.filter((c) => c.status !== "pending").length;
  const acceptedChangesCount = changes.filter((c) => c.status === "accepted").length;
  const allScenesReviewed = changes.length > 0 && reviewedChangesCount === changes.length;

  const approvedLanguagesCount = languages.filter((l) => l.status === "approved").length;
  const allLanguagesApproved = approvedLanguagesCount === languages.length;

  const activeScene = activeSceneId !== null ? scenes.find((s) => s.id === activeSceneId) || null : null;
  const activeChange = activeSceneId !== null ? changes.find((c) => c.sceneId === activeSceneId) : undefined;
  const activeLanguage = activeLanguageCode ? languages.find((l) => l.code === activeLanguageCode) || null : null;

  return (
    <div className="min-h-screen bg-soft">
      {/* Fixed Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onResetDemo={handleResetDemo}
        onOpenMethodology={() => setIsMethodologyModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="ml-0 sm:ml-[252px] min-h-screen flex flex-col">
        {/* Sticky Topbar */}
        <TopBar
          currentView={currentView}
          aiProviderName={aiProviderInfo.name}
          isExternalAi={aiProviderInfo.isExternal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Container */}
        <main className="max-w-[1510px] w-full mx-auto px-4 sm:px-10 py-8 flex-1 flex flex-col">
          {/* Page Heading */}
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[9px] font-bold tracking-[1.5px] text-[#8c96a8] flex items-center gap-1.5 mb-1">
                <span className="text-purple">✳</span>
                <span>CONTENT MAINTENANCE</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1b2639] tracking-tight leading-tight m-0">
                Keep your training <em className="not-italic text-purple">up to date.</em>
              </h1>
              <p className="text-xs text-[#7c8799] mt-1 m-0">
                Update existing videos from your latest source material. Change only what needs changing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold tracking-wider text-[#8b93a3] flex items-center gap-1.5 bg-white border border-[#e2e6ed] px-2.5 py-1.5 rounded-lg shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e2a64c]" />
                <span className="uppercase">{organization.workspaceName || "DEMO WORKSPACE"}</span>
              </span>

              <button
                onClick={handleResetDemo}
                className="border border-[#e3e6ed] bg-white hover:bg-[#fafaff] hover:border-[#c8c3f8] text-[#586479] hover:text-[#5549d4] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset demo</span>
              </button>
            </div>
          </section>

          {/* Workflow Step Strip */}
          <WorkflowStrip
            currentView={currentView}
            onStepClick={(view) => setCurrentView(view)}
            allScenesReviewed={allScenesReviewed}
            allLanguagesApproved={allLanguagesApproved}
            isPublished={storeState?.isPublished || false}
            onOpenPublish={() => setIsPublishModalOpen(true)}
          />

          {/* Project Context Hero Card */}
          <ProjectContextCard
            project={project}
            reviewedCount={reviewedChangesCount}
            totalChanges={changes.length}
            unaffectedCount={scenes.length - changes.length}
            languageCount={languages.length}
            onViewOriginalVideo={() => setIsOriginalVideoModalOpen(true)}
          />

          {/* Dynamic View Switching */}
          {currentView === "review" && (
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <SceneReviewView
                scenes={scenes}
                changes={changes}
                allScenesReviewed={allScenesReviewed}
                onInspectScene={(id) => setActiveSceneId(id)}
                onAcceptChange={(id) => handleAcceptChange(id)}
                onRejectChange={(id) => handleRejectChange(id)}
                onContinueToLocalization={() => setCurrentView("localization")}
              />
              <RightRail
                sourceFile={sourceFile}
                auditLogs={auditLogs}
                onUploadFile={handleUploadFile}
                onOpenMethodology={() => setIsMethodologyModalOpen(true)}
              />
            </div>
          )}

          {currentView === "localization" && (
            <LocalizationView
              languages={languages}
              scenes={scenes}
              allScenesReviewed={allScenesReviewed}
              allLanguagesApproved={allLanguagesApproved}
              onOpenLanguage={(code) => setActiveLanguageCode(code)}
              onBackToReview={() => setCurrentView("review")}
              onOpenPublish={() => setIsPublishModalOpen(true)}
              onTranslateAll={handleTranslateAllLanguages}
            />
          )}

          {currentView === "history" && (
            <VersionHistoryView
              history={history}
              currentVersion={storeState.project.currentVersion}
              isPublished={storeState.isPublished}
              onBackToProject={() => setCurrentView("review")}
              onRollback={handleRollback}
            />
          )}

          {currentView === "library" && (
            <TrainingLibraryView
              onOpenProject={() => setCurrentView("review")}
            />
          )}

          {/* Footer */}
          <footer className="mt-auto pt-8 pb-4 border-t border-line flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#a1a9b5] gap-2">
            <div>
              EasyVideo Change Studio <b className="text-slate-300">·</b> AI Training Video Maintenance
            </div>
            <div>
              {organization.name} Workspace · Operating under Enterprise RBAC
            </div>
          </footer>
        </main>
      </div>

      {/* Interactive Modals */}
      <SceneEditorModal
        scene={activeScene}
        change={activeChange}
        isOpen={activeSceneId !== null}
        onClose={() => setActiveSceneId(null)}
        onAccept={(headline, script, visual) => {
          if (activeChange) {
            handleAcceptChange(activeChange.id, headline, script, visual);
          }
        }}
        onReject={() => {
          if (activeChange) {
            handleRejectChange(activeChange.id);
          }
        }}
        onRegenerate={handleRegenerateScene}
        onSaveDirectScene={handleSaveDirectScene}
      />

      <LocalizationModal
        language={activeLanguage}
        scenes={scenes}
        isOpen={activeLanguageCode !== null}
        onClose={() => setActiveLanguageCode(null)}
        onToggleApproval={handleToggleLanguageApproval}
        onRefreshTranslations={handleRefreshLanguageTranslations}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        acceptedCount={acceptedChangesCount}
        totalChanges={changes.length}
        reviewedLanguagesCount={approvedLanguagesCount}
        totalLanguages={languages.length}
        unaffectedCount={scenes.length - changes.length}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublish}
      />

      <MethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />

      <OriginalVideoModal
        isOpen={isOriginalVideoModalOpen}
        onClose={() => setIsOriginalVideoModalOpen(false)}
      />

      {/* Toast Region */}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
