import { notFound } from "next/navigation";

// Any unknown URL under /en or /ar renders [locale]/not-found.tsx inside the
// localized layout instead of Next's unstyled default 404.
export default async function CatchAll() {
  notFound();
}
