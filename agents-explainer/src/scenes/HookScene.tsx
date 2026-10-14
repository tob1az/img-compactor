import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { arrowHead, drawStroke, enter, popIn } from "../components/anim";
import { Icon } from "../components/icons";
import { Accent, Body, Headline } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

// Agent lane: seven steps snaking right then back left, ending in a check.
const STEP_NODES = [
  { x: 165, y: 600 },
  { x: 365, y: 600 },
  { x: 565, y: 600 },
  { x: 765, y: 600 },
  { x: 765, y: 780 },
  { x: 565, y: 780 },
  { x: 365, y: 780 },
] as const;
const CHECK = { x: 165, y: 780 };
const NODE_R = 34;
const FIRST_STEP = 46;
const STEP_GAP = 10;
const CHECK_AT = FIRST_STEP + STEP_GAP * STEP_NODES.length;

// Segment i leads into node i (segment 0 leaves the prompt pill).
const SEGMENTS = [
  { d: "M 165 504 L 165 566", head: [165, 566, 90] },
  { d: "M 199 600 L 331 600", head: [331, 600, 0] },
  { d: "M 399 600 L 531 600", head: [531, 600, 0] },
  { d: "M 599 600 L 731 600", head: [731, 600, 0] },
  { d: "M 799 600 C 880 600 880 780 799 780", head: [799, 780, 180] },
  { d: "M 731 780 L 599 780", head: [599, 780, 180] },
  { d: "M 531 780 L 399 780", head: [399, 780, 180] },
  { d: "M 331 780 L 203 780", head: [203, 780, 180] },
] as const;

const HookSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chatCard = enter(frame, fps, 8);
  const agentCard = enter(frame, fps, 18);
  // Linear on purpose: the count ticks exactly as each step node lands.
  const steps =
    frame < FIRST_STEP
      ? 0
      : Math.floor(
          interpolate(
            frame,
            [FIRST_STEP, CHECK_AT - STEP_GAP],
            [1, STEP_NODES.length],
            {
              extrapolateRight: "clamp",
            },
          ),
        );
  const check = enter(frame, fps, CHECK_AT);

  return (
    <>
      <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }} />
      <Headline name="Headline" premountFor={fps}>
        Chatbots answer.
        <br />
        <Accent>Agents act.</Accent>
      </Headline>
      <Interactive.Svg
        name="Chatbot vs agent diagram"
        width={920}
        height={880}
        viewBox="0 0 920 880"
        overflow="visible"
        style={{ position: "absolute", left: 80, top: 550, fontFamily }}
      >
        {/* Chatbot lane */}
        <g style={popIn(chatCard, 32)}>
          <rect
            x={0}
            y={0}
            width={920}
            height={270}
            rx={32}
            fill="rgba(255,255,255,0.03)"
            stroke={COLORS.faint}
            strokeWidth={2}
          />
          <text
            x={40}
            y={64}
            fontSize={30}
            fontWeight={600}
            letterSpacing={3}
            fill={COLORS.muted}
          >
            CHATBOT
          </text>
          <text
            x={880}
            y={64}
            fontSize={30}
            fontWeight={600}
            textAnchor="end"
            fill={COLORS.muted}
          >
            1 reply
          </text>
        </g>
        <g style={popIn(enter(frame, fps, 20))}>
          <rect
            x={40}
            y={110}
            width={250}
            height={84}
            rx={42}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={2.5}
          />
          <text
            x={165}
            y={163}
            fontSize={32}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.text}
          >
            Fix my tests
          </text>
        </g>
        <path
          d="M 302 152 L 352 152"
          stroke={COLORS.muted}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          {...drawStroke(enter(frame, fps, 28, 10))}
        />
        <path
          d={arrowHead(354, 152, 0, 14)}
          stroke={COLORS.muted}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={interpolate(enter(frame, fps, 28, 10), [0.7, 1], [0, 1], {
            extrapolateLeft: "clamp",
          })}
        />
        <g style={popIn(enter(frame, fps, 36))}>
          <rect
            x={370}
            y={110}
            width={300}
            height={84}
            rx={42}
            fill="rgba(255,255,255,0.08)"
          />
          <text
            x={520}
            y={163}
            fontSize={32}
            fontWeight={400}
            textAnchor="middle"
            fill={COLORS.text}
          >
            Here’s a tip.
          </text>
        </g>
        <path
          d="M 682 152 L 728 152"
          stroke={COLORS.muted}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          {...drawStroke(enter(frame, fps, 44, 10))}
        />
        <path
          d={arrowHead(730, 152, 0, 14)}
          stroke={COLORS.muted}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={interpolate(enter(frame, fps, 44, 10), [0.7, 1], [0, 1], {
            extrapolateLeft: "clamp",
          })}
        />
        <g style={popIn(enter(frame, fps, 52))}>
          <rect x={750} y={117} width={70} height={70} rx={14} fill="#3f3f46" />
          <text
            x={785}
            y={232}
            fontSize={28}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.muted}
          >
            Stops
          </text>
        </g>

        {/* Agent lane */}
        <g style={popIn(agentCard, 32)}>
          <rect
            x={0}
            y={310}
            width={920}
            height={570}
            rx={32}
            fill="rgba(99,102,241,0.06)"
            stroke="rgba(99,102,241,0.4)"
            strokeWidth={2}
          />
          <text
            x={40}
            y={374}
            fontSize={30}
            fontWeight={600}
            letterSpacing={3}
            fill={COLORS.accent}
          >
            AGENT
          </text>
        </g>
        <text
          x={880}
          y={378}
          textAnchor="end"
          fill={COLORS.text}
          style={{
            ...popIn(agentCard, 32),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <tspan fontSize={44} fontWeight={800}>
            {steps}
          </tspan>
          <tspan fontSize={30} fontWeight={600} fill={COLORS.muted}>
            {" "}
            steps
          </tspan>
        </text>
        <g style={popIn(enter(frame, fps, 30))}>
          <rect
            x={40}
            y={420}
            width={250}
            height={84}
            rx={42}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={2.5}
          />
          <text
            x={165}
            y={473}
            fontSize={32}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.text}
          >
            Fix my tests
          </text>
        </g>
        {SEGMENTS.map((seg, i) => {
          const start = FIRST_STEP - 8 + i * STEP_GAP;
          const p = enter(frame, fps, start, 10);
          return (
            <g key={seg.d}>
              <path
                d={seg.d}
                stroke={COLORS.accent}
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                {...drawStroke(p)}
              />
              <path
                d={arrowHead(seg.head[0], seg.head[1], seg.head[2], 12)}
                stroke={COLORS.accent}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={interpolate(p, [0.7, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                })}
              />
            </g>
          );
        })}
        {STEP_NODES.map((node, i) => (
          <g
            key={`${node.x}-${node.y}`}
            style={popIn(enter(frame, fps, FIRST_STEP + i * STEP_GAP), 0)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill={COLORS.bg}
              stroke={COLORS.accent}
              strokeWidth={3}
            />
            <text
              x={node.x}
              y={node.y + 11}
              fontSize={30}
              fontWeight={600}
              textAnchor="middle"
              fill={COLORS.text}
            >
              {i + 1}
            </text>
          </g>
        ))}
        <g style={popIn(check, 0)}>
          <circle
            cx={CHECK.x}
            cy={CHECK.y}
            r={NODE_R + 4}
            fill="rgba(34,197,94,0.15)"
            stroke={COLORS.success}
            strokeWidth={3}
          />
          <Icon
            name="check"
            x={CHECK.x - 20}
            y={CHECK.y - 20}
            size={40}
            color={COLORS.success}
            strokeWidth={3}
            progress={enter(frame, fps, CHECK_AT + 4, 14)}
          />
          <text
            x={CHECK.x}
            y={CHECK.y + 76}
            fontSize={30}
            fontWeight={600}
            textAnchor="middle"
            fill={COLORS.success}
          >
            Done
          </text>
        </g>
      </Interactive.Svg>
      <Body name="Body" from={10} premountFor={fps}>
        A chatbot replies once and stops. An agent keeps taking steps until the
        job is done.
      </Body>
    </>
  );
};

const hookSceneSchema = {} as const satisfies InteractivitySchema;

export const HookScene = Interactive.withSchema({
  Component: HookSceneInner,
  componentName: "HookScene",
  schema: hookSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
