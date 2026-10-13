"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";

export type ReviewResult = { ok: true } | { ok: false; error: "invalid" | "needOne" | "generic" };

const BLOB_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//;

export async function submitReviews(input: unknown): Promise<ReviewResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "needOne" };
  const { orderId, token, locale, name, reviews } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, reviews: true } });
  if (!order || order.reviewToken !== token || order.status !== "DELIVERED") return { ok: false, error: "invalid" };

  const bought = new Set(order.items.map((i) => i.productSlug));
  const done = new Set(order.reviews.map((r) => r.productSlug));
  const fresh = reviews.filter((r) => bought.has(r.slug) && !done.has(r.slug));
  if (fresh.length === 0) return { ok: false, error: "needOne" };

  try {
    await db.review.createMany({
      data: fresh.map((r) => ({
        orderId,
        productSlug: r.slug,
        name,
        rating: r.rating,
        body: r.body,
        photo: r.photo && BLOB_HOST.test(r.photo) ? r.photo : null,
        locale,
      })),
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("[reviews] save failed", e instanceof Prisma.PrismaClientKnownRequestError ? e.code : e);
    return { ok: false, error: "generic" };
  }
  return { ok: true };
}
