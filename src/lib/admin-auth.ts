// HTTP Basic auth for /admin. Checked in proxy.ts for every admin request and
// again inside admin server actions, so the actions stay protected even if the
// proxy matcher changes.

function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export type AdminAuthResult = "ok" | "unauthorized" | "disabled";

export function checkAdminAuth(authorization: string | null): AdminAuthResult {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "disabled";
  const user = process.env.ADMIN_USER || "admin";

  if (!authorization?.startsWith("Basic ")) return "unauthorized";
  let decoded: string;
  try {
    decoded = atob(authorization.slice(6));
  } catch {
    return "unauthorized";
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return "unauthorized";
  const ok = safeEqual(decoded.slice(0, sep), user) && safeEqual(decoded.slice(sep + 1), password);
  return ok ? "ok" : "unauthorized";
}
