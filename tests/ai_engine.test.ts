import { describe, it, expect } from "vitest";
import { SmartRuleAIProvider } from "../lib/ai/provider";
import { ChangeDetectionResultSchema } from "../lib/ai/schemas";
import { SEEDED_SCENES } from "../lib/data/seededProject";

describe("AI Change Detection and Scene Mapping", () => {
  const provider = new SmartRuleAIProvider();

  it("detects the three seeded changes and maps them strictly to Scenes 03, 07, and 09", async () => {
    const updatedPolicyText = `NORTHSTAR PEOPLE & CULTURE
REMOTE WORK POLICY — VERSION 2.0
Effective: November 12, 2026

2.1 OFFICE ATTENDANCE
Employees are expected to work from an office or hub at least three days per week. Teams may agree on which days are most useful for collaboration.

4.3 PLANNED LEAVE
Employees should submit planned leave requests at least ten business days in advance. This gives teams sufficient time to plan coverage and handovers.

4.5 EXTENDED LEAVE APPROVAL
Extended leave requests are reviewed by the assigned People Partner in partnership with the employee's manager. Employees will receive confirmation by email.

All other sections of the Remote Work Policy remain unchanged.`;

    const result = await provider.detectSourceChanges(
      "Original baseline policy v1.0",
      updatedPolicyText,
      SEEDED_SCENES
    );

    // Validate with strict Zod schema
    const validated = ChangeDetectionResultSchema.parse(result);
    expect(validated.detectedChanges.length).toBe(3);
    expect(validated.matchConfidence).toBeGreaterThanOrEqual(0.9);

    // Verify Scene 03 mapping
    const scene3Change = validated.detectedChanges.find((c) => c.sceneId === 3);
    expect(scene3Change).toBeDefined();
    expect(scene3Change?.category).toBe("numerical_change");
    expect(scene3Change?.sourceQuote).toContain("three days per week");
    expect(scene3Change?.newHeadline).toContain("Three days together");

    // Verify Scene 07 mapping
    const scene7Change = validated.detectedChanges.find((c) => c.sceneId === 7);
    expect(scene7Change).toBeDefined();
    expect(scene7Change?.category).toBe("policy_change");
    expect(scene7Change?.sourceQuote).toContain("ten business days");

    // Verify Scene 09 mapping
    const scene9Change = validated.detectedChanges.find((c) => c.sceneId === 9);
    expect(scene9Change).toBeDefined();
    expect(scene9Change?.category).toBe("process_change");
    expect(scene9Change?.sourceQuote).toContain("People Partner");

    // Verify exactly 9 scenes remain unaffected
    expect(validated.unaffectedSceneCount).toBe(9);
  });

  it("regenerates a scene while preserving instructional tone and objectives", async () => {
    const scene03 = SEEDED_SCENES.find((s) => s.id === 3)!;
    const regenerated = await provider.regenerateScene(
      scene03,
      "Employees are expected to work from an office or hub at least three days per week."
    );

    expect(regenerated.sceneId).toBe(3);
    expect(regenerated.headline.length).toBeGreaterThan(2);
    expect(regenerated.narration.length).toBeGreaterThan(10);
    expect(regenerated.visualDescription).toBeDefined();
  });

  it("translates changed segments into Hindi, German, and French with layout checks", async () => {
    const segments = [
      {
        sceneId: 3,
        headline: "Three days together",
        narration: "Our hybrid approach asks every team member to work from an office or hub at least three days each week.",
      },
    ];

    const germanResult = await provider.translateSegments("DE", "German", segments);
    expect(germanResult.languageCode).toBe("DE");
    expect(germanResult.segments[0].headline).toBe("Drei Tage gemeinsam");
    expect(germanResult.segments[0].warnings).toBeDefined();
    expect(germanResult.segments[0].warnings?.[0]).toContain("longer than English");

    const hindiResult = await provider.translateSegments("HI", "Hindi", segments);
    expect(hindiResult.segments[0].headline).toBe("तीन दिन एक साथ");
  });
});
