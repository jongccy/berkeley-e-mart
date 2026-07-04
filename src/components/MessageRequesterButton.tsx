import Link from "next/link";
import { startWantedConversation } from "@/app/actions/chat";
import { isVerifiedBerkeleyUser } from "@/lib/supabase/auth-helpers";
import { BLOCKED_MESSAGING_MESSAGE } from "@/lib/user-blocks";
import type { User } from "@supabase/supabase-js";

type Props = {
  wantedPostId: string;
  requesterId: string;
  user: User | null;
  messagingBlocked?: boolean;
};

export function MessageRequesterButton({
  wantedPostId,
  requesterId,
  user,
  messagingBlocked = false,
}: Props) {
  if (!user) {
    return (
      <Link
        href={`/login?redirect=/wanted/${wantedPostId}`}
        className="inline-block w-full rounded-lg bg-[#003262] px-4 py-2.5 text-center text-white hover:bg-[#002244]"
      >
        Log in to message
      </Link>
    );
  }

  if (user.id === requesterId) {
    return (
      <p className="text-sm text-zinc-500">This is your request.</p>
    );
  }

  if (!isVerifiedBerkeleyUser(user)) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Verify your Berkeley email to message the requester.
      </p>
    );
  }

  if (messagingBlocked) {
    return (
      <p className="text-sm text-zinc-500">{BLOCKED_MESSAGING_MESSAGE}</p>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await startWantedConversation(wantedPostId);
      }}
    >
      <button
        type="submit"
        className="w-full rounded-lg bg-[#003262] px-4 py-2.5 font-medium text-white hover:bg-[#002244]"
      >
        Message requester
      </button>
    </form>
  );
}
