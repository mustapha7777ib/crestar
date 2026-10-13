import { getCatalog } from "@/lib/catalog";
import { checkDiscount } from "@/lib/discounts";
import { priceLines, subtotalOf } from "@/lib/pricing";
import { discountCheckSchema } from "@/lib/validation";

// Lets the checkout preview a discount code. The checkout API checks it again.
export async function POST(request: Request) {
  const parsed = discountCheckSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, reason: "invalid" }, { status: 400 });
  const subtotal = subtotalOf(priceLines(parsed.data.items, await getCatalog()));
  return Response.json(await checkDiscount(parsed.data.code, subtotal));
}
