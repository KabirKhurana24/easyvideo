import { describe, it, expect } from "vitest";
import {
  generateSRT,
  generateVTT,
  generateProductionScript,
  generateChangelog,
} from "../lib/export/subtitles";
import { SEEDED_SCENES, SEEDED_HISTORY } from "../lib/data/seededProject";

describe("Export & Subtitle Generation", () => {
  it("generates compliant SRT subtitles with progressive cue timestamps", () => {
    const srt = generateSRT(SEEDED_SCENES.slice(0, 3));
    expect(srt).toContain("1\n00:00:00,000 --> 00:00:20,000");
    expect(srt).toContain("Welcome to Northstar");
    expect(srt).toContain("2\n00:00:20,500 --> 00:00:44,500");
    expect(srt).toContain("3\n00:00:45,000 --> 00:01:07,000");
  });

  it("generates valid WebVTT header and voice tags", () => {
    const vtt = generateVTT(SEEDED_SCENES.slice(0, 2));
    expect(vtt).toContain("WEBVTT");
    expect(vtt).toContain("00:00:00.000 --> 00:00:20.000");
    expect(vtt).toContain("<v Host>Welcome to Northstar</v>");
  });

  it("generates markdown production script with visual cues", () => {
    const script = generateProductionScript("Remote Work Essentials", "1.1", SEEDED_SCENES);
    expect(script).toContain("# Remote Work Essentials — Production Script (v1.1)");
    expect(script).toContain("### SCENE 01: WELCOME TO REMOTE WORK");
    expect(script).toContain("[VISUAL DIRECTION]");
    expect(script).toContain("[ON-SCREEN HEADLINE]");
    expect(script).toContain("[SPOKEN NARRATION]");
  });

  it("generates markdown changelog from published version snapshot", () => {
    const changelog = generateChangelog(SEEDED_HISTORY[0]);
    expect(changelog).toContain("# Changelog — Version 1.0");
    expect(changelog).toContain("Original remote work onboarding video");
    expect(changelog).toContain("Preserved Unchanged Content");
  });
});
