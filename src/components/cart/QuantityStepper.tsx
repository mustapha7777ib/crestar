"use client";

import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { useI18n } from "@/i18n/provider";
import { MinusIcon, PlusIcon } from "../ui/icons";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QTY_PER_LINE,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const h = size === "sm" ? "h-9" : "h-[3.25rem]";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div className={`inline-flex items-center border border-stone ${h}`} role="group" aria-label={t.product.quantity}>
      <button
        type="button"
        className={`grid ${w} h-full place-items-center transition-colors hover:bg-sand disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t.product.decrease}
      >
        <MinusIcon size={14} />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`grid ${w} h-full place-items-center transition-colors hover:bg-sand disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t.product.increase}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
