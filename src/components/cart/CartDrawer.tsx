"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { localePath, tr } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import type { PricedLine } from "@/lib/pricing";
import { ArrowIcon, CloseIcon } from "../ui/icons";
import { useCart, useCartDrawer } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer() {
  const { locale, t } = useI18n();
  const { open, setOpen } = useCartDrawer();
  const { priced, subtotal, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    // Closed: fully hidden (after the slide-out) and clipped, so the off-screen
    // panel and its shadow never widen the page on mobile browsers.
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-500 ${open ? "visible" : "pointer-events-none invisible"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-ivory transition-[transform,box-shadow] duration-500 ease-[var(--ease-luxe)] ${
          open ? "translate-x-0 shadow-2xl" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone px-6 py-5">
          <h2 className="font-display text-2xl">
            {t.cart.title}
            {count > 0 && (
              <span className="ms-2 align-middle font-sans text-xs text-muted">
                {count === 1 ? t.cart.itemCountOne : fmt(t.cart.itemCount, { count })}
              </span>
            )}
          </h2>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="-me-2 p-2" aria-label={t.nav.close}>
            <CloseIcon size={22} />
          </button>
        </div>

        {priced.length === 0 ? (
          <div className="motif flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-3xl">{t.cart.empty}</p>
            <p className="mt-3 max-w-xs text-sm text-muted">{t.cart.emptyBody}</p>
            <Link href={localePath(locale, "/shop")} className="btn btn-primary mt-8" onClick={() => setOpen(false)}>
              {t.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <FreeDeliveryProgress subtotal={subtotal} />
            <ul className="flex-1 divide-y divide-stone/70 overflow-y-auto px-6">
              {priced.map((line) => (
                <CartLineItem key={`${line.product.slug}:${line.variant.id}`} line={line} onNavigate={() => setOpen(false)} />
              ))}
            </ul>
            <div className="border-t border-stone bg-paper px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-[0.18em] rtl:text-base">{t.cart.subtotal}</span>
                <span className="font-display text-2xl tabular-nums">{formatMoney(subtotal, locale)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{t.product.taxNote}</p>
              <Link href={localePath(locale, "/checkout")} className="btn btn-primary mt-5 w-full">
                {t.cart.checkout}
                <ArrowIcon size={16} />
              </Link>
              <Link
                href={localePath(locale, "/cart")}
                className="mt-3 block text-center text-xs uppercase tracking-[0.18em] text-muted hover:text-ink rtl:text-sm"
              >
                {t.cart.viewBag}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export function CartLineItem({ line, onNavigate }: { line: PricedLine; onNavigate?: () => void }) {
  const { locale, t } = useI18n();
  const { setQty, remove } = useCart();
  const { product, variant, qty, lineTotal, available } = line;
  const short = qty > available;
  const href = localePath(locale, `/products/${product.slug}`);
  return (
    <li className="flex gap-4 py-5">
      <Link href={href} onClick={onNavigate} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-sand">
        <Image src={product.images[0]} alt={tr(product.name, locale)} fill sizes="80px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} onClick={onNavigate} className="font-display text-lg leading-snug hover:text-teal-deep">
              {tr(product.name, locale)}
            </Link>
            <p className="mt-0.5 text-xs text-muted">{tr(variant.label, locale)}</p>
            {short && (
              <p className="mt-1 text-xs text-danger" role="alert">
                {available === 0 ? t.cart.soldOutLine : fmt(t.cart.onlyLeft, { n: available })}
              </p>
            )}
          </div>
          <p className="text-sm tabular-nums">{formatMoney(lineTotal, locale)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper size="sm" value={qty} max={Math.max(1, available)} onChange={(n) => setQty(product.slug, variant.id, Math.min(n, Math.max(1, available)))} />
          <button
            type="button"
            onClick={() => remove(product.slug, variant.id)}
            className="link-underline text-xs uppercase tracking-[0.16em] text-muted hover:text-ink rtl:text-sm"
          >
            {t.cart.remove}
          </button>
        </div>
      </div>
    </li>
  );
}

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const { locale, t } = useI18n();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  return (
    <div className="border-b border-stone/70 px-6 py-4">
      <p className="text-xs text-ink-soft">
        {remaining > 0 ? fmt(t.cart.progress, { amount: formatMoney(remaining, locale) }) : t.cart.unlocked}
      </p>
      <div className="mt-2.5 h-[3px] bg-sand">
        <div
          className="h-full bg-teal transition-[width] duration-700 ease-[var(--ease-luxe)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
