import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import {
  generateSRT,
  generateVTT,
  generateProductionScript,
  generateChangelog,
} from "@/lib/export/subtitles";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const langCode = (searchParams.get("lang") || "EN").toUpperCase();
    const versionStr = searchParams.get("version");

    const store = getProjectStore();
    const state = store.getState();

    // Select snapshot if version specified, otherwise current state
    const targetHistory = versionStr
      ? state.history.find((h) => h.version === versionStr)
      : state.history[state.history.length - 1];

    const scenes = targetHistory ? targetHistory.snapshot.scenes : state.scenes;
    const languages = targetHistory ? targetHistory.snapshot.languages : state.languages;
    const selectedLang = languages.find((l) => l.code === langCode);
    const versionNumber = targetHistory ? targetHistory.version : state.project.currentVersion;

    if (format === "srt") {
      const srtContent = generateSRT(scenes, selectedLang?.translatedSegments);
      return new NextResponse(srtContent, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="Remote_Work_Essentials_v${versionNumber}_${langCode}.srt"`,
        },
      });
    }

    if (format === "vtt") {
      const vttContent = generateVTT(scenes, selectedLang?.translatedSegments);
      return new NextResponse(vttContent, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Content-Disposition": `attachment; filename="Remote_Work_Essentials_v${versionNumber}_${langCode}.vtt"`,
        },
      });
    }

    if (format === "script") {
      const scriptContent = generateProductionScript(
        state.project.title,
        versionNumber,
        scenes
      );
      return new NextResponse(scriptContent, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="Remote_Work_Essentials_v${versionNumber}_Script.md"`,
        },
      });
    }

    if (format === "changelog") {
      const changelogContent = targetHistory
        ? generateChangelog(targetHistory)
        : "# No published versions yet";
      return new NextResponse(changelogContent, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="Remote_Work_Essentials_v${versionNumber}_Changelog.md"`,
        },
      });
    }

    // Default: full JSON export
    return NextResponse.json({
      project: state.project,
      exportedAt: new Date().toISOString(),
      activeVersion: versionNumber,
      scenes,
      languages,
      sourceFile: state.sourceFile,
      history: state.history,
      auditLogs: state.auditLogs,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Export failed",
      },
      { status: 500 }
    );
  }
}
