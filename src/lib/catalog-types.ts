import type { CategoryId } from "@/data/categories";
import { towns, type Town, type TownId } from "@/data/towns";
import type { L } from "@/i18n/config";

// Catalogue shapes shared by the server (lib/catalog.ts reads them from the
// database) and the browser (a slim copy is passed to the cart and search).
// Prices are integer dirhams, weights are grams.

export type Variant = {
  id: string; // stable code used in bags and orders, e.g. "500g"
  label: L;
  price: number;
  /** null = stock not tracked, always available. */
  stock: number | null;
  weight: number;
};

export type Product = {
  slug: string;
  category: CategoryId;
  name: L;
  tagline: L;
  story: L;
  town: TownId;
  details: { label: L; value: L }[];
  images: string[];
  variants: Variant[];
  badge?: L;
  /** Position in the home page "most loved" row; omit to leave it out. */
  featured?: number;
  handmade?: boolean;
  /** Slugs of the products inside a gift set. */
  bundle?: string[];
  active?: boolean;
  rating?: { average: number; count: number };
};

/** What the browser needs for the bag, search and stock labels. */
export type ClientProduct = Pick<Product, "slug" | "category" | "name" | "tagline" | "images" | "variants">;

export const LOW_STOCK = 3;

export function townOf(product: Pick<Product, "town">): Town {
  return towns[product.town] ?? towns.kano;
}

export function getVariant<P extends { variants: Variant[] }>(product: P, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function minPrice(product: { variants: Variant[] }): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function isSoldOut(variant: Variant): boolean {
  return variant.stock !== null && variant.stock <= 0;
}

export function productSoldOut(product: { variants: Variant[] }): boolean {
  return product.variants.every(isSoldOut);
}

/** "Only N left" threshold for a variant, or null when stock is plentiful/untracked. */
export function lowStock(variant: Variant): number | null {
  return variant.stock !== null && variant.stock > 0 && variant.stock <= LOW_STOCK ? variant.stock : null;
}

/** How many of this variant a customer may put in the bag. */
export function maxQty(variant: Variant, cap: number): number {
  return variant.stock === null ? cap : Math.max(0, Math.min(cap, variant.stock));
}

export function toClientProduct(p: Product): ClientProduct {
  return { slug: p.slug, category: p.category, name: p.name, tagline: p.tagline, images: p.images.slice(0, 1), variants: p.variants };
}
