import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

export const COLORS = {
  bg: "#0a0a0a",
  text: "#ffffff",
  accent: "#6366f1",
  success: "#22c55e",
  muted: "rgba(255, 255, 255, 0.6)",
  faint: "rgba(255, 255, 255, 0.14)",
} as const;

// Platform UI overlaps these areas on vertical video.
export const SAFE_ZONE = { top: 150, bottom: 170, side: 60 } as const;
