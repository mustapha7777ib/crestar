import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import type { ReviewStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { approveReviewAction, rejectReviewAction } from "./actions";

const TABS: { status: ReviewStatus; label: string }[] = [
  { status: "PENDING", label: "Waiting for approval" },
  { status: "APPROVED", label: "Published" },
  { status: "REJECTED", label: "Rejected" },
];

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  await connection();
  const { status: raw } = await searchParams;
  const status = TABS.find((t) => t.status === raw)?.status ?? "PENDING";
  const [reviews, products, counts] = await Promise.all([
    db.review.findMany({ where: { status }, include: { order: { select: { number: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.product.findMany({ select: { slug: true, nameEn: true } }),
    db.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const name = (slug: string) => products.find((p) => p.slug === slug)?.nameEn ?? slug;
  const count = (s: ReviewStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-serif text-4xl">Reviews</h1>
      <p className="mt-1 text-sm text-muted">
        Customers get a review link once their order is marked delivered. Nothing appears on the site until you publish it.
      </p>
      <nav className="mt-6 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/admin/reviews?status=${t.status}`}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${t.status === status ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            {t.label} ({count(t.status)})
          </Link>
        ))}
      </nav>
      {reviews.length === 0 ? (
        <p className="py-16 text-center text-muted">Nothing here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-wrap gap-6 border border-stone bg-paper p-5">
              {r.photo && (
                <a href={r.photo} target="_blank" className="relative aspect-square w-28 shrink-0 overflow-hidden bg-sand">
                  <Image src={r.photo} alt="" fill sizes="112px" className="object-cover" />
                </a>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="text-gold-deep">{"★".repeat(r.rating)}</span>
                  <span className="text-stone">{"★".repeat(5 - r.rating)}</span>{" "}
                  <span className="font-semibold">{name(r.productSlug)}</span>
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed" dir="auto">
                  {r.body}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {r.name} · order {r.order.number} · {r.locale === "ar" ? "Arabic" : "English"} ·{" "}
                  {r.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {r.status !== "APPROVED" && (
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="w-full bg-ink px-4 py-2 text-xs font-semibold text-paper">Publish</button>
                  </form>
                )}
                {r.status !== "REJECTED" && (
                  <form action={rejectReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="w-full border border-stone px-4 py-2 text-xs hover:border-ink">{r.status === "APPROVED" ? "Unpublish" : "Reject"}</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
