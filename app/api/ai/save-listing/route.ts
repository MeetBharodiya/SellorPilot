import { NextRequest } from "next/server";
import {
  createListing,
  uploadListingImage,
  setListingInventory,
  getShippingProfiles,
  resolveShopSectionId,
} from "@/lib/etsy/listings";
import { getActiveShop } from "@/lib/etsy/auth";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";
import { getCategoryConfig } from "@/lib/categories/config";

export const maxDuration = 60;

// ─── SSE helper ───────────────────────────────────────────────────────────────
function encodeEvent(data: object) {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── POST /api/ai/save-listing ────────────────────────────────────────────────
// Streams real-time progress events (SSE) as each Etsy operation completes.
export async function POST(req: NextRequest) {
  const formData   = await req.formData();
  const imageFiles = formData.getAll("images") as File[];
  const aiResult   = JSON.parse(formData.get("aiResult") as string);
  const categoryKey = formData.get("categoryKey") as string || "press_on_nails";
  const category   = getCategoryConfig(categoryKey);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: string, status: "loading" | "done" | "error", extra?: object) => {
        controller.enqueue(encodeEvent({ step, status, ...extra }));
      };

      try {
        // ── Step 1: shipping profile ─────────────────────────────────────────
        send("shipping", "loading");
        const shop = await getActiveShop();
        if (!shop) {
          send("shipping", "error", { message: "No Etsy shop connected." });
          controller.close(); return;
        }
        const profiles = await getShippingProfiles();
        const shippingProfileId = profiles[0]?.shipping_profile_id;
        if (!shippingProfileId) {
          send("shipping", "error", { message: "No shipping profile found. Create one in Etsy Seller Hub first." });
          controller.close(); return;
        }
        send("shipping", "done");

        // ── Step 2: create draft listing ─────────────────────────────────────
        send("create", "loading");

        // FIX 5: Resolve the shop section that best matches the AI-generated section name
        const shopSectionId = await resolveShopSectionId(aiResult.section).catch(() => null);

        const newListing = await createListing({
          title:            aiResult.title,
          description:      aiResult.description,
          price:            SHOP_DEFAULTS.pricing.regions.india,
          quantity:         SHOP_DEFAULTS.quantity,
          tags:             aiResult.tags,
          state:            "draft",
          shippingProfileId,
          taxonomyId:       category.etsyTaxonomyId,
          shopSectionId:    shopSectionId ?? undefined,
        });
        const etsyListingId  = newListing.listing_id;
        const etsyListingUrl = newListing.url;
        send("create", "done", { etsyListingId, etsyListingUrl });

        // ── Step 3: upload images ────────────────────────────────────────────
        send("images", "loading");
        for (let i = 0; i < imageFiles.length; i++) {
          const buffer = Buffer.from(await imageFiles[i].arrayBuffer());
          await uploadListingImage(String(etsyListingId), buffer, imageFiles[i].type, i + 1);
          // Emit progress sub-event so frontend can show e.g. "2 / 6 uploaded"
          controller.enqueue(encodeEvent({ step: "images", status: "progress", done: i + 1, total: imageFiles.length }));
        }
        send("images", "done");

        // ── Step 4: inventory variants ───────────────────────────────────────
        // 4. Set inventory variants — only for categories that use them (e.g. nails)
        send("inventory", "loading");
        if (!category.skipInventoryVariants) {
          try {
            await setListingInventory(String(etsyListingId));
          } catch {
            // Non-fatal — some shop configs don't support variants via API
            console.warn("[save-listing] Inventory setup skipped:", category.key);
          }
        }
        send("inventory", "done");

        // ── Step 5: finalise ─────────────────────────────────────────────────
        send("finalise", "done", { saved: true, etsyListingId, etsyListingUrl });

      } catch (err: any) {
        controller.enqueue(encodeEvent({ step: "error", message: err.message ?? "Unknown error" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
