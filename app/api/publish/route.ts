import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getProjectStore();
    const state = store.getState();

    // 1. Validation checks
    const pendingChanges = state.changes.filter((c) => c.status === "pending");
    if (pendingChanges.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot publish: ${pendingChanges.length} scene changes are still pending review. Please accept or reject all suggested changes first.`,
        },
        { status: 400 }
      );
    }

    const unapprovedLanguages = state.languages.filter((l) => l.status !== "approved");
    if (unapprovedLanguages.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot publish: ${unapprovedLanguages.length} language variants (${unapprovedLanguages.map((l) => l.name).join(", ")}) still require QA review and approval.`,
        },
        { status: 400 }
      );
    }

    // 2. Publish new version snapshot
    const userCtx = body.user
      ? {
          userId: body.user.id,
          userName: body.user.name,
          avatar: body.user.avatar,
        }
      : undefined;

    const newVersion = store.publishVersion(body.note, userCtx);

    return NextResponse.json({
      success: true,
      message: `Version ${newVersion.version} published successfully!`,
      data: {
        publishedVersion: newVersion,
        history: store.getHistory(),
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Publishing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to publish version",
      },
      { status: 500 }
    );
  }
}
