import { connection } from "next/server";
import { db } from "@/lib/db";

export default async function SubscribersPage() {
  await connection();
  const subscribers = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-4">
        <div>
          <h1 className="font-serif text-4xl">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-muted">
            {subscribers.length} from the footer form. No emails are sent automatically: export the list into an email tool to write to them.
          </p>
        </div>
        {subscribers.length > 0 && (
          <a href="/admin/subscribers/export" download className="border border-ink px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-paper">
            Download CSV
          </a>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="py-10 text-center text-muted">No subscribers yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-stone/70 border border-stone bg-paper text-sm">
          {subscribers.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 px-4 py-3">
              <span>{s.email}</span>
              <span className="text-muted">
                {s.locale === "ar" ? "Arabic" : "English"} ·{" "}
                {s.createdAt.toLocaleDateString("en-GB", { timeZone: "Asia/Qatar", dateStyle: "medium" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
