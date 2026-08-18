import { NextRequest, NextResponse } from "next/server";
import {
  LISTING_GENERATION_PROMPT,
  parseAIResponse,
  getMockAIResult,
} from "@/lib/ai/listing-generator";

export const maxDuration = 60; // Allow up to 60s for AI + image processing

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFiles = formData.getAll("images") as File[];

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // ── Demo mode (no API key) ───────────────────────────────────────────────
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      console.log("[AI] No Gemini API key — returning demo result");
      // Simulate processing delay so the UI loading state is visible
      await new Promise((r) => setTimeout(r, 2500));
      return NextResponse.json({ result: getMockAIResult(), demo: true });
    }

    // ── Real Gemini Vision call ───────────────────────────────────────────────
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert all uploaded images to base64 inline parts
    const imageParts = await Promise.all(
      imageFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        return {
          inlineData: {
            data: base64,
            mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
          },
        };
      })
    );

    const result = await model.generateContent([
      LISTING_GENERATION_PROMPT,
      ...imageParts,
    ]);

    const rawText = result.response.text();
    const parsed = parseAIResponse(rawText);

    return NextResponse.json({ result: parsed, demo: false });
  } catch (err: any) {
    console.error("[AI generate-listing] Error:", err);
    return NextResponse.json(
      { error: err.message ?? "AI generation failed" },
      { status: 500 }
    );
  }
}
