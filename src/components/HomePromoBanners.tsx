"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeConveyorBanner } from "@/components/HomeConveyorBanner";

/**
 * Left + right keep the original 1.6fr / 1fr sizes of the two-banner layout.
 * Middle matches the original right banner. Two views: (1) left + middle,
 * (2) scrolled to reveal the third banner.
 */
export function HomePromoBanners() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thirdRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (index === 0) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      setActive(0);
      return;
    }

    const third = thirdRef.current;
    const track = third?.parentElement;
    if (!third || !track) return;

    scroller.scrollTo({
      left: third.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
    setActive(1);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function updateActive() {
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) {
        setActive(0);
        return;
      }
      setActive(scroller.scrollLeft > max * 0.4 ? 1 : 0);
    }

    scroller.addEventListener("scroll", updateActive, { passive: true });
    return () => scroller.removeEventListener("scroll", updateActive);
  }, []);

  return (
    <section aria-label="Featured promotions" className="space-y-4">
      <div
        ref={scrollerRef}
        className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="grid grid-cols-[1.6fr_1fr_1fr] items-stretch gap-4"
          style={{ width: "calc((100% - 1rem) * 3.6 / 2.6 + 2rem)" }}
        >
          <div className="home-promo-enter overflow-hidden rounded-3xl bg-[#003262]">
            <Image
              src="/promos/welcome-calket.jpg"
              alt="Welcome to Calket"
              width={1024}
              height={576}
              priority
              quality={100}
              unoptimized
              sizes="62vw"
              className="h-auto w-full"
            />
          </div>

          <div className="relative min-h-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0">
              <HomeConveyorBanner />
            </div>
          </div>

          <div
            ref={thirdRef}
            className="home-promo-enter home-promo-enter-delay relative min-h-0 overflow-hidden rounded-3xl bg-[#6b3f2a]"
          >
            <Image
              src="/promos/save-today.png"
              alt="How much will you save today?"
              fill
              priority
              quality={100}
              unoptimized
              sizes="39vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className="flex items-center gap-2.5 rounded-full bg-zinc-200/90 px-3.5 py-2.5"
          role="tablist"
          aria-label="Banner slides"
        >
          {[0, 1].map((index) => {
            const isActive = active === index;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={index === 0 ? "Show first banners" : "Show next banner"}
                onClick={() => goTo(index)}
                className={`h-2 w-2 rounded-full transition ${
                  isActive
                    ? "bg-zinc-900"
                    : "bg-zinc-400 hover:bg-zinc-500"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
