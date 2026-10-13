import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar, Header } from "@/components/layout/Header";
import { dirOf, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/fmt";
import { I18nProvider } from "@/i18n/provider";
import { getCatalog } from "@/lib/catalog";
import { toClientProduct } from "@/lib/catalog-types";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import "../globals.css";

// Poppins is Crestar's typeface (crestartrading.com); IBM Plex Sans Arabic is
// its Arabic partner. globals.css orders each stack by the language of the
// text (:lang) so each script gets its own face.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: { default: t.meta.title, template: `%s — ${t.brand.name}` },
    description: t.meta.description,
    alternates: { languages: { en: "/en", ar: "/ar" } },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: t.brand.name,
      locale: locale === "ar" ? "ar_QA" : "en_QA",
      images: ["/images/editorial/spice-baskets.jpg"],
      type: "website",
    },
  };
}

// Pages are prerendered and refreshed when the catalogue changes (see
// lib/catalog.ts); this is the safety net for anything missed.
export const revalidate = 300;

export const viewport: Viewport = { themeColor: "#fffcf2" };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const catalog = (await getCatalog()).map(toClientProduct);

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${plexArabic.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale} dictionary={t}>
          <CatalogProvider catalog={catalog}>
          <CartProvider>
            <AnnouncementBar text={fmt(t.announcement, { amount: formatMoney(FREE_DELIVERY_THRESHOLD, locale) })} />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} t={t} />
            <CartDrawer />
            <WhatsAppButton />
          </CartProvider>
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
