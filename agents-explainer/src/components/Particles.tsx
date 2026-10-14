import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";
import { enter } from "./anim";

const COUNT = 12;

// Soft circles drifting upward, wrapping from top back to bottom.
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fadeIn = enter(frame, fps, 0, 24);

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <svg width={width} height={height}>
        {new Array(COUNT).fill(true).map((_, i) => {
          const r = 4 + random(`r-${i}`) * 10;
          const speed = 1.2 + random(`v-${i}`) * 2.2;
          const startY = random(`y-${i}`) * height;
          const baseX = 40 + random(`x-${i}`) * (width - 80);
          const phase = random(`p-${i}`) * Math.PI * 2;
          const span = height + 4 * r;
          const y = ((((startY - speed * frame) % span) + span) % span) - 2 * r;
          const x = baseX + 16 * Math.sin(frame / 28 + phase);

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={i % 3 === 0 ? COLORS.text : COLORS.accent}
              opacity={0.15 + random(`o-${i}`) * 0.35}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
