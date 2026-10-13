import type { Locale } from "@/i18n/config";

/**
 * All money is held as integer dirhams (1 QAR = 100 dirhams) so totals never
 * pick up floating-point drift. Convert to QAR only for display or for the
 * payment provider.
 */
export const CURRENCY = "QAR";

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: Locale, fractionDigits: number) {
  const key = `${locale}:${fractionDigits}`;
  let f = formatters.get(key);
  if (!f) {
    // Latin digits in Arabic too: Gulf storefronts and receipts use them for prices.
    f = new Intl.NumberFormat(locale === "ar" ? "ar-QA-u-nu-latn" : "en-QA", {
      style: "currency",
      currency: CURRENCY,
      currencyDisplay: locale === "ar" ? "symbol" : "code",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatters.set(key, f);
  }
  return f;
}

export function formatMoney(dirhams: number, locale: Locale): string {
  const whole = dirhams % 100 === 0;
  return formatter(locale, whole ? 0 : 2).format(dirhams / 100);
}

/** Decimal string for payment APIs, e.g. 12550 -> "125.50". */
export function toMajorUnits(dirhams: number): string {
  return (dirhams / 100).toFixed(2);
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-QA-u-nu-latn" : "en-QA").format(n);
}
