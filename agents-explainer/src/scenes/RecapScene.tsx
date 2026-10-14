import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { enter, popIn } from "../components/anim";
import { Icon, type IconName } from "../components/icons";
import { Particles } from "../components/Particles";
import { Accent, Body, Headline } from "../components/Text";
import { COLORS, fontFamily } from "../theme";

const TILES: { label: string; icon: IconName; x: number; at: number }[] = [
  { label: "LLM", icon: "cpu", x: 0, at: 16 },
  { label: "Tools", icon: "wrench", x: 335, at: 28 },
  { label: "Loop", icon: "loop", x: 670, at: 40 },
];
const TILE_W = 250;
const PLUS = [
  { x: 292, at: 22 },
  { x: 627, at: 34 },
];
const EQUALS_AT = 54;
const AGENT_AT = 62;

const RecapSceneInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const agent = enter(frame, fps, AGENT_AT, 36);
  const agentGlow = enter(frame, fps, AGENT_AT + 30, 24);

  return (
    <>
      <AbsoluteFill name="Background" style={{ backgroundColor: "#0a0a0a" }} />
      <Particles />
      <Headline name="Headline" premountFor={fps}>
        Agent =
        <br />
        <Accent>LLM</Accent> + <Accent>Tools</Accent> + <Accent>Loop</Accent>
      </Headline>
      <Interactive.Svg
        name="Agent recipe"
        width={920}
        height={900}
        viewBox="0 0 920 900"
        overflow="visible"
        style={{ position: "absolute", left: 80, top: 560, fontFamily }}
      >
        {TILES.map((tile) => (
          <g key={tile.label} style={popIn(enter(frame, fps, tile.at), 40)}>
            <rect
              x={tile.x}
              y={0}
              width={TILE_W}
              height={260}
              rx={32}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(99,102,241,0.5)"
              strokeWidth={2.5}
            />
            <Icon
              name={tile.icon}
              x={tile.x + 70}
              y={40}
              size={110}
              color={COLORS.accent}
              strokeWidth={1.6}
              progress={enter(frame, fps, tile.at + 4, 20)}
            />
            <text
              x={tile.x + TILE_W / 2}
              y={222}
              fontSize={40}
              fontWeight={800}
              textAnchor="middle"
              fill={COLORS.text}
            >
              {tile.label}
            </text>
          </g>
        ))}
        {PLUS.map((plus) => (
          <text
            key={plus.x}
            x={plus.x}
            y={152}
            fontSize={64}
            fontWeight={800}
            textAnchor="middle"
            fill={COLORS.accent}
            style={popIn(enter(frame, fps, plus.at), 0)}
          >
            +
          </text>
        ))}
        <text
          x={460}
          y={400}
          fontSize={96}
          fontWeight={800}
          textAnchor="middle"
          fill={COLORS.accent}
          style={popIn(enter(frame, fps, EQUALS_AT), 0)}
        >
          =
        </text>
        <g
          style={{
            opacity: enter(frame, fps, AGENT_AT, 10),
            filter: `drop-shadow(0 0 ${36 * agentGlow}px rgba(34,197,94,0.7))`,
          }}
        >
          <Icon
            name="agent"
            x={330}
            y={450}
            size={260}
            color={COLORS.success}
            strokeWidth={1.4}
            progress={agent}
          />
        </g>
        <text
          x={460}
          y={790}
          fontSize={48}
          fontWeight={800}
          textAnchor="middle"
          fill={COLORS.success}
          style={popIn(enter(frame, fps, AGENT_AT + 24), 16)}
        >
          AI Agent
        </text>
      </Interactive.Svg>
      <Body name="Body" from={10} premountFor={fps}>
        A brain that decides, tools that act, and a loop that keeps going until
        the goal is met.
      </Body>
    </>
  );
};

const recapSceneSchema = {} as const satisfies InteractivitySchema;

export const RecapScene = Interactive.withSchema({
  Component: RecapSceneInner,
  componentName: "RecapScene",
  schema: recapSceneSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});
