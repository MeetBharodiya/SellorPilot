import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SellorPilot — Etsy Seller Automation",
    template: "%s | SellorPilot",
  },
  description:
    "Automate your Etsy shop. Manage listings, orders, inventory, and analytics — all in one beautiful dashboard.",
  keywords: ["Etsy", "seller tools", "listing automation", "Etsy dashboard", "shop management"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
