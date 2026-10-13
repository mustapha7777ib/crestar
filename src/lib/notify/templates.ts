import "server-only";
import type { Order, OrderItem } from "@prisma/client";
import { findCity } from "@/lib/delivery";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";
import type { Email } from "./email";

// Customer emails, written in the language the order was placed in.

export type OrderEvent = "placed" | "outForDelivery" | "delivered" | "cancelled";
type OrderWithItems = Order & { items: OrderItem[] };

const copy = {
  en: {
    placed: {
      subject: "Your Crestar Trading order {number} is confirmed",
      heading: "Thank you, {name}.",
      body: "We've received your order and are preparing it in Doha. Our driver will call you on {phone} before delivering.",
    },
    outForDelivery: {
      subject: "Your order {number} is on its way",
      heading: "Your order is on its way.",
      body: "Our driver has your order and will call you on {phone} shortly.",
    },
    delivered: {
      subject: "Your order {number} has been delivered",
      heading: "Delivered. We hope you love it.",
      body: "Thank you for shopping with Crestar Trading. If you have a moment, tell other customers what you thought.",
    },
    cancelled: {
      subject: "Your order {number} has been cancelled",
      heading: "Your order has been cancelled.",
      body: "If you paid by card, the refund goes back to the same card within 5–10 working days. Reply to this email if you have any questions.",
    },
    order: "Order",
    items: "Items",
    subtotal: "Subtotal",
    discount: "Discount",
    delivery: "Delivery",
    free: "Complimentary",
    total: "Total",
    paidCard: "Paid by card",
    payCod: "Cash on delivery: please have {amount} ready",
    paidCod: "Paid in cash on delivery",
    deliverTo: "Delivering to",
    zone: "Zone",
    street: "Street",
    building: "Building",
    track: "View your order",
    review: "Write a review",
    help: "Questions? WhatsApp {phone} or reply to this email.",
  },
  ar: {
    placed: {
      subject: "تم تأكيد طلبك {number} من كريستار للتجارة",
      heading: "شكرًا لك يا {name}.",
      body: "استلمنا طلبك ونجهّزه الآن في الدوحة. سيتصل بك السائق على الرقم {phone} قبل التوصيل.",
    },
    outForDelivery: {
      subject: "طلبك {number} في الطريق إليك",
      heading: "طلبك في الطريق إليك.",
      body: "طلبك مع السائق الآن، وسيتصل بك على الرقم {phone} قريبًا.",
    },
    delivered: {
      subject: "تم توصيل طلبك {number}",
      heading: "تم التوصيل. نتمنى أن ينال إعجابك.",
      body: "شكرًا لتسوّقك من كريستار للتجارة. إن كان لديك دقيقة، شارك رأيك مع العملاء الآخرين.",
    },
    cancelled: {
      subject: "تم إلغاء طلبك {number}",
      heading: "تم إلغاء طلبك.",
      body: "إذا دفعت بالبطاقة، يُعاد المبلغ إلى البطاقة نفسها خلال 5 إلى 10 أيام عمل. يمكنك الرد على هذه الرسالة لأي استفسار.",
    },
    order: "الطلب",
    items: "القطع",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    delivery: "التوصيل",
    free: "مجاني",
    total: "الإجمالي",
    paidCard: "مدفوع بالبطاقة",
    payCod: "الدفع عند الاستلام: يرجى تجهيز {amount}",
    paidCod: "مدفوع نقدًا عند الاستلام",
    deliverTo: "التوصيل إلى",
    zone: "المنطقة",
    street: "الشارع",
    building: "المبنى",
    track: "عرض طلبك",
    review: "اكتب تقييمًا",
    help: "لديك سؤال؟ راسلنا على واتساب {phone} أو ردّ على هذه الرسالة.",
  },
};

