import "server-only";
import { randomInt } from "node:crypto";
import { Prisma, type Order, type PaymentMethod } from "@prisma/client";
import { db } from "./db";
import { sendEmail } from "./notify/email";
import { orderEmail, type OrderEvent } from "./notify/templates";
import { providerFor } from "./payments";
import type { PricedLine } from "./pricing";
import type { CheckoutInput } from "./validation";

// Order lifecycle:
//   card: PENDING → (paid) PLACED, or → FAILED (→ PLACED if a retry is paid)
//   cash on delivery: created directly as PLACED
//   PLACED → OUT_FOR_DELIVERY → DELIVERED, or → CANCELLED (staff)
// Becoming PLACED takes the items out of stock, counts the discount code's use
// and emails the customer. Every transition is a conditional update, so two
// requests racing (return page + webhook) can never apply it twice.

// No 0/O or 1/I so numbers survive being read over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function orderNumber(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `CT-${s}`;
}

export async function createOrder(args: {
  input: CheckoutInput;
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  deliveryFee: number;
  weight: number;
  paymentMethod: PaymentMethod;
  provider: string;
}): Promise<Order> {
  const { input, lines, subtotal, discount, discountCode, deliveryFee, weight, paymentMethod, provider } = args;
  const data = {
    locale: input.locale,
    subtotal,
    discount,
    discountCode,
    deliveryFee,
    total: subtotal - discount + deliveryFee,
    weight,
    deliveryMethod: input.deliveryMethod,
    paymentMethod,
    firstName: input.customer.firstName,
    lastName: input.customer.lastName,
    email: input.customer.email.toLowerCase(),
    phone: input.customer.phone,
    city: input.address.city,
    zone: input.address.zone,
    street: input.address.street,
    building: input.address.building,
    unit: input.address.unit || null,
    notes: input.address.notes || null,
    paymentProvider: provider,
    items: {
      create: lines.map((l) => ({
        productSlug: l.product.slug,
        variantId: l.variant.id,
        name: l.product.name.en,
        nameAr: l.product.name.ar,
        variantLabel: l.variant.label.en,
        variantLabelAr: l.variant.label.ar,
        unitPrice: l.variant.price,
        quantity: l.qty,
        lineTotal: l.lineTotal,
      })),
    },
  };

  // 32^6 numbers: collisions are rare, but retry rather than fail checkout.
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.order.create({ data: { ...data, number: orderNumber() } });
    } catch (e) {
      const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002" && attempt < 5;
      if (!collision) throw e;
    }
  }
}

async function emailCustomer(event: OrderEvent, orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (order) await sendEmail(orderEmail(event, order));
}

/** Take a placed order's items out of stock. Returns false if something had run out. */
async function takeStock(orderId: string): Promise<boolean> {
  const items = await db.orderItem.findMany({ where: { orderId } });
  let complete = true;
  for (const item of items) {
    const variant = await db.variant.findFirst({
      where: { code: item.variantId, product: { slug: item.productSlug } },
    });
    if (!variant || variant.stock === null) continue; // untracked
    const taken = await db.variant.updateMany({
      where: { id: variant.id, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (taken.count === 0) {
      // Sold out between checkout and payment: take what is left and flag it.
      complete = false;
      await db.variant.updateMany({ where: { id: variant.id, stock: { gt: 0 } }, data: { stock: 0 } });
    }
  }
  return complete;
}

async function returnStock(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await db.variant.updateMany({
      where: { code: item.variantId, product: { slug: item.productSlug }, stock: { not: null } },
      data: { stock: { increment: item.quantity } },
    });
  }
}

/**
 * Everything that happens once an order is definitely going ahead. Call it only
 * from the request that won the transition to PLACED.
 */
async function onPlaced(order: Order) {
  const complete = await takeStock(order.id);
  if (!complete) await db.order.update({ where: { id: order.id }, data: { stockShort: true } });
  if (order.discountCode) {
    await db.discountCode.updateMany({ where: { code: order.discountCode }, data: { uses: { increment: 1 } } });
  }
  await emailCustomer("placed", order.id);
}

/** Cash on delivery: the order goes straight to PLACED. */
export async function placeCashOrder(order: Order): Promise<Order> {
  const now = new Date();
  const won = await db.order.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "PLACED", placedAt: now, paymentStatus: "CASH_ON_DELIVERY" },
  });
  if (won.count === 1) await onPlaced(order);
  return db.order.findUniqueOrThrow({ where: { id: order.id } });
}

/**
 * Ask the payment provider where an unpaid card order stands and record the
 * answer. Safe to call repeatedly and concurrently (return page + webhook).
 * Returns the order and whether this call moved it to PLACED (stock changed).
 *
 * FAILED orders are checked too: the customer can retry on the same payment
 * page after a decline, so a later "paid" still places the order.
 */
export async function syncPaymentStatus(order: Order): Promise<Order & { justPlaced?: boolean }> {
  const unpaid = order.status === "PENDING" || order.status === "FAILED";
  if (!unpaid || !order.chargeId || order.paymentMethod !== "CARD") return order;
  const provider = providerFor(order.paymentProvider);
  if (!provider) return order;

  const status = await provider.getChargeStatus(order);
  if (status.outcome === "pending" || (status.outcome === "failed" && order.status === "FAILED")) {
    if (status.raw !== order.paymentStatus) {
      await db.order.updateMany({ where: { id: order.id, status: order.status }, data: { paymentStatus: status.raw } });
    }
    return { ...order, paymentStatus: status.raw };
  }

  const now = new Date();
  const won = await db.order.updateMany({
    where: { id: order.id, status: status.outcome === "paid" ? { in: ["PENDING", "FAILED"] } : "PENDING" },
    data:
      status.outcome === "paid"
        ? { status: "PLACED", paymentStatus: status.raw, paidAt: now, placedAt: now }
        : { status: "FAILED", paymentStatus: status.raw },
  });
  const justPlaced = won.count === 1 && status.outcome === "paid";
  if (justPlaced) await onPlaced(order);
  const fresh = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  return { ...fresh, justPlaced };
}

// ——— Staff actions (from /admin) ———

export async function markOutForDelivery(orderId: string): Promise<boolean> {
  const won = await db.order.updateMany({
    where: { id: orderId, status: "PLACED" },
    data: { status: "OUT_FOR_DELIVERY", outForDeliveryAt: new Date() },
  });
  if (won.count === 1) await emailCustomer("outForDelivery", orderId);
  return won.count === 1;
}

export async function markDelivered(orderId: string): Promise<boolean> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return false;
  const now = new Date();
  const won = await db.order.updateMany({
    where: { id: orderId, status: { in: ["PLACED", "OUT_FOR_DELIVERY"] } },
    // Cash on delivery is paid when the driver hands it over.
    data: { status: "DELIVERED", deliveredAt: now, ...(order.paymentMethod === "COD" ? { paidAt: now, paymentStatus: "CASH_COLLECTED" } : {}) },
  });
  if (won.count === 1) await emailCustomer("delivered", orderId);
  return won.count === 1;
}

/** Cancel an order that has not been delivered; its items go back into stock. */
export async function cancelOrder(orderId: string): Promise<boolean> {
  const won = await db.order.updateMany({
    where: { id: orderId, status: { in: ["PLACED", "OUT_FOR_DELIVERY"] } },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  if (won.count === 1) {
    await returnStock(orderId);
    await emailCustomer("cancelled", orderId);
  }
  return won.count === 1;
}
