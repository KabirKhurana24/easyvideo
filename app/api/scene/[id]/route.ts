import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateSceneSchema = z.object({
  headline: z.string().optional(),
  script: z.string().optional(),
  visualDescription: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected", "unchanged"]).optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sceneId = parseInt(params.id, 10);
    if (isNaN(sceneId)) {
      return NextResponse.json({ success: false, error: "Invalid scene ID" }, { status: 400 });
    }

    const store = getProjectStore();
    const scene = store.getScene(sceneId);
    if (!scene) {
      return NextResponse.json({ success: false, error: `Scene ${sceneId} not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: scene });
  } catch (error) {
    console.error("Get scene error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sceneId = parseInt(params.id, 10);
    if (isNaN(sceneId)) {
      return NextResponse.json({ success: false, error: "Invalid scene ID" }, { status: 400 });
    }

    const body = await req.json();
    const validated = UpdateSceneSchema.parse(body);

    const store = getProjectStore();
    const existing = store.getScene(sceneId);
    if (!existing) {
      return NextResponse.json({ success: false, error: `Scene ${sceneId} not found` }, { status: 404 });
    }

    const userCtx = validated.user
      ? {
          userId: validated.user.id,
          userName: validated.user.name,
          avatar: validated.user.avatar,
        }
      : undefined;

    const updated = store.updateScene(
      sceneId,
      {
        ...validated,
        suggestedHeadline: validated.headline || existing.suggestedHeadline,
        suggestedScript: validated.script || existing.suggestedScript,
        suggestedVisual: validated.visualDescription || existing.suggestedVisual,
      },
      userCtx
    );

    return NextResponse.json({
      success: true,
      data: {
        scene: updated,
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Update scene error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update scene" },
      { status: 400 }
    );
  }
}
