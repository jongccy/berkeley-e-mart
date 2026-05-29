import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/inbox");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id,
      last_message_at,
      listings(id, title),
      buyer:buyer_id(id, display_name),
      seller:seller_id(id, display_name)
    `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
      {!conversations?.length ? (
        <p className="text-zinc-500">
          No conversations yet. Message a seller from a listing page.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {conversations.map((c) => {
            const listingRaw = c.listings as
              | { id: string; title: string }
              | { id: string; title: string }[]
              | null;
            const listing = Array.isArray(listingRaw)
              ? listingRaw[0]
              : listingRaw;
            const buyerRaw = c.buyer as
              | { id: string; display_name: string | null }
              | { id: string; display_name: string | null }[];
            const buyer = Array.isArray(buyerRaw) ? buyerRaw[0] : buyerRaw;
            const sellerRaw = c.seller as
              | { id: string; display_name: string | null }
              | { id: string; display_name: string | null }[];
            const seller = Array.isArray(sellerRaw) ? sellerRaw[0] : sellerRaw;
            const other =
              buyer.id === user.id ? seller : buyer;

            return (
              <li key={c.id}>
                <Link
                  href={`/inbox/${c.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div>
                    <p className="font-medium">{listing?.title ?? "Listing"}</p>
                    <p className="text-sm text-zinc-500">
                      with {other.display_name ?? "Student"}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {formatRelativeTime(c.last_message_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
