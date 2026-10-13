"use client";

import { MAX_QTY_PER_LINE, type CartLine } from "@/lib/pricing";

// A tiny external store for the bag, persisted to localStorage and kept in
// sync across tabs. Read it with useSyncExternalStore (see useCart).

const KEY = "crestar.cart.v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data.filter(
      (l): l is CartLine =>
        typeof l?.slug === "string" && typeof l?.variant === "string" && Number.isInteger(l?.qty) && l.qty > 0,
    );
  } catch {
    return EMPTY;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    lines = parse(window.localStorage.getItem(KEY));
  } catch {
    lines = EMPTY; // storage blocked (private mode, etc.): keep an in-memory bag
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* in-memory only */
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  lines = parse(e.newValue);
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): CartLine[] {
    hydrate();
    return lines;
  },
  getServerSnapshot(): CartLine[] {
    return EMPTY;
  },

  add(slug: string, variant: string, qty = 1) {
    hydrate();
    const existing = lines.find((l) => l.slug === slug && l.variant === variant);
    commit(
      existing
        ? lines.map((l) =>
            l === existing ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY_PER_LINE) } : l,
          )
        : [...lines, { slug, variant, qty: Math.min(qty, MAX_QTY_PER_LINE) }],
    );
  },
  setQty(slug: string, variant: string, qty: number) {
    hydrate();
    if (qty <= 0) return cartStore.remove(slug, variant);
    commit(
      lines.map((l) =>
        l.slug === slug && l.variant === variant ? { ...l, qty: Math.min(qty, MAX_QTY_PER_LINE) } : l,
      ),
    );
  },
  remove(slug: string, variant: string) {
    hydrate();
    commit(lines.filter((l) => !(l.slug === slug && l.variant === variant)));
  },
  clear() {
    commit(EMPTY);
  },
};
