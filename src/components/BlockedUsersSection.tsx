"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { unblockUser } from "@/app/actions/blocks";
import { DisplayNameWithBadge } from "@/components/DisplayNameWithBadge";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  profileIsVerified,
  resolvePublicName,
  type ProfilePublicIdentity,
} from "@/lib/profile-display";

export type BlockedUserItem = {
  id: string;
  blockedAt: string;
  avatarUrl: string | null;
  profile: ProfilePublicIdentity;
};

type Props = {
  users: BlockedUserItem[];
};

export function BlockedUsersSection({ users: initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  async function handleUnblock(userId: string) {
    setPendingId(userId);
    setError("");

    const result = await unblockUser(userId);
    setPendingId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== userId));
    router.refresh();
  }

  return (
    <section className="rounded-xl bg-zinc-100 p-5 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold">Blocked users</h2>
      <p className="mt-1 text-xs text-zinc-500">
        People you&apos;ve blocked. Unblock to message them again and see their
        listings.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {users.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">You haven&apos;t blocked anyone.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {users.map((user) => {
            const name = resolvePublicName(user.profile);
            const verified = profileIsVerified(user.profile);
            const unblocking = pendingId === user.id;

            return (
              <li
                key={user.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Link
                  href={`/profile/${user.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <ProfileAvatar avatarUrl={user.avatarUrl} size="xs" />
                  <DisplayNameWithBadge
                    name={name}
                    verified={verified}
                    nameClassName="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => void handleUnblock(user.id)}
                  disabled={pendingId !== null}
                  className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-950"
                >
                  {unblocking ? "Unblocking..." : "Unblock"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
