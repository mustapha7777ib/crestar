"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

/** Swaps the locale segment of the current URL, keeping the path and query. */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams();
  const target: Locale = locale === "en" ? "ar" : "en";
  const rest = pathname.split("/").slice(2).join("/");
  const query = search.toString();
  const href = `/${target}${rest ? `/${rest}` : ""}${query ? `?${query}` : ""}`;

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={t.nav.switchLanguageLabel}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={`text-sm transition-colors hover:text-teal-deep ${target === "ar" ? "font-[family-name:var(--font-plex-arabic)]" : ""} ${className}`}
    >
      {t.nav.switchLanguage}
    </Link>
  );
}
