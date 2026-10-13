"use client";

import { createContext, useContext } from "react";
import type { ClientProduct } from "@/lib/catalog-types";

// The shop's catalogue (slim: names, first photo, sizes, prices, stock), passed
// down once from the layout for the bag, search and the WhatsApp button.

const CatalogContext = createContext<ClientProduct[]>([]);

export function CatalogProvider({ catalog, children }: { catalog: ClientProduct[]; children: React.ReactNode }) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): ClientProduct[] {
  return useContext(CatalogContext);
}
