import { getVariant, maxQty, type ClientProduct, type Variant } from "./catalog-types";

// Shared by the bag (with the browser's copy of the catalogue) and the checkout
// API (with the database's). The API re-runs this on the server, so a tampered
// bag cannot change prices.

export const MAX_QTY_PER_LINE = 20;

export type CartLine = { slug: string; variant: string; qty: number };

export type PricedLine<P extends ClientProduct = ClientProduct> = {
  product: P;
  variant: Variant;
  qty: number;
  lineTotal: number;
  /** Most the customer can have of this variant right now (0 = sold out). */
  available: number;
};

export function priceLines<P extends ClientProduct>(lines: CartLine[], catalog: P[]): PricedLine<P>[] {
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const priced: PricedLine<P>[] = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    const variant = product && getVariant(product, line.variant);
    if (!product || !variant) continue; // discontinued item left in an old bag
    const qty = Math.min(Math.max(1, Math.floor(line.qty)), MAX_QTY_PER_LINE);
    priced.push({ product, variant, qty, lineTotal: variant.price * qty, available: maxQty(variant, MAX_QTY_PER_LINE) });
  }
  return priced;
}

export function subtotalOf(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function weightOf(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.variant.weight * l.qty, 0);
}

/** Lines asking for more than is in stock. */
export function stockProblems<P extends ClientProduct>(lines: PricedLine<P>[]): PricedLine<P>[] {
  return lines.filter((l) => l.qty > l.available);
}
