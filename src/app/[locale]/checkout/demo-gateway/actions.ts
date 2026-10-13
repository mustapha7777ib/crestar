"use server";

import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { refreshCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { syncPaymentStatus } from "@/lib/orders";
import { demoPaymentsEnabled } from "@/lib/payments";

/**
 * Records the simulated card result. Server actions are public endpoints, so
 * this re-checks that demo payments are enabled and only touches pending demo orders.
 */
export async function completeDemoPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const outcome = formData.get("outcome") === "approve" ? "CAPTURED" : "DECLINED";
  if (!demoPaymentsEnabled() || !isLocale(locale)) throw new Error("Demo payments are disabled");

  await db.order.updateMany({
    where: { id: orderId, status: "PENDING", paymentProvider: "demo" },
    data: { paymentStatus: outcome },
  });
  // Settle it here, like the real gateway's webhook would, so stock and the
  // confirmation email are handled before the customer sees the order page.
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (order) {
    const synced = await syncPaymentStatus(order);
    if (synced.justPlaced) refreshCatalog();
  }
  redirect(`/${locale}/checkout/complete?order=${encodeURIComponent(orderId)}`);
}
