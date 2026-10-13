import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getAllProducts } from "@/lib/catalog";
import { db } from "@/lib/db";
import { ReviewForm } from "./ReviewForm";

export const metadata: Metadata = { robots: { index: false } };

export default async function ReviewPage({ params, searchParams }: PageProps<"/[locale]/review">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { order: orderId, token } = await searchParams;

  const order =
    typeof orderId === "string" ? await db.order.findUnique({ where: { id: orderId }, include: { items: true, reviews: true } }) : null;
  const valid = order && typeof token === "string" && order.reviewToken === token;

  const message = (text: string) => (
    <section className="container-luxe py-28 text-center">
      <p className="font-display text-3xl md:text-4xl">{text}</p>
      <Link href={localePath(locale, "/shop")} className="btn btn-primary mt-10">
        {t.complete.continue}
      </Link>
    </section>
  );
  if (!valid) return message(t.review.invalidLink);
  if (order.status !== "DELIVERED") return message(t.review.notYet);

  const catalog = await getAllProducts();
  const reviewed = new Set(order.reviews.map((r) => r.productSlug));
  const slugs = [...new Set(order.items.map((i) => i.productSlug))].filter((s) => !reviewed.has(s));
  if (slugs.length === 0) return message(t.review.nothingLeft);
  const items = slugs.map((slug) => {
    const product = catalog.find((p) => p.slug === slug);
    const line = order.items.find((i) => i.productSlug === slug)!;
    return {
      slug,
      name: product ? tr(product.name, locale) : locale === "ar" ? line.nameAr : line.name,
      image: product?.images[0] ?? "/images/editorial/spice-baskets.jpg",
    };
  });

  return (
    <section className="motif">
      <div className="container-luxe max-w-3xl py-16 md:py-24">
        <p className="eyebrow">{t.review.eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl font-light leading-[1.05] md:text-6xl">{t.review.title}</h1>
        <p className="mt-5 max-w-xl text-ink-soft">{t.review.body}</p>
        <div className="mt-12">
          <ReviewForm orderId={order.id} token={order.reviewToken} items={items} defaultName={`${order.firstName} ${order.lastName.charAt(0)}.`} />
        </div>
      </div>
    </section>
  );
}
