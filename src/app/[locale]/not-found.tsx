"use client";

import Link from "next/link";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function NotFound() {
  const { locale, t } = useI18n();
  return (
    <section className="motif">
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-[7rem] leading-none text-teal/20 md:text-[10rem]">404</p>
        <h1 className="-mt-6 font-display text-4xl md:text-5xl">{t.notFound.title}</h1>
        <p className="mt-4 max-w-md text-muted">{t.notFound.body}</p>
        <Link href={localePath(locale)} className="btn btn-primary mt-10">
          {t.notFound.cta}
        </Link>
      </div>
    </section>
  );
}
