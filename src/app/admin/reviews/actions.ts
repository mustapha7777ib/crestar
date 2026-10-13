"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { refreshCatalogNow } from "@/lib/catalog";
import { db } from "@/lib/db";

async function setStatus(formData: FormData, status: "APPROVED" | "REJECTED") {
  await requireAdmin();
  await db.review.update({ where: { id: String(formData.get("id") ?? "") }, data: { status } });
  refreshCatalogNow(); // star ratings and product pages
  revalidatePath("/admin/reviews");
}

export async function approveReviewAction(formData: FormData) {
  await setStatus(formData, "APPROVED");
}

export async function rejectReviewAction(formData: FormData) {
  await setStatus(formData, "REJECTED");
}
