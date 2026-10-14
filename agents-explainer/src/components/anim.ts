import { Easing, interpolate, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Entrance progress 0 → 1. Every entrance uses a damping: 200 spring.
export const enter = (
  frame: number,
  fps: number,
  delay: number,
  durationInFrames = 18,
) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames,
  });

// Props that make an SVG stroke draw itself as `progress` goes 0 → 1.
export const drawStroke = (progress: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
  opacity: progress > 0.001 ? 1 : 0,
});

// Spring-in for an SVG group: fade + lift + slight scale around its own center.
export const popIn = (progress: number, lift = 24) => ({
  opacity: progress,
  translate: `0px ${(1 - progress) * lift}px`,
  scale: `${interpolate(progress, [0, 1], [0.85, 1])}`,
  transformBox: "fill-box" as const,
  transformOrigin: "center",
});

export const countUp = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
) =>
  interpolate(frame, input, output, {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

// Chevron arrowhead with its tip at (x, y), pointing along `angleDeg`.
export const arrowHead = (
  x: number,
  y: number,
  angleDeg: number,
  size = 18,
) => {
  const a = (angleDeg * Math.PI) / 180;
  const spread = (28 * Math.PI) / 180;
  const p1 = [x - size * Math.cos(a - spread), y - size * Math.sin(a - spread)];
  const p2 = [x - size * Math.cos(a + spread), y - size * Math.sin(a + spread)];
  return `M ${p1[0]} ${p1[1]} L ${x} ${y} L ${p2[0]} ${p2[1]}`;
};
