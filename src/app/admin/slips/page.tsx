import { connection } from "next/server";
import { db } from "@/lib/db";
import { findCity } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { PrintButton } from "./PrintButton";

// Delivery slips for the driver: one per page when printed.
// /admin/slips → every order to prepare; /admin/slips?order=<id> → one order.

export default async function SlipsPage({ searchParams }: PageProps<"/admin/slips">) {
  await connection();
  const { order } = await searchParams;
  const orders = await db.order.findMany({
    where: typeof order === "string" ? { id: order } : { status: "PLACED" },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-muted">
          {orders.length} slip{orders.length === 1 ? "" : "s"}
        </p>
        <PrintButton />
      </div>
      {orders.length === 0 && <p className="text-muted">No orders to prepare.</p>}
      {orders.map((o) => {
        const cod = o.paymentMethod === "COD" && !o.paidAt;
        return (
          <article key={o.id} className="mb-8 break-after-page border border-ink bg-white p-8 text-ink print:mb-0 print:border-0">
            <header className="flex items-start justify-between border-b-2 border-ink pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em]">Crestar Trading · Delivery slip</p>
                <p className="mt-1 text-3xl font-bold">{o.number}</p>
                <p className="text-sm">
                  {o.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium", timeStyle: "short" })} ·{" "}
                  {o.deliveryMethod === "express" ? "SAME-DAY" : "Standard"}
                </p>
              </div>
              <div className={`px-4 py-3 text-right ${cod ? "bg-ink text-white" : "border-2 border-ink"}`}>
                <p className="text-xs uppercase tracking-[0.2em]">{cod ? "Collect cash" : "Paid"}</p>
                <p className="text-2xl font-bold">{cod ? formatMoney(o.total, "en") : "QAR 0 to collect"}</p>
              </div>
            </header>

            <section className="grid gap-6 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Customer</p>
                <p className="mt-1 text-xl font-semibold">
                  {o.firstName} {o.lastName}
                </p>
                <p className="text-xl">+974 {o.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Address · {findCity(o.city)?.name.en ?? o.city}</p>
                <div className="mt-2 flex gap-2 text-center">
                  {[
                    ["Zone", o.zone],
                    ["Street", o.street],
                    ["Building", o.building],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-16 bg-[#1f4f8f] px-3 py-2 text-white">
                      <p className="text-2xl font-bold">{v}</p>
                      <p className="text-[0.65rem] uppercase tracking-[0.15em]">{k}</p>
                    </div>
                  ))}
                </div>
                {o.unit && <p className="mt-2">Unit / flat: {o.unit}</p>}
              </div>
            </section>

            {o.notes && <p className="mb-6 border-l-4 border-ink bg-sand px-4 py-3 italic">Note: {o.notes}</p>}

            <table className="w-full text-left">
              <thead className="border-b border-ink text-xs uppercase tracking-[0.15em]">
                <tr>
                  <th className="w-10 py-2">✓</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Item</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.id} className="border-b border-stone">
                    <td className="py-3">
                      <span className="inline-block h-5 w-5 border-2 border-ink" />
                    </td>
                    <td className="py-3 text-lg font-bold">{i.quantity}×</td>
                    <td className="py-3">
                      {i.name} <span className="text-muted">({i.variantLabel})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-muted">
              {(o.weight / 1000).toFixed(1)} kg · Total {formatMoney(o.total, "en")}
            </p>
          </article>
        );
      })}
    </div>
  );
}
