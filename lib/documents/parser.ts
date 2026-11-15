import AdmZip from "adm-zip";
import mammoth from "mammoth";

export interface ExtractedSection {
  title: string;
  content: string;
  pageOrSlide?: number;
}

export interface DocumentParseResult {
  filename: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  sections: ExtractedSection[];
  metadata: {
    pageCount?: number;
    slideCount?: number;
    wordCount: number;
    parsedAt: string;
  };
}

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "text/plain": "txt",
  "text/markdown": "md",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-powerpoint": "ppt",
};

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function parseDocument(
  fileBuffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<DocumentParseResult> {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  let extractedText = "";
  let sections: ExtractedSection[] = [];
  let pageCount: number | undefined;
  let slideCount: number | undefined;

  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed size (25 MB).`);
  }

  // 1. Text & Markdown
  if (extension === "txt" || extension === "md" || mimeType?.includes("text")) {
    extractedText = fileBuffer.toString("utf-8");
    sections = extractSectionsFromText(extractedText);
  }
  // 2. PDF
  else if (extension === "pdf" || mimeType === "application/pdf") {
    try {
      // Dynamic require for pdf-parse to handle server-side build bundling
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text || "";
      pageCount = pdfData.numpages || 1;
      sections = extractSectionsFromText(extractedText);
    } catch (err: unknown) {
      console.warn("pdf-parse fallback, extracting plain strings from buffer:", err);
      // Fallback: extract legible ASCII/UTF-8 streams from PDF buffer
      const textMatches = fileBuffer.toString("binary").match(/[A-Za-z0-9\s.,!?:;'"()\-_]{4,}/g);
      extractedText = textMatches ? textMatches.join(" ") : fileBuffer.toString("utf-8");
      sections = extractSectionsFromText(extractedText);
    }
  }
  // 3. Word Document (DOCX)
  else if (extension === "docx") {
    try {
      const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxResult.value || "";
      sections = extractSectionsFromText(extractedText);
    } catch (err: unknown) {
      throw new Error(`Failed to parse DOCX file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  // 4. PowerPoint Presentation (PPTX)
  else if (extension === "pptx") {
    try {
      const zip = new AdmZip(fileBuffer);
      const zipEntries = zip.getEntries();
      const slideEntries = zipEntries
        .filter((entry) => entry.entryName.match(/ppt\/slides\/slide[0-9]+\.xml/i))
        .sort((a, b) => {
          const numA = parseInt(a.entryName.match(/[0-9]+/)?.[0] || "0", 10);
          const numB = parseInt(b.entryName.match(/[0-9]+/)?.[0] || "0", 10);
          return numA - numB;
        });

      slideCount = slideEntries.length;
      const allSlideTexts: string[] = [];

      slideEntries.forEach((entry, index) => {
        const xml = entry.getData().toString("utf-8");
        // Extract text inside <a:t> tags
        const textTokens = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/gi) || [];
        const slideText = textTokens
          .map((t) => t.replace(/<[^>]+>/g, "").trim())
          .filter(Boolean)
          .join(" ");

        if (slideText) {
          allSlideTexts.push(slideText);
          sections.push({
            title: `Slide ${index + 1}`,
            content: slideText,
            pageOrSlide: index + 1,
          });
        }
      });

      extractedText = allSlideTexts.join("\n\n");
    } catch (err: unknown) {
      throw new Error(`Failed to parse PPTX presentation: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    // Default fallback: UTF-8 decode
    extractedText = fileBuffer.toString("utf-8");
    sections = extractSectionsFromText(extractedText);
  }

  const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;

  return {
    filename,
    fileType: mimeType || extension,
    fileSize: fileBuffer.length,
    extractedText: extractedText.trim(),
    sections,
    metadata: {
      pageCount,
      slideCount,
      wordCount,
      parsedAt: new Date().toISOString(),
    },
  };
}

/**
 * Splits extracted document text into logical sections based on section headers,
 * numbers (e.g. 2.1, 4.3), or markdown headers (# Section).
 */
export function extractSectionsFromText(text: string): ExtractedSection[] {
  const lines = text.split("\n").map((l) => l.trim());
  const sections: ExtractedSection[] = [];
  let currentTitle = "General";
  let currentContent: string[] = [];

  const sectionHeaderPattern = /^([0-9]+(\.[0-9]+)*\s+[A-Z\s]{3,}|#{1,4}\s+.+|[A-Z\s]{4,}:?)$/;

  for (const line of lines) {
    if (!line) continue;

    if (sectionHeaderPattern.test(line) && line.length < 90) {
      if (currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join(" "),
        });
        currentContent = [];
      }
      currentTitle = line.replace(/^#{1,4}\s*/, "").trim();
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join(" "),
    });
  }

  return sections.length > 0 ? sections : [{ title: "Full Document", content: text.trim() }];
}
