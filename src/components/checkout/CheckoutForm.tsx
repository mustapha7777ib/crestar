"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { localePath, tr } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { useI18n } from "@/i18n/provider";
import { cities, COD_MAX_TOTAL, deliveryFee, findCity, heavySurcharge, type DeliveryMethod } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { useHydrated } from "@/lib/use-hydrated";
import { useCart } from "../cart/CartProvider";
import { CheckoutSkeleton } from "../ui/Skeleton";
import { BackIcon, CheckIcon, LockIcon } from "../ui/icons";

type ErrorKey = "required" | "email" | "phone" | "number" | "generic" | "unavailable" | "emptyCart" | "stock" | "codLimit";
type DiscountError = "invalid" | "expired" | "usedUp" | "minimum";
type PaymentChoice = "card" | "cod";
type FieldErrors = Partial<Record<string, ErrorKey>>;

const DIGITS = /^\d+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[2-7]\d{7}$/;

/** Mirrors lib/validation.ts so most mistakes are caught without a round trip. */
function validate(data: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of ["firstName", "lastName", "email", "phone", "city", "zone", "street", "building"]) {
    if (!data[key]?.trim()) errors[key] = "required";
  }
  if (!errors.email && !EMAIL.test(data.email.trim())) errors.email = "email";
  const phone = data.phone.replace(/[\s-]/g, "").replace(/^(\+|00)?974/, "");
  if (!errors.phone && !PHONE.test(phone)) errors.phone = "phone";
  for (const key of ["zone", "street", "building"]) {
    if (!errors[key] && !DIGITS.test(data[key].trim())) errors[key] = "number";
  }
  return errors;
}

