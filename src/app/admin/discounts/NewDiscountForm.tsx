"use client";

import { useActionState, useState } from "react";
import { createDiscountAction, type DiscountFormState } from "./actions";

const input = "w-full border border-stone bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none";
const label = "mb-1 block text-xs font-medium text-ink-soft";

export function NewDiscountForm() {
  const [state, action, pending] = useActionState<DiscountFormState, FormData>(createDiscountAction, undefined);
  const [kind, setKind] = useState<"PERCENT" | "FIXED">("PERCENT");
  return (
    <form action={action} className="grid gap-4 border border-stone bg-paper p-6 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <span className={label}>Code customers type</span>
        <input name="code" required placeholder="WELCOME10" className={`${input} uppercase`} />
      </div>
      <div>
        <span className={label}>Type</span>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as "PERCENT" | "FIXED")} className={input}>
          <option value="PERCENT">Percentage off</option>
          <option value="FIXED">Amount off (QAR)</option>
        </select>
      </div>
      <div>
        <span className={label}>{kind === "PERCENT" ? "Percent off" : "QAR off"}</span>
        <input name="value" required inputMode="decimal" placeholder={kind === "PERCENT" ? "10" : "20"} className={input} />
      </div>
      <div>
        <span className={label}>Minimum order (QAR)</span>
        <input name="minSubtotal" inputMode="decimal" placeholder="0" className={input} />
      </div>
      <div>
        <span className={label}>Maximum uses (empty = unlimited)</span>
        <input name="maxUses" inputMode="numeric" className={input} />
      </div>
      <div>
        <span className={label}>Starts (optional)</span>
        <input name="startsAt" type="date" className={input} />
      </div>
      <div>
        <span className={label}>Ends (optional)</span>
        <input name="endsAt" type="date" className={input} />
      </div>
      <div className="sm:col-span-3">
        <span className={label}>Note for yourself (optional)</span>
        <input name="note" placeholder="e.g. National Day 2026, Instagram followers" className={input} />
      </div>
      <div className="flex items-end">
        <button disabled={pending} className="w-full bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          {pending ? "Creating…" : "Create code"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-danger sm:col-span-4">{state.error}</p>}
      {state?.saved && <p className="text-sm text-green sm:col-span-4">{state.saved} is live. Customers can use it at checkout now.</p>}
    </form>
  );
}
