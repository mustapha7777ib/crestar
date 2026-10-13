"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { refreshCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { cancelOrder, markDelivered, markOutForDelivery, syncPaymentStatus } from "@/lib/orders";

const id = (formData: FormData) => String(formData.get("orderId") ?? "");

export async function outForDeliveryAction(formData: FormData) {
  await requireAdmin();
  await markOutForDelivery(id(formData));
  revalidatePath("/admin");
}

export async function deliveredAction(formData: FormData) {
  await requireAdmin();
  await markDelivered(id(formData));
  revalidatePath("/admin");
}

export async function cancelAction(formData: FormData) {
  await requireAdmin();
  if (await cancelOrder(id(formData))) refreshCatalog(); // stock returned
  revalidatePath("/admin");
}

export async function recheckPaymentAction(formData: FormData) {
  await requireAdmin();
  const order = await db.order.findUnique({ where: { id: id(formData) } });
  if (order) {
    const synced = await syncPaymentStatus(order);
    if (synced.justPlaced) refreshCatalog();
  }
  revalidatePath("/admin");
}
