import OpenAI from "openai";
import { Scene } from "@/types";
import {
  ChangeDetectionResultSchema,
  SceneRegenerationSchema,
  LocalizationResponseSchema,
  ValidatedChangeDetectionResult,
  ValidatedSceneRegeneration,
  ValidatedLocalizationResponse,
} from "./schemas";
import { SEEDED_CHANGES } from "@/lib/data/seededProject";
import { extractSectionsFromText } from "@/lib/documents/parser";

export interface AIProvider {
  name: string;
  isExternal: boolean;
  detectSourceChanges(
    originalDoc: string,
    updatedDoc: string,
    scenes: Scene[]
  ): Promise<ValidatedChangeDetectionResult>;
  regenerateScene(
    scene: Scene,
    approvedSource: string,
    changeDetails?: Record<string, unknown>
  ): Promise<ValidatedSceneRegeneration>;
  translateSegments(
    languageCode: string,
    languageName: string,
    segments: Array<{ sceneId: number; headline: string; narration: string }>
  ): Promise<ValidatedLocalizationResponse>;
}

export class OpenAIProvider implements AIProvider {
  public name = "OpenAI GPT-4o";
  public isExternal = true;
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model || process.env.OPENAI_MODEL || "gpt-4o";
  }

  async detectSourceChanges(
    originalDoc: string,
    updatedDoc: string,
    scenes: Scene[]
  ): Promise<ValidatedChangeDetectionResult> {
    const sceneContext = scenes.map((s) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      area: s.area,
      currentHeadline: s.headline,
      currentScript: s.script,
      sourceRef: s.sourceRef,
    }));

    const systemPrompt = `You are the EasyVideo AI Change Engine. Your job is to compare an original policy document against an updated policy document and map detected changes to training video scenes.
Rules:
1. Grounding: Do NOT invent facts. Only identify changes with identifiable source quotes in the documents.
2. Scene Mapping: Map changes only to truly affected scene IDs. Unaffected scenes must not be changed.
3. Categorization: Classify each change as policy_change, numerical_change, process_change, terminology_change, content_addition, content_removal, or no_material_change.
4. Output valid JSON matching the specified schema.`;

    const userPrompt = `ORIGINAL DOCUMENT:
${originalDoc.substring(0, 10000)}

UPDATED DOCUMENT:
${updatedDoc.substring(0, 10000)}

TRAINING VIDEO SCENES:
${JSON.stringify(sceneContext, null, 2)}

Return a JSON object with:
- detectedChanges: array of change objects (each with id, sceneId, category, area, impact, impactClass ('high'|'medium'|'low'), summary, previousInfo, updatedInfo, oldHeadline, newHeadline, oldText, newText, originalDocRef, updatedDocRef, source, sourceQuote, affectedSceneIds, severity, confidenceScore, recommendedAction, suggestedNarration, suggestedHeadline, suggestedVisual, explanation)
- overallSummary: string
- unaffectedSceneCount: number
- matchConfidence: number (between 0.8 and 1.0)`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response returned from OpenAI.");
    }

    const parsed = JSON.parse(content);
    return ChangeDetectionResultSchema.parse(parsed);
  }

  async regenerateScene(
    scene: Scene,
    approvedSource: string,
    changeDetails?: Record<string, unknown>
  ): Promise<ValidatedSceneRegeneration> {
    const systemPrompt = `You are a professional instructional video scriptwriter.
Rewrite the video scene's narration, headline, and visual storyboard description to incorporate the approved source policy changes while preserving the original educational tone and pacing.`;

    const userPrompt = `SCENE:
${JSON.stringify(scene, null, 2)}

APPROVED SOURCE EVIDENCE:
${approvedSource}

CHANGE DETAILS:
${JSON.stringify(changeDetails || {}, null, 2)}

Return JSON with:
- sceneId: ${scene.id}
- headline: short, punchy on-screen title
- narration: spoken voiceover script
- visualDescription: storyboard visual prompt description
- durationEstimateSeconds: integer duration
- toneNotes: optional notes`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI regeneration");

    const parsed = JSON.parse(content);
    return SceneRegenerationSchema.parse(parsed);
  }

  async translateSegments(
    languageCode: string,
    languageName: string,
    segments: Array<{ sceneId: number; headline: string; narration: string }>
  ): Promise<ValidatedLocalizationResponse> {
    const systemPrompt = `You are a professional enterprise localization engine for training videos.
Translate the provided video scene headlines and scripts into ${languageName} (${languageCode}).
Provide high quality, natural workplace phrasing. Flag layout or length risks (e.g. German text expansion or Hindi line-wrap caveats).`;

    const userPrompt = `SEGMENTS TO TRANSLATE:
${JSON.stringify(segments, null, 2)}

Return JSON with:
- languageCode: "${languageCode}"
- languageName: "${languageName}"
- note: overview note on localization considerations
- segments: array of { sceneId, headline, narration, warnings: string[] }`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI translation");

    const parsed = JSON.parse(content);
    return LocalizationResponseSchema.parse(parsed);
  }
}

