import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const { email, locale } = parsed.data;
  await db.newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), locale },
    update: {}, // already subscribed: answer the same way, don't reveal it
  });
  return Response.json({ ok: true });
}
