"use client";

import { useEffect, useState } from "react";
import { tr } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { isSoldOut, lowStock, maxQty, type Product } from "@/lib/catalog-types";
import { formatMoney } from "@/lib/money";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { useCart, useCartDrawer } from "../cart/CartProvider";
import { QuantityStepper } from "../cart/QuantityStepper";
import { CheckIcon, LockIcon } from "../ui/icons";

export function ProductPurchase({ product }: { product: Pick<Product, "slug" | "variants"> }) {
  const { locale, t } = useI18n();
  const { add, lines } = useCart();
  const { setOpen } = useCartDrawer();
  const firstAvailable = product.variants.find((v) => !isSoldOut(v)) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;

  // What is left for this customer, counting what is already in their bag.
  const inBag = lines.find((l) => l.slug === product.slug && l.variant === variant.id)?.qty ?? 0;
  const max = Math.max(0, maxQty(variant, MAX_QTY_PER_LINE) - inBag);
  const soldOut = isSoldOut(variant);
  const low = lowStock(variant);
  const shownQty = Math.max(1, Math.min(qty, max || 1));

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <div>
      <p className="font-display text-3xl tabular-nums">{formatMoney(variant.price * shownQty, locale)}</p>

      {product.variants.length > 1 && (
        <fieldset className="mt-8">
          <legend className="text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm">{t.product.size}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const selected = v.id === variant.id;
              const out = isSoldOut(v);
              return (
                <label
                  key={v.id}
                  className={`flex min-w-24 flex-col items-center border px-4 py-2.5 text-center transition-colors ${
                    selected ? "border-ink bg-ink text-paper" : "border-stone hover:border-ink"
                  } ${out ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={selected}
                    disabled={out}
                    onChange={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className="sr-only"
                  />
                  <span className={`text-sm ${out ? "line-through" : ""}`}>{tr(v.label, locale)}</span>
                  <span className={`text-xs ${selected ? "text-paper/70" : "text-muted"}`}>
                    {out ? t.product.soldOut : formatMoney(v.price, locale)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {low !== null && !soldOut && (
        <p className="mt-6 flex items-center gap-2 text-sm text-danger">
          <span className="h-1.5 w-1.5 rotate-45 bg-danger" aria-hidden="true" />
          {fmt(t.product.onlyLeft, { n: low })}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <QuantityStepper value={shownQty} onChange={setQty} max={Math.max(1, max)} />
        <button
          type="button"
          className="btn btn-primary flex-1"
          disabled={soldOut || max === 0}
          onClick={() => {
            add(product.slug, variant.id, shownQty);
            setAdded(true);
            setOpen(true);
          }}
        >
          {soldOut ? (
            t.product.soldOut
          ) : added ? (
            <>
              <CheckIcon size={16} />
              {t.product.added}
            </>
          ) : (
            t.product.addToBag
          )}
        </button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <LockIcon size={14} />
        {t.product.secure} · {t.product.taxNote}
      </p>
    </div>
  );
}