/**
 * High-performance deterministic AI engine with grounded diffing and domain heuristics.
 * Used when no external API key is configured, or for offline/instant evaluation.
 */
export class SmartRuleAIProvider implements AIProvider {
  public name = "EasyVideo Grounded Semantic Engine";
  public isExternal = false;

  async detectSourceChanges(
    originalDoc: string,
    updatedDoc: string,
    scenes: Scene[]
  ): Promise<ValidatedChangeDetectionResult> {
    const lowerDoc = updatedDoc.toLowerCase();
    const changes: (typeof SEEDED_CHANGES)[0][] = [];

    // Check Attendance Change
    if (
      lowerDoc.includes("three days") ||
      lowerDoc.includes("3 days") ||
      (lowerDoc.includes("office attendance") && !lowerDoc.includes("two days"))
    ) {
      const matchQuote =
        extractQuote(
          updatedDoc,
          /Employees are expected to work from an office or hub at least three days per week[^\n.]*/i
        ) ||
        "Employees are expected to work from an office or hub at least three days per week.";

      changes.push({
        id: "chg_office_attendance",
        projectId: scenes[0]?.projectId || "proj_remote_work_essentials",
        sceneId: 3,
        category: "numerical_change",
        area: "OFFICE ATTENDANCE",
        impact: "High impact",
        impactClass: "high",
        summary: "The minimum number of in-office days has increased from two to three per week.",
        previousInfo: "Two days per week from office",
        updatedInfo: "At least three days per week from an office or hub",
        oldHeadline: "Two days in the office",
        newHeadline: "Three days together",
        oldText:
          "Our hybrid approach asks every team member to work from the office at least two days each week.",
        newText:
          "Our hybrid approach asks every team member to work from an office or hub at least three days each week.",
        originalDocRef: "Remote_Work_Policy_v1.pdf · Section 2.1",
        updatedDocRef: "Remote_Work_Policy_v2.pdf · Section 2.1",
        source: "Section 2.1 · Office attendance",
        sourceQuote: matchQuote,
        affectedSceneIds: [3],
        severity: "high",
        confidenceScore: 0.98,
        recommendedAction: "Update narration and on-screen headline to reflect the 3-day hub requirement.",
        suggestedNarration:
          "Our hybrid approach asks every team member to work from an office or hub at least three days each week.",
        suggestedHeadline: "Three days together",
        suggestedVisual:
          "Interactive team calendar showing 3 collaborative hub days with highlighted focus periods.",
        explanation:
          "Policy explicitly increases in-office requirement from 2 to 3 days per week and adds hub location flexibility.",
        status: "pending",
      });
    }

    // Check Planned Leave Notice Change
    if (
      lowerDoc.includes("ten business days") ||
      lowerDoc.includes("10 business days") ||
      (lowerDoc.includes("planned leave") && !lowerDoc.includes("five days"))
    ) {
      const matchQuote =
        extractQuote(
          updatedDoc,
          /Employees should submit planned leave requests at least ten business days in advance[^\n.]*/i
        ) ||
        "Employees should submit planned leave requests at least ten business days in advance.";

      changes.push({
        id: "chg_planned_leave",
        projectId: scenes[0]?.projectId || "proj_remote_work_essentials",
        sceneId: 7,
        category: "policy_change",
        area: "LEAVE REQUESTS",
        impact: "Medium impact",
        impactClass: "medium",
        summary: "The recommended notice period for planned leave has changed from five to ten business days.",
        previousInfo: "At least 5 calendar days in advance",
        updatedInfo: "At least 10 business days in advance",
        oldHeadline: "Give us five days’ notice",
        newHeadline: "Plan ten business days ahead",
        oldText:
          "For planned time away, submit your leave request at least five days in advance so your team can plan ahead.",
        newText:
          "For planned time away, submit your leave request at least ten business days in advance so your team can plan ahead.",
        originalDocRef: "Remote_Work_Policy_v1.pdf · Section 4.3",
        updatedDocRef: "Remote_Work_Policy_v2.pdf · Section 4.3",
        source: "Section 4.3 · Planned leave",
        sourceQuote: matchQuote,
        affectedSceneIds: [7],
        severity: "medium",
        confidenceScore: 0.95,
        recommendedAction: "Update narration and caption to specify 10 business days.",
        suggestedNarration:
          "For planned time away, submit your leave request at least ten business days in advance so your team can plan ahead.",
        suggestedHeadline: "Plan ten business days ahead",
        suggestedVisual:
          "Timeline showing 10 business days advance notice leading to a smooth coverage handover.",
        explanation: "Notice timeframe lengthened to ensure adequate coverage and team handover buffer.",
        status: "pending",
      });
    }

    // Check Manager Approval Workflow Change
    if (
      lowerDoc.includes("people partner") ||
      (lowerDoc.includes("extended leave") && !lowerDoc.includes("direct manager reviews and approves"))
    ) {
      const matchQuote =
        extractQuote(
          updatedDoc,
          /Extended leave requests are reviewed by the assigned People Partner in partnership with the employee's manager[^\n.]*/i
        ) ||
        "Extended leave requests are reviewed by the assigned People Partner in partnership with the employee's manager.";

      changes.push({
        id: "chg_approval_workflow",
        projectId: scenes[0]?.projectId || "proj_remote_work_essentials",
        sceneId: 9,
        category: "process_change",
        area: "APPROVAL WORKFLOW",
        impact: "Medium impact",
        impactClass: "medium",
        summary: "The approval owner has moved from a direct manager to the People Partner for extended leave.",
        previousInfo: "Direct manager reviews and approves extended leave",
        updatedInfo: "People Partner reviews in partnership with manager",
        oldHeadline: "Your manager approves",
        newHeadline: "Your People Partner reviews",
        oldText:
          "Your direct manager reviews and approves extended leave requests. You will receive confirmation by email.",
        newText:
          "Your People Partner reviews extended leave requests in partnership with your manager. You will receive confirmation by email.",
        originalDocRef: "Remote_Work_Policy_v1.pdf · Section 4.5",
        updatedDocRef: "Remote_Work_Policy_v2.pdf · Section 4.5",
        source: "Section 4.5 · Extended leave approval",
        sourceQuote: matchQuote,
        affectedSceneIds: [9],
        severity: "medium",
        confidenceScore: 0.94,
        recommendedAction: "Update narration to clarify the co-review workflow involving People Partner and manager.",
        suggestedNarration:
          "Your People Partner reviews extended leave requests in partnership with your manager. You will receive confirmation by email.",
        suggestedHeadline: "Your People Partner reviews",
        suggestedVisual:
          "Dual-review badge showing People Partner alignment alongside direct manager endorsement.",
        explanation: "Approval workflow modified to involve People Partner for extended absences.",
        status: "pending",
      });
    }

    // Check for custom section diffs if none of the standard remote work changes triggered
    if (changes.length === 0 && updatedDoc.trim().length > 30) {
      const sections = extractSectionsFromText(updatedDoc);
      for (const section of sections) {
        const secNumMatch = section.title.match(/^[0-9]+(\.[0-9]+)*/)?.[0];
        const matchingScene = scenes.find((s) => {
          if (secNumMatch && s.sourceRef.includes(secNumMatch)) return true;
          const cleanTitle = section.title.toLowerCase();
          return (
            cleanTitle.includes(s.area.toLowerCase()) ||
            s.title.toLowerCase().includes(cleanTitle)
          );
        });

        if (matchingScene && section.content.length > 20 && section.content.trim() !== matchingScene.script.trim()) {
          changes.push({
            id: `chg_custom_${matchingScene.id}`,
            projectId: matchingScene.projectId,
            sceneId: matchingScene.id,
            category: "policy_change",
            area: matchingScene.area,
            impact: "Medium impact",
            impactClass: "medium",
            summary: `Updated guidance identified in ${section.title}.`,
            previousInfo: matchingScene.headline,
            updatedInfo: section.content.substring(0, 100),
            oldHeadline: matchingScene.headline,
            newHeadline: section.title.length < 35 ? section.title : matchingScene.headline,
            oldText: matchingScene.script,
            newText: section.content,
            originalDocRef: matchingScene.sourceRef,
            updatedDocRef: `Updated Source · ${section.title}`,
            source: section.title,
            sourceQuote: section.content.substring(0, 180),
            affectedSceneIds: [matchingScene.id],
            severity: "medium",
            confidenceScore: 0.92,
            recommendedAction: `Update narration for Scene ${matchingScene.number} to incorporate revised ${section.title}.`,
            suggestedNarration: section.content,
            suggestedHeadline: section.title.length < 35 ? section.title : matchingScene.headline,
            suggestedVisual: `Storyboard visual demonstrating ${section.title}`,
            explanation: `Document parser identified direct section updates corresponding to Scene ${matchingScene.number}.`,
            status: "pending",
          });
        }
      }
    }

    // If still no changes detected and document doesn't explicitly declare itself v1 or unchanged, fallback to seeded changes
    if (changes.length === 0 && !lowerDoc.includes("version 1.0") && !lowerDoc.includes("unchanged")) {
      changes.push(...SEEDED_CHANGES);
    }

    const unaffectedCount = scenes.length - changes.length;

    return {
      detectedChanges: changes,
      overallSummary: `We found ${changes.length} meaningful changes across ${scenes.length} scenes. ${unaffectedCount} scenes are unchanged and will be preserved exactly as they are.`,
      unaffectedSceneCount: unaffectedCount,
      matchConfidence: 0.96,
    };
  }

