export type UserRole = "admin" | "editor" | "reviewer";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  title?: string;
  department?: string;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaceName?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  user: User;
}

export type ProjectStatus = "draft" | "in_review" | "ready_to_publish" | "published";

export interface Project {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  currentVersion: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  duration: string;
  sceneCount: number;
  languageCount: number;
  lastUpdated: string;
  createdAt: string;
}

export type ChangeStatus = "pending" | "accepted" | "rejected";
export type ImpactSeverity = "high" | "medium" | "low";

export type ChangeCategory =
  | "policy_change"
  | "numerical_change"
  | "process_change"
  | "terminology_change"
  | "content_addition"
  | "content_removal"
  | "no_material_change";

export interface Scene {
  id: number;
  projectId: string;
  number: string;
  title: string;
  area: string;
  headline: string;
  script: string;
  visualDescription: string;
  durationSeconds: number;
  orderIndex: number;
  sourceRef: string;
  sourceQuote?: string;
  isAffected: boolean;
  status: ChangeStatus | "unchanged";
  // Updated draft values when edited or regenerated
  suggestedHeadline?: string;
  suggestedScript?: string;
  suggestedVisual?: string;
}

export interface DetectedChange {
  id: string;
  projectId: string;
  sceneId: number;
  category: ChangeCategory;
  area: string;
  impact: string;
  impactClass: ImpactSeverity;
  summary: string;
  previousInfo: string;
  updatedInfo: string;
  oldHeadline: string;
  newHeadline: string;
  oldText: string;
  newText: string;
  originalDocRef: string;
  updatedDocRef: string;
  source: string;
  sourceQuote: string;
  affectedSceneIds: number[];
  severity: ImpactSeverity;
  confidenceScore: number;
  recommendedAction: string;
  suggestedNarration: string;
  suggestedHeadline: string;
  suggestedVisual?: string;
  explanation: string;
  status: ChangeStatus;
  // User overrides
  userHeadline?: string;
  userScript?: string;
}

export interface LanguageSegment {
  sceneId: number;
  sceneNumber: string;
  headline: string;
  narration: string;
  status: "pending" | "approved";
  warnings?: string[];
}

export interface LanguageVariant {
  code: string;
  flag: string;
  name: string;
  locale: string;
  note: string;
  segments: number;
  status: "review" | "approved";
  translatedSegments: LanguageSegment[];
}

export interface SourceDocument {
  id: string;
  projectId: string;
  name: string;
  meta: string;
  versionLabel: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  extractedText?: string;
  sections?: Array<{
    title: string;
    content: string;
    pageOrSlide?: number;
  }>;
}

export interface PublishedVersion {
  version: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  snapshot: {
    projectTitle: string;
    scenes: Scene[];
    changes: DetectedChange[];
    languages: LanguageVariant[];
    sourceFile: {
      name: string;
      meta: string;
      version: string;
    };
  };
}

export interface AuditLogItem {
  id: string;
  organizationId: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  avatar?: string;
  isAi?: boolean;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  type: "scene_script" | "tts_audio" | "video_render" | "localization";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  output?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
}
