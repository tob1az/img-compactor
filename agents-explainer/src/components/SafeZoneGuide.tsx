import { AbsoluteFill } from "remotion";
import { SAFE_ZONE } from "../theme";

// Preview-only overlay that outlines the platform-UI-free area.
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: SAFE_ZONE.top,
        bottom: SAFE_ZONE.bottom,
        left: SAFE_ZONE.side,
        right: SAFE_ZONE.side,
        border: "3px dashed rgba(255, 64, 129, 0.9)",
      }}
    />
  </AbsoluteFill>
);
