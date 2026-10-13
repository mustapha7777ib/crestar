import type { L } from "@/i18n/config";

// Delivery rules are shared by the cart (for display) and the checkout API
// (which recomputes everything server-side and never trusts client totals).

export const FREE_DELIVERY_THRESHOLD = 250_00; // QAR 250, in dirhams

export const deliveryMethods = ["standard", "express"] as const;
export type DeliveryMethod = (typeof deliveryMethods)[number];

const FEES: Record<DeliveryMethod, number> = {
  standard: 15_00,
  express: 35_00,
};

export type City = { id: string; name: L; express: boolean };

export const cities: City[] = [
  { id: "doha", name: { en: "Doha", ar: "الدوحة" }, express: true },
  { id: "lusail", name: { en: "Lusail", ar: "لوسيل" }, express: true },
  { id: "al-rayyan", name: { en: "Al Rayyan", ar: "الريان" }, express: true },
  { id: "al-wakrah", name: { en: "Al Wakrah", ar: "الوكرة" }, express: true },
  { id: "al-daayen", name: { en: "Al Daayen", ar: "الضعاين" }, express: false },
  { id: "umm-salal", name: { en: "Umm Salal", ar: "أم صلال" }, express: false },
  { id: "al-khor", name: { en: "Al Khor", ar: "الخور" }, express: false },
  { id: "mesaieed", name: { en: "Mesaieed", ar: "مسيعيد" }, express: false },
  { id: "al-shamal", name: { en: "Al Shamal", ar: "الشمال" }, express: false },
  { id: "dukhan", name: { en: "Dukhan", ar: "دخان" }, express: false },
];

export function findCity(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

// Heavy orders (charcoal sacks, big pots) cost more to carry: the base fee covers
// the first 10kg, then each started 10kg adds QAR 10. Free delivery waives the
// base fee only.
export const INCLUDED_WEIGHT = 10_000; // grams
export const HEAVY_STEP = 10_000; // grams
export const HEAVY_STEP_FEE = 10_00; // QAR 10

export function heavySurcharge(weight: number): number {
  if (weight <= INCLUDED_WEIGHT) return 0;
  return Math.ceil((weight - INCLUDED_WEIGHT) / HEAVY_STEP) * HEAVY_STEP_FEE;
}

/** Express is a paid upgrade, so only standard delivery becomes free over the threshold. */
export function deliveryFee(method: DeliveryMethod, subtotal: number, weight = 0): number {
  const base = method === "standard" && subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FEES[method];
  return base + heavySurcharge(weight);
}

/** Cash on delivery is offered up to this order total, to limit unpaid-order risk. */
export const COD_MAX_TOTAL = 2000_00;

export function baseDeliveryFee(method: DeliveryMethod): number {
  return FEES[method];
}
