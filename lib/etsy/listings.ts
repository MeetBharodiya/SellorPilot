import { etsy, getShopId } from "./client";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";

// ─── Etsy Listing Types ────────────────────────────────────────────────────────

export interface EtsyListing {
  listing_id:          number;
  title:               string;
  description:         string;
  state:               "active" | "draft" | "inactive" | "expired" | "sold_out";
  price:               { amount: number; divisor: number; currency_code: string };
  quantity:            number;
  tags:                string[];
  views:               number;
  num_favorers:        number;
  url:                 string;
  images?:             EtsyListingImage[];
  creation_timestamp:  number;
  last_modified_timestamp: number;
  taxonomy_id?:        number;
  shop_section_id?:    number;
  shipping_profile_id?: number;
}

export interface EtsyListingImage {
  listing_image_id: number;
  listing_id:       number;
  url_fullxfull:    string;
  url_570xN:        string;
  rank:             number;
}

export interface EtsyListingsResponse {
  count:   number;
  results: EtsyListing[];
}

// ─── Get all shop listings ─────────────────────────────────────────────────────

export async function getShopListings(
  state: "active" | "draft" | "inactive" | "all" = "all",
  limit = 100,
  offset = 0
): Promise<EtsyListingsResponse> {
  const shopId = await getShopId();
  const params = new URLSearchParams({
    limit:    String(limit),
    offset:   String(offset),
    includes: "Images",
  });
  if (state !== "all") params.set("state", state);

  return etsy.get<EtsyListingsResponse>(
    `/application/shops/${shopId}/listings?${params}`
  );
}

// ─── Get single listing ────────────────────────────────────────────────────────

export async function getListing(listingId: string): Promise<EtsyListing> {
  return etsy.get<EtsyListing>(
    `/application/listings/${listingId}?includes=Images`
  );
}

// ─── Get shop sections ─────────────────────────────────────────────────────────

export async function getShopSections(): Promise<{ shop_section_id: number; title: string }[]> {
  const shopId = await getShopId();
  const res = await etsy.get<{ count: number; results: { shop_section_id: number; title: string }[] }>(
    `/application/shops/${shopId}/sections`
  );
  return res.results ?? [];
}

/**
 * Find the best matching shop_section_id for an AI-generated section name.
 * Returns null if no section matches or shop has no sections.
 */
export async function resolveShopSectionId(sectionName?: string): Promise<number | null> {
  if (!sectionName) return null;
  const sections = await getShopSections();
  if (!sections.length) return null;

  const needle = sectionName.toLowerCase().trim();

  // Exact match first
  const exact = sections.find(s => s.title.toLowerCase() === needle);
  if (exact) return exact.shop_section_id;

  // Partial match (e.g. "Press-On Sets" matches "Press On Collection")
  const partial = sections.find(s =>
    s.title.toLowerCase().includes(needle) ||
    needle.includes(s.title.toLowerCase().split(" ")[0].toLowerCase())
  );
  if (partial) return partial.shop_section_id;

  // Fall back to first section
  return sections[0].shop_section_id;
}

// ─── Create listing draft ──────────────────────────────────────────────────────

export interface CreateListingPayload {
  title:              string;
  description:        string;
  price:              number;       // in shop currency (INR)
  quantity:           number;
  tags:               string[];     // max 13, max 20 chars each
  state?:             "draft" | "active";
  taxonomyId?:        number;
  shippingProfileId?: number;
  readinessStateId?:  number;
  shopSectionId?:     number;       // FIX 5: shop section
}

export async function createListing(
  payload: CreateListingPayload
): Promise<EtsyListing> {
  const shopId = await getShopId();

  const body: Record<string, unknown> = {
    title:               payload.title.slice(0, 140),
    description:         payload.description,
    price:               payload.price,
    quantity:            payload.quantity ?? SHOP_DEFAULTS.quantity,
    tags:                payload.tags.slice(0, 13),
    who_made:            "i_did",
    when_made:           "made_to_order",
    // FIX 1: correct taxonomy ID — 264 = Bath & Beauty > Nails > Acrylic & Press On Nails
    taxonomy_id:         payload.taxonomyId ?? 264,
    is_supply:           false,
    state:               payload.state ?? "draft",
    shipping_profile_id: payload.shippingProfileId,
    readiness_state_id:  payload.readinessStateId ?? 1502437701331,
  };

  // FIX 5: include shop_section_id only if provided (undefined omits it)
  if (payload.shopSectionId) {
    body.shop_section_id = payload.shopSectionId;
  }

  return etsy.post<EtsyListing>(
    `/application/shops/${shopId}/listings`,
    body
  );
}

