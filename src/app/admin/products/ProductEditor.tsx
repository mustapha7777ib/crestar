"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { categories } from "@/data/categories";
import { towns } from "@/data/towns";
import { saveProduct } from "./actions";
import type { ProductForm } from "./schema";

type Bi = { en: string; ar: string };
type VariantRow = { code: string; label: Bi; price: string; stock: string; weight: string };

const input = "w-full border border-stone bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none";
const labelCls = "mb-1 block text-xs font-medium text-ink-soft";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function BiField({
  label,
  value,
  onChange,
  textarea = false,
  rows = 3,
}: {
  label: string;
  value: Bi;
  onChange: (v: Bi) => void;
  textarea?: boolean;
  rows?: number;
}) {
  const Field = textarea ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <span className={labelCls}>{label} — English</span>
        <Field className={input} rows={textarea ? rows : undefined} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </div>
      <div>
        <span className={labelCls}>{label} — العربية</span>
        <Field
          className={input}
          dir="rtl"
          lang="ar"
          rows={textarea ? rows : undefined}
          value={value.ar}
          onChange={(e) => onChange({ ...value, ar: e.target.value })}
        />
      </div>
    </div>
  );
}

export function ProductEditor({
  initial,
  others,
}: {
  initial: ProductForm | null;
  others: { slug: string; name: string }[];
}) {
  const isNew = !initial;
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [category, setCategory] = useState<ProductForm["category"]>(initial?.category ?? "pantry");
  const [town, setTown] = useState<ProductForm["town"]>(initial?.town ?? "kano");
  const [active, setActive] = useState(initial?.active ?? true);
  const [handmade, setHandmade] = useState(initial?.handmade ?? false);
  const [featured, setFeatured] = useState(initial?.featured?.toString() ?? "");
  const [name, setName] = useState<Bi>(initial?.name ?? { en: "", ar: "" });
  const [tagline, setTagline] = useState<Bi>(initial?.tagline ?? { en: "", ar: "" });
  const [story, setStory] = useState<Bi>(initial?.story ?? { en: "", ar: "" });
  const [badge, setBadge] = useState<Bi>(initial?.badge ?? { en: "", ar: "" });
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [details, setDetails] = useState(initial?.details ?? []);
  const [bundle, setBundle] = useState<string[]>(initial?.bundle ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      code: v.code,
      label: v.label,
      price: (v.price / 100).toString(),
      stock: v.stock === null ? "" : v.stock.toString(),
      weight: (v.weight / 1000).toString(),
    })) ?? [{ code: "standard", label: { en: "", ar: "" }, price: "", stock: "", weight: "0.5" }],
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const blob = await upload(`products/${slug || "new"}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/admin/upload",
        });
        setImages((prev) => [...prev, blob.url]);
      }
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}. Use JPG, PNG or WebP under 10MB.`);
    }
    setUploading(false);
  }

  function move<T>(list: T[], i: number, by: number): T[] {
    const next = [...list];
    const j = i + by;
    if (j < 0 || j >= next.length) return list;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }

  function submit() {
    setError(null);
    const form: ProductForm = {
      originalSlug: initial?.slug ?? null,
      slug,
      category,
      town,
      active,
      handmade,
      featured: featured.trim() ? Number(featured) : null,
      name,
      tagline,
      story,
      badge,
      images,
      details,
      bundle,
      variants: variants.map((v) => ({
        code: v.code.trim(),
        label: v.label,
        price: Math.round(Number(v.price) * 100),
        stock: v.stock.trim() === "" ? null : Math.floor(Number(v.stock)),
        weight: Math.round(Number(v.weight || 0) * 1000),
      })),
    };
    if (form.variants.some((v) => !Number.isFinite(v.price) || (v.stock !== null && !Number.isFinite(v.stock)) || !Number.isFinite(v.weight))) {
      setError("Check the sizes: price, stock and weight must be numbers.");
      return;
    }
    startSaving(async () => {
      const result = await saveProduct(form);
      if (result && !result.ok) setError(result.error);
    });
  }

  const section = "border border-stone bg-paper p-6";
  const h2 = "mb-4 font-serif text-2xl";

  return (
    <div className="space-y-6">
      <div className={section}>
        <h2 className={h2}>Basics</h2>
        <div className="space-y-4">
          <BiField
            label="Name"
            value={name}
            onChange={(v) => {
              setName(v);
              if (!slugTouched) setSlug(slugify(v.en));
            }}
          />
          <BiField label="Short line under the name" value={tagline} onChange={setTagline} />
          <BiField label="The story" value={story} onChange={setStory} textarea rows={6} />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span className={labelCls}>Collection</span>
              <select className={input} value={category} onChange={(e) => setCategory(e.target.value as ProductForm["category"])}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelCls}>Comes from</span>
              <select className={input} value={town} onChange={(e) => setTown(e.target.value as ProductForm["town"])}>
                {Object.entries(towns).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.name.en}, {t.country.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelCls}>Web address</span>
              <input
                className={input}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                dir="ltr"
              />
              <span className="mt-1 block text-[0.7rem] text-muted">/products/{slug || "…"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Visible in the shop
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={handmade} onChange={(e) => setHandmade(e.target.checked)} /> Hand-made
            </label>
            <label className="flex items-center gap-2">
              Home page &ldquo;most loved&rdquo; position
              <input className={`${input} w-20`} inputMode="numeric" placeholder="—" value={featured} onChange={(e) => setFeatured(e.target.value.replace(/\D/g, ""))} />
            </label>
          </div>
          <BiField label="Badge (optional, e.g. New)" value={badge} onChange={setBadge} />
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Photos</h2>
        <p className="mb-4 text-sm text-muted">The first photo is the main one. Portrait photos (4:5) look best.</p>
        <div className="flex flex-wrap gap-4">
          {images.map((src, i) => (
            <div key={src + i} className="w-32">
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                <Image src={src} alt="" fill sizes="128px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[0.6rem] text-paper">MAIN</span>}
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <button type="button" onClick={() => setImages(move(images, i, -1))} disabled={i === 0} className="px-1 disabled:opacity-30" aria-label="Move left">
                  ←
                </button>
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-danger">
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setImages(move(images, i, 1))}
                  disabled={i === images.length - 1}
                  className="px-1 disabled:opacity-30"
                  aria-label="Move right"
                >
                  →
                </button>
              </div>
            </div>
          ))}
          <label className="grid aspect-[4/5] w-32 cursor-pointer place-items-center border border-dashed border-stone text-center text-xs text-muted hover:border-ink">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => void onFiles(e.target.files)} disabled={uploading} />
            {uploading ? "Uploading…" : "+ Add photos"}
          </label>
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Sizes, prices & stock</h2>
        <p className="mb-4 text-sm text-muted">Leave stock empty if you don&apos;t want to track it. Weight is used for the heavy-item delivery fee.</p>
        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="grid gap-3 border-b border-stone/70 pb-4 sm:grid-cols-[1fr_1fr_6rem_6rem_6rem_auto]">
              <div>
                <span className={labelCls}>Size — English</span>
                <input className={input} value={v.label.en} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x)))} />
              </div>
              <div>
                <span className={labelCls}>Size — العربية</span>
                <input className={input} dir="rtl" lang="ar" value={v.label.ar} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, label: { ...x.label, ar: e.target.value } } : x)))} />
              </div>
              <div>
                <span className={labelCls}>Price (QAR)</span>
                <input className={input} inputMode="decimal" value={v.price} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
              </div>
              <div>
                <span className={labelCls}>In stock</span>
                <input className={input} inputMode="numeric" placeholder="not tracked" value={v.stock} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, stock: e.target.value.replace(/\D/g, "") } : x)))} />
              </div>
              <div>
                <span className={labelCls}>Weight (kg)</span>
                <input className={input} inputMode="decimal" value={v.weight} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)))} />
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <span className={labelCls}>Code</span>
                  <input
                    className={`${input} w-24`}
                    dir="ltr"
                    value={v.code}
                    disabled={!isNew && initial?.variants.some((x) => x.code === v.code)}
                    title="Used in bags and orders; fixed once saved"
                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, code: e.target.value.replace(/[^a-zA-Z0-9-]/g, "") } : x)))}
                  />
                </div>
                <button type="button" className="pb-2 text-xs text-danger disabled:opacity-30" disabled={variants.length === 1} onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="text-sm underline"
            onClick={() => setVariants([...variants, { code: `size-${variants.length + 1}`, label: { en: "", ar: "" }, price: "", stock: "", weight: "0.5" }])}
          >
            + Add a size
          </button>
        </div>
      </div>

      <div className={section}>
        <h2 className={h2}>Details</h2>
        <p className="mb-4 text-sm text-muted">Rows shown under &ldquo;Details&rdquo;, e.g. Ingredients, Dimensions, Care.</p>
        <div className="space-y-4">
          {details.map((d, i) => (
            <div key={i} className="space-y-2 border-b border-stone/70 pb-4">
              <BiField label="Label" value={d.label} onChange={(v) => setDetails(details.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
              <BiField label="Value" value={d.value} onChange={(v) => setDetails(details.map((x, j) => (j === i ? { ...x, value: v } : x)))} />
              <button type="button" className="text-xs text-danger" onClick={() => setDetails(details.filter((_, j) => j !== i))}>
                Remove row
              </button>
            </div>
          ))}
          <button type="button" className="text-sm underline" onClick={() => setDetails([...details, { label: { en: "", ar: "" }, value: { en: "", ar: "" } }])}>
            + Add a detail
          </button>
        </div>
      </div>

      {category === "gifts" && (
        <div className={section}>
          <h2 className={h2}>What&apos;s inside this gift set</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {others.map((o) => (
              <label key={o.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bundle.includes(o.slug)}
                  onChange={(e) => setBundle(e.target.checked ? [...bundle, o.slug] : bundle.filter((s) => s !== o.slug))}
                />
                {o.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-stone bg-ivory py-4">
        {error ? <p className="text-sm text-danger">{error}</p> : <span />}
        <div className="flex gap-3">
          <Link href="/admin/products" className="border border-stone px-5 py-2.5 text-sm">
            Cancel
          </Link>
          <button type="button" onClick={submit} disabled={saving || uploading} className="bg-ink px-6 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
            {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
