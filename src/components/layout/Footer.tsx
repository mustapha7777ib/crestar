import Link from "next/link";
import { categories } from "@/data/categories";
import { localePath, tr, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { site } from "@/lib/site";
import { InstagramIcon, MailIcon, PinIcon, WhatsAppIcon } from "../ui/icons";
import { LogoMark } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

// Card payments go through SkipCash; check these match the methods enabled on the account.
const PAYMENT_MARKS = ["SkipCash", "Visa", "Mastercard", "Apple Pay", "Google Pay"];

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const heading = "mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold rtl:text-sm";
  const link = "text-sm text-paper/75 transition-colors hover:text-paper";

  return (
    <footer className="mt-auto">
      <div className="woven-band" aria-hidden="true" />
      <div className="lattice bg-ink text-paper">
        <div className="container-luxe grid gap-14 py-16 md:py-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="max-w-md">
            <LogoMark className="h-10 w-10 text-gold" />
            <p className="mt-6 font-display text-3xl leading-tight md:text-4xl">{t.home.newsletterTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">{t.home.newsletterBody}</p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h2 className={heading}>{t.footer.shop}</h2>
              <ul className="space-y-3">
                <li>
                  <Link href={localePath(locale, "/shop")} className={link}>
                    {t.nav.shop}
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={localePath(locale, `/shop?category=${c.id}`)} className={link}>
                      {tr(c.name, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={heading}>{t.footer.house}</h2>
              <ul className="space-y-3">
                <li>
                  <Link href={localePath(locale, "/about")} className={link}>
                    {t.nav.story}
                  </Link>
                </li>
                {t.help.sections.map((s) => (
                  <li key={s.id}>
                    <Link href={localePath(locale, `/help#${s.id}`)} className={link}>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className={heading}>{t.footer.contact}</h2>
              <ul className="space-y-3 text-sm text-paper/75">
                <li className="flex gap-2.5">
                  <PinIcon size={16} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    {tr(site.address, locale)}
                    <br />
                    <span className="text-paper/50">{tr(site.hours, locale)}</span>
                  </span>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className={`${link} flex items-center gap-2.5`}>
                    <MailIcon size={16} className="text-gold" />
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={site.whatsappHref} className={`${link} flex items-center gap-2.5`} dir="ltr">
                    <WhatsAppIcon size={16} className="text-gold" />
                    {site.phoneDisplay}
                  </a>
                </li>
                {site.instagramHref && (
                  <li>
                    <a href={site.instagramHref} className={`${link} flex items-center gap-2.5`}>
                      <InstagramIcon size={16} className="text-gold" />
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-paper/10">
          <div className="container-luxe flex flex-col gap-5 py-7 text-xs text-paper/55 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}
              <span className="mx-2 text-paper/25">·</span>
              <a href="https://unsplash.com" className="hover:text-paper">{t.footer.photoCredit}</a>
              <span className="mx-2 text-paper/25">·</span>
              <span className="font-display text-sm text-paper/70" lang={locale === "ar" ? "en" : "ar"}>
                {locale === "ar" ? "Doha" : "الدوحة"}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-2 uppercase tracking-[0.2em] rtl:text-xs">{t.footer.payments}</span>
              {PAYMENT_MARKS.map((m) => (
                <span key={m} className="border border-paper/20 px-2 py-1 text-[0.65rem] font-semibold text-paper/75" dir="ltr">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
