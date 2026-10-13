"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { priceLines, stockProblems, subtotalOf, weightOf } from "@/lib/pricing";
import { useCatalog } from "../catalog/CatalogProvider";
import { cartStore } from "./cart-store";

type CartUI = { open: boolean; setOpen: (open: boolean) => void };

const CartUIContext = createContext<CartUI | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Navigating (e.g. drawer -> checkout) closes the drawer. Adjusting this
  // component's own state during render is the React-sanctioned pattern.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenState(false);
  }
  const setOpen = useCallback((value: boolean) => setOpenState(value), []);
  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>;
}

export function useCartDrawer(): CartUI {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside <CartProvider>");
  return ctx;
}

/** Bag contents priced from the catalogue. Empty during server render and hydration. */
export function useCart() {
  const catalog = useCatalog();
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const priced = useMemo(() => priceLines(lines, catalog), [lines, catalog]);
  return {
    lines,
    priced,
    subtotal: subtotalOf(priced),
    weight: weightOf(priced),
    /** Lines asking for more than is in stock. */
    short: stockProblems(priced),
    count: priced.reduce((n, l) => n + l.qty, 0),
    add: cartStore.add,
    setQty: cartStore.setQty,
    remove: cartStore.remove,
    clear: cartStore.clear,
  };
}
