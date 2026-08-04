# Orra Nails — Etsy Listing Automation Tool
## Implementation Plan (v1.0)

> **Status:** Approved for development  
> **Last Updated:** 2026-08-03  
> **Owner:** Orra Nails

---

## ?? Project Goal

Build a **personal-use Etsy automation tool** for the Orra Nails shop — designed with a **modular, SaaS-ready architecture** so it can be commercially launched for any Etsy seller in the future without requiring a structural rewrite.

---

## ? Design Decisions (Answered)

| Question | Answer |
|---|---|
| **API Key** | Will be requested from developers.etsy.com |
| **Scope** | Personal tool now ? SaaS-ready later (modular architecture from day one) |
| **Product Type** | Handmade physical products (nail art, press-on nails) |
| **AI Listing Writer** | ? Include in Phase 1 (OpenAI/Gemini API key will be obtained) |
| **Hosting** | Local first ? Cloud (Vercel + Supabase) when ready for SaaS |

---

## ?? Full Etsy API Capability Map

| API Category | What We Can Automate |
|---|---|
| **ShopListing** | Create, edit, publish, delete, copy listings; manage states (draft ? active ? deactivated ? expired) |
| **ListingInventory** | Set quantities & prices per variation (up to 3 variations) |
| **ListingImage / Video** | Upload, replace, reorder listing photos & videos |
| **ShopListingTranslation** | Push translated titles & descriptions for international buyers |
| **BuyerTaxonomy / SellerTaxonomy** | Auto-classify listings using Etsy full category tree |
| **ShopSection** | Create & manage shop sections/collections |
| **ShippingProfile** | Create/update shipping templates; set rates per region |
| **ReturnPolicy** | Read/set return policies per listing |
| **Shop** | Read/update shop info, language, currency, status |
| **ShopReceipt (Orders)** | Fetch all orders, filter by paid/shipped/cancelled, update tracking |
| **ShopTransaction** | Read individual line items within an order |
| **PaymentAccountLedger** | Pull complete financial ledger (credits & debits) |
| **Payment** | Fetch payment details per order (fees, taxes, shipping charged) |
| **Webhooks** | Real-time push events: order.paid, order.shipped, order.canceled, order.delivered |

> ?? Analytics Gap: Etsy does NOT expose views, clicks, or search ranking data via API. We build our own analytics layer from order history data.

---

## ?? MCP Server Integration

- **Etsy Official Dev MCP:** https://mcp.api.etsycloud.com/mcp
  - Used during development: keeps API client code in sync with live Etsy schema changes
- **Community MCP servers:** Evaluate for future power-user feature (AI assistant ? shop data)

---

## ??? Architecture — Modular & SaaS-Ready from Day One

### Folder Structure
```
listing-automation/
+-- PLAN.md
+-- app/
¦   +-- (auth)/               ? Auth pages
¦   +-- (dashboard)/
¦   ¦   +-- listings/         ? Listing manager
¦   ¦   +-- orders/           ? Order dashboard
¦   ¦   +-- inventory/        ? Inventory manager
¦   ¦   +-- analytics/        ? Custom analytics
¦   ¦   +-- shipping/         ? Shipping profiles
¦   ¦   +-- ai-writer/        ? AI listing writer
¦   +-- api/
¦       +-- etsy/             ? Etsy API proxy layer
¦       +-- webhooks/         ? Incoming Etsy webhooks
¦       +-- auth/             ? OAuth handlers
¦       +-- ai/               ? AI generation endpoints
+-- lib/
¦   +-- etsy/                 ? Etsy API client (all endpoints wrapped)
¦   +-- ai/                   ? AI client (OpenAI/Gemini)
¦   +-- db/                   ? Database client & queries
¦   +-- queue/                ? Job queue (BullMQ)
+-- components/               ? Reusable UI components
+-- hooks/                    ? React hooks
+-- types/                    ? TypeScript types
+-- prisma/
    +-- schema.prisma         ? Database schema & migrations
```

### Why This is SaaS-Ready
- lib/etsy/ is a pure API client — swap credentials per user/shop easily
- prisma schema has userId on every entity — multi-tenant from day one
- Auth layer (NextAuth.js) works in single-user local mode AND multi-user cloud mode
- All API routes are stateless — ready to scale horizontally

