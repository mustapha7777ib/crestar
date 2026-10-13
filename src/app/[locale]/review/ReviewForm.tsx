"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Stars } from "@/components/product/Stars";
import { StarIcon } from "@/components/ui/icons";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { submitReviews } from "./actions";

type Item = { slug: string; name: string; image: string };
type Draft = { rating: number; body: string; photo: string | null; skip: boolean; uploading: boolean };

export function ReviewForm({ orderId, token, items, defaultName }: { orderId: string; token: string; items: Item[]; defaultName: string }) {
  const { locale, t } = useI18n();
  const r = t.review;
  const [name, setName] = useState(defaultName);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(
    Object.fromEntries(items.map((i) => [i.slug, { rating: 0, body: "", photo: null, skip: false, uploading: false }])),
  );
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const set = (slug: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [slug]: { ...d[slug], ...patch } }));

  async function addPhoto(slug: string, file: File | undefined) {
    if (!file) return;
    set(slug, { uploading: true });
    setError(null);
    try {
      const blob = await upload(`reviews/${slug}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/reviews/upload",
        clientPayload: JSON.stringify({ orderId, token }),
      });
      set(slug, { photo: blob.url, uploading: false });
    } catch {
      set(slug, { uploading: false });
      setError(r.photoError);
    }
  }

  function submit() {
    setError(null);
    const reviews = items
      .filter((i) => !drafts[i.slug].skip && drafts[i.slug].rating > 0 && drafts[i.slug].body.trim().length >= 3)
      .map((i) => ({ slug: i.slug, rating: drafts[i.slug].rating, body: drafts[i.slug].body.trim(), photo: drafts[i.slug].photo }));
    if (!name.trim() || reviews.length === 0) {
      setError(r.needOne);
      return;
    }
    start(async () => {
      const result = await submitReviews({ orderId, token, locale, name: name.trim(), reviews });
      if (result.ok) setDone(true);
      else setError(result.error === "invalid" ? r.invalidLink : result.error === "needOne" ? r.needOne : t.checkout.errors.generic);
    });
  }

  if (done) {
    return (
      <div className="border border-stone bg-paper p-10 text-center">
        <p className="font-display text-4xl">{r.thanksTitle}</p>
        <p className="mt-3 text-muted">{r.thanksBody}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-sm">
        <label htmlFor="review-name" className="mb-2 block text-xs font-medium text-ink-soft">
          {r.name}
        </label>
        <input id="review-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={r.namePlaceholder} maxLength={40} />
      </div>

      {items.map((item) => {
        const d = drafts[item.slug];
        return (
          <fieldset key={item.slug} className={`border border-stone bg-paper p-6 ${d.skip ? "opacity-50" : ""}`}>
            <legend className="sr-only">{item.name}</legend>
            <div className="flex items-center gap-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-sand">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <p className="font-display text-2xl">{item.name}</p>
            </div>
            {!d.skip && (
              <>
                <div className="mt-6">
                  <span className="mb-2 block text-xs font-medium text-ink-soft">{r.rating}</span>
                  <div className="flex gap-1" role="radiogroup" aria-label={r.rating}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={d.rating === n}
                        aria-label={fmt(r.stars, { n })}
                        onClick={() => set(item.slug, { rating: n })}
                        className={`p-1 ${n <= d.rating ? "text-gold-deep" : "text-stone hover:text-gold-deep/60"}`}
                      >
                        <StarIcon size={28} filled={n <= d.rating} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <label htmlFor={`body-${item.slug}`} className="mb-2 block text-xs font-medium text-ink-soft">
                    {r.text}
                  </label>
                  <textarea
                    id={`body-${item.slug}`}
                    className="field"
                    rows={4}
                    maxLength={1500}
                    dir="auto"
                    value={d.body}
                    placeholder={r.textPlaceholder}
                    onChange={(e) => set(item.slug, { body: e.target.value })}
                  />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {d.photo ? (
                    <>
                      <div className="relative aspect-square w-24 overflow-hidden bg-sand">
                        <Image src={d.photo} alt="" fill sizes="96px" className="object-cover" />
                      </div>
                      <button type="button" className="text-sm text-danger underline" onClick={() => set(item.slug, { photo: null })}>
                        {r.removePhoto}
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer border border-dashed border-stone px-4 py-3 text-sm text-muted hover:border-ink">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic"
                        className="sr-only"
                        disabled={d.uploading}
                        onChange={(e) => void addPhoto(item.slug, e.target.files?.[0])}
                      />
                      {d.uploading ? r.uploading : r.photo}
                    </label>
                  )}
                </div>
              </>
            )}
            <label className="mt-5 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={d.skip} onChange={(e) => set(item.slug, { skip: e.target.checked })} />
              {r.skip}
            </label>
          </fieldset>
        );
      })}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <button type="button" onClick={submit} disabled={pending || Object.values(drafts).some((d) => d.uploading)} className="btn btn-primary">
        {r.submit}
      </button>
      <p className="flex items-center gap-2 text-xs text-muted">
        <Stars value={5} size={12} /> {r.body}
      </p>
    </div>
  );
}