// ─── Update listing ────────────────────────────────────────────────────────────

export async function updateListing(
  listingId: string,
  fields: Partial<CreateListingPayload>
): Promise<EtsyListing> {
  const shopId = await getShopId();
  const body: Record<string, unknown> = {};
  if (fields.title)       body.title       = fields.title.slice(0, 140);
  if (fields.description) body.description = fields.description;
  if (fields.price)       body.price       = fields.price;
  if (fields.quantity)    body.quantity    = fields.quantity;
  if (fields.tags)        body.tags        = fields.tags.slice(0, 13);
  if (fields.state)       body.state       = fields.state;

  return etsy.patch<EtsyListing>(
    `/application/shops/${shopId}/listings/${listingId}`,
    body
  );
}

// ─── Delete listing ────────────────────────────────────────────────────────────

export async function deleteListing(listingId: string): Promise<void> {
  const shopId = await getShopId();
  await etsy.delete(`/application/shops/${shopId}/listings/${listingId}`);
}

// ─── Get shipping profiles ─────────────────────────────────────────────────────

export async function getShippingProfiles(): Promise<{ shipping_profile_id: number; title: string }[]> {
  const shopId = await getShopId();
  const res = await etsy.get<{ count: number; results: { shipping_profile_id: number; title: string }[] }>(
    `/application/shops/${shopId}/shipping-profiles`
  );
  return res.results ?? [];
}

// ─── Upload listing image ──────────────────────────────────────────────────────

export async function uploadListingImage(
  listingId: string,
  imageBuffer: Buffer,
  mimeType: string,
  rank: number
): Promise<EtsyListingImage> {
  const shopId = await getShopId();

  const { getActiveShop } = await import("./auth");
  const shop = await getActiveShop();
  if (!shop) throw new Error("No connected shop");

  const form = new FormData();
  form.append("rank", String(rank));
  form.append(
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
    `photo_${rank}.jpg`
  );

  const apiKey      = process.env.ETSY_API_KEY!;
  const sharedSecret = process.env.ETSY_SHARED_SECRET!;
  const xApiKeyValue = sharedSecret ? `${apiKey}:${sharedSecret}` : apiKey;

  const res = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/${listingId}/images`,
    {
      method:  "POST",
      headers: {
        "x-api-key":   xApiKeyValue,
        Authorization: `Bearer ${shop.accessToken}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`Image upload failed ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

// ─── Set listing inventory (variations) ───────────────────────────────────────
//
// FIX 2: Use correct property_id for taxonomy 264 (Acrylic & Press On Nails):
//   - property_id 100 (TeeShirtSize / "Size") with scale_id 301 (Alpha) for XS/S/M/L/XL/Custom
//   - property_id 513 (Custom1) for nail Shape — free-text custom property
//
// FIX 3: price_on_property: [] = global price (same price for all variants)
//         Each offering still carries the price to satisfy the API.
//
// FIX 4: sku_on_property: [100, 513] = SKU unique per Size+Shape combo.

export async function setListingInventory(listingId: string, listingSku?: string): Promise<void> {
  const sizes  = SHOP_DEFAULTS.sizeVariant.options.filter((o) => o.enabled).map((o) => o.name);
  const shapes = SHOP_DEFAULTS.shapeVariant.options.filter((o) => o.enabled).map((o) => o.name);

  // Global prices for all 3 regions (INR — Etsy converts to buyer's currency)
  const priceIndia = SHOP_DEFAULTS.pricing.regions.india;   // ₹3,450

  // Build cross-product of sizes × shapes
  // All variants share the same SKU (one listing = one SKU regardless of size/shape)
  const products = sizes.flatMap((size) =>
    shapes.map((shape) => ({
      sku: listingSku ?? "",  // same SKU for all size+shape combos
      property_values: [
        {
          // property_id 100 = "Size" for taxonomy 264, scale_id 301 = Alpha (XS/S/M/L/XL)
          property_id:   100,
          property_name: "Size",
          scale_id:      301,
          values:        [size],
        },
        {
          // property_id 513 = Custom Property 1 → used for "Shape"
          property_id:   513,
          property_name: "Shape",
          scale_id:      null,
          values:        [shape],
        },
      ],
      offerings: [
        {
          price:      priceIndia,
          quantity:   SHOP_DEFAULTS.quantity,
          is_enabled: true,
        },
      ],
    }))
  );

  await etsy.put(`/application/listings/${listingId}/inventory`, {
    products,
    price_on_property:    [],   // global price — same across all variants
    quantity_on_property: [],
    sku_on_property:      [],   // SKU is the same for all variants
  });
}
