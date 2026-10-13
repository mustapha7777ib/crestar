"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { categories } from "@/data/categories";
import { localePath, tr } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useCart, useCartDrawer } from "../cart/CartProvider";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "../ui/icons";
import { LanguageSwitch } from "./LanguageSwitch";
import { Wordmark } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const { count } = useCart();
  const { setOpen } = useCartDrawer();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu when navigation lands on a new page.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const shopHref = localePath(locale, "/shop");
  const navLink =
    "relative whitespace-nowrap py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-teal-deep rtl:text-sm rtl:font-medium";

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-500 ${
          scrolled
            ? "border-b border-stone/60 bg-ivory/90 shadow-[0_1px_24px_-12px_rgba(27,22,18,0.25)] backdrop-blur-md"
            : "border-b border-transparent bg-ivory"
        }`}
      >
        <div className="container-luxe grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-20">
          {/* Start: menu on mobile, navigation on desktop */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="-ms-2 p-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.menu}
              aria-expanded={menuOpen}
            >
              <MenuIcon size={24} />
            </button>
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              <Link href={shopHref} className={navLink}>
                {t.nav.shop}
              </Link>
              {/* Poppins sets wide: the third collection only fits on very wide screens. */}
              {categories.slice(0, 3).map((c, i) => (
                <Link
                  key={c.id}
                  href={`${shopHref}?category=${c.id}`}
                  className={`${navLink} hidden ${i < 2 ? "xl:inline" : "2xl:inline"}`}
                >
                  {tr(c.name, locale)}
                </Link>
              ))}
              <Link href={localePath(locale, "/about")} className={`${navLink} xl:hidden`}>
                {t.nav.story}
              </Link>
            </nav>
          </div>

          <Link href={localePath(locale)} aria-label={t.brand.name} className="justify-self-center">
            <Wordmark name={t.brand.name} />
          </Link>

          {/* End: story, language, bag */}
          <div className="flex items-center justify-end gap-5 md:gap-7">
            <Link href={localePath(locale, "/about")} className={`${navLink} hidden xl:inline`}>
              {t.nav.story}
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-1 transition-colors hover:text-teal-deep"
              aria-label={t.nav.search}
            >
              <SearchIcon size={21} />
            </button>
            <Suspense fallback={<span className="hidden w-12 sm:inline" />}>
              <LanguageSwitch className="hidden sm:inline" />
            </Suspense>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative -me-1 flex items-center gap-2 p-1 transition-colors hover:text-teal-deep"
              aria-label={`${t.nav.bag} (${count})`}
            >
              <BagIcon size={22} />
              <span className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.2em] md:inline rtl:text-sm">
                {t.nav.bag}
              </span>
              <span
                className={`absolute -top-1 -end-1.5 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-teal px-1 text-[0.65rem] font-semibold text-ink transition-transform duration-300 md:static md:h-auto md:min-w-0 md:bg-transparent md:p-0 md:text-[0.72rem] md:text-ink ${
                  count > 0 ? "scale-100" : "scale-0 md:scale-100"
                }`}
              >
                <span className="md:hidden">{count}</span>
                <span className="hidden md:inline">({count})</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-[visibility] duration-500 lg:hidden ${menuOpen ? "visible" : "pointer-events-none invisible"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menu}
          className={`motif absolute inset-y-0 start-0 flex w-[88%] max-w-sm flex-col bg-ivory transition-transform duration-500 ease-[var(--ease-luxe)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex h-[4.5rem] items-center justify-between px-5">
            <Wordmark name={t.brand.name} />
            <button type="button" onClick={() => setMenuOpen(false)} className="p-2" aria-label={t.nav.close}>
              <CloseIcon size={22} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 pt-6" aria-label="Mobile">
            <Link href={shopHref} className="py-2 font-display text-3xl">
              {t.nav.shop}
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`${shopHref}?category=${c.id}`} className="py-2 font-display text-3xl">
                {tr(c.name, locale)}
              </Link>
            ))}
            <div className="my-6 h-px bg-stone" />
            <Link href={localePath(locale, "/about")} className="py-2 text-sm uppercase tracking-[0.2em] rtl:text-base">
              {t.nav.story}
            </Link>
            <Link href={localePath(locale, "/help")} className="py-2 text-sm uppercase tracking-[0.2em] rtl:text-base">
              {t.nav.help}
            </Link>
          </nav>
          <div className="border-t border-stone px-6 py-5">
            <Suspense fallback={null}>
              <LanguageSwitch className="text-base" />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-ink text-paper">
      <p className="container-luxe py-2.5 text-center text-[0.68rem] font-medium uppercase tracking-[0.22em] rtl:text-xs">
        {text}
      </p>
    </div>
  );
}
