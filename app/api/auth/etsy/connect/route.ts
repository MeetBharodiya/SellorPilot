import { NextResponse } from "next/server";
import {
  buildAuthUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/lib/etsy/auth";

export async function GET() {
  const codeVerifier    = generateCodeVerifier();
  const codeChallenge   = generateCodeChallenge(codeVerifier);
  const state           = generateState();
  const authUrl         = buildAuthUrl(state, codeChallenge);

  // Store verifier + state in cookies (server-side, HTTP-only)
  const res = NextResponse.redirect(authUrl);
  res.cookies.set("etsy_code_verifier", codeVerifier, {
    httpOnly: true,
    secure:   false,  // localhost
    maxAge:   600,    // 10 minutes to complete OAuth
    path:     "/",
  });
  res.cookies.set("etsy_oauth_state", state, {
    httpOnly: true,
    secure:   false,
    maxAge:   600,
    path:     "/",
  });

  return res;
}
