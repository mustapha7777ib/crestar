"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { normaliseCode } from "@/lib/discounts";

export type DiscountFormState = { error?: string; saved?: string } | undefined;

const dateOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  // Dates are entered in Qatar time (UTC+3).
  const d = new Date(`${s}T00:00:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export async function createDiscountAction(_prev: DiscountFormState, formData: FormData): Promise<DiscountFormState> {
  await requireAdmin();
  const code = normaliseCode(String(formData.get("code") ?? ""));
  const kind = formData.get("kind") === "FIXED" ? "FIXED" : "PERCENT";
  const rawValue = Number(formData.get("value"));
  const value = kind === "PERCENT" ? Math.round(rawValue) : Math.round(rawValue * 100);
  const minSubtotal = Math.round(Number(formData.get("minSubtotal") || 0) * 100);
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const maxUses = maxUsesRaw ? Math.floor(Number(maxUsesRaw)) : null;
  const startsAt = dateOrNull(formData.get("startsAt"));
  const endsAtStart = dateOrNull(formData.get("endsAt"));
  // An end date includes the whole of that day.
  const endsAt = endsAtStart ? new Date(endsAtStart.getTime() + 24 * 3600 * 1000 - 1) : null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!/^[A-Z0-9-]{3,30}$/.test(code)) return { error: "Code: 3–30 letters, numbers or dashes." };
  if (!Number.isFinite(rawValue) || rawValue <= 0) return { error: "Enter how much the code takes off." };
  if (kind === "PERCENT" && value > 90) return { error: "A percentage code can take off at most 90%." };
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) return { error: "Minimum order must be a number." };
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) return { error: "Maximum uses must be 1 or more, or empty." };
  if (startsAt && endsAt && endsAt < startsAt) return { error: "The end date is before the start date." };

  try {
    await db.discountCode.create({ data: { code, kind, value, minSubtotal, maxUses, startsAt, endsAt, note } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: `${code} already exists.` };
    throw e;
  }
  revalidatePath("/admin/discounts");
  return { saved: code };
}

export async function toggleDiscountAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const found = await db.discountCode.findUnique({ where: { id } });
  if (found) await db.discountCode.update({ where: { id }, data: { active: !found.active } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscountAction(formData: FormData) {
  await requireAdmin();
  // Only unused codes are deleted; used ones stay for the order history (switch them off instead).
  await db.discountCode.deleteMany({ where: { id: String(formData.get("id") ?? ""), uses: 0 } });
  revalidatePath("/admin/discounts");
}
