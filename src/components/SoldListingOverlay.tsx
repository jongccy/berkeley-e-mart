/** Grey gradient overlay for sold listings. Parent must be `position: relative`. */
export function SoldListingOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] bg-gradient-to-br from-zinc-400/45 via-zinc-500/35 to-zinc-600/50 dark:from-zinc-600/50 dark:via-zinc-700/45 dark:to-zinc-800/55"
      aria-hidden
    />
  );
}
