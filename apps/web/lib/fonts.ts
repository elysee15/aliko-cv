import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import type { FontFamily } from "@/lib/schemas/resume";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-resume-inter",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-resume-merriweather",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-resume-jetbrains",
  display: "swap",
});

export const resumeFontVariables = [
  inter.variable,
  merriweather.variable,
  jetbrainsMono.variable,
].join(" ");

export const fontFamilyMap: Record<FontFamily, string> = {
  inter: "var(--font-resume-inter), ui-sans-serif, system-ui, sans-serif",
  merriweather:
    "var(--font-resume-merriweather), ui-serif, Georgia, serif",
  "jetbrains-mono":
    "var(--font-resume-jetbrains), ui-monospace, monospace",
};
