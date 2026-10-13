"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { sortKeys, type SortKey } from "@/lib/sort";

export function SortSelect({ value }: { value: SortKey }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted rtl:text-sm">
      {t.shop.sortLabel}
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          const qs = next.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="cursor-pointer border-b border-stone bg-transparent py-1.5 pe-6 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink"
      >
        {sortKeys.map((key) => (
          <option key={key} value={key}>
            {t.shop.sort[key]}
          </option>
        ))}
      </select>
    </label>
  );
}
