import { NextResponse } from "next/server";
import { parseDocument, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/documents/parser";
import { getProjectStore } from "@/lib/db/store";
import { getAIProvider } from "@/lib/ai/provider";
import { formatFileSize } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in form data" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 25 MB limit (${formatFileSize(file.size)}).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Genuine server-side parsing
    const parseResult = await parseDocument(buffer, file.name, file.type);

    const store = getProjectStore();
    const currentState = store.getState();
    const aiProvider = getAIProvider();

    // 2. Attach updated document metadata
    const versionCount = currentState.history.length + 1;
    const versionLabel = `Policy v${versionCount} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    const userName = (formData.get("userName") as string) || "Kabir Khurana";
    const userId = (formData.get("userId") as string) || "user_current";
    const avatar = (formData.get("avatar") as string) || "KK";

    store.setSourceFile(
      {
        id: `doc_${Date.now()}`,
        projectId: currentState.project.id,
        name: file.name,
        meta: `${file.name.split(".").pop()?.toUpperCase() || "DOC"} document · ${formatFileSize(file.size)}`,
        versionLabel,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        uploadedAt: new Date().toISOString(),
        extractedText: parseResult.extractedText,
        sections: parseResult.sections,
      },
      { userId, userName, avatar }
    );

    // 3. AI Comparison against existing baseline scenes
    const originalDocBaseline = currentState.sourceFile.extractedText || "Original Northstar Remote Work Policy v1.0";
    const comparisonResult = await aiProvider.detectSourceChanges(
      originalDocBaseline,
      parseResult.extractedText,
      currentState.scenes
    );

    // 4. Update store changes
    store.setChanges(
      comparisonResult.detectedChanges.map((c) => ({
        ...c,
        projectId: currentState.project.id,
        status: (c.status || "pending") as "pending" | "accepted" | "rejected",
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        document: {
          filename: file.name,
          fileSize: file.size,
          formattedSize: formatFileSize(file.size),
          wordCount: parseResult.metadata.wordCount,
          sectionsFound: parseResult.sections.length,
          versionLabel,
        },
        comparison: comparisonResult,
        updatedState: store.getState(),
      },
    });
  } catch (error) {
    console.error("Document upload & parsing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process document",
      },
      { status: 500 }
    );
  }
}