const fill = (t: string, vars: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function origin(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function orderLinks(order: Pick<Order, "id" | "locale" | "reviewToken">) {
  const base = origin();
  return {
    track: `${base}/${order.locale}/checkout/complete?order=${order.id}`,
    review: `${base}/${order.locale}/review?order=${order.id}&token=${order.reviewToken}`,
  };
}

export function orderEmail(event: OrderEvent, order: OrderWithItems): Email {
  const locale = order.locale === "ar" ? "ar" : "en";
  const t = copy[locale];
  const e = t[event];
  const money = (n: number) => formatMoney(n, locale);
  const vars = { number: order.number, name: order.firstName, phone: `+974 ${order.phone}` };
  const links = orderLinks(order);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "right" : "left";
  const end = locale === "ar" ? "left" : "right";

  const payment =
    order.paymentMethod === "COD"
      ? order.status === "DELIVERED"
        ? t.paidCod
        : fill(t.payCod, { amount: money(order.total) })
      : t.paidCard;
  const city = findCity(order.city);
  const address = [
    `${order.firstName} ${order.lastName}`,
    `${t.zone} ${order.zone} · ${t.street} ${order.street} · ${t.building} ${order.building}${order.unit ? ` · ${order.unit}` : ""}`,
    city ? city.name[locale] : order.city,
  ];
  const lines = order.items.map((i) => ({
    name: locale === "ar" ? i.nameAr : i.name,
    size: locale === "ar" && i.variantLabelAr ? i.variantLabelAr : i.variantLabel,
    qty: i.quantity,
    total: money(i.lineTotal),
  }));
  const totals: [string, string][] = [
    [t.subtotal, money(order.subtotal)],
    ...(order.discount > 0 ? ([[`${t.discount}${order.discountCode ? ` (${order.discountCode})` : ""}`, `−${money(order.discount)}`]] as [string, string][]) : []),
    [t.delivery, order.deliveryFee === 0 ? t.free : money(order.deliveryFee)],
    [t.total, money(order.total)],
  ];
  const cta = event === "delivered" ? { label: t.review, href: links.review } : { label: t.track, href: links.track };
  const showDetails = event !== "delivered";

  const text = [
    fill(e.heading, vars),
    fill(e.body, vars),
    "",
    `${t.order} ${order.number}`,
    ...(showDetails ? lines.map((l) => `${l.qty} × ${l.name} (${l.size}) — ${l.total}`) : []),
    ...(showDetails ? totals.map(([k, v]) => `${k}: ${v}`) : []),
    ...(showDetails ? [payment, "", `${t.deliverTo}:`, ...address] : []),
    "",
    `${cta.label}: ${cta.href}`,
    fill(t.help, { phone: site.phoneDisplay }),
  ].join("\n");

  const row = (k: string, v: string, strong = false) =>
    `<tr><td style="padding:4px 0;color:#6b7280;text-align:${align}">${esc(k)}</td><td style="padding:4px 0;text-align:${end};${strong ? "font-weight:600;color:#1f2937" : ""}">${esc(v)}</td></tr>`;

  const html = `<!doctype html><html lang="${locale}" dir="${dir}"><body style="margin:0;background:#fffcf2;font-family:${locale === "ar" ? "'IBM Plex Sans Arabic',Tahoma,Arial" : "Helvetica,Arial"},sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffcf2"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e1cf" dir="${dir}">
<tr><td style="background:#0f766e;padding:22px 28px;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:.02em;text-align:${align}"><span style="color:#ffd249">&#9679;</span> ${esc(locale === "ar" ? site.nameAr : site.name)}</td></tr>
<tr><td style="padding:28px;text-align:${align}">
<h1 style="margin:0 0 12px;font-size:24px;font-weight:600">${esc(fill(e.heading, vars))}</h1>
<p style="margin:0 0 20px;line-height:1.6;color:#374151">${esc(fill(e.body, vars))}</p>
<p style="margin:0 0 16px;font-size:13px;color:#6b7280">${esc(t.order)} <strong style="color:#1f2937" dir="ltr">${esc(order.number)}</strong></p>
${
  showDetails
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e1cf;border-bottom:1px solid #e7e1cf;margin-bottom:16px">
${lines.map((l) => `<tr><td style="padding:10px 0;text-align:${align}">${l.qty} × ${esc(l.name)}<br><span style="color:#6b7280;font-size:13px">${esc(l.size)}</span></td><td style="padding:10px 0;text-align:${end};white-space:nowrap">${esc(l.total)}</td></tr>`).join("")}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${totals.map(([k, v], i) => row(k, v, i === totals.length - 1)).join("")}</table>
<p style="margin:16px 0 0;padding:12px 14px;background:#f7f0dc;font-size:14px">${esc(payment)}</p>
<p style="margin:20px 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0f766e">${esc(t.deliverTo)}</p>
<p style="margin:0;line-height:1.6">${address.map(esc).join("<br>")}</p>`
    : ""
}
<p style="margin:28px 0 0"><a href="${esc(cta.href)}" style="display:inline-block;background:#1f2937;color:#ffffff;text-decoration:none;padding:14px 26px;font-size:14px;letter-spacing:.08em">${esc(cta.label)}</a></p>
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e7e1cf;font-size:13px;color:#6b7280;text-align:${align}">${esc(fill(t.help, { phone: site.phoneDisplay }))}</td></tr>
</table></td></tr></table></body></html>`;

  return { to: order.email, subject: fill(e.subject, vars), html, text };
}
