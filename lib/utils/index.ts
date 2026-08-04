import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge Tailwind CSS classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in a given currency
export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format Etsy's price object (amount / divisor)
export function formatEtsyPrice(
  amount: number,
  divisor: number,
  currency: string
): string {
  return formatPrice(amount / divisor, currency);
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Parse JSON safely (returns null on error)
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Convert Etsy timestamp (Unix seconds) to Date
export function etsyTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Get listing state color for badges
export function getListingStateColor(state: string): string {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    inactive: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    sold_out: "bg-red-500/20 text-red-400 border-red-500/30",
    expired: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return colors[state] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

// Get order status color for badges
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    shipped: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    refunded: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return colors[status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

// Validate Etsy tags (max 13, max 20 chars each, no special chars)
export function validateEtsyTags(tags: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (tags.length > 13) errors.push("Maximum 13 tags allowed on Etsy");
  tags.forEach((tag, i) => {
    if (tag.length > 20) errors.push(`Tag ${i + 1} exceeds 20 characters`);
    if (/[^a-zA-Z0-9 '-]/.test(tag))
      errors.push(`Tag "${tag}" contains invalid characters`);
  });
  return { valid: errors.length === 0, errors };
}

// Validate Etsy listing title (max 140 chars)
export function validateEtsyTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  if (title.length > 140)
    return { valid: false, error: "Title must be 140 characters or less" };
  if (title.length < 5)
    return { valid: false, error: "Title must be at least 5 characters" };
  return { valid: true };
}

// Sleep utility for rate limiting
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exponential backoff retry
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error = new Error("Unknown error");
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}
