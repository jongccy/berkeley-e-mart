"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeConveyorBanner } from "@/components/HomeConveyorBanner";

/**
 * Mobile carousel:
 *   Slide 1 — welcome banner alone
 *   Slide 2 — conveyor + save-today side by side
 * Desktop — original left+middle / third scroll layout
 */
export function HomePromoBanners() {
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const thirdRef = useRef<HTMLDivElement>(null);
  const [mobileActive, setMobileActive] = useState(0);
  const [desktopActive, setDesktopActive] = useState(0);

  const goToMobile = useCallback((index: number) => {
    const scroller = mobileScrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: index * scroller.clientWidth,
      behavior: "smooth",
    });
    setMobileActive(index);
  }, []);

  const goToDesktop = useCallback((index: number) => {
    const scroller = desktopScrollerRef.current;
    if (!scroller) return;

    if (index === 0) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      setDesktopActive(0);
      return;
    }

    const third = thirdRef.current;
    const track = third?.parentElement;
    if (!third || !track) return;

    scroller.scrollTo({
      left: third.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
    setDesktopActive(1);
  }, []);

  useEffect(() => {
    const scroller = mobileScrollerRef.current;
    if (!scroller) return;

    function updateActive() {
      if (!scroller) return;
      const width = scroller.clientWidth || 1;
      setMobileActive(Math.round(scroller.scrollLeft / width));
    }

    scroller.addEventListener("scroll", updateActive, { passive: true });
    return () => scroller.removeEventListener("scroll", updateActive);
  }, []);

  useEffect(() => {
    const scroller = desktopScrollerRef.current;
    if (!scroller) return;

    function updateActive() {
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) {
        setDesktopActive(0);
        return;
      }
      setDesktopActive(scroller.scrollLeft > max * 0.4 ? 1 : 0);
    }

    scroller.addEventListener("scroll", updateActive, { passive: true });
    return () => scroller.removeEventListener("scroll", updateActive);
  }, []);

  return (
    <section aria-label="Featured promotions" className="space-y-4">
      {/* Mobile carousel */}
      <div className="md:hidden">
        <div
          ref={mobileScrollerRef}
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-full min-w-full shrink-0 snap-start px-4">
            <div className="home-promo-enter relative aspect-[1024/576] overflow-hidden rounded-3xl bg-[#003262]">
              <Image
                src="/promos/welcome-calket.jpg"
                alt="Welcome to Calket"
                fill
                priority
                quality={100}
                unoptimized
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="w-full min-w-full shrink-0 snap-start px-4">
            <div className="grid aspect-[1024/576] grid-cols-2 gap-3">
              <div className="relative min-h-0 overflow-hidden rounded-3xl">
                <div className="absolute inset-0">
                  <HomeConveyorBanner compact />
                </div>
              </div>
              <div
                className="home-promo-enter home-promo-enter-delay flex min-h-0 flex-col justify-center overflow-hidden rounded-3xl bg-[#864200] px-3 py-3"
                aria-label="How much will you save today?"
              >
                <p className="text-[clamp(0.95rem,5vw,1.35rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-white">
                  How much
                  <br />
                  will you
                  <br />
                  save
                  <br />
                  today?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div
            className="flex items-center gap-2.5 rounded-full bg-zinc-200/90 px-3.5 py-2.5"
            role="tablist"
            aria-label="Banner slides"
          >
            {[0, 1].map((index) => {
              const isActive = mobileActive === index;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={
                    index === 0
                      ? "Show welcome banner"
                      : "Show promo banners"
                  }
                  onClick={() => goToMobile(index)}
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
      </div>

      {/* Desktop: original scroll carousel */}
      <div className="hidden md:block">
        <div
          ref={desktopScrollerRef}
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
              className="home-promo-enter home-promo-enter-delay relative min-h-0 overflow-hidden rounded-3xl bg-[#864200]"
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

        <div className="mt-4 flex justify-center">
          <div
            className="flex items-center gap-2.5 rounded-full bg-zinc-200/90 px-3.5 py-2.5"
            role="tablist"
            aria-label="Banner slides"
          >
            {[0, 1].map((index) => {
              const isActive = desktopActive === index;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={
                    index === 0 ? "Show first banners" : "Show next banner"
                  }
                  onClick={() => goToDesktop(index)}
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
      </div>
    </section>
  );
}
