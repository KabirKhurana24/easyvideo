import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import { getAIProvider } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sceneId = parseInt(params.id, 10);
    if (isNaN(sceneId)) {
      return NextResponse.json(
        { success: false, error: "Invalid scene ID" },
        { status: 400 }
      );
    }

    const store = getProjectStore();
    const scene = store.getScene(sceneId);
    if (!scene) {
      return NextResponse.json(
        { success: false, error: `Scene ${sceneId} not found` },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const aiProvider = getAIProvider();

    // Source context
    const sourceEvidence =
      scene.sourceQuote ||
      body.sourceEvidence ||
      "Employees are expected to work from an office or hub at least three days per week.";

    const regenerated = await aiProvider.regenerateScene(scene, sourceEvidence, body);

    // Update scene draft values in store
    store.updateScene(sceneId, {
      suggestedHeadline: regenerated.headline,
      suggestedScript: regenerated.narration,
      suggestedVisual: regenerated.visualDescription,
    });

    store.addAuditLog({
      action: `AI regenerated Scene ${scene.number}`,
      details: `Generated new narration & storyboard visual using ${aiProvider.name}.`,
      isAi: true,
      userName: "EasyVideo AI",
      userId: "system_ai",
    });

    return NextResponse.json({
      success: true,
      data: {
        regenerated,
        updatedScene: store.getScene(sceneId),
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Regeneration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to regenerate scene",
      },
      { status: 500 }
    );
  }
}
