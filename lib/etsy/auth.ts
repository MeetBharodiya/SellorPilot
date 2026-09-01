/**
 * Etsy OAuth 2.0 with PKCE — auth helpers and token management
 * Multi-shop: uses sellor_user_id cookie to identify the platform user,
 * then reads user.activeShopId to find the currently selected shop.
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export const ETSY_SCOPES = [
  "listings_r",
  "listings_w",
  "listings_d",
  "transactions_r",
  "transactions_w",
  "shops_r",
  "profile_r",
].join(" ");

export const ETSY_AUTH_URL   = "https://www.etsy.com/oauth/connect";
export const ETSY_TOKEN_URL  = "https://api.etsy.com/v3/public/oauth/token";
export const ETSY_API_BASE   = "https://openapi.etsy.com/v3";
export const REDIRECT_URI    = `${process.env.NEXTAUTH_URL}/api/auth/etsy/callback`;

// ─── PKCE helpers ──────────────────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString("base64url").slice(0, 128);
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// ─── Build OAuth URL ───────────────────────────────────────────────────────────

export function buildAuthUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type:         "code",
    redirect_uri:          REDIRECT_URI,
    scope:                 ETSY_SCOPES,
    client_id:             process.env.ETSY_API_KEY!,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: "S256",
  });
  return `${ETSY_AUTH_URL}?${params.toString()}`;
}

// ─── Token exchange ────────────────────────────────────────────────────────────

export interface EtsyTokenResponse {
  access_token:  string;
  token_type:    string;
  expires_in:    number;   // seconds
  refresh_token: string;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<EtsyTokenResponse> {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "authorization_code",
      client_id:     process.env.ETSY_API_KEY!,
      client_secret: process.env.ETSY_SHARED_SECRET!, // Required for confidential client token
      redirect_uri:  REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} — ${err}`);
  }
  return res.json();
}

// ─── Token refresh ─────────────────────────────────────────────────────────────

export async function refreshAccessToken(
  refreshToken: string
): Promise<EtsyTokenResponse> {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "refresh_token",
      client_id:     process.env.ETSY_API_KEY!,
      client_secret: process.env.ETSY_SHARED_SECRET!, // Required for confidential client
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} — ${err}`);
  }
  return res.json();
}

// ─── Get current platform user ID from cookie ──────────────────────────────────

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("sellor_user_id")?.value ?? null;
}

// ─── Get active shop (with auto-refresh) ──────────────────────────────────────
// Multi-shop: resolves the active shop via cookie userId → user.activeShopId

export async function getActiveShop() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  let shop = null;

  // 1. Try the explicitly selected shop
  if (user.activeShopId) {
    shop = await prisma.shop.findFirst({
      where: { id: user.activeShopId, userId },
    });
  }

  // 2. Fall back to any shop for this user
  if (!shop) {
    shop = await prisma.shop.findFirst({ where: { userId } });
    // Persist as the active shop
    if (shop) {
      await prisma.user.update({
        where: { id: userId },
        data:  { activeShopId: shop.id },
      });
    }
  }

  if (!shop) return null;

  // Auto-refresh token if expiring within 5 minutes
  const expiresAt   = shop.tokenExpiry ? new Date(shop.tokenExpiry) : null;
  const now         = new Date();
  const fiveMinutes = 5 * 60 * 1000;
  const needsRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < fiveMinutes;

  if (needsRefresh && shop.refreshToken) {
    try {
      const tokens = await refreshAccessToken(shop.refreshToken);
      const updated = await prisma.shop.update({
        where: { id: shop.id },
        data: {
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry:  new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
      return updated;
    } catch (err) {
      console.error("[Etsy Auth] Token refresh failed:", err);
    }
  }

  return shop;
}