---

## ??? Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | SQLite (local dev) ? PostgreSQL / Supabase (cloud) |
| ORM | Prisma |
| Auth | NextAuth.js (Etsy OAuth 2.0) |
| Job Queue | BullMQ + Redis |
| Image Storage | Local filesystem ? Cloudinary (cloud) |
| AI | OpenAI GPT-4o / Google Gemini |
| Local Hosting | localhost (npm run dev) |
| Cloud Hosting | Vercel + Supabase |

---

## ?? Feature Roadmap

### Phase 1 — MVP Personal Tool

1. **Etsy Shop Connection** — OAuth 2.0, auto-refresh tokens
2. **Listing Dashboard** — grid/table view, filter/search, status badges
3. **Listing Creator** — guided step form, auto-category, draft/publish
4. **Listing Scheduler** — schedule publish date/time, batch scheduler
5. **AI Listing Writer** — keywords ? SEO title + description + 13 tags
6. **Variation & Inventory Manager** — per-variation price/qty/SKU, low-stock alerts
7. **Image Manager** — drag-and-drop, reorder, image library/reuse
8. **Bulk Editor** — multi-listing price/tag/section/qty updates
9. **Shipping Profile Manager** — view, create, clone, edit templates

### Phase 2 — Order & Operations

10. **Order Dashboard** — real-time webhooks, filter by status
11. **Shipment Tracker** — add tracking, auto push to Etsy
12. **Inventory Alerts** — email/in-app when stock drops below threshold
13. **Order Analytics** — revenue charts, best-sellers, avg order value

### Phase 3 — Finance & Reporting

14. **Financial Ledger** — Etsy fees breakdown, CSV export
15. **Profit Calculator** — COGS input ? net profit per order

### Phase 4 — SaaS Launch

16. **Multi-User Auth** — user registration, isolated shop data
17. **Multi-Shop Support** — connect multiple shops, dashboard switcher
18. **Team Access** — roles: Admin, Editor, Viewer
19. **Listing Templates Library** — save/reuse listing structures
20. **International Translation** — auto-translate + push to Etsy
21. **Subscription & Billing** — Stripe, tiered plans
22. **Market Research** — competitor pricing, trending keywords (Bright Data MCP)

---

## ??? Database Schema (Core Tables)

- **User** — platform account (single for now, multi-tenant later)
- **Shop** — connected Etsy shop (etsyShopId, encrypted tokens)
- **Listing** — mirrored listing data (title, price, state, tags, scheduledAt)
- **ListingImage** — images per listing with rank ordering
- **Order** — synced order history (status, tracking, totalPrice)
- **OrderItem** — line items per order
- **ScheduledJob** — BullMQ job records (type, payload, runAt, status)

---

## ?? Security

| Concern | Solution |
|---|---|
| OAuth tokens | AES-256 encrypted before DB storage |
| API keys | Server-side only, never sent to browser |
| Rate limits | Exponential backoff + request queue |
| Webhook integrity | Verify Etsy signing secret on every event |
| Multi-tenant isolation | All DB queries scoped by shopId + userId |

---

## ?? Development Sequence (10 Weeks)

| Week | Goal |
|---|---|
| 1 | Project setup (Next.js + Prisma + shadcn/ui + Tailwind) |
| 2 | Etsy OAuth connect + shop dashboard |
| 3 | Listing CRUD (view, create, edit, delete) |
| 4 | AI Listing Writer integration |
| 5 | Listing Scheduler (BullMQ) |
| 6 | Image Manager + Bulk Editor |
| 7 | Inventory & Variation Manager |
| 8 | Shipping Profile Manager |
| 9 | Order Dashboard + Webhooks |
| 10 | Polish, testing, personal daily use begins |

---

## ?? Immediate Next Steps (Before Build)

- [ ] Request Etsy Developer API Key at https://developers.etsy.com
- [ ] Obtain OpenAI or Gemini API key for AI Listing Writer
- [ ] Confirm Node.js 20+ is installed on local machine
- [ ] Approve plan ? begin project scaffold in this folder
