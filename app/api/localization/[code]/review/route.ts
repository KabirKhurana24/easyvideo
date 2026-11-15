import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import { getAIProvider } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();
    const body = await req.json();
    const store = getProjectStore();

    if (body.action === "translate_changed_scenes") {
      const state = store.getState();
      const acceptedScenes = state.scenes.filter((s) => s.status === "accepted");
      const targetScenes =
        acceptedScenes.length > 0
          ? acceptedScenes
          : state.scenes.filter((s) => s.isAffected);

      const aiProvider = getAIProvider();
      const lang = state.languages.find((l) => l.code === code);
      const languageName = lang?.name || code;

      const translationResult = await aiProvider.translateSegments(
        code,
        languageName,
        targetScenes.map((s) => ({
          sceneId: s.id,
          headline: s.headline,
          narration: s.script,
        }))
      );

      // Merge new translations into existing segments map
      const existingMap = new Map((lang?.translatedSegments || []).map((seg) => [seg.sceneId, seg]));
      translationResult.segments.forEach((seg) => {
        existingMap.set(seg.sceneId, {
          sceneId: seg.sceneId,
          sceneNumber: String(seg.sceneId).padStart(2, "0"),
          headline: seg.headline,
          narration: seg.narration,
          status: "pending",
          warnings: seg.warnings,
        });
      });

      const mergedSegments = Array.from(existingMap.values()).sort((a, b) => a.sceneId - b.sceneId);

      const updated = store.updateLanguageStatus(
        code,
        "review",
        mergedSegments
      );

      return NextResponse.json({
        success: true,
        data: { language: updated, state: store.getState() },
      });
    }

    const userCtx = body.user
      ? {
          userId: body.user.id,
          userName: body.user.name,
          avatar: body.user.avatar,
        }
      : undefined;

    const updated = store.updateLanguageStatus(
      code,
      body.status || "approved",
      body.segments,
      userCtx
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Language ${code} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        language: updated,
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Localization review error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update localization",
      },
      { status: 400 }
    );
  }
}
