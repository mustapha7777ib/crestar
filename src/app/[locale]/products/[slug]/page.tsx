import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { HandIcon } from "@/components/ui/icons";
import { getCategory } from "@/data/categories";
import Image from "next/image";
import { Stars } from "@/components/product/Stars";
import { getCatalog, getProduct, relatedProducts } from "@/lib/catalog";
import { minPrice, productSoldOut, townOf } from "@/lib/catalog-types";
import { db } from "@/lib/db";
import { DOHA, kmToDoha, originLabel } from "@/data/towns";
import { isLocale, localePath, locales, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { CURRENCY, formatMoney, formatNumber, toMajorUnits } from "@/lib/money";

export async function generateStaticParams() {
  const products = await getCatalog();
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!isLocale(locale) || !product) return {};
  return {
    title: tr(product.name, locale),
    description: tr(product.tagline, locale),
    alternates: { languages: { en: `/en/products/${slug}`, ar: `/ar/products/${slug}` } },
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!isLocale(locale) || !product) notFound();
  const catalog = await getCatalog();
  const [related, reviews] = await Promise.all([
    relatedProducts(product),
    db.review.findMany({ where: { productSlug: slug, status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  const inside = (product.bundle ?? []).map((s) => catalog.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const t = getDictionary(locale);
  const category = getCategory(product.category);
  const town = townOf(product);
  const km = formatNumber(kmToDoha(town), locale);
  const index = catalog.indexOf(product) + 1;
  const name = tr(product.name, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: tr(product.story, locale),
    image: product.images,
    brand: { "@type": "Brand", name: t.brand.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: CURRENCY,
      lowPrice: toMajorUnits(minPrice(product)),
      highPrice: toMajorUnits(Math.max(...product.variants.map((v) => v.price))),
      availability: productSoldOut(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
    ...(product.rating
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count } }
      : {}),
  };

  const summary = "flex cursor-pointer list-none items-center justify-between py-5 text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm [&::-webkit-details-marker]:hidden";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-luxe pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={localePath(locale)} className="hover:text-ink">{t.nav.home}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={localePath(locale, `/shop?category=${category.id}`)} className="hover:text-ink">
                {tr(category.name, locale)}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-luxe grid gap-10 pb-20 pt-6 md:pt-10 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <div className="min-w-0 self-start lg:sticky lg:top-28">
          <ProductGallery images={product.images} alt={name} badge={product.badge && tr(product.badge, locale)} />
        </div>

        <div className="min-w-0">
          <p className="eyebrow">
            {fmt(t.product.number, { n: formatNumber(index, locale).padStart(2, "0") })} · {tr(category.name, locale)}
          </p>
          <h1 className="mt-4 font-display text-4xl font-light leading-[1.05] md:text-[3.4rem]">{name}</h1>
          <p className="mt-3 text-ink-soft">{tr(product.tagline, locale)}</p>
          {product.rating && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Stars value={product.rating.average} />
              <span>
                {fmt(t.product.outOfFive, { n: product.rating.average })} ·{" "}
                {product.rating.count === 1 ? t.product.reviewCountOne : fmt(t.product.reviewCount, { n: product.rating.count })}
              </span>
            </a>
          )}

          {/* Journey: maker's town to Doha */}
          <div className="mt-8 flex items-center gap-4 border-y border-stone py-4">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted rtl:text-xs">{t.product.origin}</p>
              <p className="mt-1 font-display text-xl">{tr(originLabel(town), locale)}</p>
            </div>
            <div className="relative mx-2 h-px flex-1 bg-[linear-gradient(to_right,var(--color-stone)_50%,transparent_50%)] bg-[length:8px_1px]">
              <span className="absolute -top-[3px] end-0 h-[7px] w-[7px] rotate-45 bg-teal" />
            </div>
            <div className="text-end">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-teal-deep rtl:text-xs">
                {fmt(t.home.routesDistance, { km })}
              </p>
              <p className="mt-1 font-display text-xl">{tr(DOHA.name, locale)}</p>
            </div>
          </div>

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          {product.handmade && (
            <p className="mt-6 flex items-center gap-3 bg-sand/60 px-4 py-3 text-sm text-ink-soft">
              <HandIcon size={18} className="shrink-0 text-teal-deep" />
              {t.product.madeBy} · {tr(town.name, locale)}
            </p>
          )}

          <div className="mt-10 divide-y divide-stone border-y border-stone">
            {inside.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm">{t.product.inside}</p>
                <ul className="mt-4 divide-y divide-stone/70 border-y border-stone/70">
                  {inside.map((item) => (
                    <li key={item.slug}>
                      <Link href={localePath(locale, `/products/${item.slug}`)} className="group flex items-center gap-4 py-3">
                        <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-sand">
                          <Image src={item.images[0]} alt="" fill sizes="48px" className="object-cover" />
                        </div>
                        <span className="font-display text-lg group-hover:text-teal-deep">{tr(item.name, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <details open className="group">
              <summary className={summary}>
                {t.product.description}
                <span className="text-lg font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 leading-relaxed text-ink-soft">{tr(product.story, locale)}</p>
            </details>
            <details className="group">
              <summary className={summary}>
                {t.product.details}
                <span className="text-lg font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <dl className="grid gap-4 pb-6 text-sm sm:grid-cols-[9rem_1fr]">
                {product.details.map((d) => (
                  <div key={d.label.en} className="contents">
                    <dt className="text-muted">{tr(d.label, locale)}</dt>
                    <dd className="-mt-3 sm:mt-0">{tr(d.value, locale)}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="group">
              <summary className={summary}>
                {t.product.delivery}
                <span className="text-lg font-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 text-sm leading-relaxed text-ink-soft">
                {fmt(t.product.deliveryBody, { amount: formatMoney(FREE_DELIVERY_THRESHOLD, locale) })}
              </p>
            </details>
          </div>
        </div>
      </section>

      <section id="reviews" className="container-luxe scroll-mt-28 border-t border-stone/70 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-light">{t.product.reviews}</h2>
          {product.rating && (
            <p className="flex items-center gap-3 text-sm text-muted">
              <Stars value={product.rating.average} size={16} />
              {fmt(t.product.outOfFive, { n: product.rating.average })} ·{" "}
              {product.rating.count === 1 ? t.product.reviewCountOne : fmt(t.product.reviewCount, { n: product.rating.count })}
            </p>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="mt-6 max-w-xl text-muted">{t.product.noReviews}</p>
        ) : (
          <ul className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="border-t border-stone pt-6">
                <div className="flex items-center justify-between gap-4">
                  <Stars value={r.rating} />
                  <span className="text-xs text-muted">
                    {r.createdAt.toLocaleDateString(locale === "ar" ? "ar-QA-u-nu-latn" : "en-GB", { dateStyle: "medium", timeZone: "Asia/Qatar" })}
                  </span>
                </div>
                <p className="mt-4 leading-relaxed text-ink-soft" dir="auto">
                  {r.body}
                </p>
                {r.photo && (
                  <div className="relative mt-4 aspect-square w-32 overflow-hidden bg-sand">
                    <Image src={r.photo} alt="" fill sizes="128px" className="object-cover" />
                  </div>
                )}
                <p className="mt-4 text-sm">
                  <span className="font-medium" dir="auto">{r.name}</span>
                  <span className="text-muted"> · {t.product.verified}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="woven-band opacity-90" aria-hidden="true" />
      <section className="bg-paper">
        <div className="container-luxe py-20 md:py-24">
          <h2 className="font-display text-4xl font-light">{t.product.related}</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-7">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} t={t} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
