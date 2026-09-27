import { NextRequest } from "next/server";
import {
  createListing,
  uploadListingImage,
  getShippingProfiles,
  resolveShopSectionId,
} from "@/lib/etsy/listings";
import { getActiveShop } from "@/lib/etsy/auth";
import { getCategoryConfig } from "@/lib/categories/config";
import { etsy, getShopId } from "@/lib/etsy/client";

export const maxDuration = 60;

// ─── SSE helper ───────────────────────────────────────────────────────────────
function encodeEvent(data: object) {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BlouseOption {
  name:  string;
  price: number;
}

// ─── Build inventory products for saree/lehenga variants ──────────────────────
//
// Rules:
//   • Blouse Stitching = property_id 513 (Custom1)
//   • Colour           = property_id 514 (Custom2)
//   • When Blouse Stitching is enabled → price differs per stitching option
//     → price_on_property: [513]
//   • When only Colour enabled → global price
//     → price_on_property: []
//   • When neither enabled → single product with global price
//
function buildSareeProducts(
  blouseOptions: BlouseOption[],
  colourOptions: string[],
  globalPrice:   number,
): {
  products:          object[];
  price_on_property: number[];
} {
  const hasBlouse  = blouseOptions.length > 0;
  const hasColours = colourOptions.length > 0;

  // ── No variants ────────────────────────────────────────────────────────────
  if (!hasBlouse && !hasColours) {
    return {
      products: [{
        sku: "",
        property_values: [],
        offerings: [{ price: globalPrice, quantity: 10, is_enabled: true, readiness_state_id: 1502437701331 }],
      }],
      price_on_property: [],
    };
  }

  // ── Blouse Stitching only ──────────────────────────────────────────────────
  if (hasBlouse && !hasColours) {
    return {
      products: blouseOptions.map(opt => ({
        sku: "",
        property_values: [
          { property_id: 513, property_name: "Blouse Stitching", values: [opt.name] },
        ],
        offerings: [{
          price:              opt.price,
          quantity:           10,
          is_enabled:         true,
          readiness_state_id: 1502437701331,
        }],
      })),
      price_on_property: [513],
    };
  }

  // ── Colours only ───────────────────────────────────────────────────────────
  if (!hasBlouse && hasColours) {
    return {
      products: colourOptions.map(colour => ({
        sku: "",
        property_values: [
          { property_id: 514, property_name: "Colour", values: [colour] },
        ],
        offerings: [{
          price:              globalPrice,
          quantity:           10,
          is_enabled:         true,
          readiness_state_id: 1502437701331,
        }],
      })),
      price_on_property: [],
    };
  }

  // ── Both Blouse Stitching × Colours ───────────────────────────────────────
  // Price varies by stitching option; colour is cosmetic
  const products = blouseOptions.flatMap(opt =>
    colourOptions.map(colour => ({
      sku: "",
      property_values: [
        { property_id: 513, property_name: "Blouse Stitching", values: [opt.name] },
        { property_id: 514, property_name: "Colour",           values: [colour]   },
      ],
      offerings: [{
        price:              opt.price,
        quantity:           10,
        is_enabled:         true,
        readiness_state_id: 1502437701331,
      }],
    }))
  );

  return { products, price_on_property: [513] };
}

// ─── POST /api/ai/save-saree-listing ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const formData   = await req.formData();
  const imageFiles = formData.getAll("images") as File[];
  const title       = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tags        = JSON.parse(formData.get("tags") as string) as string[];
  const categoryKey = (formData.get("categoryKey") as string) || "sarees";
  const globalPrice = Number(formData.get("globalPrice")) || 2500;
  const blouseOptionsRaw = formData.get("blouseOptions");
  const colourOptionsRaw = formData.get("colourOptions");
  const sectionName      = (formData.get("section") as string) || "";

  const blouseOptions: BlouseOption[] = blouseOptionsRaw
    ? JSON.parse(blouseOptionsRaw as string)
    : [];
  const colourOptions: string[] = colourOptionsRaw
    ? JSON.parse(colourOptionsRaw as string)
    : [];

  const category = getCategoryConfig(categoryKey);

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
        const shopSectionId = await resolveShopSectionId(sectionName).catch(() => null);

        // Use global price for the listing itself; inventory will set per-variant prices
        const listingPrice = blouseOptions.length > 0
          ? Math.min(...blouseOptions.map(o => o.price))  // lowest variant price for the listing
          : globalPrice;

        const newListing = await createListing({
          title,
          description,
          price:            listingPrice,
          quantity:         10,
          tags:             tags.slice(0, 13),
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
          controller.enqueue(encodeEvent({ step: "images", status: "progress", done: i + 1, total: imageFiles.length }));
        }
        send("images", "done");

        // ── Step 4: inventory variants ───────────────────────────────────────
        send("inventory", "loading");
        const hasAnyVariant = blouseOptions.length > 0 || colourOptions.length > 0;
        if (hasAnyVariant) {
          const { products, price_on_property } = buildSareeProducts(blouseOptions, colourOptions, globalPrice);
          const shopId = await getShopId();
          await etsy.put(`/application/listings/${etsyListingId}/inventory`, {
            products,
            price_on_property,
            quantity_on_property: [],
            sku_on_property:      [],
          });
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
