import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/etsy/auth";
import { saveShopToDB } from "@/lib/etsy/shop";

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
    // ── 1. Exchange code for tokens (now includes client_secret) ────────────
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    console.log("[OAuth] Token obtained. Expires in:", tokens.expires_in, "s. Token prefix:", tokens.access_token.slice(0, 20));

    // ── 2. Get user_id from JWT ────────────────────────────────────────────
    const userId = decodeEtsyToken(tokens.access_token);
    console.log("[OAuth] Decoded user_id from JWT:", userId);

    // ── 3. Try to get the real Etsy shop ───────────────────────────────────
    let etsyShop: any = null;

    if (userId) {
      const shopsRes = await etsyGet(
        `/application/users/${userId}/shops`,
        tokens.access_token
      );
      console.log("[OAuth] /users/{id}/shops status:", shopsRes.status);

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        etsyShop = shopsData.results?.[0] ?? shopsData;
        console.log("[OAuth] Got real shop:", etsyShop.shop_id, etsyShop.shop_name);
      } else {
        const errBody = await shopsRes.text();
        console.warn("[OAuth] /users/{id}/shops failed:", shopsRes.status, errBody);
      }
    }

    // ── 4. Fallback: try /users/me ─────────────────────────────────────────
    if (!etsyShop) {
      const meRes = await etsyGet("/application/users/me", tokens.access_token);
      console.log("[OAuth] /users/me status:", meRes.status);
      if (meRes.ok) {
        const me = await meRes.json();
        const realUserId = String(me.user_id ?? userId ?? "");
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

    // ── 5. Last fallback — save tokens regardless, update shop_id later ────
    if (!etsyShop || !etsyShop.shop_id) {
      console.warn("[OAuth] Could not fetch shop info. Saving with placeholder.");
      etsyShop = {
        shop_id:       userId ?? "orra_nails",
        shop_name:     "Orra Nails",
        url:           "https://www.etsy.com",
        currency_code: "INR",
      };
    }

    // ── 6. Save to DB ──────────────────────────────────────────────────────
    await saveShopToDB(
      etsyShop,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in
    );
    console.log("[OAuth] Shop saved to DB. shop_id:", etsyShop.shop_id);

    // ── 7. Clear cookies & redirect ────────────────────────────────────────
    const res = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?connected=true`
    );
    res.cookies.delete("etsy_code_verifier");
    res.cookies.delete("etsy_oauth_state");
    return res;

  } catch (err: any) {
    console.error("[Etsy OAuth Callback]", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=${encodeURIComponent(err.message)}`
    );
  }
}
