import Link from "next/link";
import { startConversation } from "@/app/actions/chat";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import type { User } from "@supabase/supabase-js";

type Props = {
  listingId: string;
  sellerId: string;
  user: User | null;
};

export function MessageSellerButton({ listingId, sellerId, user }: Props) {
  if (!user) {
    return (
      <Link
        href={`/login?redirect=/listings/${listingId}`}
        className="inline-block rounded-lg bg-[#003262] px-4 py-2 text-white hover:bg-[#002244]"
      >
        Log in to message seller
      </Link>
    );
  }

  if (user.id === sellerId) {
    return (
      <p className="text-sm text-zinc-500">This is your listing.</p>
    );
  }

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Verify your Berkeley email to message the seller.
      </p>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await startConversation(listingId);
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-[#003262] px-4 py-2 text-white hover:bg-[#002244]"
      >
        Message seller
      </button>
    </form>
  );
}
