import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MailIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { isLocale, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/help">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).help.title } : {};
}

export default async function HelpPage({ params }: PageProps<"/[locale]/help">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const amount = formatMoney(FREE_DELIVERY_THRESHOLD, locale);

  return (
    <>
      <section className="motif border-b border-stone/70">
        <div className="container-luxe py-16 text-center md:py-24">
          <p className="eyebrow">{t.help.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-light md:text-6xl">{t.help.title}</h1>
        </div>
      </section>

      <section className="container-luxe grid gap-14 py-16 md:py-24 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <nav className="hidden lg:block" aria-label={t.help.title}>
          <ul className="sticky top-28 space-y-3 border-s border-stone ps-5 text-sm">
            {t.help.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted hover:text-ink">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-2xl space-y-14">
          {t.help.sections.map((s, i) => (
            <article key={s.id} id={s.id} className="scroll-mt-28">
              <p className="font-display text-xl text-teal-deep">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">{s.title}</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{fmt(s.body, { amount })}</p>
            </article>
          ))}

          <div className="border border-stone bg-paper p-8">
            <h2 className="font-display text-3xl">{t.help.contactTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.help.contactBody}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-teal-deep">
                  <MailIcon size={18} className="text-teal-deep" />
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.whatsappHref} className="flex items-center gap-3 hover:text-teal-deep">
                  <WhatsAppIcon size={18} className="text-teal-deep" />
                  <span dir="ltr">{site.phoneDisplay}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <PinIcon size={18} className="text-teal-deep" />
                {tr(site.address, locale)}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
