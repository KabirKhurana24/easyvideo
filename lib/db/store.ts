import {
  Project,
  Scene,
  DetectedChange,
  LanguageVariant,
  PublishedVersion,
  AuditLogItem,
  SourceDocument,
  ChangeStatus,
} from "@/types";
import {
  SEEDED_PROJECT,
  SEEDED_SCENES,
  SEEDED_CHANGES,
  SEEDED_LANGUAGES,
  SEEDED_SOURCE_FILE,
  SEEDED_HISTORY,
  SEEDED_AUDIT_LOGS,
} from "@/lib/data/seededProject";

export interface ProjectStoreState {
  project: Project;
  scenes: Scene[];
  changes: DetectedChange[];
  languages: LanguageVariant[];
  sourceFile: SourceDocument;
  history: PublishedVersion[];
  auditLogs: AuditLogItem[];
  isPublished: boolean;
}

class ProjectStore {
  private state: ProjectStoreState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): ProjectStoreState {
    return {
      project: structuredClone(SEEDED_PROJECT),
      scenes: structuredClone(SEEDED_SCENES),
      changes: structuredClone(SEEDED_CHANGES),
      languages: structuredClone(SEEDED_LANGUAGES),
      sourceFile: structuredClone(SEEDED_SOURCE_FILE),
      history: structuredClone(SEEDED_HISTORY),
      auditLogs: structuredClone(SEEDED_AUDIT_LOGS),
      isPublished: false,
    };
  }

  public reset(): ProjectStoreState {
    this.state = this.getInitialState();
    return this.getState();
  }

  public getState(): ProjectStoreState {
    return structuredClone(this.state);
  }

  public getProject(): Project {
    return structuredClone(this.state.project);
  }

  public getScenes(): Scene[] {
    return structuredClone(this.state.scenes);
  }

  public getScene(id: number): Scene | undefined {
    const scene = this.state.scenes.find((s) => s.id === id);
    return scene ? structuredClone(scene) : undefined;
  }

  public updateScene(
    id: number,
    updates: Partial<Scene>,
    user?: { userId?: string; userName?: string; avatar?: string }
  ): Scene | null {
    const sceneIndex = this.state.scenes.findIndex((s) => s.id === id);
    if (sceneIndex === -1) return null;

    this.state.scenes[sceneIndex] = {
      ...this.state.scenes[sceneIndex],
      ...updates,
    };

    if (user || updates.headline || updates.script) {
      this.addAuditLog({
        action: `Scene ${this.state.scenes[sceneIndex].number} edited`,
        details: `Saved updates to Scene ${this.state.scenes[sceneIndex].number} (${this.state.scenes[sceneIndex].title}).`,
        userId: user?.userId || "user_current",
        userName: user?.userName || "Kabir Khurana",
        avatar: user?.avatar || "KK",
      });
    }

    return structuredClone(this.state.scenes[sceneIndex]);
  }

  public getChanges(): DetectedChange[] {
    return structuredClone(this.state.changes);
  }

  public updateChangeStatus(
    id: string,
    status: ChangeStatus,
    userEdits?: { headline?: string; script?: string; visual?: string },
    user?: { userId?: string; userName?: string; avatar?: string }
  ): DetectedChange | null {
    const change = this.state.changes.find((c) => c.id === id);
    if (!change) return null;

    change.status = status;
    if (userEdits?.headline) change.userHeadline = userEdits.headline;
    if (userEdits?.script) change.userScript = userEdits.script;
    if (userEdits?.visual) change.suggestedVisual = userEdits.visual;

    // Update corresponding scene
    const scene = this.state.scenes.find((s) => s.id === change.sceneId);
    if (scene) {
      scene.status = status;
      if (status === "accepted") {
        scene.headline = change.userHeadline || change.newHeadline;
        scene.script = change.userScript || change.newText;
        if (change.suggestedVisual) scene.visualDescription = change.suggestedVisual;
      } else if (status === "rejected") {
        scene.headline = change.oldHeadline;
        scene.script = change.oldText;
      }
    }

    // Add audit log
    const actionDesc =
      status === "accepted"
        ? `Accepted change for Scene ${scene?.number || change.sceneId}: ${change.summary}`
        : `Rejected change for Scene ${scene?.number || change.sceneId}. Current version retained.`;

    this.addAuditLog({
      action: status === "accepted" ? "Change accepted" : "Change rejected",
      details: actionDesc,
      userId: user?.userId || "user_current",
      userName: user?.userName || "Kabir Khurana",
      avatar: user?.avatar || "KK",
    });

    return structuredClone(change);
  }

  public setChanges(newChanges: DetectedChange[]) {
    this.state.changes = structuredClone(newChanges);
    this.state.isPublished = false;
    this.state.project.status = "in_review";
    this.state.languages.forEach((lang) => {
      lang.status = "review";
    });

    // Mark affected scenes
    const affectedIds = new Set(newChanges.map((c) => c.sceneId));
    this.state.scenes.forEach((s) => {
      s.isAffected = affectedIds.has(s.id);
      if (s.isAffected) {
        const change = newChanges.find((c) => c.sceneId === s.id);
        s.status = "pending";
        if (change) {
          s.suggestedHeadline = change.newHeadline;
          s.suggestedScript = change.newText;
          s.suggestedVisual = change.suggestedVisual;
        }
      } else {
        s.status = "unchanged";
      }
    });

    this.addAuditLog({
      action: "Change analysis completed",
      details: `Analyzed document. Detected ${newChanges.length} changes across ${this.state.scenes.length} scenes.`,
      isAi: true,
      userName: "EasyVideo AI",
      userId: "system_ai",
    });
  }

  public getLanguages(): LanguageVariant[] {
    return structuredClone(this.state.languages);
  }

  public updateLanguageStatus(
    code: string,
    status: "review" | "approved",
    updatedSegments?: LanguageVariant["translatedSegments"],
    user?: { userId?: string; userName?: string; avatar?: string }
  ): LanguageVariant | null {
    const lang = this.state.languages.find((l) => l.code === code);
    if (!lang) return null;

    lang.status = status;
    if (updatedSegments) {
      lang.translatedSegments = structuredClone(updatedSegments);
    }

    this.addAuditLog({
      action: status === "approved" ? "Language approved" : "Language sent for review",
      details: `${lang.name} (${lang.code}) marked as ${status}.`,
      userId: user?.userId || "user_current",
      userName: user?.userName || "Kabir Khurana",
      avatar: user?.avatar || "KK",
    });

    return structuredClone(lang);
  }

  public getSourceFile(): SourceDocument {
    return structuredClone(this.state.sourceFile);
  }

  public setSourceFile(
    file: SourceDocument,
    user?: { userId?: string; userName?: string; avatar?: string }
  ) {
    this.state.sourceFile = structuredClone(file);
    this.addAuditLog({
      action: "New source uploaded",
      details: `Attached ${file.name} (${file.meta}).`,
      userId: user?.userId || "user_current",
      userName: user?.userName || "Kabir Khurana",
      avatar: user?.avatar || "KK",
    });
  }

  public getHistory(): PublishedVersion[] {
    return structuredClone(this.state.history);
  }

  public getNextVersion(): string {
    const currentVer = this.state.project.currentVersion || "1.0";
    const parts = currentVer.split(".").map(Number);
    return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])
      ? `${parts[0]}.${parts[1] + 1}`
      : "1.1";
  }

  public publishVersion(
    note?: string,
    user?: { userId?: string; userName?: string; avatar?: string }
  ): PublishedVersion {
    const acceptedCount = this.state.scenes.filter((s) => s.status === "accepted").length;
    const preservedCount = this.state.scenes.length - acceptedCount;
    const nextVersion = this.getNextVersion();
    const authorName = user?.userName || "Kabir Khurana";

    const newVersion: PublishedVersion = {
      version: nextVersion,
      title: "Policy update published",
      description: note || "Updated remote work and leave policy guidance.",
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      author: authorName,
      tags: [
        `${acceptedCount} scenes updated`,
        `${this.state.languages.length} languages reviewed`,
        `${preservedCount} scenes preserved`,
      ],
      snapshot: {
        projectTitle: this.state.project.title,
        scenes: structuredClone(this.state.scenes),
        changes: structuredClone(this.state.changes),
        languages: structuredClone(this.state.languages),
        sourceFile: {
          name: this.state.sourceFile.name,
          meta: this.state.sourceFile.meta,
          version: this.state.sourceFile.versionLabel,
        },
      },
    };

    this.state.history.push(newVersion);
    this.state.isPublished = true;
    this.state.project.currentVersion = nextVersion;
    this.state.project.status = "published";

    this.addAuditLog({
      action: `Version ${nextVersion} published`,
      details: `Successfully published version ${nextVersion}. Snapshot preserved with ${acceptedCount} modified scenes.`,
      userId: user?.userId || "user_current",
      userName: authorName,
      avatar: user?.avatar || "KK",
    });

    return structuredClone(newVersion);
  }

  public rollbackToVersion(
    versionStr: string,
    user?: { userId?: string; userName?: string; avatar?: string }
  ): boolean {
    const historical = this.state.history.find((h) => h.version === versionStr);
    if (!historical) return false;

    this.state.scenes = structuredClone(historical.snapshot.scenes);
    this.state.changes = structuredClone(historical.snapshot.changes);
    this.state.languages = structuredClone(historical.snapshot.languages);
    this.state.project.currentVersion = versionStr;
    this.state.isPublished = true;
    this.state.project.status = "published";

    if (historical.snapshot.sourceFile) {
      this.state.sourceFile.name = historical.snapshot.sourceFile.name;
      this.state.sourceFile.meta = historical.snapshot.sourceFile.meta;
      this.state.sourceFile.versionLabel = historical.snapshot.sourceFile.version || "Policy";
    }

    this.addAuditLog({
      action: `Rollback to Version ${versionStr}`,
      details: `Restored scene content and localization snapshot from Version ${versionStr}.`,
      userId: user?.userId || "user_current",
      userName: user?.userName || "Kabir Khurana",
      avatar: user?.avatar || "KK",
    });

    return true;
  }

  public getAuditLogs(): AuditLogItem[] {
    return structuredClone(this.state.auditLogs);
  }

  public addAuditLog(
    entry: Omit<AuditLogItem, "id" | "organizationId" | "projectId" | "timestamp"> & {
      timestamp?: string;
    }
  ) {
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.state.project.organizationId,
      projectId: this.state.project.id,
      timestamp: entry.timestamp || "Just now",
      ...entry,
    };
    this.state.auditLogs.unshift(newLog);
  }
}

// Global singleton instance for server-side persistence in API routes
declare global {
  // eslint-disable-next-line no-var
  var __easyVideoStore: ProjectStore | undefined;
}

export function getProjectStore(): ProjectStore {
  if (!global.__easyVideoStore) {
    global.__easyVideoStore = new ProjectStore();
  }
  return global.__easyVideoStore;
}
