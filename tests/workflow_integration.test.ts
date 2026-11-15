import { describe, it, expect, beforeEach } from "vitest";
import { getProjectStore } from "../lib/db/store";
import { SmartRuleAIProvider } from "../lib/ai/provider";

describe("Critical End-to-End Workflow Integration", () => {
  const store = getProjectStore();
  const aiProvider = new SmartRuleAIProvider();

  beforeEach(() => {
    store.reset();
  });

  it("completes the full 10-step lifecycle: comparison -> review -> edit/regen -> localization -> publish v1.1 -> rollback", async () => {
    // 1. Initial State Check
    const initial = store.getState();
    expect(initial.project.title).toBe("Remote Work Essentials");
    expect(initial.project.currentVersion).toBe("1.0");
    expect(initial.scenes.length).toBe(12);
    expect(initial.languages.length).toBe(4);
    expect(initial.history.length).toBe(1);

    // 2. Attach updated policy document
    store.setSourceFile({
      id: "doc_test_v2",
      projectId: initial.project.id,
      name: "Remote_Work_Policy_v2.pdf",
      meta: "PDF document · 2.4 MB",
      versionLabel: "Policy v2 · Nov 12",
      fileSize: 2450000,
      fileType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      extractedText: "Office attendance 3 days. Planned leave 10 business days. Extended leave People Partner.",
    });

    // 3. Run AI change detection
    const comparison = await aiProvider.detectSourceChanges(
      "Original baseline v1.0",
      "Employees are expected to work from an office or hub at least three days per week. Planned leave 10 business days. Extended leave People Partner.",
      store.getScenes()
    );
    expect(comparison.detectedChanges.length).toBe(3);
    store.setChanges(
      comparison.detectedChanges.map((c) => ({
        ...c,
        projectId: initial.project.id,
        status: (c.status || "pending") as "pending" | "accepted" | "rejected",
      }))
    );

    // 4. Review 3 affected scenes
    const changes = store.getChanges();
    expect(changes.length).toBe(3);

    // 5. Accept two changes (Scene 03 & Scene 07)
    store.updateChangeStatus("chg_office_attendance", "accepted");
    store.updateChangeStatus("chg_planned_leave", "accepted");

    // 6. Reject one change (Scene 09)
    store.updateChangeStatus("chg_approval_workflow", "rejected");

    // Verify scene statuses
    const scene3 = store.getScene(3);
    expect(scene3?.status).toBe("accepted");
    expect(scene3?.headline).toBe("Three days together");

    const scene7 = store.getScene(7);
    expect(scene7?.status).toBe("accepted");

    const scene9 = store.getScene(9);
    expect(scene9?.status).toBe("rejected");
    expect(scene9?.headline).toBe("Your manager approves"); // Retains original

    // 7. Edit and regenerate Scene 03
    const editedHeadline = "Three days together in office hubs";
    const editedScript = "Our hybrid model asks team members to collaborate in an office hub at least three days each week.";
    store.updateScene(3, {
      headline: editedHeadline,
      script: editedScript,
    });
    expect(store.getScene(3)?.headline).toBe(editedHeadline);

    // 8. Review all 4 language variants
    const languages = store.getLanguages();
    languages.forEach((lang) => {
      store.updateLanguageStatus(lang.code, "approved");
    });
    const approvedLanguages = store.getLanguages().filter((l) => l.status === "approved");
    expect(approvedLanguages.length).toBe(4);

    // 9. Publish version 1.1
    const newVersion = store.publishVersion("Updated remote work and leave policy guidance.");
    expect(newVersion.version).toBe("1.1");
    expect(store.getProject().currentVersion).toBe("1.1");
    expect(store.getHistory().length).toBe(2);

    // Verify snapshot immutability
    const v1_1_snapshot = store.getHistory().find((h) => h.version === "1.1");
    expect(v1_1_snapshot?.snapshot.scenes.find((s) => s.id === 3)?.headline).toBe(editedHeadline);

    // 10. Rollback to version 1.0
    const rollbackSuccess = store.rollbackToVersion("1.0");
    expect(rollbackSuccess).toBe(true);
    expect(store.getProject().currentVersion).toBe("1.0");
    expect(store.getScene(3)?.headline).toBe("Two days in the office"); // Restored original!

    // History is preserved (never deleted)
    expect(store.getHistory().length).toBe(2);
  });
});
