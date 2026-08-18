import { NextRequest, NextResponse } from "next/server";
import {
  LISTING_GENERATION_PROMPT,
  parseAIResponse,
  getMockAIResult,
} from "@/lib/ai/listing-generator";
import {
  createListing,
  uploadListingImage,
  setListingInventory,
} from "@/lib/etsy/listings";
import { getActiveShop } from "@/lib/etsy/auth";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const imageFiles = formData.getAll("images") as File[];
    const saveToEtsy = formData.get("saveToEtsy") === "true";

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResult;
    let isDemo = false;

    // ── Demo mode ─────────────────────────────────────────────────────────────
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      console.log("[AI] No Gemini API key — returning demo result");
      await new Promise((r) => setTimeout(r, 2500));
      aiResult = getMockAIResult();
      isDemo   = true;
    } else {
      // ── Real Gemini Vision ──────────────────────────────────────────────────
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imageParts = await Promise.all(
        imageFiles.map(async (file) => {
          const bytes  = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString("base64");
          return {
            inlineData: {
              data:     base64,
              mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
            },
          };
        })
      );

      const result  = await model.generateContent([LISTING_GENERATION_PROMPT, ...imageParts]);
      const rawText = result.response.text();
      aiResult      = parseAIResponse(rawText);
    }

    // ── Save to Etsy as draft (if requested and shop is connected) ────────────
    let etsyListingId: number | null = null;
    let etsyListingUrl: string | null = null;

    if (saveToEtsy) {
      const shop = await getActiveShop();

      if (!shop) {
        // Return AI result but note shop not connected
        return NextResponse.json({
          result: aiResult,
          demo:   isDemo,
          saved:  false,
          saveError: "No Etsy shop connected. Connect in Settings first.",
        });
      }

      try {
        // 1. Create the listing as draft
        const newListing = await createListing({
          title:       aiResult.title,
          description: aiResult.description,
          price:       SHOP_DEFAULTS.pricing.regions.india,
          quantity:    SHOP_DEFAULTS.quantity,
          tags:        aiResult.tags,
          state:       "draft",
        });

        etsyListingId  = newListing.listing_id;
        etsyListingUrl = newListing.url;

        // 2. Upload all images to the listing
        for (let i = 0; i < imageFiles.length; i++) {
          const file   = imageFiles[i];
          const buffer = Buffer.from(await file.arrayBuffer());
          await uploadListingImage(String(etsyListingId), buffer, file.type, i + 1);
        }

        // 3. Set inventory (size × shape variations + pricing)
        try {
          await setListingInventory(String(etsyListingId));
        } catch (invErr) {
          // Inventory setup can fail on some shop configurations — not fatal
          console.warn("[AI Route] Inventory setup warning:", invErr);
        }

      } catch (etsyErr: any) {
        console.error("[AI Route] Etsy save failed:", etsyErr);
        return NextResponse.json({
          result:    aiResult,
          demo:      isDemo,
          saved:     false,
          saveError: etsyErr.message,
        });
      }
    }

    return NextResponse.json({
      result:        aiResult,
      demo:          isDemo,
      saved:         !!etsyListingId,
      etsyListingId,
      etsyListingUrl,
    });

  } catch (err: any) {
    console.error("[AI generate-listing]", err);
    return NextResponse.json({ error: err.message ?? "AI generation failed" }, { status: 500 });
  }
}
