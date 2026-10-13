import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, MailIcon, WhatsAppIcon } from "@/components/ui/icons";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.about.eyebrow, description: t.about.intro };
}

// Each chapter is titled in both scripts: the company works in both languages.
// The pottery and carved wood are Crestar's own product photos.
const chapters = [
  { pair: ["Mission", "رسالتنا"], image: "/images/crestar/clay-pots.jpg" },
  { pair: ["Vision", "رؤيتنا"], image: "/images/editorial/doha.jpg" },
  { pair: ["Values", "قيمنا"], image: "/images/crestar/carved-wood.jpg" },
];

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const a = t.about;

  return (
    <>
      <section className="container-luxe grid items-end gap-12 pb-20 pt-12 md:pt-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="eyebrow">{a.eyebrow}</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] md:text-6xl">{a.title}</h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">{a.intro}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-sand">
          <Image src="/images/editorial/artisan.jpg" alt="" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
        </div>
      </section>

      <div className="woven-band" aria-hidden="true" />

      {a.sections.map((section, i) => {
        const chapter = chapters[i];
        const [latin, arabic] = chapter.pair;
        return (
          <section key={section.title} className={i % 2 === 1 ? "bg-paper" : ""}>
            <div className="container-luxe grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1" aria-hidden="true">
                  <span className="font-display text-5xl md:text-6xl" lang="en">{latin}</span>
                  <span className="h-px w-8 self-center bg-teal" />
                  <span className="font-display text-4xl text-teal-deep md:text-5xl" lang="ar">{arabic}</span>
                </p>
                <h2 className="sr-only">{section.title}</h2>
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">{section.body}</p>
              </div>
              <div className={`relative aspect-[5/4] overflow-hidden bg-sand ${i === 1 ? "rounded-t-full" : ""}`}>
                <Image src={chapter.image} alt="" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
              </div>
            </div>
          </section>
        );
      })}

      {/* ——— For business ——— */}
      <section className="border-t border-stone/70 bg-paper">
        <div className="container-luxe grid gap-12 py-20 md:py-28 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <p className="eyebrow">{a.servicesEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">{a.servicesTitle}</h2>
            <p className="mt-6 max-w-lg leading-relaxed text-ink-soft">{a.servicesBody}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={`mailto:${site.email}`} className="btn btn-primary">
                <MailIcon size={16} />
                {a.servicesCta}
              </a>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <WhatsAppIcon size={16} />
                WhatsApp
              </a>
            </div>
            <div className="relative mt-12 hidden aspect-[4/5] max-w-xs overflow-hidden rounded-t-full bg-sand lg:block">
              <Image src="/images/crestar/terracotta-planters.jpg" alt="" fill sizes="20rem" className="object-cover" />
            </div>
          </div>
          <ol className="grid gap-px self-start border border-stone bg-stone sm:grid-cols-2">
            {a.services.map((service, i) => (
              <li key={service.title} className="bg-paper p-7">
                <span className="font-display text-xl text-teal-deep">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-xl leading-snug">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Partners ——— */}
      <section className="motif border-t border-stone/70">
        <div className="container-luxe py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">{a.partnersEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">{a.partnersTitle}</h2>
            <p className="mt-6 leading-relaxed text-ink-soft">{a.partnersBody}</p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {a.partners.map((partner) => (
              <li key={partner.name} className="border-t-2 border-teal bg-paper p-6">
                <h3 className="font-display text-lg">
                  <bdi>{partner.name}</bdi>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{partner.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {a.partnersInvite}{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-teal-deep underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </div>
      </section>

      <section className="lattice bg-plum text-paper">
        <div className="serration text-ivory" aria-hidden="true" />
        <div className="container-luxe flex flex-col items-center py-20 text-center md:py-24">
          <p className="font-display text-4xl md:text-5xl">{t.brand.tagline}</p>
          <Link href={localePath(locale, "/shop")} className="btn btn-light mt-10">
            {a.cta}
            <ArrowIcon size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
