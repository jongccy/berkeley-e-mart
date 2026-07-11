import { Nunito } from "next/font/google";
import { GeistPixelSquare } from "geist/font/pixel";

/** Readable UI body/UI text */
export const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

/** Bubbly brand moments (nav, hero headings) — matches logo personality */
export const geistPixel = GeistPixelSquare;
