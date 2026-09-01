"use client";

/**
 * ShopContext — single source of truth for Etsy shop connection status.
 * Multi-shop: exposes allShops list and switchShop() to switch active shop.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface ShopInfo {
  id?:          string;   // DB id (used for switching)
  connected:    boolean;
  shopName?:    string;
  shopUrl?:     string;
  iconUrl?:     string;
  currency?:    string;
  tokenExpiry?: string;
  isActive?:    boolean;  // true when this shop is the current active shop
}

interface ShopContextValue {
  shop:        ShopInfo;             // Currently active shop
  allShops:    ShopInfo[];           // All connected shops
  loading:     boolean;
  refresh:     () => Promise<void>;
  switchShop:  (shopId: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextValue>({
  shop:       { connected: false },
  allShops:   [],
  loading:    true,
  refresh:    async () => {},
  switchShop: async () => {},
});

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shop,     setShop]     = useState<ShopInfo>({ connected: false });
  const [allShops, setAllShops] = useState<ShopInfo[]>([]);
  const [loading,  setLoading]  = useState(true);

  const refresh = useCallback(async () => {
    try {
      // Fetch active shop + all shops in parallel
      const [activeRes, allRes] = await Promise.all([
        fetch("/api/etsy/shop"),
        fetch("/api/etsy/shops"),
      ]);

      const activeData = activeRes.ok ? await activeRes.json() : { connected: false };
      const allData    = allRes.ok    ? await allRes.json()    : { shops: [] };

      setShop(activeData);
      setAllShops((allData.shops ?? []).map((s: ShopInfo) => ({
        ...s,
        connected: true,
      })));
    } catch {
      setShop({ connected: false });
      setAllShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch the active shop
  const switchShop = useCallback(async (shopId: string) => {
    try {
      const res = await fetch("/api/etsy/shop", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ shopId }),
      });
      if (!res.ok) throw new Error("Switch failed");
      await refresh(); // re-fetch everything so all dashboard widgets update
    } catch (err) {
      console.error("[ShopContext] switchShop error:", err);
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <ShopContext.Provider value={{ shop, allShops, loading, refresh, switchShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
