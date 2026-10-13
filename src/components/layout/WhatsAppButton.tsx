"use client";

import { usePathname } from "next/navigation";
import { tr } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { site } from "@/lib/site";
import { useCatalog } from "../catalog/CatalogProvider";

// Floating "chat with us" button. On a product page the message names the product.
export function WhatsAppButton() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const catalog = useCatalog();

  // Checkout already has the customer's attention; keep it uncluttered.
  if (/\/checkout(\/|$)/.test(pathname)) return null;

  const slug = pathname.match(/\/products\/([^/]+)/)?.[1];
  const product = slug ? catalog.find((p) => p.slug === slug) : undefined;
  const text = product ? fmt(t.whatsapp.productMessage, { product: tr(product.name, locale) }) : t.whatsapp.message;
  const href = `${site.whatsappHref}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.label}
      title={t.whatsapp.label}
      className="fixed bottom-5 end-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#1f7a4d] text-white shadow-[0_12px_30px_-10px_rgba(27,22,18,0.55)] transition-transform duration-300 hover:scale-105 focus-visible:outline-offset-4 md:bottom-7 md:end-7"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.04-.38-1.99-1.23-.73-.66-1.23-1.47-1.37-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
      </svg>
    </a>
  );
}
