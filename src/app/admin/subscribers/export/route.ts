import { checkAdminAuth } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// CSV of newsletter subscribers, for importing into Mailchimp, Brevo, etc.
// proxy.ts already protects /admin; this re-checks in case the matcher changes.
export async function GET(request: Request) {
  if (checkAdminAuth(request.headers.get("authorization")) !== "ok") {
    return new Response("Authentication required.", { status: 401 });
  }
  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "asc" } });
  const rows = subscribers.map((s) => `${s.email},${s.locale},${s.createdAt.toISOString()}`);
  return new Response(["email,language,subscribed_at", ...rows].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="crestar-trading-subscribers.csv"',
    },
  });
}
