/**
 * Etsy API v3 HTTP client
 * Handles auth headers, rate limiting (5 req/sec), and error formatting
 */
import { ETSY_API_BASE, getActiveShop } from "./auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export class EtsyApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(`Etsy API ${status}: ${message}`);
  }
}

// ─── Rate limit queue (simple) ────────────────────────────────────────────────
// Etsy allows 10 req/s for OAuth calls. We stay under 5/s to be safe.
let lastRequestTime = 0;
const MIN_REQUEST_GAP_MS = 200; // 5 req/sec max

async function throttle() {
  const now  = Date.now();
  const wait = MIN_REQUEST_GAP_MS - (now - lastRequestTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

export async function etsyFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  const shop = await getActiveShop();
  if (!shop) throw new EtsyApiError(401, "No connected Etsy shop. Go to Settings → Connect Shop.");

  await throttle();

  const url = path.startsWith("http") ? path : `${ETSY_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "x-api-key":    process.env.ETSY_API_KEY!,
      "Authorization": `Bearer ${shop.accessToken}`,
      "Content-Type":  "application/json",
      ...(options.headers ?? {}),
    },
  });

  // Rate limited — wait and retry
  if (res.status === 429 && retries > 0) {
    const retryAfter = parseInt(res.headers.get("retry-after") ?? "1", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return etsyFetch<T>(path, options, retries - 1);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new EtsyApiError(
      res.status,
      body?.error_description ?? body?.error ?? res.statusText,
      body
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const etsy = {
  get:    <T>(path: string)                     => etsyFetch<T>(path),
  post:   <T>(path: string, body: unknown)      => etsyFetch<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)      => etsyFetch<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)      => etsyFetch<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                     => etsyFetch<T>(path, { method: "DELETE" }),
};

// ─── Get shop ID (cached on shop record) ──────────────────────────────────────

export async function getShopId(): Promise<string> {
  const shop = await getActiveShop();
  if (!shop) throw new EtsyApiError(401, "No connected Etsy shop.");
  if (shop.etsyShopId) return shop.etsyShopId;
  throw new EtsyApiError(500, "Shop ID not found in DB");
}
