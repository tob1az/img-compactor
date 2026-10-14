import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { SafeZoneGuide } from "./components/SafeZoneGuide";
import { CompoundScene } from "./scenes/CompoundScene";
import { HookScene } from "./scenes/HookScene";
import { LoopScene } from "./scenes/LoopScene";
import { RecapScene } from "./scenes/RecapScene";
import { ToolScene } from "./scenes/ToolScene";

type Props = {
  readonly showSafeZone: boolean;
};

// 168 + 192 + 204 + 192 + 192 = 948 frames, minus four 12-frame fades = 900 (30s).
export const AgentsExplainer: React.FC<Props> = ({ showSafeZone }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="1 · Chatbots vs agents"
          durationInFrames={168}
          premountFor={fps}
        >
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="2 · The loop"
          durationInFrames={192}
          premountFor={fps}
        >
          <LoopScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="3 · Tool calls"
          durationInFrames={204}
          premountFor={fps}
        >
          <ToolScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="4 · Errors compound"
          durationInFrames={192}
          premountFor={fps}
        >
          <CompoundScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 12,
          })}
        />
        <TransitionSeries.Sequence
          name="5 · Recap"
          durationInFrames={192}
          premountFor={fps}
        >
          <RecapScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {showSafeZone ? <SafeZoneGuide /> : null}
    </AbsoluteFill>
  );
};
