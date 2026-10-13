import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteMap } from "@/components/home/RouteMap";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowIcon, HandIcon, LeafIcon, TruckIcon } from "@/components/ui/icons";
import { categories } from "@/data/categories";
import { featuredProducts, getProduct, productsIn } from "@/lib/catalog";
import { minPrice, productSoldOut } from "@/lib/catalog-types";
import { DOHA, kmToDoha, towns } from "@/data/towns";
import { isLocale, localePath, tr } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { formatMoney, formatNumber } from "@/lib/money";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const h = t.home;
  const [featured, crafts] = await Promise.all([featuredProducts(), productsIn("crafts")]);
  const zobo = (await getProduct("zobo-dried-hibiscus")) ?? featured[0];
  const bestsellers = featured.filter((p) => !productSoldOut(p)).slice(0, 4);
  const bronze = (await getProduct("ife-style-bronze-head")) ?? crafts[0];
  const craftPicks = ["kano-leather-pouf", "adire-eleko-indigo-cloth", "bida-glass-bead-strands", "terracotta-water-pot"]
    .map((slug) => crafts.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);
  const freeOver = formatMoney(FREE_DELIVERY_THRESHOLD, locale);
  const kanoKm = formatNumber(kmToDoha(towns.kano), locale);
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden">
        <div className="motif pointer-events-none absolute inset-y-0 end-0 hidden w-[42%] opacity-70 lg:block" />
        <div className="container-luxe relative grid items-center gap-12 pb-20 pt-10 md:pt-16 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-28">
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow animate-fade-up flex items-center gap-3" style={delay(50)}>
              <span className="h-px w-10 bg-teal" />
              {h.heroEyebrow}
            </p>
            <h1
              className="animate-fade-up mt-6 font-display text-[2.3rem] leading-[1.08] text-ink sm:text-[3.4rem] xl:text-[4.4rem]"
              style={delay(150)}
            >
              {h.heroTitle}
            </h1>
            <p className="animate-fade-up mt-7 max-w-lg text-[0.98rem] leading-relaxed text-ink-soft" style={delay(300)}>
              {h.heroBody}
            </p>
            <div className="animate-fade-up mt-10 flex flex-wrap gap-3" style={delay(420)}>
              <Link href={localePath(locale, "/shop?category=pantry")} className="btn btn-primary">
                {h.heroPrimary}
                <ArrowIcon size={16} />
              </Link>
              <Link href={localePath(locale, "/shop?category=crafts")} className="btn btn-outline">
                {h.heroSecondary}
              </Link>
            </div>
            <p
              className="animate-fade-up mt-12 flex items-center gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted rtl:text-xs"
              style={delay(560)}
            >
              <span>{h.routesFrom}</span>
              <span className="relative h-px w-16 bg-stone">
                <span className="absolute -top-[3px] end-0 h-[7px] w-[7px] rotate-45 bg-teal" />
              </span>
              <span>{h.routesTo}</span>
              <span className="text-teal-deep">{fmt(h.routesDistance, { km: kanoKm })}</span>
            </p>
          </div>

          {/* Arched frame, like the doorways of Souq Waqif */}
          <div className="relative mx-auto w-full max-w-[30rem] lg:me-0">
            <span
              aria-hidden="true"
              // Arabic is drawn solid and faint: an outline (text-stroke) traces the
              // overlapping contours where Arabic letters join and looks broken.
              className={`pointer-events-none absolute z-0 hidden select-none font-display leading-none lg:block ${
                locale === "en"
                  ? "top-6 -start-44 text-[10rem] text-teal/20 xl:-start-52 xl:text-[11rem]"
                  : "-top-16 -start-64 text-[6.5rem] text-transparent opacity-70 [-webkit-text-stroke:1px_var(--color-teal)]"
              }`}
              lang={locale === "en" ? "ar" : "en"}
            >
              {locale === "en" ? "كريستار" : "Crestar"}
            </span>
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full border border-teal/50 rtl:-translate-x-4" />
            <div className="animate-fade-up relative aspect-[4/5.4] overflow-hidden rounded-t-full bg-sand" style={delay(200)}>
              <Image
                src="/images/editorial/spice-baskets.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="object-cover"
              />
            </div>
            {/* This season card */}
            <Link
              href={localePath(locale, `/products/${zobo.slug}`)}
              className="animate-fade-up group absolute -bottom-8 start-[-1rem] flex w-64 items-center gap-4 bg-paper p-3 pe-5 shadow-[0_24px_60px_-24px_rgba(27,22,18,0.45)] sm:start-[-2.5rem]"
              style={delay(650)}
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden">
                <Image src={zobo.images[0]} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-[0.6rem]! rtl:text-xs!">{h.heroCardEyebrow}</p>
                <p className="mt-1 font-display text-lg leading-tight group-hover:text-teal-deep">{tr(zobo.name, locale)}</p>
                <p className="mt-1 text-xs text-muted">
                  {t.product.from} {formatMoney(minPrice(zobo), locale)}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Teal band with the flag's serrated edge ——— */}
      <section aria-label={h.promiseEyebrow}>
        <div className="overflow-hidden bg-teal-deep py-4 text-paper" dir="ltr">
          <div className="animate-marquee flex w-max">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {[...h.marquee, ...h.marquee].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-10 px-5 text-[0.7rem] font-medium uppercase tracking-[0.25em] whitespace-nowrap"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <span className={locale === "ar" ? "text-sm tracking-normal" : ""}>{item}</span>
                    <span aria-hidden="true" className="relative inline-block h-2 w-2 text-gold">
                      <span className="absolute inset-0 bg-current" />
                      <span className="absolute inset-0 rotate-45 bg-current" />
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="serration text-teal-deep" aria-hidden="true" />
      </section>

      {/* ——— Collections ——— */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow">{h.categoriesEyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">{h.categoriesTitle}</h2>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-7 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link key={c.id} href={localePath(locale, `/shop?category=${c.id}`)} className="group text-center">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-sand">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 24vw, 48vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-4 font-display text-lg text-paper/90">
                  {formatNumber(i + 1, locale).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl transition-colors group-hover:text-teal-deep">{tr(c.name, locale)}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{tr(c.blurb, locale)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Bestsellers ——— */}
      <section className="border-t border-stone/70 bg-paper">
        <div className="container-luxe py-20 md:py-28">
          <SectionHeading eyebrow={h.bestsellersEyebrow} title={h.bestsellersTitle}>
            <Link href={localePath(locale, "/shop")} className="link-underline flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm">
              {h.viewAll}
              <ArrowIcon size={14} />
            </Link>
          </SectionHeading>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-7">
            {bestsellers.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— Made by hand ——— */}
      <section className="container-luxe grid items-center gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <div className="relative pb-16 pe-10 sm:pe-20">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/editorial/beadwork.jpg" alt="" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover object-[50%_25%]" />
          </div>
          <div className="absolute bottom-0 end-0 aspect-square w-[45%] overflow-hidden rounded-t-full border-[10px] border-ivory">
            <Image src="/images/editorial/potter.jpg" alt="" fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
          </div>
        </div>
        <div>
          <p className="eyebrow">{h.craftEyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-[1.08] md:text-5xl">{h.craftTitle}</h2>
          <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">{h.craftBody}</p>
          <dl className="mt-10 max-w-xl">
            {h.craftPlaces.map((row) => (
              <div key={row.place} className="flex items-baseline gap-4 border-t border-stone py-4 last:border-b">
                <dt className="font-display text-2xl">{row.place}</dt>
                <span className="flex-1 translate-y-[-4px] border-b border-dotted border-stone" aria-hidden="true" />
                <dd className="text-sm text-muted">{row.craft}</dd>
              </div>
            ))}
          </dl>
          <Link href={localePath(locale, "/shop?category=crafts")} className="btn btn-primary mt-10">
            {h.craftCta}
            <ArrowIcon size={16} />
          </Link>
        </div>
      </section>

      {/* ——— Zobo · Karkadeh ——— */}
      <section className="relative">
        <div className="serration serration-up text-plum" aria-hidden="true" />
        <div className="lattice bg-plum text-paper">
          <div className="container-luxe grid items-center gap-14 py-20 md:py-28 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-t-full border border-paper/20 lg:mx-0">
              <Image src="/images/products/hibiscus-2.jpg" alt="" fill sizes="(min-width: 1024px) 24rem, 80vw" className="object-cover" />
            </div>
            <div>
              <p className="eyebrow text-gold!">{h.zoboEyebrow}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2" aria-hidden="true">
                <span className="font-display text-6xl md:text-7xl" lang="en">Zobo</span>
                <span className="h-px w-10 self-center bg-gold" />
                <span className="font-display text-5xl md:text-6xl" lang="ar">كركديه</span>
              </p>
              <h2 className="mt-6 font-display text-3xl font-light md:text-4xl">{h.zoboTitle}</h2>
              <p className="mt-5 max-w-xl leading-relaxed text-paper/80">{h.zoboBody}</p>
              <ol className="mt-10 grid gap-6 sm:grid-cols-3">
                {h.zoboSteps.map((step, i) => (
                  <li key={i} className="border-t border-paper/25 pt-4">
                    <span className="font-display text-3xl text-gold">{formatNumber(i + 1, locale).padStart(2, "0")}</span>
                    <p className="mt-2 text-sm leading-relaxed text-paper/85">{step}</p>
                  </li>
                ))}
              </ol>
              <Link href={localePath(locale, `/products/${zobo.slug}`)} className="btn btn-light mt-12">
                {h.zoboCta}
                <ArrowIcon size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="serration text-plum" aria-hidden="true" />
      </section>

      {/* ——— An old road ——— */}
      <section className="container-luxe grid items-center gap-12 py-20 md:py-28 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="eyebrow">{h.routesEyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-[1.08] md:text-5xl">{h.routesTitle}</h2>
          <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">{h.routesBody}</p>
        </div>
        <figure className="border border-stone bg-paper p-6 md:p-10">
          <RouteMap
            from={{ label: tr(towns.kano.name, locale), coords: "12.00°N · 8.59°E" }}
            to={{ label: tr(DOHA.name, locale), coords: "25.29°N · 51.53°E" }}
            distance={fmt(h.routesDistance, { km: kanoKm })}
          />
          <figcaption className="mt-4 border-t border-stone pt-4 text-center text-xs text-muted">{h.routesCaption}</figcaption>
        </figure>
      </section>

      {/* ——— Objects with a story ——— */}
      <section className="border-t border-stone/70 bg-paper">
        <div className="container-luxe py-20 md:py-28">
          <SectionHeading eyebrow={h.collectionEyebrow} title={h.collectionTitle}>
            <Link href={localePath(locale, "/shop?category=crafts")} className="link-underline flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] rtl:text-sm">
              {h.viewAll}
              <ArrowIcon size={14} />
            </Link>
          </SectionHeading>
          <div className="mt-12 grid gap-x-7 gap-y-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
            <div>
              <div className="lg:sticky lg:top-28">
                <ProductCard product={bronze} locale={locale} t={t} arched />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-7">
              {craftPicks.map((p) => (
                <ProductCard key={p.slug} product={p} locale={locale} t={t} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— Delivered across Qatar ——— */}
      <section className="relative isolate overflow-hidden">
        <Image src="/images/editorial/doha.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/10 rtl:bg-gradient-to-l" />
        <div className="container-luxe py-24 text-paper md:py-36">
          <div className="max-w-xl">
            <p className="eyebrow text-gold!">{h.deliveryEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.08] md:text-5xl">{h.deliveryTitle}</h2>
            <p className="mt-6 leading-relaxed text-paper/80">{h.deliveryBody}</p>
            <ul className="mt-10 space-y-4">
              {h.deliveryPoints.map((point) => (
                <li key={point} className="flex items-center gap-4 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-paper/30">
                    <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  </span>
                  {fmt(point, { amount: freeOver })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ——— Promise ——— */}
      <section className="container-luxe py-20 md:py-24">
        <p className="eyebrow text-center">{h.promiseEyebrow}</p>
        <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-10">
          {h.promises.map((promise, i) => {
            const Icon = [HandIcon, LeafIcon, TruckIcon][i];
            return (
              <div key={promise.title} className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-t-full border border-stone text-teal-deep">
                  <Icon size={24} />
                </span>
                <h3 className="mt-6 font-display text-2xl">{promise.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">{promise.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl font-light md:text-5xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}
