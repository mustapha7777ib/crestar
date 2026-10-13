import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/product/SortSelect";
import { categories, getCategory, isCategoryId } from "@/data/categories";
import { getCatalog } from "@/lib/catalog";
import { minPrice, productSoldOut, type Product } from "@/lib/catalog-types";
import { isLocale, localePath, tr, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { formatNumber } from "@/lib/money";
import { sortKeys, type SortKey } from "@/lib/sort";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { category } = await searchParams;
  const t = getDictionary(locale);
  if (typeof category === "string" && isCategoryId(category)) {
    const c = getCategory(category);
    return { title: tr(c.name, locale), description: tr(c.blurb, locale) };
  }
  return { title: t.shop.title, description: t.shop.subtitle };
}

function sortProducts(list: Product[], sort: SortKey, locale: Locale): Product[] {
  const copy = [...list];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => minPrice(a) - minPrice(b));
    case "priceDesc":
      return copy.sort((a, b) => minPrice(b) - minPrice(a));
    case "name":
      return copy.sort((a, b) => tr(a.name, locale).localeCompare(tr(b.name, locale), locale));
    default:
      // Featured pieces first, then catalogue order; sold-out pieces last.
      return copy.sort(
        (a, b) => Number(productSoldOut(a)) - Number(productSoldOut(b)) || (a.featured ?? 99) - (b.featured ?? 99),
      );
  }
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const query = await searchParams;

  const category = typeof query.category === "string" && isCategoryId(query.category) ? getCategory(query.category) : null;
  const sort: SortKey = sortKeys.find((k) => k === query.sort) ?? "featured";
  const products = await getCatalog();
  const list = sortProducts(category ? products.filter((p) => p.category === category.id) : products, sort, locale);

  const tab = (active: boolean) =>
    `whitespace-nowrap border-b pb-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors rtl:text-sm ${
      active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
    }`;
  const sortQuery = sort === "featured" ? "" : `sort=${sort}`;
  const hrefFor = (id?: string) => {
    const q = [id ? `category=${id}` : "", sortQuery].filter(Boolean).join("&");
    return localePath(locale, `/shop${q ? `?${q}` : ""}`);
  };

  return (
    <>
      <section className="motif border-b border-stone/70">
        <div className="container-luxe py-16 text-center md:py-24">
          <p className="eyebrow">{t.shop.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-light md:text-7xl">{category ? tr(category.name, locale) : t.shop.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-ink-soft">{category ? tr(category.blurb, locale) : t.shop.subtitle}</p>
        </div>
      </section>

      <section className="container-luxe py-10 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <nav className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:px-0" aria-label={t.shop.eyebrow}>
            <Link href={hrefFor()} className={tab(!category)} aria-current={!category ? "page" : undefined}>
              {t.shop.all}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={hrefFor(c.id)}
                className={tab(category?.id === c.id)}
                aria-current={category?.id === c.id ? "page" : undefined}
              >
                {tr(c.name, locale)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-8">
            <p className="text-xs text-muted">{fmt(t.shop.count, { count: formatNumber(list.length, locale) })}</p>
            <Suspense fallback={null}>
              <SortSelect value={sort} />
            </Suspense>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-24 text-center text-muted">{t.shop.empty}</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-7 xl:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.slug} product={p} locale={locale} t={t} priority={i < 4} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
