import { NextResponse } from "next/server";
import { getProjectStore } from "@/lib/db/store";
import { z } from "zod";

const DecisionSchema = z.object({
  status: z.enum(["accepted", "rejected", "pending"]),
  headline: z.string().optional(),
  script: z.string().optional(),
  visual: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = DecisionSchema.parse(body);

    const store = getProjectStore();
    const updatedChange = store.updateChangeStatus(
      id,
      validated.status,
      {
        headline: validated.headline,
        script: validated.script,
        visual: validated.visual,
      },
      validated.user
        ? {
            userId: validated.user.id,
            userName: validated.user.name,
            avatar: validated.user.avatar,
          }
        : undefined
    );

    if (!updatedChange) {
      return NextResponse.json(
        { success: false, error: `Change with id "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        change: updatedChange,
        state: store.getState(),
      },
    });
  } catch (error) {
    console.error("Change decision error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record decision",
      },
      { status: 400 }
    );
  }
}