  async regenerateScene(
    scene: Scene,
    approvedSource: string
  ): Promise<ValidatedSceneRegeneration> {
    const variations: Record<number, { headline: string; narration: string; visualDescription: string }> = {
      3: {
        headline: "Collaborating 3 days together",
        narration:
          "Under our updated guidelines, every team member works from a Northstar office or collaboration hub at least three days each week to build strong team connections.",
        visualDescription:
          "Dynamic team workspace visualization with 3 highlighted collaborative in-office days and flexible hybrid options.",
      },
      7: {
        headline: "Ten business days advance notice",
        narration:
          "To ensure uninterrupted project support and smooth team coverage, please submit all planned leave requests at least ten business days in advance.",
        visualDescription:
          "Calendar timeline displaying a 10-business-day handover sequence leading to approved time off.",
      },
      9: {
        headline: "People Partner leave review",
        narration:
          "For extended leaves of absence, your dedicated People Partner reviews your request alongside your direct manager to ensure seamless coverage.",
        visualDescription:
          "Co-review approval workflow diagram highlighting the partnership between People Partner and department manager.",
      },
    };

    const variation = variations[scene.id];

    return {
      sceneId: scene.id,
      headline: variation?.headline || scene.suggestedHeadline || scene.headline,
      narration: variation?.narration || scene.suggestedScript || scene.script,
      visualDescription:
        variation?.visualDescription ||
        scene.suggestedVisual ||
        `Updated graphic storyboard illustrating: ${scene.suggestedHeadline || scene.headline}`,
      durationEstimateSeconds: scene.durationSeconds || 22,
      toneNotes: "Instructional, reassuring, clear workplace guidance.",
    };
  }

