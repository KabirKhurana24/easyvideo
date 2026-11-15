import { z } from "zod";

export const ChangeCategorySchema = z.enum([
  "policy_change",
  "numerical_change",
  "process_change",
  "terminology_change",
  "content_addition",
  "content_removal",
  "no_material_change",
]);

export const ImpactSeveritySchema = z.enum(["high", "medium", "low"]);

export const DetectedChangeSchema = z.object({
  id: z.string(),
  projectId: z.string().optional().default("proj_remote_work_essentials"),
  sceneId: z.number().int(),
  category: ChangeCategorySchema,
  area: z.string().min(1),
  impact: z.string().min(1),
  impactClass: ImpactSeveritySchema,
  summary: z.string().min(5),
  previousInfo: z.string().min(1),
  updatedInfo: z.string().min(1),
  oldHeadline: z.string().min(1),
  newHeadline: z.string().min(1),
  oldText: z.string().min(1),
  newText: z.string().min(1),
  originalDocRef: z.string().min(1),
  updatedDocRef: z.string().min(1),
  source: z.string().min(1),
  sourceQuote: z.string().min(1),
  affectedSceneIds: z.array(z.number().int()),
  severity: ImpactSeveritySchema,
  confidenceScore: z.number().min(0).max(1),
  recommendedAction: z.string().min(5),
  suggestedNarration: z.string().min(5),
  suggestedHeadline: z.string().min(2),
  suggestedVisual: z.string().optional(),
  explanation: z.string().min(5),
  status: z.enum(["pending", "accepted", "rejected"]).optional().default("pending"),
  userHeadline: z.string().optional(),
  userScript: z.string().optional(),
});

export const ChangeDetectionResultSchema = z.object({
  detectedChanges: z.array(DetectedChangeSchema),
  overallSummary: z.string(),
  unaffectedSceneCount: z.number().int(),
  matchConfidence: z.number().min(0).max(1),
});

export const SceneRegenerationSchema = z.object({
  sceneId: z.number().int(),
  headline: z.string().min(2),
  narration: z.string().min(10),
  visualDescription: z.string().min(5),
  durationEstimateSeconds: z.number().int(),
  toneNotes: z.string().optional(),
});

export const LocalizationSegmentSchema = z.object({
  sceneId: z.number().int(),
  headline: z.string().min(1),
  narration: z.string().min(1),
  warnings: z.array(z.string()).optional(),
});

export const LocalizationResponseSchema = z.object({
  languageCode: z.string().min(2),
  languageName: z.string().min(2),
  note: z.string().optional(),
  segments: z.array(LocalizationSegmentSchema),
});

export type ValidatedDetectedChange = z.infer<typeof DetectedChangeSchema>;
export type ValidatedChangeDetectionResult = z.infer<typeof ChangeDetectionResultSchema>;
export type ValidatedSceneRegeneration = z.infer<typeof SceneRegenerationSchema>;
export type ValidatedLocalizationResponse = z.infer<typeof LocalizationResponseSchema>;
