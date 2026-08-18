import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/etsy/auth";
import { getMe, getShop, saveShopToDB } from "@/lib/etsy/shop";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code     = searchParams.get("code");
  const state    = searchParams.get("state");
  const errorMsg = searchParams.get("error");

  // ── User denied access ────────────────────────────────────────────────────
  if (errorMsg) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=access_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_params`
    );
  }

  // ── Verify state (CSRF protection) ────────────────────────────────────────
  const savedState    = req.cookies.get("etsy_oauth_state")?.value;
  const codeVerifier  = req.cookies.get("etsy_code_verifier")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=state_mismatch`
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_verifier`
    );
  }

  try {
    // ── Exchange code for tokens ──────────────────────────────────────────
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // ── Temporarily set token on shop-less client to fetch user/shop info ─
    // We need to call the Etsy API before saving to DB, so temporarily use
    // the token directly
    const meRes = await fetch("https://openapi.etsy.com/v3/application/users/me", {
      headers: {
        "x-api-key":    process.env.ETSY_API_KEY!,
        Authorization:  `Bearer ${tokens.access_token}`,
      },
    });

    if (!meRes.ok) throw new Error(`Failed to get user: ${meRes.status}`);
    const me = await meRes.json();

    // Get their shop (first shop associated with account)
    const shopsRes = await fetch(
      `https://openapi.etsy.com/v3/application/users/${me.user_id}/shops`,
      {
        headers: {
          "x-api-key":    process.env.ETSY_API_KEY!,
          Authorization:  `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!shopsRes.ok) throw new Error(`Failed to get shop: ${shopsRes.status}`);
    const shopData = await shopsRes.json();
    const etsyShop = shopData.results?.[0] ?? shopData;

    // ── Save to DB ────────────────────────────────────────────────────────
    await saveShopToDB(etsyShop, tokens.access_token, tokens.refresh_token, tokens.expires_in);

    // ── Clear cookies & redirect to settings with success ─────────────────
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
