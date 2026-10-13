import { db } from "@/lib/db";
import { refreshCatalog } from "@/lib/catalog";
import { syncPaymentStatus } from "@/lib/orders";
import { verifyWebhook } from "@/lib/payments/skipcash";

// SkipCash posts here when a payment finishes (and retries 1 hour and 1 day
// later unless we answer 200). The signature is checked with the webhook key,
// but the body is still not trusted: we only take the payment id from it and
// re-fetch the payment from SkipCash (inside syncPaymentStatus). That also
// copes with webhooks arriving out of order.

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const paymentId = typeof body?.PaymentId === "string" ? body.PaymentId : null;
  if (!body || !paymentId) return Response.json({ ok: false }, { status: 400 });

  const webhookKey = process.env.SKIPCASH_WEBHOOK_KEY;
  if (webhookKey && !verifyWebhook(body, request.headers.get("authorization"), webhookKey)) {
    console.warn(`[skipcash webhook] bad signature for payment ${paymentId}`);
    return Response.json({ ok: false }, { status: 401 });
  }

  const order = await db.order.findUnique({ where: { chargeId: paymentId } });
  if (!order) return Response.json({ ok: true }); // not ours, or already cleaned up

  try {
    const synced = await syncPaymentStatus(order);
    if (synced.justPlaced) refreshCatalog(); // stock changed
  } catch (error) {
    console.error(`[skipcash webhook] sync failed for ${order.number}`, error);
    return Response.json({ ok: false }, { status: 500 }); // SkipCash will retry
  }
  return Response.json({ ok: true });
}
