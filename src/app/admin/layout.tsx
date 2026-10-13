import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "./AdminNav";
import "../globals.css";

export const metadata: Metadata = { title: "Crestar Trading admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-ivory font-[system-ui] text-ink">
        <header className="border-b border-stone bg-paper print:hidden">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-deep">
              Crestar Trading · Admin
            </Link>
            <AdminNav />
            <Link href="/en" className="text-xs text-muted hover:text-ink">
              View shop ↗
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
