import Image from "next/image";

type BeltItem = {
  src?: string;
  alt: string;
};

const BELT_A: BeltItem[] = [
  { src: "/promos/belt-a/01-air-fryer.png?v=2", alt: "Air fryer" },
  { src: "/promos/belt-a/02-chair.png?v=2", alt: "Office chair" },
  { src: "/promos/belt-a/03-vacuum.png?v=2", alt: "Vacuum cleaner" },
  { src: "/promos/belt-a/04-book.png?v=2", alt: "Open book" },
  { src: "/promos/belt-a/05-monitor.png?v=2", alt: "Computer monitor" },
  { src: "/promos/belt-a/06-cal-shirt.png?v=2", alt: "Cal t-shirt" },
];

const BELT_B: BeltItem[] = [
  { src: "/promos/belt-b/01-scooter.png?v=1", alt: "Electric scooter" },
  { src: "/promos/belt-b/02-guitar.png?v=1", alt: "Electric guitar" },
  { src: "/promos/belt-b/03-headphones.png?v=1", alt: "Headphones" },
  { src: "/promos/belt-b/04-backpack.png?v=1", alt: "Backpack" },
  { src: "/promos/belt-b/05-plates.png?v=1", alt: "Stacked plates" },
  { src: "/promos/belt-b/06-keyboard.png?v=1", alt: "Keyboard" },
];

type BeltProps = {
  items: readonly BeltItem[];
  offset?: boolean;
};

function ConveyorBelt({ items, offset = false }: BeltProps) {
  const loop = [...items, ...items];

  return (
    <div
      className={`relative flex-1 overflow-hidden ${offset ? "pt-6" : "pb-6"}`}
    >
      <div className="home-conveyor-down flex flex-col gap-3 will-change-transform">
        {loop.map((item, index) => (
          <div
            key={`${item.alt}-${index}`}
            className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-[#289958]"
            aria-hidden
          >
            {item.src ? (
              <Image
                src={item.src}
                alt=""
                fill
                unoptimized
                sizes="120px"
                className="object-contain object-center p-1"
              />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-xs font-medium leading-snug text-[#fff7ee]/70">
                {item.alt}
              </span>
            )}
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
      aria-label="Safer Buying and Selling with UC Berkeley Affiliates"
    >
      <div className="flex h-full w-[52%] gap-3 p-2 sm:p-2.5" aria-hidden>
        <ConveyorBelt items={BELT_A} />
        <ConveyorBelt items={BELT_B} offset />
      </div>

      <div className="flex h-full flex-1 items-center px-3 py-3 sm:px-4">
        <p className="w-full text-[clamp(1.6rem,3.2vw,2.85rem)] font-bold leading-[1.05] tracking-tight text-[#fff7ee]">
          Safer Buying
          <br />
          and Selling
          <br />
          with
          <br />
          UC&nbsp;Berkeley Affiliates
        </p>
      </div>
    </div>
  );
}
