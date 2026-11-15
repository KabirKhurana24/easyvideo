import { describe, it, expect, beforeEach } from "vitest";
import { getProjectStore } from "../lib/db/store";
import { DUMMY_USERS, DUMMY_ORGANIZATIONS } from "../lib/data/seededUsers";

describe("User Authentication, Personas & RBAC Audit Tracking", () => {
  const store = getProjectStore();

  beforeEach(() => {
    store.reset();
  });

  it("provides pre-configured dummy personas with correct role assignments", () => {
    expect(DUMMY_USERS.length).toBeGreaterThanOrEqual(4);

    const admin = DUMMY_USERS.find((u) => u.role === "admin");
    const editor = DUMMY_USERS.find((u) => u.role === "editor");
    const reviewer = DUMMY_USERS.find((u) => u.role === "reviewer");

    expect(admin).toBeDefined();
    expect(admin?.fullName).toBe("Kabir Khurana");

    expect(editor).toBeDefined();
    expect(editor?.fullName).toBe("Sarah Lin");

    expect(reviewer).toBeDefined();
    expect(reviewer?.fullName).toBe("Elena Rostova");
  });

  it("provides multiple workspaces for tenancy switching", () => {
    expect(DUMMY_ORGANIZATIONS.length).toBeGreaterThanOrEqual(3);
    expect(DUMMY_ORGANIZATIONS.map((o) => o.slug)).toContain("northstar-people");
  });

  it("accurately attributes audit logs to Sarah Lin (Editor) when editing scenes and making decisions", () => {
    const sarah = DUMMY_USERS.find((u) => u.id === "user_sarah")!;

    // Sarah edits scene 2
    store.updateScene(
      2,
      { headline: "Ergonomic Home Workspace" },
      { userId: sarah.id, userName: sarah.fullName, avatar: sarah.avatarUrl }
    );

    const logs = store.getAuditLogs();
    const sceneLog = logs.find((l) => l.action.includes("Scene 02"));
    expect(sceneLog).toBeDefined();
    expect(sceneLog?.userName).toBe("Sarah Lin");
    expect(sceneLog?.avatar).toBe("SL");

    // Sarah accepts change
    store.updateChangeStatus(
      "chg_office_attendance",
      "accepted",
      undefined,
      { userId: sarah.id, userName: sarah.fullName, avatar: sarah.avatarUrl }
    );

    const changeLog = store.getAuditLogs().find((l) => l.action === "Change accepted");
    expect(changeLog).toBeDefined();
    expect(changeLog?.userName).toBe("Sarah Lin");
  });

  it("accurately attributes localization reviews to Elena Rostova (Reviewer)", () => {
    const elena = DUMMY_USERS.find((u) => u.id === "user_elena")!;

    store.updateLanguageStatus(
      "DE",
      "approved",
      undefined,
      { userId: elena.id, userName: elena.fullName, avatar: elena.avatarUrl }
    );

    const langLog = store.getAuditLogs().find((l) => l.action === "Language approved");
    expect(langLog).toBeDefined();
    expect(langLog?.userName).toBe("Elena Rostova");
    expect(langLog?.avatar).toBe("ER");
  });

  it("accurately records author attribution upon publishing", () => {
    const admin = DUMMY_USERS.find((u) => u.role === "admin")!;

    // Accept remaining changes and approve languages to allow publish
    store.updateChangeStatus("chg_office_attendance", "accepted");
    store.updateChangeStatus("chg_planned_leave", "accepted");
    store.updateChangeStatus("chg_approval_workflow", "accepted");

    store.getLanguages().forEach((l) => {
      store.updateLanguageStatus(l.code, "approved");
    });

    const published = store.publishVersion("Verified hybrid attendance updates", {
      userId: admin.id,
      userName: admin.fullName,
      avatar: admin.avatarUrl,
    });

    expect(published.author).toBe("Kabir Khurana");
    expect(published.version).toBe("1.1");

    const pubLog = store.getAuditLogs().find((l) => l.action.includes("Version 1.1 published"));
    expect(pubLog?.userName).toBe("Kabir Khurana");
  });
});
