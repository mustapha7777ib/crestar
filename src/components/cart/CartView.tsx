"use client";

import Link from "next/link";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { formatMoney } from "@/lib/money";
import { ArrowIcon } from "../ui/icons";
import { CartLineItem, FreeDeliveryProgress } from "./CartDrawer";
import { useHydrated } from "@/lib/use-hydrated";
import { CheckoutSkeleton } from "../ui/Skeleton";
import { useCart } from "./CartProvider";

export function CartView() {
  const { locale, t } = useI18n();
  const { priced, subtotal } = useCart();

  const hydrated = useHydrated();
  if (!hydrated) return <CheckoutSkeleton />;

  if (priced.length === 0) {
    return (
      <div className="motif py-28 text-center">
        <p className="font-display text-4xl">{t.cart.empty}</p>
        <p className="mt-3 text-muted">{t.cart.emptyBody}</p>
        <Link href={localePath(locale, "/shop")} className="btn btn-primary mt-10">
          {t.cart.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <ul className="divide-y divide-stone/70 border-y border-stone">
        {priced.map((line) => (
          <CartLineItem key={`${line.product.slug}:${line.variant.id}`} line={line} />
        ))}
      </ul>
      <aside className="self-start border border-stone bg-paper lg:sticky lg:top-28">
        <FreeDeliveryProgress subtotal={subtotal} />
        <div className="space-y-3 px-6 py-6 text-sm">
          <div className="flex justify-between">
            <span>{t.cart.subtotal}</span>
            <span className="tabular-nums">{formatMoney(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{t.cart.delivery}</span>
            <span>{t.cart.deliveryAtCheckout}</span>
          </div>
        </div>
        <div className="border-t border-stone px-6 py-6">
          <Link href={localePath(locale, "/checkout")} className="btn btn-primary w-full">
            {t.cart.checkout}
            <ArrowIcon size={16} />
          </Link>
          <Link
            href={localePath(locale, "/shop")}
            className="mt-4 block text-center text-xs uppercase tracking-[0.18em] text-muted hover:text-ink rtl:text-sm"
          >
            {t.cart.continue}
          </Link>
        </div>
      </aside>
    </div>
  );
}
