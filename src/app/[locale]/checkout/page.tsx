import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { activeProvider } from "@/lib/payments";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).checkout.title, robots: { index: false } } : {};
}

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  await connection(); // payment configuration is read at request time, not build time
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const mode = activeProvider()?.id === "demo" ? "demo" : "live";

  return (
    <section className="container-luxe pb-24 pt-12 md:pt-16">
      <h1 className="mb-10 font-display text-5xl font-light md:text-6xl">{t.checkout.title}</h1>
      <CheckoutForm mode={mode} />
    </section>
  );
}
