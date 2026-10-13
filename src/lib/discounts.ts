import "server-only";
import type { DiscountCode } from "@prisma/client";
import { db } from "./db";

// Discount codes (WELCOME10, EID20…) are created in /admin/discounts. They take
// money off the products, never off delivery.

export type DiscountCheck =
  | { ok: true; code: string; amount: number; kind: "PERCENT" | "FIXED"; value: number }
  | { ok: false; reason: "invalid" | "expired" | "minimum" | "usedUp"; minSubtotal?: number };

export function normaliseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function discountAmount(code: Pick<DiscountCode, "kind" | "value">, subtotal: number): number {
  const amount = code.kind === "PERCENT" ? Math.round((subtotal * Math.min(code.value, 100)) / 100) : code.value;
  return Math.max(0, Math.min(amount, subtotal));
}

export async function checkDiscount(raw: string, subtotal: number, now = new Date()): Promise<DiscountCheck> {
  const code = normaliseCode(raw);
  if (!code) return { ok: false, reason: "invalid" };
  const found = await db.discountCode.findUnique({ where: { code } });
  if (!found || !found.active) return { ok: false, reason: "invalid" };
  if ((found.startsAt && found.startsAt > now) || (found.endsAt && found.endsAt < now)) return { ok: false, reason: "expired" };
  if (found.maxUses !== null && found.uses >= found.maxUses) return { ok: false, reason: "usedUp" };
  if (subtotal < found.minSubtotal) return { ok: false, reason: "minimum", minSubtotal: found.minSubtotal };
  return { ok: true, code, amount: discountAmount(found, subtotal), kind: found.kind, value: found.value };
}
