import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LockIcon } from "@/components/ui/icons";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { demoPaymentsEnabled } from "@/lib/payments";
import { completeDemoPayment } from "./actions";

export const metadata: Metadata = { robots: { index: false } };

export default async function DemoGatewayPage({ params, searchParams }: PageProps<"/[locale]/checkout/demo-gateway">) {
  const { locale } = await params;
  const { order: orderId } = await searchParams;
  if (!isLocale(locale) || !demoPaymentsEnabled() || typeof orderId !== "string") notFound();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentProvider !== "demo" || order.status !== "PENDING") notFound();
  const t = getDictionary(locale);

  return (
    <section className="lattice bg-ink py-16 md:py-24">
      <div className="mx-auto w-full max-w-md px-5">
        <div className="bg-paper p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm">
              <LockIcon size={16} className="text-teal-deep" />
              {t.demo.title}
            </span>
            <span className="bg-gold/30 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink rtl:text-xs">
              {t.demo.badge}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.demo.body}</p>

          {/* A card that is obviously not real */}
          <div className="relative mt-8 aspect-[1.6] overflow-hidden rounded-xl bg-gradient-to-br from-teal-deep to-plum p-5 text-paper" dir="ltr">
            <div className="lattice absolute inset-0 opacity-70" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="font-display text-xl">{t.brand.name}</span>
              <span className="font-mono text-lg tracking-[0.2em]">4242 4242 4242 4242</span>
              <span className="flex justify-between text-xs uppercase tracking-[0.2em] text-paper/80">
                <span>Test card</span>
                <span>12/34</span>
              </span>
            </div>
          </div>

          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t.demo.merchant}</dt>
              <dd>{t.brand.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t.complete.orderNumber}</dt>
              <dd dir="ltr">{order.number}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-stone pt-3">
              <dt className="text-muted">{t.demo.amount}</dt>
              <dd className="font-display text-3xl">{formatMoney(order.total, locale)}</dd>
            </div>
          </dl>

          <form action={completeDemoPayment} className="mt-8 grid gap-3">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="locale" value={locale} />
            <button name="outcome" value="approve" className="btn btn-primary w-full">
              {t.demo.approve}
            </button>
            <button name="outcome" value="decline" className="btn btn-outline w-full">
              {t.demo.decline}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
