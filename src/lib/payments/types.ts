import type { Order } from "@prisma/client";

export type ProviderId = "skipcash" | "demo";

/** Our view of a charge. "pending" means the customer has not finished paying yet. */
export type ChargeOutcome = "paid" | "pending" | "failed";

export type ChargeStatus = {
  outcome: ChargeOutcome;
  /** Provider's own status string, stored on the order for support. */
  raw: string;
};

export type CreateChargeInput = {
  order: Order;
  /** Where the gateway sends the customer after paying. */
  returnUrl: string;
  /** Server-to-server notification URL. */
  webhookUrl: string;
  description: string;
};

export interface PaymentProvider {
  id: ProviderId;
  createCharge(input: CreateChargeInput): Promise<{ chargeId: string; redirectUrl: string }>;
  /** Always asks the provider (or store) directly; never trusts browser-supplied status. */
  getChargeStatus(order: Order): Promise<ChargeStatus>;
}

export class PaymentError extends Error {}
