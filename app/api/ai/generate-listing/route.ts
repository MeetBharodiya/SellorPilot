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
  getShippingProfiles,
} from "@/lib/etsy/listings";
import { getActiveShop } from "@/lib/etsy/auth";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const imageFiles = formData.getAll("images") as File[];
    const saveToEtsy = formData.get("saveToEtsy") === "true";

    // ── MODE: Save pre-generated AI result to Etsy ───────────────────────────
    // When the client already has an aiResult and only wants to save to Etsy,
    // it passes the JSON in "aiResult" field — skip Gemini entirely.
    const prebuiltJson = formData.get("aiResult");
    if (saveToEtsy && prebuiltJson) {
      const aiResult = JSON.parse(prebuiltJson as string);
      return await saveListingToEtsy(aiResult, imageFiles);
    }

    // ── MODE: AI generation (no save yet) ────────────────────────────────────
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResult;
    let isDemo = false;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      console.log("[AI] No Gemini API key — returning demo result");
      await new Promise((r) => setTimeout(r, 2500));
      aiResult = getMockAIResult();
      isDemo   = true;
    } else {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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

    return NextResponse.json({ result: aiResult, demo: isDemo, saved: false });

  } catch (err: any) {
    console.error("[AI generate-listing]", err);
    return NextResponse.json({ error: err.message ?? "AI generation failed" }, { status: 500 });
  }
}

// ─── Save a pre-generated result to Etsy ──────────────────────────────────────
async function saveListingToEtsy(
  aiResult: {
    title: string;
    description: string;
    tags: string[];
    style: string;
    colors: string[];
    occasion: string;
    section: string;
  },
  imageFiles: File[]
): Promise<NextResponse> {
  const shop = await getActiveShop();
  if (!shop) {
    return NextResponse.json({
      saved: false,
      saveError: "No Etsy shop connected. Connect in Settings first.",
    });
  }

  try {
    // 1. Fetch shipping profile (required by Etsy for physical listings)
    const shippingProfiles = await getShippingProfiles();
    const shippingProfileId = shippingProfiles[0]?.shipping_profile_id;
    if (!shippingProfileId) {
      throw new Error("No shipping profile found in your Etsy shop. Please create one in Etsy Seller Hub first.");
    }

    // 2. Create listing as draft
    const newListing = await createListing({
      title:            aiResult.title,
      description:      aiResult.description,
      price:            SHOP_DEFAULTS.pricing.regions.india,
      quantity:         SHOP_DEFAULTS.quantity,
      tags:             aiResult.tags,
      state:            "draft",
      shippingProfileId,
    });

    const etsyListingId  = newListing.listing_id;
    const etsyListingUrl = newListing.url;

    // 3. Upload all images
    for (let i = 0; i < imageFiles.length; i++) {
      const buffer = Buffer.from(await imageFiles[i].arrayBuffer());
      await uploadListingImage(String(etsyListingId), buffer, imageFiles[i].type, i + 1);
    }

    // 4. Set inventory (size × shape variations + pricing) — non-fatal
    try {
      await setListingInventory(String(etsyListingId));
    } catch (invErr) {
      console.warn("[AI Route] Inventory setup warning:", invErr);
    }

    return NextResponse.json({ saved: true, etsyListingId, etsyListingUrl });

  } catch (etsyErr: any) {
    console.error("[AI Route] Etsy save failed:", etsyErr);
    return NextResponse.json({ saved: false, saveError: etsyErr.message });
  }
}
