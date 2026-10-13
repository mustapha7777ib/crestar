import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Order } from "@prisma/client";
import { CURRENCY, toMajorUnits } from "@/lib/money";
import { PaymentError, type ChargeStatus, type PaymentProvider } from "./types";

// SkipCash (https://dev.skipcash.app): a Qatari gateway for cards, Apple Pay
// and Google Pay, always in QAR. Flow: create a payment with an HMAC-signed
// request, send the customer to its payUrl, then confirm by fetching the
// payment with our client id. Card numbers never touch this server.

const BASE_URLS = {
  live: "https://api.skipcash.app",
  sandbox: "https://skipcashtest.azurewebsites.net",
};

function config() {
  const clientId = process.env.SKIPCASH_CLIENT_ID;
  const keyId = process.env.SKIPCASH_KEY_ID;
  const keySecret = process.env.SKIPCASH_KEY_SECRET;
  if (!clientId || !keyId || !keySecret) {
    throw new PaymentError("SKIPCASH_CLIENT_ID, SKIPCASH_KEY_ID and SKIPCASH_KEY_SECRET must all be set");
  }
  const base = process.env.SKIPCASH_ENV === "sandbox" ? BASE_URLS.sandbox : BASE_URLS.live;
  return { clientId, keyId, keySecret, base };
}

export function skipcashConfigured(): boolean {
  return Boolean(process.env.SKIPCASH_CLIENT_ID && process.env.SKIPCASH_KEY_ID && process.env.SKIPCASH_KEY_SECRET);
}

/**
 * SkipCash signs "Key=value" pairs joined by commas, in a fixed order, leaving
 * out empty fields: HMAC-SHA256, then base64.
 */
function sign(fields: [string, unknown][], secret: string): string {
  const message = fields
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
  return createHmac("sha256", secret).update(message, "utf8").digest("base64");
}

/** SkipCash rejects names with special characters; keep letters and spaces. */
function plainName(name: string): string {
  const clean = name.replace(/[^\p{L}\p{M} ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return clean || "Customer";
}

type SkipCashPayment = {
  id: string;
  statusId: number;
  status?: string | null;
  payUrl?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  transactionId?: string | null;
};

type SkipCashResponse = {
  resultObj?: SkipCashPayment | null;
  hasError?: boolean;
  hasValidationError?: boolean;
  errorMessage?: string | null;
  validationErrors?: unknown;
};

async function skipcashFetch(path: string, init: RequestInit & { authorization: string }): Promise<SkipCashPayment> {
  const { base } = config();
  const { authorization, ...rest } = init;
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: { Authorization: authorization, "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as SkipCashResponse | null;
  if (!res.ok || !body?.resultObj || body.hasError || body.hasValidationError) {
    const detail = [body?.errorMessage, body?.validationErrors ? JSON.stringify(body.validationErrors) : null]
      .filter(Boolean)
      .join(" ");
    throw new PaymentError(`SkipCash ${init.method ?? "GET"} ${path} failed (${res.status}) ${detail}`);
  }
  return body.resultObj;
}

// statusId values from the SkipCash docs. 12 means the customer has the card
// form open; it drops back to 0 after two minutes if they do not finish.
const PAID = 2;
const PENDING = new Set([0, 1, 12]);

export const skipcashProvider: PaymentProvider = {
  id: "skipcash",

  async createCharge({ order, returnUrl, webhookUrl, description }) {
    const { keyId, keySecret } = config();
    // The signed fields, in the order SkipCash signs them. Our order id is
    // the TransactionId: SkipCash allows no "#" or special characters there.
    const fields: [string, string][] = [
      ["Uid", randomUUID()],
      ["KeyId", keyId],
      ["Amount", toMajorUnits(order.total)],
      ["FirstName", plainName(order.firstName)],
      ["LastName", plainName(order.lastName)],
      ["Phone", `+974${order.phone}`],
      ["Email", order.email],
      ["TransactionId", order.id],
    ];
    const body = {
      ...Object.fromEntries(fields.map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v])),
      subject: description,
      description,
      returnUrl,
      webhookUrl,
    };
    const payment = await skipcashFetch("/api/v1/payments", {
      method: "POST",
      authorization: sign(fields, keySecret),
      body: JSON.stringify(body),
    });
    if (!payment.id || !payment.payUrl) throw new PaymentError(`SkipCash payment for ${order.number} has no payUrl`);
    return { chargeId: payment.id, redirectUrl: payment.payUrl };
  },

  async getChargeStatus(order: Order): Promise<ChargeStatus> {
    if (!order.chargeId) return { outcome: "pending", raw: "NO_CHARGE" };
    const payment = await skipcashFetch(`/api/v1/payments/${encodeURIComponent(order.chargeId)}`, {
      authorization: config().clientId,
    });
    const raw = (payment.status ?? `STATUS_${payment.statusId}`).toUpperCase();

    // A paid payment only counts if it is for exactly this order and amount.
    const matches =
      payment.id === order.chargeId &&
      (payment.currency ?? CURRENCY) === CURRENCY &&
      Math.round(Number(payment.amount) * 100) === order.total &&
      (!payment.transactionId || payment.transactionId === order.id);
    if (!matches) {
      console.error(`[skipcash] payment ${payment.id} does not match order ${order.number}`);
      return { outcome: "failed", raw: `MISMATCH_${raw}` };
    }

    if (payment.statusId === PAID) return { outcome: "paid", raw };
    if (PENDING.has(payment.statusId)) return { outcome: "pending", raw };
    // 3 cancelled, 4 failed, 5 rejected, 6–8 refunds. A customer can still
    // retry on the same payment page, so syncPaymentStatus lets a later
    // "paid" override this.
    return { outcome: "failed", raw };
  },
};

/**
 * Checks a webhook's Authorization header. SkipCash signs PaymentId, Amount,
 * StatusId, TransactionId, Custom1 and VisaId (empty ones left out) with the
 * webhook key.
 */
export function verifyWebhook(body: Record<string, unknown>, authorization: string | null, webhookKey: string): boolean {
  const order = ["PaymentId", "Amount", "StatusId", "TransactionId", "Custom1", "VisaId"];
  const expected = Buffer.from(sign(order.map((k) => [k, body[k]]), webhookKey));
  const given = Buffer.from(authorization?.trim() ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
