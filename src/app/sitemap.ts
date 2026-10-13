import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { locales } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalog();
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const paths = ["", "/shop", "/about", "/help", ...products.map((p) => `/products/${p.slug}`)];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])) },
    })),
  );
}
