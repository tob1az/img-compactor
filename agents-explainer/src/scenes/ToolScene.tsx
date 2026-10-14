import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import {
  arrowHead,
  countUp,
  drawStroke,
  enter,
  popIn,
} from "../components/anim";
import { Icon } from "../components/icons";
import { Accent, Body, Headline } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

// Flow connectors, top to bottom, each drawing itself in turn.
const CONNECTORS = [
  { d: "M 310 95 L 366 95", head: [368, 95, 0], at: 24 },
  { d: "M 650 200 L 650 256", head: [650, 258, 90], at: 60 },
  { d: "M 650 400 L 650 456", head: [650, 458, 90], at: 76 },
  { d: "M 650 670 L 650 848", head: [650, 850, 90], at: 104 },
] as const;

// What piles up in the context window during one loop.
const CONTEXT_SEGMENTS = [
  { label: "Goal", x: 8, w: 170, fill: "rgba(99,102,241,0.35)", at: 112 },
  { label: "Thought", x: 186, w: 200, fill: "rgba(99,102,241,0.55)", at: 122 },
  { label: "Tool call", x: 394, w: 220, fill: "rgba(99,102,241,0.8)", at: 132 },
  { label: "Result", x: 622, w: 200, fill: "rgba(34,197,94,0.75)", at: 142 },
] as const;

const RETURN_AT = 156;

const ToolSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokens = Math.round(countUp(frame, [112, 152], [1200, 4800]) / 10) * 10;
  const back = enter(frame, fps, RETURN_AT, 20);
  const glow = enter(frame, fps, RETURN_AT + 16, 12);

  return (
    <>
      <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }} />
      <Headline name="Headline" premountFor={fps}>
        The model doesn’t run tools. <Accent>It asks.</Accent>
      </Headline>
      <Interactive.Svg
        name="Tool call flowchart"
        width={920}
        height={960}
        viewBox="0 0 920 960"
        overflow="visible"
        style={{ position: "absolute", left: 80, top: 530, fontFamily }}
      >
        {/* LLM */}
        <g style={popIn(enter(frame, fps, 14))}>
          <rect
            x={0}
            y={20}
            width={300}
            height={150}
            rx={28}
            fill={`rgba(99,102,241,${0.12 + 0.25 * glow})`}
            stroke={COLORS.accent}
            strokeWidth={3}
            style={{
              filter: `drop-shadow(0 0 ${28 * glow}px rgba(99,102,241,0.8))`,
            }}
          />
          <Icon
            name="cpu"
            x={30}
            y={55}
            size={80}
            color={COLORS.text}
            strokeWidth={1.6}
            progress={enter(frame, fps, 18, 20)}
          />
          <text
            x={130}
            y={111}
            fontSize={44}
            fontWeight={800}
            fill={COLORS.text}
          >
            LLM
          </text>
        </g>

        {/* Structured tool call */}
        <g style={popIn(enter(frame, fps, 30))}>
          <rect
            x={380}
            y={0}
            width={540}
            height={190}
            rx={24}
            fill="rgba(255,255,255,0.05)"
            stroke={COLORS.faint}
            strokeWidth={2}
          />
          <text
            x={890}
            y={50}
            fontSize={28}
            fontWeight={600}
            letterSpacing={2}
            textAnchor="end"
            fill={COLORS.accent}
          >
            TOOL CALL
          </text>
        </g>
        <text
          x={410}
          y={62}
          fontSize={32}
          fontWeight={600}
          fill={COLORS.muted}
          style={popIn(enter(frame, fps, 34), 12)}
        >
          {"{"}
        </text>
        <text
          x={442}
          y={112}
          fontSize={32}
          fontWeight={600}
          style={popIn(enter(frame, fps, 42), 12)}
        >
          <tspan fill={COLORS.muted}>{'"tool": '}</tspan>
          <tspan fill={COLORS.success}>"run_tests"</tspan>
        </text>
        <text
          x={410}
          y={162}
          fontSize={32}
          fontWeight={600}
          fill={COLORS.muted}
          style={popIn(enter(frame, fps, 50), 12)}
        >
          {"}"}
        </text>

        {/* Runtime executes it */}
        <g style={popIn(enter(frame, fps, 66))}>
          <rect
            x={380}
            y={270}
            width={540}
            height={120}
            rx={24}
            fill="rgba(255,255,255,0.03)"
            stroke={COLORS.faint}
            strokeWidth={2}
          />
          <Icon
            name="zap"
            x={410}
            y={298}
            size={64}
            color={COLORS.accent}
            strokeWidth={1.8}
            progress={enter(frame, fps, 70, 16)}
          />
          <text x={500} y={343} fontSize={36}>
            <tspan fontWeight={600} fill={COLORS.text}>
              Runtime
            </tspan>
            <tspan fontWeight={400} fill={COLORS.muted}>
              {" "}
              runs it
            </tspan>
          </text>
        </g>

        {/* Tool output */}
        <g style={popIn(enter(frame, fps, 82))}>
          <rect
            x={380}
            y={470}
            width={540}
            height={190}
            rx={24}
            fill="#111114"
            stroke={COLORS.faint}
            strokeWidth={2}
          />
          <Icon
            name="terminal"
            x={410}
            y={497}
            size={44}
            color={COLORS.muted}
            strokeWidth={2}
            progress={enter(frame, fps, 86, 14)}
          />
          <text
            x={470}
            y={531}
            fontSize={32}
            fontWeight={400}
            fill={COLORS.muted}
            opacity={enter(frame, fps, 88)}
          >
            $ npm test
          </text>
        </g>
        <text
          x={410}
          y={615}
          fontSize={36}
          style={popIn(enter(frame, fps, 96), 12)}
        >
          <tspan fontWeight={800} fill={COLORS.success}>
            2 passed
          </tspan>
          <tspan fontWeight={600} fill={COLORS.text}>
            {" "}
            · 1 failed
          </tspan>
        </text>

        {CONNECTORS.map((c) => {
          const p = enter(frame, fps, c.at, 12);
          return (
            <g key={c.d}>
              <path
                d={c.d}
                stroke={COLORS.muted}
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                {...drawStroke(p)}
              />
              <path
                d={arrowHead(c.head[0], c.head[1], c.head[2], 14)}
                stroke={COLORS.muted}
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

        {/* Context window = the model's working memory */}
        <g style={popIn(enter(frame, fps, 108), 16)}>
          <text
            x={184}
            y={790}
            fontSize={28}
            fontWeight={600}
            letterSpacing={2}
            fill={COLORS.muted}
          >
            CONTEXT WINDOW
          </text>
          <text
            x={184}
            y={830}
            fontSize={28}
            fontWeight={400}
            fill={COLORS.muted}
          >
            the model’s memory
          </text>
          <text
            x={920}
            y={796}
            textAnchor="end"
            fill={COLORS.text}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <tspan fontSize={40} fontWeight={800}>
              {tokens.toLocaleString("en-US")}
            </tspan>
            <tspan fontSize={28} fontWeight={600} fill={COLORS.muted}>
              {" "}
              tokens
            </tspan>
          </text>
          <text
            x={920}
            y={832}
            fontSize={28}
            fontWeight={400}
            textAnchor="end"
            fill={COLORS.muted}
          >
            example
          </text>
          <rect
            x={0}
            y={860}
            width={920}
            height={84}
            rx={22}
            fill="rgba(255,255,255,0.03)"
            stroke={COLORS.faint}
            strokeWidth={2}
          />
        </g>
        {CONTEXT_SEGMENTS.map((seg) => {
          const p = enter(frame, fps, seg.at, 14);
          return (
            <g key={seg.label}>
              <rect
                x={seg.x}
                y={868}
                width={seg.w * p}
                height={68}
                rx={16}
                fill={seg.fill}
              />
              <text
                x={seg.x + seg.w / 2}
                y={912}
                fontSize={28}
                fontWeight={600}
                textAnchor="middle"
                fill={COLORS.text}
                opacity={interpolate(p, [0.6, 1], [0, 1], {
                  extrapolateLeft: "clamp",
                })}
              >
                {seg.label}
              </text>
            </g>
          );
        })}

        {/* Everything in context goes back to the model on the next turn */}
        <path
          d="M 150 852 L 150 184"
          stroke={COLORS.accent}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          {...drawStroke(back)}
        />
        <path
          d={arrowHead(150, 180, -90, 18)}
          stroke={COLORS.accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={interpolate(back, [0.75, 1], [0, 1], {
            extrapolateLeft: "clamp",
          })}
        />
        <g
          opacity={interpolate(back, [0.4, 1], [0, 1], {
            extrapolateLeft: "clamp",
          })}
        >
          <text
            x={174}
            y={505}
            fontSize={28}
            fontWeight={600}
            fill={COLORS.accent}
          >
            fed back
          </text>
          <text
            x={174}
            y={541}
            fontSize={28}
            fontWeight={600}
            fill={COLORS.accent}
          >
            every turn
          </text>
        </g>
      </Interactive.Svg>
      <Body name="Body" from={10} premountFor={fps}>
        It writes a structured request. The program around it runs the tool and
        feeds the result back into the model’s memory.
      </Body>
    </>
  );
};

const toolSceneSchema = {} as const satisfies InteractivitySchema;

export const ToolScene = Interactive.withSchema({
  Component: ToolSceneInner,
  componentName: "ToolScene",
  schema: toolSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
