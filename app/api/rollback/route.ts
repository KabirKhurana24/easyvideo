import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { success: false, error: "Target version is required for rollback" },
        { status: 400 }
      );
    }

    const store = getProjectStore();
    const userCtx = body.user
      ? {
          userId: body.user.id,
          userName: body.user.name,
          avatar: body.user.avatar,
        }
      : undefined;

    const success = store.rollbackToVersion(version, userCtx);

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Version "${version}" was not found in history.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to Version ${version}. Prior history remains preserved.`,
      data: {
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Rollback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to execute rollback",
      },
      { status: 500 }
    );
  }
}
