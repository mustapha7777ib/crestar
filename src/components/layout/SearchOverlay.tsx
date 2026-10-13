"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories } from "@/data/categories";
import { localePath, tr } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { minPrice, productSoldOut } from "@/lib/catalog-types";
import { formatMoney } from "@/lib/money";
import { useCatalog } from "../catalog/CatalogProvider";
import { CloseIcon, SearchIcon } from "../ui/icons";

// Strip case, Latin accents and Arabic diacritics/letter variants so
// "karkade", "كركديه" and "كَركديه" all match.
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

const SUGGESTIONS = { en: ["Hibiscus", "Charcoal", "Shea", "Indigo", "Gift"], ar: ["كركديه", "فحم", "شيا", "نيلي", "هدايا"] };

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useI18n();
  const catalog = useCatalog();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // Index once: both languages, tagline and collection name.
  const index = useMemo(
    () =>
      catalog.map((p) => {
        const cat = categories.find((c) => c.id === p.category);
        return {
          product: p,
          text: normalise([p.name.en, p.name.ar, p.tagline.en, p.tagline.ar, cat?.name.en, cat?.name.ar].join(" ")),
        };
      }),
    [catalog],
  );

  const terms = normalise(q).split(/\s+/).filter(Boolean);
  const results = terms.length ? index.filter((e) => terms.every((term) => e.text.includes(term))).slice(0, 8) : [];

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-300 ${open ? "visible" : "pointer-events-none invisible"}`}
      aria-hidden={!open}
    >
      <div className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.search.label}
        className={`relative max-h-dvh overflow-y-auto bg-ivory shadow-xl transition-transform duration-500 ease-[var(--ease-luxe)] ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container-luxe py-6 md:py-10">
          <div className="flex items-center gap-4 border-b border-ink pb-3">
            <SearchIcon size={22} className="shrink-0 text-muted" />
            <label htmlFor="site-search" className="sr-only">
              {t.search.label}
            </label>
            <input
              ref={input}
              id="site-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search.placeholder}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-stone md:text-4xl"
            />
            <button type="button" onClick={onClose} className="-me-2 p-2" aria-label={t.search.close}>
              <CloseIcon size={22} />
            </button>
          </div>

          {terms.length === 0 ? (
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="me-2 text-muted">{t.search.suggestions}</span>
              {SUGGESTIONS[locale].map((s) => (
                <button key={s} type="button" onClick={() => setQ(s)} className="border border-stone px-3 py-1.5 hover:border-ink">
                  {s}
                </button>
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="mt-8 text-muted">{fmt(t.search.noResults, { q })}</p>
          ) : (
            <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {results.map(({ product }) => (
                <li key={product.slug}>
                  <Link
                    href={localePath(locale, `/products/${product.slug}`)}
                    onClick={onClose}
                    className="group flex items-center gap-4 border-b border-stone/60 py-3"
                  >
                    <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-sand">
                      <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg group-hover:text-teal-deep">{tr(product.name, locale)}</p>
                      <p className="truncate text-xs text-muted">{tr(product.tagline, locale)}</p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums">
                      {productSoldOut(product) ? <span className="text-muted">{t.product.soldOut}</span> : formatMoney(minPrice(product), locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
