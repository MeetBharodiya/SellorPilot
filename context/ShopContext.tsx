"use client";

/**
 * ShopContext — single source of truth for Etsy shop connection status.
 * One API call on mount, shared across Sidebar, Settings, and any other component.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface ShopInfo {
  connected:    boolean;
  shopName?:    string;
  shopUrl?:     string;
  iconUrl?:     string;
  currency?:    string;
  tokenExpiry?: string;
}

interface ShopContextValue {
  shop:    ShopInfo;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ShopContext = createContext<ShopContextValue>({
  shop:    { connected: false },
  loading: true,
  refresh: async () => {},
});

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shop,    setShop]    = useState<ShopInfo>({ connected: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/etsy/shop");
      const data = await res.json();
      setShop(data);
    } catch {
      setShop({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <ShopContext.Provider value={{ shop, loading, refresh }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
