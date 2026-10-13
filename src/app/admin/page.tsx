import Link from "next/link";
import { connection } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { findCity } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { orderLinks } from "@/lib/notify/templates";
import { site } from "@/lib/site";
import { cancelAction, deliveredAction, outForDeliveryAction, recheckPaymentAction } from "./actions";

const TABS: { status?: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "To prepare" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "PENDING", label: "Awaiting card payment" },
  { status: "FAILED", label: "Payment failed" },
  { status: "CANCELLED", label: "Cancelled" },
  { label: "All" },
];

const BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-gold/40 text-ink",
  FAILED: "bg-stone/60 text-muted",
  PLACED: "bg-teal-deep text-paper",
  OUT_FOR_DELIVERY: "bg-plum text-paper",
  DELIVERED: "bg-green text-paper",
  CANCELLED: "bg-stone/60 text-muted line-through",
};

const LABEL: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  FAILED: "Payment failed",
  PLACED: "To prepare",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const button = "whitespace-nowrap border px-3 py-1.5 text-xs font-semibold";

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  const { status: raw } = await searchParams;
  const all = raw === "all";
  const status = all ? undefined : (TABS.find((t) => t.status === raw)?.status ?? "PLACED");

  const [orders, counts, revenue] = await Promise.all([
    db.order.findMany({
      where: status ? { status } : undefined,
      include: { items: true },
      orderBy: { createdAt: status === "PLACED" ? "asc" : "desc" }, // oldest first when preparing
      take: 200,
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({
      where: { status: { in: ["PLACED", "OUT_FOR_DELIVERY", "DELIVERED"] }, paymentProvider: { not: "demo" } },
      _sum: { total: true },
    }),
  ]);
  const count = (s: OrderStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-stone pb-6">
        <h1 className="font-serif text-4xl">Orders</h1>
        <dl className="flex flex-wrap gap-8 text-sm">
          <div>
            <dt className="text-muted">To prepare</dt>
            <dd className="text-2xl font-semibold">{count("PLACED")}</dd>
          </div>
          <div>
            <dt className="text-muted">Out for delivery</dt>
            <dd className="text-2xl font-semibold">{count("OUT_FOR_DELIVERY")}</dd>
          </div>
          <div>
            <dt className="text-muted">Delivered</dt>
            <dd className="text-2xl font-semibold">{count("DELIVERED")}</dd>
          </div>
          <div>
            <dt className="text-muted">Sales (excl. demo)</dt>
            <dd className="text-2xl font-semibold">{formatMoney(revenue._sum.total ?? 0, "en")}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active = t.status ? t.status === status : all;
            return (
              <Link
                key={t.label}
                href={t.status ? `/admin?status=${t.status}` : "/admin?status=all"}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
              >
                {t.label}
                {t.status && count(t.status) > 0 ? ` (${count(t.status)})` : ""}
              </Link>
            );
          })}
        </nav>
        {count("PLACED") > 0 && (
          <Link href="/admin/slips" className={`${button} border-ink hover:bg-ink hover:text-paper`}>
            Print slips for all orders to prepare
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="py-20 text-center text-muted">No orders here.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[66rem] text-left text-sm">
            <thead className="border-b border-stone text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Deliver to</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/70 align-top">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{o.number}</p>
                    <p className="text-xs text-muted">
                      {o.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    {o.paymentProvider === "demo" && <p className="mt-1 text-xs font-semibold text-danger">DEMO — do not deliver</p>}
                    {o.stockShort && <p className="mt-1 text-xs font-semibold text-danger">Stock ran out — check items</p>}
                  </td>
                  <td className="px-4 py-4">
                    <p>
                      {o.firstName} {o.lastName}
                    </p>
                    <a href={`tel:+974${o.phone}`} className="text-xs text-muted hover:text-ink">
                      +974 {o.phone}
                    </a>
                    <p className="text-xs text-muted">{o.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>
                      {findCity(o.city)?.name.en ?? o.city} · <span className="uppercase">{o.deliveryMethod === "express" ? "same-day" : "standard"}</span>
                    </p>
                    <p className="text-xs text-muted">
                      Zone {o.zone}, Street {o.street}, Building {o.building}
                      {o.unit ? `, ${o.unit}` : ""}
                    </p>
                    {o.notes && <p className="mt-1 text-xs italic text-muted">“{o.notes}”</p>}
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-0.5">
                      {o.items.map((i) => (
                        <li key={i.id}>
                          {i.quantity} × {i.name} <span className="text-muted">({i.variantLabel})</span>
                        </li>
                      ))}
                    </ul>
                    {o.weight > 0 && <p className="mt-1 text-xs text-muted">{(o.weight / 1000).toFixed(1)} kg</p>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="tabular-nums">{formatMoney(o.total, "en")}</p>
                    {o.discount > 0 && (
                      <p className="text-xs text-muted">
                        −{formatMoney(o.discount, "en")} {o.discountCode}
                      </p>
                    )}
                    <p className={`mt-1 text-xs font-semibold ${o.paymentMethod === "COD" && !o.paidAt ? "text-danger" : "text-muted"}`}>
                      {o.paymentMethod === "COD" ? (o.paidAt ? "Cash collected" : "Collect cash") : o.paidAt ? "Paid by card" : "Card"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${BADGE[o.status]}`}>
                      {LABEL[o.status]}
                    </span>
                    {o.paymentStatus && <p className="mt-1 text-[0.65rem] text-muted">{o.paymentStatus}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-end gap-2">
                      {o.status === "PLACED" && (
                        <form action={outForDeliveryAction}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <button className={`${button} border-plum text-plum hover:bg-plum hover:text-paper`}>Out for delivery</button>
                        </form>
                      )}
                      {(o.status === "PLACED" || o.status === "OUT_FOR_DELIVERY") && (
                        <form action={deliveredAction}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <button className={`${button} border-ink hover:bg-ink hover:text-paper`}>
                            {o.paymentMethod === "COD" ? "Delivered & cash collected" : "Delivered"}
                          </button>
                        </form>
                      )}
                      {(o.status === "PLACED" || o.status === "OUT_FOR_DELIVERY") && (
                        <>
                          <Link href={`/admin/slips?order=${o.id}`} className="text-xs text-muted underline hover:text-ink">
                            Print slip
                          </Link>
                          <form action={cancelAction}>
                            <input type="hidden" name="orderId" value={o.id} />
                            <button className="text-xs text-danger underline">Cancel order</button>
                          </form>
                        </>
                      )}
                      {o.status === "DELIVERED" && (
                        <a
                          href={`https://wa.me/974${o.phone}?text=${encodeURIComponent(
                            o.locale === "ar"
                              ? `مرحبًا ${o.firstName}، شكرًا لطلبك ${o.number} من ${site.nameAr}. يسعدنا تقييمك لمشترياتك: ${orderLinks(o).review}`
                              : `Hi ${o.firstName}, thank you for your ${site.name} order ${o.number}. We'd love your review: ${orderLinks(o).review}`,
                          )}`}
                          target="_blank"
                          className={`${button} border-[#1f7a4d] text-[#1f7a4d] hover:bg-[#1f7a4d] hover:text-paper`}
                        >
                          Send review link (WhatsApp)
                        </a>
                      )}
                      {(o.status === "PLACED" || o.status === "OUT_FOR_DELIVERY") && (
                        <a
                          href={`https://wa.me/974${o.phone}?text=${encodeURIComponent(
                            o.locale === "ar"
                              ? `مرحبًا ${o.firstName}، معك ${site.nameAr} بخصوص طلبك ${o.number}. يمكنك متابعته هنا: ${orderLinks(o).track}`
                              : `Hi ${o.firstName}, this is ${site.name} about your order ${o.number}. Track it here: ${orderLinks(o).track}`,
                          )}`}
                          target="_blank"
                          className="text-xs text-[#1f7a4d] underline"
                        >
                          WhatsApp customer
                        </a>
                      )}
                      {(o.status === "PENDING" || (o.status === "FAILED" && o.chargeId)) && (
                        <form action={recheckPaymentAction}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <button className={`${button} border-stone hover:border-ink`}>Re-check payment</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        Each status change emails the customer. Cancelling puts the items back in stock; refund card payments from the SkipCash merchant portal.
      </p>
    </div>
  );
}
