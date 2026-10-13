import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { checkAdminAuth } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const result = checkAdminAuth(request.headers.get("authorization"));
    if (result === "ok") return NextResponse.next();
    if (result === "disabled") {
      return new NextResponse("Admin is disabled. Set ADMIN_PASSWORD to enable it.", { status: 503 });
    }
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Crestar Trading admin", charset="UTF-8"' },
    });
  }

  // Storefront: every page lives under /en or /ar.
  if (isLocale(pathname.split("/")[1] ?? "")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/** Saved choice first, then the browser's languages in order of preference. */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const ranked = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return defaultLocale;
}

export const config = {
  // Skip API routes, Next internals and any path with a file extension (images, icons).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