export function CheckoutForm({ mode }: { mode: "live" | "demo" }) {
  const { locale, t } = useI18n();
  const { lines, priced, subtotal, weight, short } = useCart();
  const [city, setCity] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("standard");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<ErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentChoice>("card");
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState<{ reason: DiscountError; minSubtotal?: number } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  const expressAvailable = city ? Boolean(findCity(city)?.express) : true;
  const effectiveMethod: DeliveryMethod = expressAvailable ? method : "standard";
  const discount = applied ? Math.min(applied.amount, subtotal) : 0;
  const fee = deliveryFee(effectiveMethod, subtotal - discount, weight);
  const heavy = heavySurcharge(weight);
  const total = subtotal - discount + fee;
  const codAllowed = total <= COD_MAX_TOTAL;
  const paymentMethod: PaymentChoice = codAllowed ? payment : "card";
  const e = t.checkout.errors;
  const errorText = (key: ErrorKey) => fmt(e[key], { amount: formatMoney(COD_MAX_TOTAL, locale) });

  async function applyCode() {
    const code = codeInput.trim();
    if (!code) return;
    setCheckingCode(true);
    setDiscountError(null);
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, items: lines }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => null) : null;
    if (body?.ok) {
      setApplied({ code: body.code, amount: body.amount });
      setCodeInput("");
    } else {
      setApplied(null);
      setDiscountError({ reason: body?.reason ?? "invalid", minSubtotal: body?.minSubtotal });
    }
    setCheckingCode(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (short.length) {
      setFormError("stock");
      return;
    }
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: lines,
          customer: { firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone },
          address: {
            city: data.city,
            zone: data.zone,
            street: data.street,
            building: data.building,
            unit: data.unit,
            notes: data.notes,
          },
          deliveryMethod: effectiveMethod,
          paymentMethod,
          discountCode: applied?.code ?? "",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url); // payment page, or the confirmation for cash on delivery
        return;
      }
      if (body.fields) setErrors(body.fields);
      if (body.error === "discount") {
        setApplied(null);
        setDiscountError({ reason: body.reason ?? "invalid" });
        setFormError(null);
      } else {
        setFormError(["unavailable", "emptyCart", "stock", "codLimit"].includes(body.error) ? body.error : "generic");
      }
    } catch {
      setFormError("generic");
    }
    setSubmitting(false);
  }

  const hydrated = useHydrated();
  if (!hydrated) return <CheckoutSkeleton />;

  if (priced.length === 0 && !submitting) {
    return (
      <div className="motif py-28 text-center">
        <p className="font-display text-4xl">{t.cart.empty}</p>
        <Link href={localePath(locale, "/shop")} className="btn btn-primary mt-10">
          {t.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const field = (name: string) => ({
    name,
    id: name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: "field",
  });
  const label = "mb-2 block text-xs font-medium text-ink-soft";
  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-xs text-danger">
        {e[errors[name]!]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={onSubmit}
      onChange={(ev) => {
        // Clear a field's error as soon as the customer edits it.
        const name = (ev.target as unknown as HTMLInputElement).name;
        if (!errors[name]) return;
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }}
      noValidate
      className="grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16"
    >
      <div className="space-y-12">
        {mode === "demo" && (
          <p className="border border-gold-deep/40 bg-gold/15 px-4 py-3 text-sm text-ink-soft">
            <strong className="me-2 font-semibold uppercase tracking-[0.14em] text-ink rtl:tracking-normal">{t.demo.badge}</strong>
            {t.demo.body}
          </p>
        )}

        <fieldset>
          <legend className="font-display text-3xl">{t.checkout.contact}</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={label}>{t.checkout.firstName}</label>
              <input {...field("firstName")} autoComplete="given-name" />
              {err("firstName")}
            </div>
            <div>
              <label htmlFor="lastName" className={label}>{t.checkout.lastName}</label>
              <input {...field("lastName")} autoComplete="family-name" />
              {err("lastName")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className={label}>{t.checkout.email}</label>
              <input {...field("email")} type="email" autoComplete="email" dir="ltr" />
              {err("email")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className={label}>{t.checkout.phone}</label>
              <div className="flex" dir="ltr">
                <span className="grid h-[3.25rem] place-items-center border border-e-0 border-stone bg-sand px-4 text-sm text-ink-soft">
                  +974
                </span>
                <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="5555 1234" />
              </div>
              {errors.phone ? err("phone") : <p className="mt-1.5 text-xs text-muted">{t.checkout.phoneHint}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-3xl">{t.checkout.address}</legend>
          <div className="mt-4 flex items-center gap-4">
            <BluePlate />
            <p className="text-sm text-muted">{t.checkout.addressHint}</p>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="city" className={label}>{t.checkout.city}</label>
              <select {...field("city")} value={city} onChange={(ev) => setCity(ev.target.value)} autoComplete="address-level2">
                <option value="">{t.checkout.selectCity}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {tr(c.name, locale)}
                  </option>
                ))}
              </select>
              {err("city")}
            </div>
            {(["zone", "street", "building"] as const).map((name) => (
              <div key={name}>
                <label htmlFor={name} className={label}>{t.checkout[name]}</label>
                <input {...field(name)} inputMode="numeric" dir="ltr" maxLength={4} />
                {err(name)}
              </div>
            ))}
            <div className="sm:col-span-3">
              <label htmlFor="unit" className={label}>{t.checkout.unit}</label>
              <input {...field("unit")} maxLength={20} />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="notes" className={label}>{t.checkout.notes}</label>
              <textarea {...field("notes")} rows={3} maxLength={500} placeholder={t.checkout.notesPlaceholder} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-3xl">{t.checkout.method}</legend>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["standard", "express"] as const).map((m) => {
              const disabled = m === "express" && !expressAvailable;
              const selected = effectiveMethod === m;
              const methodFee = deliveryFee(m, subtotal);
              return (
                <label
                  key={m}
                  className={`flex cursor-pointer flex-col gap-1 border p-5 transition-colors ${
                    selected ? "border-ink bg-paper" : "border-stone hover:border-ink"
                  } ${disabled ? "cursor-not-allowed opacity-50 hover:border-stone" : ""}`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={m}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => setMethod(m)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span className={`grid h-4 w-4 place-items-center rounded-full border ${selected ? "border-ink" : "border-stone"}`}>
                        {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                      </span>
                      <span className="font-medium">{t.checkout[m]}</span>
                    </span>
                    <span className="text-sm tabular-nums">{methodFee === 0 ? t.cart.free : formatMoney(methodFee, locale)}</span>
                  </span>
                  <span className="ps-7 text-xs text-muted">
                    {disabled ? t.checkout.expressUnavailable : m === "standard" ? t.checkout.standardEta : t.checkout.expressEta}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-3xl">{t.checkout.payment}</legend>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["card", "cod"] as const).map((p) => {
              const disabled = p === "cod" && !codAllowed;
              const selected = paymentMethod === p;
              return (
                <label
                  key={p}
                  className={`flex cursor-pointer flex-col gap-1 border p-5 transition-colors ${
                    selected ? "border-ink bg-paper" : "border-stone hover:border-ink"
                  } ${disabled ? "cursor-not-allowed opacity-50 hover:border-stone" : ""}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={p}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => setPayment(p)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-3">
                    <span className={`grid h-4 w-4 place-items-center rounded-full border ${selected ? "border-ink" : "border-stone"}`}>
                      {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                    <span className="font-medium">{p === "card" ? t.checkout.card : t.checkout.cod}</span>
                  </span>
                  <span className="ps-7 text-xs text-muted">
                    {disabled
                      ? fmt(t.checkout.codUnavailable, { amount: formatMoney(COD_MAX_TOTAL, locale) })
                      : p === "card"
                        ? t.checkout.cardNote
                        : t.checkout.codNote}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="self-start border border-stone bg-paper lg:sticky lg:top-28">
        <h2 className="border-b border-stone px-6 py-5 font-display text-2xl">{t.checkout.summary}</h2>
        <ul className="max-h-80 divide-y divide-stone/60 overflow-y-auto px-6">
          {priced.map(({ product, variant, qty, lineTotal, available }) => (
            <li key={`${product.slug}:${variant.id}`} className="flex items-center gap-4 py-4">
              <div className="relative aspect-[4/5] w-14 shrink-0 bg-sand">
                <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                <span className="absolute -end-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] text-paper">
                  {qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg leading-tight">{tr(product.name, locale)}</p>
                <p className="text-xs text-muted">{tr(variant.label, locale)}</p>
                {qty > available && (
                  <p className="text-xs text-danger">
                    {available === 0 ? t.cart.soldOutLine : fmt(t.cart.onlyLeft, { n: available })}
                  </p>
                )}
              </div>
              <p className="text-sm tabular-nums">{formatMoney(lineTotal, locale)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-stone px-6 py-5">
          {applied ? (
            <p className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-green">
                <CheckIcon size={16} />
                {fmt(t.checkout.discountApplied, { code: applied.code })}
              </span>
              <button type="button" onClick={() => setApplied(null)} className="link-underline text-xs uppercase tracking-[0.16em] text-muted rtl:text-sm">
                {t.checkout.removeCode}
              </button>
            </p>
          ) : (
            <>
              <label htmlFor="discountCode" className="mb-2 block text-xs font-medium text-ink-soft">
                {t.checkout.discountLabel}
              </label>
              <div className="flex gap-2">
                <input
                  id="discountCode"
                  value={codeInput}
                  onChange={(ev) => setCodeInput(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                      ev.preventDefault();
                      void applyCode();
                    }
                  }}
                  placeholder={t.checkout.discountPlaceholder}
                  className="field h-11 min-w-0 flex-1 uppercase placeholder:normal-case"
                  dir="ltr"
                  autoComplete="off"
                  aria-invalid={discountError ? true : undefined}
                />
                <button type="button" onClick={() => void applyCode()} disabled={checkingCode || !codeInput.trim()} className="btn btn-outline h-11 px-5">
                  {t.checkout.apply}
                </button>
              </div>
              {discountError && (
                <p className="mt-2 text-xs text-danger" role="alert">
                  {fmt(t.checkout.discountErrors[discountError.reason], {
                    amount: formatMoney(discountError.minSubtotal ?? 0, locale),
                  })}
                </p>
              )}
            </>
          )}
        </div>
        <dl className="space-y-3 border-t border-stone px-6 py-5 text-sm">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd className="tabular-nums">{formatMoney(subtotal, locale)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green">
              <dt>
                {t.checkout.discount} <span className="opacity-70">· {applied?.code}</span>
              </dt>
              <dd className="tabular-nums">−{formatMoney(discount, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>
              {t.cart.delivery} <span className="text-muted">· {t.checkout[effectiveMethod]}</span>
            </dt>
            <dd className="tabular-nums">{fee === 0 ? t.cart.free : formatMoney(fee, locale)}</dd>
          </div>
          {heavy > 0 && <p className="-mt-1 text-xs text-muted">{fmt(t.checkout.heavyNote, { amount: formatMoney(heavy, locale) })}</p>}
          <div className="flex items-baseline justify-between border-t border-stone pt-4">
            <dt className="font-medium uppercase tracking-[0.16em] rtl:tracking-normal">{t.cart.total}</dt>
            <dd className="font-display text-3xl tabular-nums">{formatMoney(total, locale)}</dd>
          </div>
        </dl>
        <div className="px-6 pb-6">
          {formError && (
            <p role="alert" className="mb-4 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
              {errorText(formError)}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            <LockIcon size={16} />
            {submitting
              ? t.checkout.processing
              : fmt(paymentMethod === "cod" ? t.checkout.placeOrder : t.checkout.pay, { amount: formatMoney(total, locale) })}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-muted">{t.checkout.secureNote}</p>
          <Link
            href={localePath(locale, "/cart")}
            className="mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-muted hover:text-ink rtl:text-sm"
          >
            <BackIcon size={14} />
            {t.checkout.backToBag}
          </Link>
        </div>
      </aside>
    </form>
  );
}

/** Miniature of the blue address plate found on every building in Qatar. */
function BluePlate() {
  return (
    <svg viewBox="0 0 92 40" className="h-10 w-[5.75rem] shrink-0" aria-hidden="true" style={{ direction: "ltr" }}>
      <rect x="0.5" y="0.5" width="91" height="39" rx="4" fill="#1f4f8f" stroke="#fbf8f3" strokeOpacity="0.6" />
      <rect x="3" y="3" width="86" height="34" rx="2.5" fill="none" stroke="#fbf8f3" strokeOpacity="0.85" />
      <text x="22" y="26" textAnchor="middle" fill="#fbf8f3" fontSize="16" fontWeight="700" fontFamily="system-ui">14</text>
      <line x1="40" y1="8" x2="40" y2="32" stroke="#fbf8f3" strokeOpacity="0.6" />
      <text x="65" y="18" textAnchor="middle" fill="#fbf8f3" fontSize="9" fontFamily="system-ui">920</text>
      <line x1="44" y1="21" x2="86" y2="21" stroke="#fbf8f3" strokeOpacity="0.6" />
      <text x="65" y="32" textAnchor="middle" fill="#fbf8f3" fontSize="9" fontFamily="system-ui">25</text>
    </svg>
  );
}
