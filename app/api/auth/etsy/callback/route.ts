import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/etsy/auth";
import { saveShopToDB, ensurePlatformUser } from "@/lib/etsy/shop";

const API_BASE = "https://openapi.etsy.com/v3";

/** Decode Etsy access token (format: user_id.random_string) to extract user_id */
function decodeEtsyToken(accessToken: string): string | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const uid = parts[0];
    return uid ? String(uid) : null;
  } catch {
    return null;
  }
}

async function etsyGet(path: string, accessToken: string) {
  return fetch(`${API_BASE}${path}`, {
    headers: {
      "x-api-key":   `${process.env.ETSY_API_KEY}:${process.env.ETSY_SHARED_SECRET}`,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code     = searchParams.get("code");
  const state    = searchParams.get("state");
  const errorMsg = searchParams.get("error");

  if (errorMsg) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=access_denied`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_params`);
  }

  // ── Verify CSRF state ──────────────────────────────────────────────────────
  const savedState   = req.cookies.get("etsy_oauth_state")?.value;
  const codeVerifier = req.cookies.get("etsy_code_verifier")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=state_mismatch`);
  }
  if (!codeVerifier) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_verifier`);
  }

  try {
    // ── 1. Exchange code for tokens ────────────────────────────────────────
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    console.log("[OAuth] Token obtained. Expires in:", tokens.expires_in, "s.");

    // ── 2. Resolve platform user from cookie (multi-shop) ─────────────────
    const existingUserId = req.cookies.get("sellor_user_id")?.value;
    let platformUserId: string;

    if (existingUserId) {
      // Returning user — reuse the existing platform user
      platformUserId = existingUserId;
    } else {
      // First time — create a new platform user
      platformUserId = await ensurePlatformUser();
      console.log("[OAuth] Created new platform user:", platformUserId);
    }

    // ── 3. Get user_id from token ──────────────────────────────────────────
    const etsyUserId = decodeEtsyToken(tokens.access_token);
    console.log("[OAuth] Decoded Etsy user_id:", etsyUserId);

    // ── 4. Fetch the Etsy shop ─────────────────────────────────────────────
    let etsyShop = null;

    if (etsyUserId) {
      const shopsRes = await etsyGet(
        `/application/users/${etsyUserId}/shops`,
        tokens.access_token
      );
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        etsyShop = shopsData.results?.[0] ?? shopsData;
        console.log("[OAuth] Got shop:", etsyShop.shop_id, etsyShop.shop_name);
      } else {
        console.warn("[OAuth] /users/{id}/shops failed:", shopsRes.status);
      }
    }

    // ── 5. Fallback: try /users/me ─────────────────────────────────────────
    if (!etsyShop) {
      const meRes = await etsyGet("/application/users/me", tokens.access_token);
      if (meRes.ok) {
        const me = await meRes.json();
        const realUserId = String(me.user_id ?? etsyUserId ?? "");
        if (realUserId) {
          const shopsRes2 = await etsyGet(
            `/application/users/${realUserId}/shops`,
            tokens.access_token
          );
          if (shopsRes2.ok) {
            const shopsData2 = await shopsRes2.json();
            etsyShop = shopsData2.results?.[0] ?? shopsData2;
          }
        }
      }
    }

    // ── 6. Last fallback ───────────────────────────────────────────────────
    if (!etsyShop || !etsyShop.shop_id) {
      console.warn("[OAuth] Could not fetch shop info. Using placeholder.");
      etsyShop = {
        shop_id:       etsyUserId ?? "unknown",
        shop_name:     "My Etsy Shop",
        url:           "https://www.etsy.com",
        currency_code: "USD",
      };
    }

    // ── 7. Save shop to DB with the platform userId ────────────────────────
    await saveShopToDB(
      etsyShop,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      platformUserId
    );
    console.log("[OAuth] Shop saved. shop_id:", etsyShop.shop_id, "user:", platformUserId);

    // ── 8. Clear OAuth cookies, set user cookie, redirect ─────────────────
    const res = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?connected=true`
    );
    res.cookies.delete("etsy_code_verifier");
    res.cookies.delete("etsy_oauth_state");

    // Set sellor_user_id cookie (10-year lifetime, same-site strict)
    if (!existingUserId) {
      res.cookies.set("sellor_user_id", platformUserId, {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24 * 365 * 10, // 10 years
      });
    }

    return res;

  } catch (err: unknown) {
    console.error("[Etsy OAuth Callback]", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=${encodeURIComponent(msg)}`
    );
  }
}
