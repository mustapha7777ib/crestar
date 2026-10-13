import { getCatalog, refreshCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { COD_MAX_TOTAL, deliveryFee, findCity } from "@/lib/delivery";
import { checkDiscount } from "@/lib/discounts";
import { createOrder, placeCashOrder } from "@/lib/orders";
import { activeProvider } from "@/lib/payments";
import { priceLines, stockProblems, subtotalOf, weightOf } from "@/lib/pricing";
import { site } from "@/lib/site";
import { checkoutSchema } from "@/lib/validation";

const FIELD_ERRORS = new Set(["required", "email", "phone", "number"]);

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    let emptyCart = false;
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "items") emptyCart = true;
      const key = String(issue.path.at(-1) ?? "");
      if (key && !fields[key]) fields[key] = FIELD_ERRORS.has(issue.message) ? issue.message : "required";
    }
    return Response.json({ error: emptyCart ? "emptyCart" : "invalid", fields }, { status: 400 });
  }
  const input = parsed.data;

  const city = findCity(input.address.city);
  if (!city) return Response.json({ error: "invalid", fields: { city: "required" } }, { status: 400 });
  // Same-day is only offered in greater Doha; quietly fall back elsewhere.
  if (input.deliveryMethod === "express" && !city.express) input.deliveryMethod = "standard";

  // Prices, stock and weights come from the database, never from the request.
  const lines = priceLines(input.items, await getCatalog());
  if (lines.length === 0) return Response.json({ error: "emptyCart" }, { status: 400 });
  const short = stockProblems(lines);
  if (short.length) {
    return Response.json(
      { error: "stock", items: short.map((l) => ({ slug: l.product.slug, variant: l.variant.id, available: l.available })) },
      { status: 409 },
    );
  }

  const subtotal = subtotalOf(lines);
  let discount = 0;
  let discountCode: string | null = null;
  if (input.discountCode) {
    const check = await checkDiscount(input.discountCode, subtotal);
    if (!check.ok) return Response.json({ error: "discount", reason: check.reason }, { status: 400 });
    discount = check.amount;
    discountCode = check.code;
  }
  const weight = weightOf(lines);
  // Free delivery is judged on what the customer pays for the products.
  const fee = deliveryFee(input.deliveryMethod, subtotal - discount, weight);
  const total = subtotal - discount + fee;
  const origin = process.env.APP_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;

  // ——— Cash on delivery ———
  if (input.paymentMethod === "cod") {
    if (total > COD_MAX_TOTAL) return Response.json({ error: "codLimit" }, { status: 400 });
    const order = await createOrder({
      input, lines, subtotal, discount, discountCode, deliveryFee: fee, weight, paymentMethod: "COD", provider: "cod",
    });
    await placeCashOrder(order);
    refreshCatalog(); // stock changed
    return Response.json({ url: `${origin}/${input.locale}/checkout/complete?order=${order.id}` });
  }

  // ——— Card ———
  const provider = activeProvider();
  if (!provider) {
    console.error("[checkout] no payment provider configured (set the SKIPCASH_* keys)");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  const order = await createOrder({
    input, lines, subtotal, discount, discountCode, deliveryFee: fee, weight, paymentMethod: "CARD", provider: provider.id,
  });
  const returnUrl = `${origin}/${input.locale}/checkout/complete?order=${order.id}`;

  try {
    const charge = await provider.createCharge({
      order,
      returnUrl,
      webhookUrl: `${origin}/api/webhooks/skipcash`,
      description: `${site.name} order ${order.number}`,
    });
    await db.order.update({ where: { id: order.id }, data: { chargeId: charge.chargeId, paymentStatus: "INITIATED" } });
    return Response.json({ url: charge.redirectUrl });
  } catch (error) {
    console.error(`[checkout] could not create charge for ${order.number}`, error);
    await db.order.update({ where: { id: order.id }, data: { status: "FAILED", paymentStatus: "CHARGE_NOT_CREATED" } });
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
