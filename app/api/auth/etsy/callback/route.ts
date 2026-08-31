import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/etsy/auth";
import { saveShopToDB } from "@/lib/etsy/shop";

const API_BASE = "https://openapi.etsy.com/v3";

/** Decode Etsy JWT access token to extract user_id without an API call */
function decodeEtsyToken(accessToken: string): string | null {
  try {
    const parts   = accessToken.split(".");
    if (parts.length < 2) return null;
    // Base64url decode the payload
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    // Etsy puts user_id in `usr` or `sub`
    const uid = payload.usr ?? payload.user_id ?? payload.sub;
    return uid ? String(uid) : null;
  } catch {
    return null;
  }
}

async function etsyGet(path: string, accessToken: string) {
  return fetch(`${API_BASE}${path}`, {
    headers: {
      "x-api-key":   process.env.ETSY_API_KEY!,
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

    // ── 2. Get user_id — decode JWT first (no API call needed) ────────────
    let userId = decodeEtsyToken(tokens.access_token);

    // ── 3. If JWT decode failed, fall back to /users/me ───────────────────
    if (!userId) {
      const meRes = await etsyGet("/application/users/me", tokens.access_token);
      if (meRes.ok) {
        const me = await meRes.json();
        userId   = String(me.user_id ?? me.login_name ?? "");
      }
    }

    // ── 4. Get the user's Etsy shop ───────────────────────────────────────
    let etsyShop: any = null;

    if (userId) {
      const shopsRes = await etsyGet(
        `/application/users/${userId}/shops`,
        tokens.access_token
      );
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        etsyShop        = shopsData.results?.[0] ?? shopsData;
      }
    }

    // ── 5. Fallback — save with minimal info so tokens are never lost ─────
    // Even if shop fetch fails, we persist the tokens. Shop name/ID will
    // update on next successful API call.
    if (!etsyShop || !etsyShop.shop_id) {
      etsyShop = {
        shop_id:       userId ?? "personal",
        shop_name:     "Orra Nails",
        url:           "https://www.etsy.com/shop/OrraNails",
        currency_code: "INR",
      };
      console.warn("[OAuth] Could not fetch shop info — saved with defaults. shop_id:", userId);
    }

    // ── 6. Save to DB ──────────────────────────────────────────────────────
    await saveShopToDB(
      etsyShop,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in
    );

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
