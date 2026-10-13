"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="border border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper">
      Print
    </button>
  );
}
