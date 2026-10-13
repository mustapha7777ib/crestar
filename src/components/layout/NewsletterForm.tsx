"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { ArrowIcon, CheckIcon } from "../ui/icons";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { locale, t } = useI18n();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  const dark = tone === "dark";
  if (state === "done") {
    return (
      <p className={`flex items-center gap-3 text-sm ${dark ? "text-paper/85" : "text-ink-soft"}`}>
        <CheckIcon size={18} className="text-gold" />
        {t.home.newsletterThanks}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={`flex border-b ${dark ? "border-paper/40 focus-within:border-paper" : "border-ink/40 focus-within:border-ink"}`}>
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          {t.home.newsletterPlaceholder}
        </label>
        <input
          id={`newsletter-${tone}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.home.newsletterPlaceholder}
          className={`h-12 min-w-0 flex-1 bg-transparent text-sm outline-none ${dark ? "placeholder:text-paper/50" : "placeholder:text-muted"}`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="flex items-center gap-2 ps-4 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-70 disabled:opacity-50 rtl:text-sm"
        >
          {t.home.newsletterCta}
          <ArrowIcon size={14} />
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-gold">{t.checkout.errors.generic}</p>}
    </form>
  );
}
