import "server-only";
import type { ChargeStatus, PaymentProvider } from "./types";

// Simulated gateway for local development and previews. The customer is sent
// to /[locale]/checkout/demo-gateway, which records "CAPTURED" or "DECLINED"
// on the order. Only enabled when payments.ts allows it.

export const demoProvider: PaymentProvider = {
  id: "demo",

  async createCharge({ order, returnUrl }) {
    const gateway = new URL(returnUrl);
    gateway.pathname = gateway.pathname.replace(/\/checkout\/complete$/, "/checkout/demo-gateway");
    return { chargeId: `demo_${order.id}`, redirectUrl: gateway.toString() };
  },

  async getChargeStatus(order): Promise<ChargeStatus> {
    switch (order.paymentStatus) {
      case "CAPTURED":
        return { outcome: "paid", raw: "CAPTURED" };
      case "DECLINED":
        return { outcome: "failed", raw: "DECLINED" };
      default:
        return { outcome: "pending", raw: order.paymentStatus ?? "INITIATED" };
    }
  },
};
