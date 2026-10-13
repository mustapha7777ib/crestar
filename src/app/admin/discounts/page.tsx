import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { deleteDiscountAction, toggleDiscountAction } from "./actions";
import { NewDiscountForm } from "./NewDiscountForm";

const day = (d: Date | null) => (d ? d.toLocaleDateString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium" }) : "—");

export default async function DiscountsPage() {
  await connection();
  const codes = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-serif text-4xl">Discount codes</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Codes take money off the products, not delivery. One code per order.</p>
      <NewDiscountForm />

      {codes.length === 0 ? (
        <p className="py-14 text-center text-muted">No codes yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-stone bg-paper">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-stone text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Takes off</th>
                <th className="px-4 py-3 font-medium">Minimum</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/70">
              {codes.map((c) => {
                const expired = c.endsAt !== null && c.endsAt < now;
                const usedUp = c.maxUses !== null && c.uses >= c.maxUses;
                const live = c.active && !expired && !usedUp && !(c.startsAt && c.startsAt > now);
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold">{c.code}</p>
                      {c.note && <p className="text-xs text-muted">{c.note}</p>}
                    </td>
                    <td className="px-4 py-3">{c.kind === "PERCENT" ? `${c.value}%` : formatMoney(c.value, "en")}</td>
                    <td className="px-4 py-3">{c.minSubtotal ? formatMoney(c.minSubtotal, "en") : "—"}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {c.uses}
                      {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {day(c.startsAt)} → {day(c.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${live ? "bg-green text-paper" : "bg-stone/60 text-muted"}`}>
                        {live ? "Live" : !c.active ? "Off" : expired ? "Expired" : usedUp ? "Used up" : "Scheduled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <form action={toggleDiscountAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="text-xs underline">{c.active ? "Switch off" : "Switch on"}</button>
                        </form>
                        {c.uses === 0 && (
                          <form action={deleteDiscountAction}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className="text-xs text-danger underline">Delete</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
