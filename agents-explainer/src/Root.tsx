import { Composition, Folder } from "remotion";
import { AgentsExplainer } from "./AgentsExplainer";
import { Body, Headline } from "./components/Text";
import { CompoundScene } from "./scenes/CompoundScene";
import { HookScene } from "./scenes/HookScene";
import { LoopScene } from "./scenes/LoopScene";
import { RecapScene } from "./scenes/RecapScene";
import { ToolScene } from "./scenes/ToolScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AgentsExplainer"
        component={AgentsExplainer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ showSafeZone: false }}
      />
      <Folder name="Scenes">
        <Composition
          id="HookScene"
          component={HookScene}
          durationInFrames={168}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="LoopScene"
          component={LoopScene}
          durationInFrames={192}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ToolScene"
          component={ToolScene}
          durationInFrames={204}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="CompoundScene"
          component={CompoundScene}
          durationInFrames={192}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="RecapScene"
          component={RecapScene}
          durationInFrames={192}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Headline"
          component={Headline}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ children: "Chatbots answer. Agents act." }}
        />
        <Composition
          id="Body"
          component={Body}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ children: "A chatbot replies once and stops." }}
        />
      </Folder>
    </>
  );
};