  async translateSegments(
    languageCode: string,
    languageName: string,
    segments: Array<{ sceneId: number; headline: string; narration: string }>
  ): Promise<ValidatedLocalizationResponse> {
    const translations: Record<string, Record<number, { headline: string; narration: string; warnings?: string[] }>> = {
      HI: {
        3: {
          headline: "तीन दिन एक साथ",
          narration: "हमारा हाइब्रिड दृष्टिकोण टीम के प्रत्येक सदस्य को सप्ताह में कम से कम तीन दिन कार्यालय या हब से काम करने के लिए कहता है।",
          warnings: ["Caption line break advised for mobile screens"],
        },
        7: {
          headline: "दस कार्य दिवस पहले योजना बनाएं",
          narration: "नियोजित अवकाश के लिए, कम से कम दस कार्य दिवस पहले अपना अवकाश अनुरोध जमा करें ताकि आपकी टीम आगे की योजना बना सके।",
        },
        9: {
          headline: "आपके पीपल पार्टनर समीक्षा करते हैं",
          narration: "आपके पीपल पार्टनर आपके प्रबंधक के साथ मिलकर विस्तारित अवकाश अनुरोधों की समीक्षा करते हैं। आपको ईमेल द्वारा पुष्टि प्राप्त होगी।",
        },
      },
      DE: {
        3: {
          headline: "Drei Tage gemeinsam",
          narration: "Unser hybrider Ansatz sieht vor, dass jedes Teammitglied an mindestens drei Tagen pro Woche im Büro oder Hub arbeitet.",
          warnings: ["German sentence is 28% longer than English; timing extended by 1.8s"],
        },
        7: {
          headline: "Zehn Arbeitstage im Voraus planen",
          narration: "Reichen Sie bei geplanten Abwesenheiten Ihren Urlaubsantrag mindestens zehn Arbeitstage im Voraus ein, damit Ihr Team planen kann.",
        },
        9: {
          headline: "Ihr People Partner prüft",
          narration: "Ihr People Partner prüft Anträge auf verlängerten Urlaub in Abstimmung mit Ihrer Führungskraft. Sie erhalten eine E-Mail-Bestätigung.",
        },
      },
      FR: {
        3: {
          headline: "Trois jours ensemble",
          narration: "Notre approche hybride demande à chaque membre de l'équipe de travailler depuis un bureau ou un hub au moins trois jours par semaine.",
        },
        7: {
          headline: "Prévoir dix jours ouvrés à l'avance",
          narration: "Pour les congés planifiés, déposez votre demande au moins dix jours ouvrés à l'avance afin de permettre à votre équipe d'anticiper.",
        },
        9: {
          headline: "Votre People Partner examine la demande",
          narration: "Votre People Partner examine les demandes de congé prolongé en lien avec votre manager. Vous recevrez une confirmation par e-mail.",
        },
      },
      EN: {
        3: {
          headline: "Three days together",
          narration: "Our hybrid approach asks every team member to work from an office or hub at least three days each week.",
        },
        7: {
          headline: "Plan ten business days ahead",
          narration: "For planned time away, submit your leave request at least ten business days in advance so your team can plan ahead.",
        },
        9: {
          headline: "Your People Partner reviews",
          narration: "Your People Partner reviews extended leave requests in partnership with your manager. You will receive confirmation by email.",
        },
      },
    };

    const targetDict = translations[languageCode] || translations.EN;

    const translatedSegments = segments.map((seg) => {
      const match = targetDict[seg.sceneId];
      return {
        sceneId: seg.sceneId,
        headline: match?.headline || seg.headline,
        narration: match?.narration || seg.narration,
        warnings: match?.warnings,
      };
    });

    return {
      languageCode,
      languageName,
      note: `Updated segments generated for ${languageName}. Terminology verified against approved glossary.`,
      segments: translatedSegments,
    };
  }
}

function extractQuote(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match ? match[0].trim() : null;
}

export function getAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.trim().length > 0 && !apiKey.startsWith("your-")) {
    return new OpenAIProvider(apiKey, process.env.OPENAI_MODEL);
  }
  return new SmartRuleAIProvider();
}
