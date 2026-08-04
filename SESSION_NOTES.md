# SellorPilot — Session Notes
## Session 1 | 2026-08-03

---

## ? What We Accomplished Today

### 1. Defined the Product
- **App Name:** SellorPilot
- **Purpose:** Etsy seller automation tool — personal use first, SaaS later
- **Shop:** Orra Nails (handmade physical products — nail art, press-on nails)

### 2. Researched the Etsy API (Full Capability Map)
- Listings CRUD, Inventory/Variations, Images/Videos
- Orders via Webhooks (order.paid, order.shipped, order.canceled, order.delivered)
- Financial Ledger, Payments, Shipping Profiles, Taxonomy, Translations
- ?? No native analytics endpoint — we build our own from order data

### 3. Understood the MCP Server
- Etsy Dev MCP: https://mcp.api.etsycloud.com/mcp
- Use during development to stay in sync with Etsy API schema

### 4. Finalized Architecture Decisions
| Decision | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | SQLite (local) ? PostgreSQL/Supabase (cloud) |
| ORM | Prisma |
| Auth | NextAuth.js (Etsy OAuth 2.0) |
| Job Queue | BullMQ + Redis |
| AI Writer | OpenAI GPT-4o / Google Gemini |
| Hosting | Local first ? Vercel + Supabase for SaaS |

### 5. Registered Etsy API Key
- **App Name on Etsy:** sellorpilot
- **Keystring:** ma2keca7flsy00zxcjyr2nto
- **Shared Secret:** (saved separately — do NOT commit to git)
- **Status:** ? Pending Personal Approval (check email for activation)
- **Rate Limit:** 5 QPS / 5,000 QPD
- **App Type:** Seller Tools | Just myself | Non-commercial | Upload/edit listings + Read sales data

---

## ?? Plan for Session 2 (Tomorrow)

### What We Will Build First: The UI

**Step 1 — Project Scaffold**
- Initialize Next.js 14 project inside `d:\Orra Nails\listing-automation\`
- Install: Tailwind CSS, shadcn/ui, Prisma, NextAuth.js, BullMQ
- Set up folder structure as per PLAN.md

**Step 2 — Design System**
- Color palette, typography, dark mode
- Global layout: sidebar nav + top bar

**Step 3 — Pages (UI-only, no backend yet)**
1. Dashboard / Home — stats overview
2. Listings Manager — grid + table view
3. Listing Creator — multi-step form
4. AI Writer — keyword input ? generated content
5. Orders — table view
6. Inventory — variation manager
7. Shipping Profiles — list + form

**Step 4 — Backend Integration (Once API Key is Active)**
- Etsy OAuth 2.0 connect flow
- API client in lib/etsy/
- Real data flowing into UI
- Webhook listener for orders

---

## ?? Things Needed From You in Session 2

The developer (you) will ask for these as we build — just be ready:
- [ ] **Gemini or OpenAI API key** (for AI Listing Writer)
- [ ] **Your Etsy Shared Secret** (when integrating backend — keep it private)
- [ ] **Feedback on UI designs** as each page is built
- [ ] **Sample listing data** (a few of your actual Orra Nails listings for realistic mock data)
- [ ] **Logo / brand assets** for SellorPilot (if you have any)

---

## ?? Important Credentials Status

| Credential | Status |
|---|---|
| Etsy API Keystring | ? Have it |
| Etsy Shared Secret | ? Have it (keep private) |
| Etsy API Status | ? Pending approval |
| OpenAI / Gemini Key | ? Not yet — needed before AI Writer |
| Supabase / DB | ? Not yet — needed when going cloud |

---

## ?? Files in This Project

| File | Purpose |
|---|---|
| PLAN.md | Full implementation plan (architecture, features, DB schema) |
| SESSION_NOTES.md | This file — session log and continuity tracker |

---

## ?? How to Resume Tomorrow

Just open this conversation and say:
> "Let's continue building SellorPilot — start with the UI scaffold"

Everything is documented here. No need to re-explain anything.
