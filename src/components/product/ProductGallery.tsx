"use client";

import Image from "next/image";
import { useState } from "react";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";

export function ProductGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start">
      {images.length > 1 && (
        <div className="flex gap-3 md:flex-col" role="tablist" aria-label={t.product.gallery}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={fmt(t.product.viewImage, { n: i + 1 })}
              onClick={() => setActive(i)}
              className={`relative aspect-[4/5] w-16 overflow-hidden bg-sand transition-opacity md:w-20 ${
                i === active ? "opacity-100 ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden bg-sand">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === active ? alt : ""}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {badge && (
          <span className="absolute start-4 top-4 bg-paper/95 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] rtl:text-xs">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
