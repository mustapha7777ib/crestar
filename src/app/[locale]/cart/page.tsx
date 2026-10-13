import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartView } from "@/components/cart/CartView";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).cart.title, robots: { index: false } } : {};
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <section className="container-luxe pb-24 pt-12 md:pt-16">
      <h1 className="mb-10 font-display text-5xl font-light md:text-6xl">{t.cart.title}</h1>
      <CartView />
    </section>
  );
}
