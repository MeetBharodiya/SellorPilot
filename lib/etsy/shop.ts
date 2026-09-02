import { etsy } from "./client";
import { getActiveShop } from "./auth";
import prisma from "@/lib/db";

export interface EtsyShop {
  shop_id:        number;
  shop_name:      string;
  title:          string;
  currency_code:  string;
  listing_active_count: number;
  login_name:     string;
  icon_url_fullxfull?: string;
  url:            string;
}

export interface EtsyUserProfile {
  user_id:   number;
  login_name: string;
  email:     string;
  primary_email: string;
}

// ─── Get authenticated user's profile ─────────────────────────────────────────

export async function getMe(): Promise<EtsyUserProfile> {
  return etsy.get<EtsyUserProfile>("/application/users/me");
}

// ─── Get shop info by ID ───────────────────────────────────────────────────────

export async function getShop(shopId: string): Promise<EtsyShop> {
  return etsy.get<EtsyShop>(`/application/shops/${shopId}`);
}

// ─── Get shop for authenticated user ──────────────────────────────────────────

export async function getMyShop(): Promise<EtsyShop | null> {
  const shop = await getActiveShop();
  if (!shop) return null;
  return getShop(shop.etsyShopId);
}

// ─── Save (or update) a shop in DB after OAuth connect ────────────────────────
// Multi-shop: always associates the shop with the correct platform userId.
// After saving, sets user.activeShopId so the new shop is immediately active.

export async function saveShopToDB(
  etsyShop:     EtsyShop,
  accessToken:  string,
  refreshToken: string,
  expiresIn:    number,
  userId:       string   // platform user from sellor_user_id cookie
): Promise<void> {
  // Upsert the shop — if reconnecting an existing shop, update tokens
  const shop = await prisma.shop.upsert({
    where:  { etsyShopId: String(etsyShop.shop_id) },
    update: {
      shopName:     etsyShop.shop_name,
      shopUrl:      etsyShop.url,
      iconUrl:      etsyShop.icon_url_fullxfull,
      accessToken,
      refreshToken,
      tokenExpiry:  new Date(Date.now() + expiresIn * 1000),
      currency:     etsyShop.currency_code,
      userId,       // re-associate if ownership changed (e.g. new browser)
    },
    create: {
      etsyShopId:   String(etsyShop.shop_id),
      shopName:     etsyShop.shop_name,
      shopUrl:      etsyShop.url,
      iconUrl:      etsyShop.icon_url_fullxfull,
      accessToken,
      refreshToken,
      tokenExpiry:  new Date(Date.now() + expiresIn * 1000),
      currency:     etsyShop.currency_code,
      userId,
    },
  });

  // Make this newly connected shop the active one for this user
  await prisma.user.update({
    where: { id: userId },
    data:  { activeShopId: shop.id },
  });
}

// ─── Ensure a platform user exists (or create one) for the cookie ─────────────
// Called on first connect. Returns the userId to store in the cookie.

export async function ensurePlatformUser(hint?: {
  name?: string;
  email?: string;
}): Promise<string> {
  // Use a deterministic email if provided (future auth integration point)
  if (hint?.email) {
    const existing = await prisma.user.findUnique({ where: { email: hint.email } });
    if (existing) return existing.id;
  }

  // Reuse existing platform user in DB if present
  const existingUser = await prisma.user.findFirst();
  if (existingUser) return existingUser.id;

  // Create a new anonymous platform user
  const user = await prisma.user.create({
    data: {
      name:  hint?.name ?? "SellorPilot User",
      email: hint?.email,
    },
  });
  return user.id;
}
