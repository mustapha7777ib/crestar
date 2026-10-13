"use client";

import { useEffect } from "react";
import { cartStore } from "@/components/cart/cart-store";

const KEY = "crestar.cleared-orders";

/** Empties the bag once per paid order, so revisiting the receipt later is harmless. */
export function ClearCart({ orderId }: { orderId: string }) {
  useEffect(() => {
    let cleared: string[] = [];
    try {
      cleared = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {}
    if (cleared.includes(orderId)) return;
    cartStore.clear();
    try {
      localStorage.setItem(KEY, JSON.stringify([...cleared, orderId].slice(-20)));
    } catch {}
  }, [orderId]);
  return null;
}
