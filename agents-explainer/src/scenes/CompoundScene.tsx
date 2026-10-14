import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { countUp, drawStroke, enter, popIn } from "../components/anim";
import { Icon, type IconName } from "../components/icons";
import { Accent, Body, Headline, Strong } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const STEPS = 10;
const PER_STEP = 0.9;
const FIRST_LIGHT = 24;
const LIGHT_GAP = 9;
const SETTLED_AT = FIRST_LIGHT + LIGHT_GAP * STEPS;
const NODE_R = 50;
const ROW_Y = [390, 520];
const COL_X = [100, 280, 460, 640, 820];

// Ten steps snaking left→right, then right→left.
const NODES = new Array(STEPS).fill(true).map((_, i) => {
  const row = i < 5 ? 0 : 1;
  const col = row === 0 ? i : 9 - i;
  return { x: COL_X[col], y: ROW_Y[row] };
});

const LINKS = NODES.slice(0, -1).map((a, i) => {
  const b = NODES[i + 1];
  if (a.y !== b.y) {
    return `M ${a.x + NODE_R} ${a.y} C ${a.x + 110} ${a.y} ${b.x + 110} ${b.y} ${b.x + NODE_R} ${b.y}`;
  }
  const dir = Math.sign(b.x - a.x);
  return `M ${a.x + dir * NODE_R} ${a.y} L ${b.x - dir * NODE_R} ${b.y}`;
});

// Success odds after each lit step: 100, 90, 81, … ≈ 35.
const ODDS_FRAMES = new Array(STEPS + 1)
  .fill(true)
  .map((_, i) => FIRST_LIGHT + LIGHT_GAP * i);
const ODDS_VALUES = ODDS_FRAMES.map((_, i) => 100 * PER_STEP ** i);

const GUARDRAILS: { label: string; icon: IconName; at: number; y: number }[] = [
  { label: "Verify results", icon: "checkCircle", at: 124, y: 690 },
  { label: "Limit steps", icon: "octagon", at: 134, y: 790 },
  { label: "Ask a human", icon: "user", at: 144, y: 890 },
];

const CompoundSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const odds = countUp(frame, ODDS_FRAMES, ODDS_VALUES);
  const settled = enter(frame, fps, SETTLED_AT, 12);
  const oddsColor = interpolateColors(
    settled,
    [0, 1],
    [COLORS.text, COLORS.accent],
  );
  const chain = enter(frame, fps, 12);

  return (
    <>
      <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }} />
      <Headline name="Headline" premountFor={fps}>
        Small errors <Accent>compound.</Accent>
      </Headline>
      <Interactive.Svg
        name="Compounding odds diagram"
        width={920}
        height={980}
        viewBox="0 0 920 980"
        overflow="visible"
        style={{ position: "absolute", left: 80, top: 440, fontFamily }}
      >
        {/* Task success odds */}
        <g style={popIn(enter(frame, fps, 8))}>
          <text
            x={460}
            y={175}
            textAnchor="middle"
            fill={oddsColor}
            style={{
              fontVariantNumeric: "tabular-nums",
              scale: `${1 + 0.06 * Math.sin(Math.PI * settled)}`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            <tspan fontSize={180} fontWeight={800}>
              {Math.round(odds)}
            </tspan>
            <tspan fontSize={100} fontWeight={800}>
              %
            </tspan>
          </text>
          <text
            x={460}
            y={232}
            fontSize={32}
            fontWeight={400}
            textAnchor="middle"
            fill={COLORS.muted}
          >
            chance the whole task succeeds
          </text>
          <rect
            x={160}
            y={262}
            width={600}
            height={20}
            rx={10}
            fill="rgba(255,255,255,0.1)"
          />
          <rect
            x={160}
            y={262}
            width={6 * odds}
            height={20}
            rx={10}
            fill={oddsColor}
          />
        </g>

        {/* Ten 90%-reliable steps */}
        <g style={popIn(chain, 20)}>
          {LINKS.map((d) => (
            <path
              key={d}
              d={d}
              stroke={COLORS.faint}
              strokeWidth={4}
              fill="none"
            />
          ))}
        </g>
        {LINKS.map((d, i) => (
          <path
            key={d}
            d={d}
            stroke={COLORS.accent}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            {...drawStroke(
              enter(frame, fps, FIRST_LIGHT + LIGHT_GAP * i + 3, 8),
            )}
          />
        ))}
        {NODES.map((node, i) => {
          const lit = enter(frame, fps, FIRST_LIGHT + LIGHT_GAP * i, 10);
          return (
            <g key={`${node.x}-${node.y}`} style={popIn(chain, 20)}>
              <g
                style={{
                  scale: `${1 + 0.1 * Math.sin(Math.PI * lit)}`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                  fill={`rgba(99,102,241,${0.9 * lit})`}
                  stroke={interpolateColors(
                    lit,
                    [0, 1],
                    ["rgba(255,255,255,0.25)", COLORS.accent],
                  )}
                  strokeWidth={3}
                />
                <text
                  x={node.x}
                  y={node.y + 10}
                  fontSize={28}
                  fontWeight={600}
                  textAnchor="middle"
                  fill={interpolateColors(
                    lit,
                    [0, 1],
                    [COLORS.muted, COLORS.text],
                  )}
                >
                  90%
                </text>
              </g>
            </g>
          );
        })}

        <text
          x={460}
          y={650}
          fontSize={40}
          fontWeight={600}
          textAnchor="middle"
          fill={COLORS.text}
          style={popIn(enter(frame, fps, SETTLED_AT + 2), 16)}
        >
          <tspan>0.9</tspan>
          <tspan fontSize={28} dy={-18}>
            10
          </tspan>
          <tspan dy={18}> ≈ 0.35</tspan>
        </text>

        {/* Guardrails */}
        {GUARDRAILS.map((g) => {
          const p = enter(frame, fps, g.at);
          return (
            <g
              key={g.label}
              style={{ opacity: p, translate: `${(1 - p) * -60}px 0px` }}
            >
              <rect
                x={110}
                y={g.y}
                width={700}
                height={84}
                rx={42}
                fill="rgba(34,197,94,0.08)"
                stroke={COLORS.success}
                strokeWidth={2.5}
              />
              <Icon
                name={g.icon}
                x={146}
                y={g.y + 20}
                size={44}
                color={COLORS.success}
                strokeWidth={2}
                progress={enter(frame, fps, g.at + 4, 14)}
              />
              <text
                x={214}
                y={g.y + 55}
                fontSize={36}
                fontWeight={600}
                fill={COLORS.text}
              >
                {g.label}
              </text>
            </g>
          );
        })}
      </Interactive.Svg>
      <Body name="Body" from={10} premountFor={fps}>
        If each step is 90% reliable, a 10-step task succeeds only about 35% of
        the time. <Strong>Good agents check their work.</Strong>
      </Body>
    </>
  );
};

const compoundSceneSchema = {} as const satisfies InteractivitySchema;

export const CompoundScene = Interactive.withSchema({
  Component: CompoundSceneInner,
  componentName: "CompoundScene",
  schema: compoundSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
