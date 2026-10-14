import type React from "react";
import { drawStroke } from "./anim";

// Line icons on a 24×24 grid. Shape data follows Feather Icons (MIT);
// bulb and agent are drawn for this video. Every stroke draws itself
// as `progress` goes 0 → 1.

export type IconName =
  | "cpu"
  | "bulb"
  | "wrench"
  | "eye"
  | "terminal"
  | "zap"
  | "check"
  | "checkCircle"
  | "octagon"
  | "user"
  | "loop"
  | "agent";

type IconProps = {
  readonly name: IconName;
  readonly x?: number;
  readonly y?: number;
  readonly size: number;
  readonly color: string;
  readonly progress?: number;
  readonly strokeWidth?: number;
  readonly style?: React.CSSProperties;
};

export const Icon: React.FC<IconProps> = ({
  name,
  x = 0,
  y = 0,
  size,
  color,
  progress = 1,
  strokeWidth = 2,
  style,
}) => {
  const s = drawStroke(progress);

  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      style={style}
    >
      {name === "cpu" ? (
        <>
          <rect x={4} y={4} width={16} height={16} rx={2} {...s} />
          <rect x={9} y={9} width={6} height={6} {...s} />
          <path
            d="M9 1v3 M15 1v3 M9 20v3 M15 20v3 M20 9h3 M20 14h3 M1 9h3 M1 14h3"
            {...s}
          />
        </>
      ) : null}
      {name === "bulb" ? (
        <>
          <path
            d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"
            {...s}
          />
          <path d="M9.5 21.5h5" {...s} />
        </>
      ) : null}
      {name === "wrench" ? (
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          {...s}
        />
      ) : null}
      {name === "eye" ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...s} />
          <circle cx={12} cy={12} r={3} {...s} />
        </>
      ) : null}
      {name === "terminal" ? <path d="M4 17l6-6-6-6 M12 19h8" {...s} /> : null}
      {name === "zap" ? (
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...s} />
      ) : null}
      {name === "check" ? <path d="M20 6L9 17l-5-5" {...s} /> : null}
      {name === "checkCircle" ? (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" {...s} />
          <path d="M22 4L12 14.01l-3-3" {...s} />
        </>
      ) : null}
      {name === "octagon" ? (
        <>
          <path
            d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"
            {...s}
          />
          <path d="M8 12h8" {...s} />
        </>
      ) : null}
      {name === "user" ? (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...s} />
          <circle cx={12} cy={7} r={4} {...s} />
        </>
      ) : null}
      {name === "loop" ? (
        <>
          <path d="M23 4v6h-6" {...s} />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" {...s} />
        </>
      ) : null}
      {name === "agent" ? (
        <>
          <rect x={4} y={8} width={16} height={12} rx={3} {...s} />
          <path d="M12 8V4.5" {...s} />
          <circle cx={12} cy={3.5} r={1} {...s} />
          <circle cx={9} cy={13} r={1.2} {...s} />
          <circle cx={15} cy={13} r={1.2} {...s} />
          <path d="M10 16.5h4 M2 12.5v3 M22 12.5v3" {...s} />
        </>
      ) : null}
    </svg>
  );
};
