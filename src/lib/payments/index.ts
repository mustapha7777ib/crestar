import "server-only";
import { demoProvider } from "./demo";
import { skipcashConfigured, skipcashProvider } from "./skipcash";
import type { PaymentProvider, ProviderId } from "./types";

/**
 * The demo gateway lets anyone "pay" without money moving, so it must never be
 * live by accident: it is on in development, and in production only when
 * PAYMENT_PROVIDER=demo is set explicitly (e.g. for a preview deploy).
 */
export function demoPaymentsEnabled(): boolean {
  if (process.env.PAYMENT_PROVIDER === "demo") return true;
  return process.env.NODE_ENV !== "production" && !skipcashConfigured();
}

/** Provider for new checkouts, or null when online payment is not configured. */
export function activeProvider(): PaymentProvider | null {
  if (process.env.PAYMENT_PROVIDER === "demo") return demoProvider;
  if (skipcashConfigured()) return skipcashProvider;
  return demoPaymentsEnabled() ? demoProvider : null;
}

/** Provider that created an existing order's charge. */
export function providerFor(id: string): PaymentProvider | null {
  if (id === "skipcash") return skipcashProvider;
  if (id === "demo" && demoPaymentsEnabled()) return demoProvider;
  return null;
}

export type { PaymentProvider, ProviderId };
export { PaymentError } from "./types";
