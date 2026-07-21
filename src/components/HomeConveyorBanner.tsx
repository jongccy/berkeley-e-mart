const BELT_A = [
  "Photo 1",
  "Photo 2",
  "Photo 3",
  "Photo 4",
  "Photo 5",
  "Photo 6",
] as const;

const BELT_B = [
  "Photo A",
  "Photo B",
  "Photo C",
  "Photo D",
  "Photo E",
  "Photo F",
] as const;

type BeltProps = {
  items: readonly string[];
  offset?: boolean;
};

function ConveyorBelt({ items, offset = false }: BeltProps) {
  const loop = [...items, ...items];

  return (
    <div
      className={`relative flex-1 overflow-hidden ${offset ? "pt-6" : "pb-6"}`}
    >
      <div className="home-conveyor-down flex flex-col gap-3 will-change-transform">
        {loop.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="aspect-square w-full shrink-0 rounded-2xl bg-zinc-800"
            aria-hidden
          >
            <span className="flex h-full items-center justify-center px-2 text-center text-xs font-medium leading-snug text-zinc-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeConveyorBanner() {
  return (
    <div
      className="home-promo-enter flex h-full w-full overflow-hidden rounded-3xl bg-[#289958]"
      style={{ animationDelay: "0.06s" }}
      aria-label="Safer Buying and Selling with Berkeley Affiliates"
    >
      <div className="flex h-full w-[52%] gap-3 p-2 sm:p-2.5" aria-hidden>
        <ConveyorBelt items={BELT_A} />
        <ConveyorBelt items={BELT_B} offset />
      </div>

      <div className="flex h-full flex-1 items-center px-3 py-3 sm:px-4">
        <p className="w-full text-[clamp(1.35rem,2.6vw,2.35rem)] font-bold leading-[1.05] tracking-tight text-[#fff7ee]">
          Safer Buying
          <br />
          and Selling
          <br />
          with Berkeley
          <br />
          Affiliates
        </p>
      </div>
    </div>
  );
}
