import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { arrowHead, drawStroke, enter, popIn } from "../components/anim";
import { Icon, type IconName } from "../components/icons";
import { Accent, Arrow, Body, Headline, Strong } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const CX = 460;
const CY = 480;
const R = 300;
const NODE_R = 78;
// Angular half-width each node covers on the ring, plus breathing room.
const GAP_DEG = 21;

const onRing = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
};

const NODES: {
  label: string;
  icon: IconName;
  deg: number;
  enterAt: number;
  labelDy: number;
}[] = [
  {
    label: "Think",
    icon: "bulb",
    deg: -90,
    enterAt: 10,
    labelDy: -NODE_R - 26,
  },
  { label: "Act", icon: "wrench", deg: 30, enterAt: 26, labelDy: NODE_R + 52 },
  {
    label: "Observe",
    icon: "eye",
    deg: 150,
    enterAt: 42,
    labelDy: NODE_R + 52,
  },
];

// Clockwise arcs between consecutive nodes.
const ARCS = NODES.map((node, i) => {
  const from = node.deg + GAP_DEG;
  const to = node.deg + 120 - GAP_DEG;
  const p1 = onRing(from);
  const p2 = onRing(to);
  return {
    d: `M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`,
    head: arrowHead(p2.x, p2.y, to + 90, 20),
    enterAt: 18 + i * 16,
  };
});

const ORBIT_KEYS = [56, 88, 120, 152];
const DONE_AT = 152;

const LoopSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The dot circles the loop three times, easing in and out of "Think".
  const angle = interpolate(frame, ORBIT_KEYS, [-90, 270, 630, 990], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dot = onRing(angle);
  const dotIn = enter(frame, fps, 50, 10);
  const loop = Math.min(3, 1 + Math.floor((angle + 90) / 360));
  const observePasses = angle >= 150 ? Math.floor((angle - 150) / 360) + 1 : 0;
  const failing = Math.max(0, 3 - observePasses);
  const done = enter(frame, fps, DONE_AT, 12);
  const counters = enter(frame, fps, 34);

  return (
    <>
      <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }} />
      <Headline name="Headline" premountFor={fps}>
        Think <Arrow /> Act <Arrow /> Observe. <Accent>Repeat.</Accent>
      </Headline>
      <Interactive.Svg
        name="Agent loop diagram"
        width={920}
        height={1000}
        viewBox="0 0 920 1000"
        overflow="visible"
        style={{ position: "absolute", left: 80, top: 550, fontFamily }}
      >
        {ARCS.map((arc) => {
          const p = enter(frame, fps, arc.enterAt, 16);
          return (
            <g key={arc.d}>
              <path
                d={arc.d}
                stroke={COLORS.accent}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                {...drawStroke(p)}
              />
              <path
                d={arc.head}
                stroke={COLORS.accent}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={interpolate(p, [0.75, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                })}
              />
            </g>
          );
        })}

        {NODES.map((node) => {
          const pos = onRing(node.deg);
          const p = enter(frame, fps, node.enterAt);
          const dist = Math.abs(
            ((((angle - node.deg) % 360) + 540) % 360) - 180,
          );
          const pulse =
            dotIn *
            interpolate(dist, [0, 35], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          return (
            <g key={node.label} style={popIn(p, 0)}>
              <g
                style={{
                  scale: `${1 + 0.08 * pulse}`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_R}
                  fill={`rgba(99,102,241,${0.12 + 0.5 * pulse})`}
                  stroke={COLORS.accent}
                  strokeWidth={4}
                />
                <Icon
                  name={node.icon}
                  x={pos.x - 32}
                  y={pos.y - 32}
                  size={64}
                  color={COLORS.text}
                  strokeWidth={1.8}
                  progress={enter(frame, fps, node.enterAt + 4, 20)}
                />
              </g>
              <text
                x={pos.x}
                y={pos.y + node.labelDy}
                fontSize={36}
                fontWeight={600}
                textAnchor="middle"
                fill={COLORS.text}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Goal and live counters in the middle of the ring */}
        <g style={popIn(enter(frame, fps, 20))}>
          <text
            x={CX}
            y={390}
            fontSize={28}
            fontWeight={600}
            letterSpacing={3}
            textAnchor="middle"
            fill={COLORS.accent}
          >
            GOAL
          </text>
          <text
            x={CX}
            y={446}
            fontSize={40}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.text}
          >
            Fix the failing tests
          </text>
        </g>
        <g style={{ ...popIn(counters), fontVariantNumeric: "tabular-nums" }}>
          <text
            x={370}
            y={548}
            fontSize={64}
            fontWeight={800}
            textAnchor="middle"
            fill={COLORS.text}
          >
            {loop}
          </text>
          <text
            x={370}
            y={588}
            fontSize={28}
            fontWeight={600}
            letterSpacing={2}
            textAnchor="middle"
            fill={COLORS.muted}
          >
            LOOP
          </text>
          <text
            x={550}
            y={548}
            fontSize={64}
            fontWeight={800}
            textAnchor="middle"
            fill={failing === 0 ? COLORS.success : COLORS.text}
          >
            {failing}
          </text>
          <text
            x={550}
            y={588}
            fontSize={28}
            fontWeight={600}
            letterSpacing={2}
            textAnchor="middle"
            fill={failing === 0 ? COLORS.success : COLORS.muted}
          >
            FAILING
          </text>
        </g>

        {/* Travelling "attention" dot, handing off to the exit arrow */}
        <g opacity={dotIn * (1 - done)}>
          <circle
            cx={dot.x}
            cy={dot.y}
            r={30}
            fill={COLORS.accent}
            opacity={0.3}
          />
          <circle cx={dot.x} cy={dot.y} r={14} fill={COLORS.text} />
        </g>

        {/* Exit once the tests pass */}
        <path
          d="M 546 180 L 604 180"
          stroke={COLORS.success}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          {...drawStroke(done)}
        />
        <path
          d={arrowHead(606, 180, 0, 16)}
          stroke={COLORS.success}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={interpolate(done, [0.7, 1], [0, 1], {
            extrapolateLeft: "clamp",
          })}
        />
        <g style={popIn(enter(frame, fps, DONE_AT + 6), 0)}>
          <rect
            x={620}
            y={140}
            width={250}
            height={80}
            rx={40}
            fill="rgba(34,197,94,0.15)"
            stroke={COLORS.success}
            strokeWidth={3}
          />
          <text
            x={668}
            y={193}
            fontSize={36}
            fontWeight={800}
            fill={COLORS.success}
          >
            Done
          </text>
          <Icon
            name="check"
            x={790}
            y={160}
            size={40}
            color={COLORS.success}
            strokeWidth={3}
            progress={enter(frame, fps, DONE_AT + 10, 12)}
          />
        </g>
      </Interactive.Svg>
      <Body name="Body" from={10} premountFor={fps}>
        The AI model plans a step, uses a tool, reads the result, then decides
        again. Researchers call this the <Strong>ReAct loop</Strong>.
      </Body>
    </>
  );
};

const loopSceneSchema = {} as const satisfies InteractivitySchema;

export const LoopScene = Interactive.withSchema({
  Component: LoopSceneInner,
  componentName: "LoopScene",
  schema: loopSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
