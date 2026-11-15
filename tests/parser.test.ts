import { describe, it, expect } from "vitest";
import { parseDocument, extractSectionsFromText } from "../lib/documents/parser";

describe("Document Parser Engine", () => {
  it("extracts sections and structured headings from policy text", async () => {
    const samplePolicy = `NORTHSTAR PEOPLE & CULTURE
REMOTE WORK POLICY — VERSION 2.0
Effective: November 12, 2026

2.1 OFFICE ATTENDANCE
Employees are expected to work from an office or hub at least three days per week. Teams may agree on which days are most useful for collaboration.

4.3 PLANNED LEAVE
Employees should submit planned leave requests at least ten business days in advance.

4.5 EXTENDED LEAVE APPROVAL
Extended leave requests are reviewed by the assigned People Partner in partnership with the employee's manager.`;

    const buffer = Buffer.from(samplePolicy, "utf-8");
    const result = await parseDocument(buffer, "Remote_Work_Policy_v2.txt", "text/plain");

    expect(result.filename).toBe("Remote_Work_Policy_v2.txt");
    expect(result.extractedText).toContain("OFFICE ATTENDANCE");
    expect(result.extractedText).toContain("three days per week");
    expect(result.metadata.wordCount).toBeGreaterThan(30);

    const sections = extractSectionsFromText(samplePolicy);
    expect(sections.length).toBeGreaterThanOrEqual(3);
    const attendanceSection = sections.find((s) => s.title.includes("OFFICE ATTENDANCE"));
    expect(attendanceSection).toBeDefined();
    expect(attendanceSection?.content).toContain("three days per week");
  });

  it("enforces maximum file size limit", async () => {
    // 26 MB buffer exceeds 25 MB limit
    const largeBuffer = Buffer.alloc(26 * 1024 * 1024);
    await expect(
      parseDocument(largeBuffer, "oversized.pdf", "application/pdf")
    ).rejects.toThrow(/exceeds maximum allowed size/i);
  });
});
