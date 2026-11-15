import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import { getAIProvider } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = getProjectStore();
    const state = store.getState();
    const aiProvider = getAIProvider();

    return NextResponse.json({
      success: true,
      data: state,
      aiProvider: {
        name: aiProvider.name,
        isExternal: aiProvider.isExternal,
      },
    });
  } catch (error) {
    console.error("Failed to get project state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve project state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const store = getProjectStore();

    if (body.action === "reset") {
      const resetState = store.reset();
      return NextResponse.json({
        success: true,
        message: "Demo project reset to initial seeded state",
        data: resetState,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported project action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Project action error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
