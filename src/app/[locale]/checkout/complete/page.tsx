import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/ui/icons";
import { isLocale, localePath, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { getAllProducts } from "@/lib/catalog";
import { db } from "@/lib/db";
import { findCity } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { syncPaymentStatus } from "@/lib/orders";
import { ClearCart } from "./ClearCart";

// The page customers return to after paying, and the "View your order" link in
// every email: it shows where the order stands.

export const metadata: Metadata = { robots: { index: false } };

type State = "pending" | "failed" | "placed" | "out" | "delivered" | "cancelled";

export default async function OrderPage({ params, searchParams }: PageProps<"/[locale]/checkout/complete">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { order: orderId } = await searchParams;

  const found = typeof orderId === "string" ? await db.order.findUnique({ where: { id: orderId } }) : null;
  if (!found) {
    return (
      <section className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl">{t.complete.notFoundTitle}</h1>
        <Link href={localePath(locale, "/shop")} className="btn btn-primary mt-10">
          {t.complete.continue}
        </Link>
      </section>
    );
  }

  // The customer may land here before the payment webhook: ask the provider directly.
  let order = found;
  try {
    order = await syncPaymentStatus(found);
  } catch (error) {
    console.error(`[order page] status check failed for ${found.number}`, error);
  }
  const [items, catalog] = await Promise.all([db.orderItem.findMany({ where: { orderId: order.id } }), getAllProducts()]);

  const state: State = (
    { PENDING: "pending", FAILED: "failed", PLACED: "placed", OUT_FOR_DELIVERY: "out", DELIVERED: "delivered", CANCELLED: "cancelled" } as const
  )[order.status];
  const c = t.complete;
  const vars = { name: order.firstName, phone: `⁦+974 ${order.phone}⁩`, amount: formatMoney(order.total, locale) };
  const cod = order.paymentMethod === "COD";
  const copy = {
    pending: { eyebrow: c.pendingEyebrow, title: c.pendingTitle, body: c.pendingBody },
    failed: { eyebrow: c.failedEyebrow, title: c.failedTitle, body: c.failedBody },
    placed: {
      eyebrow: c.placedEyebrow,
      title: fmt(c.paidTitle, vars),
      body: fmt(cod ? c.codBody : c.paidBody, vars),
    },
    out: { eyebrow: c.outEyebrow, title: c.outTitle, body: fmt(c.outBody, vars) },
    delivered: { eyebrow: c.deliveredEyebrow, title: c.deliveredTitle, body: c.deliveredBody },
    cancelled: { eyebrow: c.cancelledEyebrow, title: c.cancelledTitle, body: c.cancelledBody },
  }[state];
  const city = findCity(order.city);
  const going = state === "placed" || state === "out" || state === "delivered";
  const stepIndex = { placed: 0, out: 1, delivered: 2 }[state as "placed" | "out" | "delivered"] ?? -1;
  const steps = [c.steps.placed, c.steps.out, c.steps.delivered];
  const payment = cod ? (order.paidAt ? c.codPaid : c.codDue) : order.paidAt ? c.paidCard : null;
  const reviewHref = localePath(locale, `/review?order=${order.id}&token=${order.reviewToken}`);

  return (
    <section className="motif">
      {going && <ClearCart orderId={order.id} />}
      <div className="container-luxe grid grid-cols-[minmax(0,1fr)] gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <span
            className={`grid h-14 w-14 place-items-center rounded-t-full ${
              going ? "bg-teal-deep text-paper" : state === "pending" ? "border border-gold-deep text-gold-deep" : "border border-danger text-danger"
            }`}
          >
            {going ? <CheckIcon size={24} /> : <span className="font-display text-2xl">{state === "pending" ? "…" : "×"}</span>}
          </span>
          <p className="eyebrow mt-8">{copy.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-light leading-[1.05] md:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-lg leading-relaxed text-ink-soft">{copy.body}</p>

          {going && (
            <ol className="mt-10 flex max-w-lg items-start" aria-label={c.orderNumber}>
              {steps.map((label, i) => (
                <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                  {i > 0 && (
                    <span
                      className={`absolute top-[0.6rem] h-px w-full -translate-x-1/2 rtl:translate-x-1/2 ${i <= stepIndex ? "bg-teal-deep" : "bg-stone"}`}
                      style={{ insetInlineStart: 0 }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 grid h-5 w-5 place-items-center rounded-full border ${
                      i <= stepIndex ? "border-teal-deep bg-teal-deep text-paper" : "border-stone bg-ivory"
                    }`}
                  >
                    {i <= stepIndex && <CheckIcon size={12} />}
                  </span>
                  <span className={`mt-2 text-xs ${i <= stepIndex ? "text-ink" : "text-muted"}`} aria-current={i === stepIndex ? "step" : undefined}>
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {state === "delivered" && (
              <Link href={reviewHref} className="btn btn-primary">
                {c.reviewCta}
              </Link>
            )}
            {state === "failed" && (
              <Link href={localePath(locale, "/cart")} className="btn btn-primary">
                {c.retry}
              </Link>
            )}
            {state === "pending" && (
              <Link href={localePath(locale, `/checkout/complete?order=${order.id}`)} className="btn btn-primary">
                {c.refresh}
              </Link>
            )}
            <Link href={localePath(locale, "/shop")} className={state === "placed" || state === "out" ? "btn btn-primary" : "btn btn-outline"}>
              {c.continue}
            </Link>
          </div>
        </div>

        <aside className="self-start border border-stone bg-paper">
          <div className="flex items-baseline justify-between border-b border-stone px-6 py-5">
            <span className="text-xs uppercase tracking-[0.2em] text-muted rtl:text-sm">{c.orderNumber}</span>
            <span className="font-display text-2xl" dir="ltr">
              {order.number}
            </span>
          </div>
          <ul className="divide-y divide-stone/60 px-6">
            {items.map((item) => {
              const product = catalog.find((p) => p.slug === item.productSlug);
              const size = locale === "ar" && item.variantLabelAr ? item.variantLabelAr : item.variantLabel;
              return (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  {product && (
                    <div className="relative aspect-[4/5] w-12 shrink-0 bg-sand">
                      <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg leading-tight">{locale === "ar" ? item.nameAr : item.name}</p>
                    <p className="text-xs text-muted">
                      {size} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{formatMoney(item.lineTotal, locale)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2 border-t border-stone px-6 py-5 text-sm">
            <div className="flex justify-between">
              <dt>{t.cart.subtotal}</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal, locale)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green">
                <dt>
                  {t.checkout.discount}
                  {order.discountCode ? ` · ${order.discountCode}` : ""}
                </dt>
                <dd className="tabular-nums">−{formatMoney(order.discount, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>{t.cart.delivery}</dt>
              <dd className="tabular-nums">{order.deliveryFee === 0 ? t.cart.free : formatMoney(order.deliveryFee, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone pt-3 font-medium">
              <dt>{t.cart.total}</dt>
              <dd className="tabular-nums">{formatMoney(order.total, locale)}</dd>
            </div>
            {payment && (
              <div className="flex justify-between pt-1 text-muted">
                <dt>{c.payment}</dt>
                <dd>{payment}</dd>
              </div>
            )}
          </dl>
          <div className="border-t border-stone px-6 py-5 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted rtl:text-sm">{c.deliverTo}</p>
            <p className="mt-2">
              {order.firstName} {order.lastName}
              <br />
              {t.checkout.zone} {order.zone} · {t.checkout.street} {order.street} · {t.checkout.building} {order.building}
              {order.unit ? ` · ${order.unit}` : ""}
              <br />
              {city ? tr(city.name, locale) : order.city}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
