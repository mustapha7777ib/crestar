import Image from "next/image";
import Link from "next/link";
import { minPrice, productSoldOut, townOf, type Product } from "@/lib/catalog-types";
import { kmToDoha } from "@/data/towns";
import { localePath, tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { formatMoney, formatNumber } from "@/lib/money";
import { Stars } from "./Stars";

export function ProductCard({
  product,
  locale,
  t,
  priority = false,
  arched = false,
}: {
  product: Product;
  locale: Locale;
  t: Dictionary;
  priority?: boolean;
  /** Souq-style arched frame, used to vary rhythm in editorial rows. */
  arched?: boolean;
}) {
  const town = townOf(product);
  const [first, second] = product.images;
  const price = minPrice(product);
  const fromPrice = product.variants.length > 1;
  const soldOut = productSoldOut(product);
  const badge = soldOut ? t.product.soldOut : product.badge ? tr(product.badge, locale) : null;

  return (
    <Link href={localePath(locale, `/products/${product.slug}`)} className="group block">
      <div
        className={`relative aspect-[4/5] overflow-hidden bg-sand ${arched ? "rounded-t-full" : ""}`}
      >
        <Image
          src={first}
          alt={tr(product.name, locale)}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          className={`object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04] ${soldOut ? "opacity-70 grayscale-[30%]" : ""}`}
        />
        {second && (
          <Image
            src={second}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {badge && (
          <span
            className={`absolute px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] whitespace-nowrap rtl:text-xs ${soldOut ? "bg-ink text-paper" : "bg-paper/95 text-ink"} ${
              arched ? "bottom-3 left-1/2 -translate-x-1/2" : "start-3 top-3"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="pt-4">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-teal-deep rtl:text-xs">
          <span>{tr(town.name, locale)}</span>
          <span aria-hidden="true" className="hidden h-px w-4 bg-teal/60 sm:inline-block" />
          <span className="text-muted">{fmt(t.product.journey, { km: formatNumber(kmToDoha(town), locale) })}</span>
        </p>
        <h3 className="mt-2 font-display text-[1.35rem] leading-tight transition-colors group-hover:text-teal-deep rtl:text-[1.3rem]">
          {tr(product.name, locale)}
        </h3>
        <p className="mt-1 text-sm text-muted">{tr(product.tagline, locale)}</p>
        {product.rating && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating.average} size={12} />
            <span className="tabular-nums">({formatNumber(product.rating.count, locale)})</span>
          </p>
        )}
        <p className={`mt-2.5 text-sm font-medium tabular-nums ${soldOut ? "text-muted line-through decoration-stone" : ""}`}>
          {fromPrice && <span className="text-muted">{t.product.from} </span>}
          {formatMoney(price, locale)}
        </p>
      </div>
    </Link>
  );
}
