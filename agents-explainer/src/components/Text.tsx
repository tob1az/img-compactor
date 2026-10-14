import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { fontFamily } from "../theme";

type TextProps = {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
};

// Scene headline, pinned below the 150px top safe zone.
const HeadlineInner: React.FC<TextProps> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Interactive.Div
      name="Headline text"
      style={{
        position: "absolute",
        top: 200,
        left: 80,
        right: 80,
        fontFamily,
        fontSize: 84,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        color: "#ffffff",
        opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
          easing: Easing.spring({ damping: 200 }),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.6 * fps], ["0px 48px", "0px 0px"], {
          easing: Easing.spring({ damping: 200 }),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      {children}
    </Interactive.Div>
  );
};

// Explanation text, anchored above the 170px bottom safe zone.
const BodyInner: React.FC<TextProps> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Interactive.Div
      name="Body text"
      style={{
        position: "absolute",
        bottom: 200,
        left: 80,
        right: 80,
        fontFamily,
        fontSize: 44,
        fontWeight: 400,
        lineHeight: 1.3,
        color: "rgba(255, 255, 255, 0.78)",
        opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
          easing: Easing.spring({ damping: 200 }),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.6 * fps], ["0px 32px", "0px 0px"], {
          easing: Easing.spring({ damping: 200 }),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        ...style,
      }}
    >
      {children}
    </Interactive.Div>
  );
};

const textSchema = {
  ...Interactive.childrenSchema,
} as const satisfies InteractivitySchema;

export const Headline = Interactive.withSchema({
  Component: HeadlineInner,
  componentName: "Headline",
  schema: textSchema,
  wrapInSequence: true,
});

export const Body = Interactive.withSchema({
  Component: BodyInner,
  componentName: "Body",
  schema: textSchema,
  wrapInSequence: true,
});

// Inline emphasis inside a Headline or Body.
export const Accent: React.FC<{
  readonly children: React.ReactNode;
  readonly color?: string;
}> = ({ children, color = "#6366f1" }) => (
  <span style={{ color, fontWeight: "inherit" }}>{children}</span>
);

export const Strong: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => <span style={{ color: "#ffffff", fontWeight: 600 }}>{children}</span>;

// Text-sized arrow; Inter's "→" glyph sits too small next to an 84px headline.
export const Arrow: React.FC = () => (
  <svg
    viewBox="0 0 32 20"
    style={{
      width: "0.72em",
      height: "0.45em",
      margin: "0 0.14em",
      verticalAlign: "0.1em",
      overflow: "visible",
    }}
  >
    <path
      d="M2 10H29 M21 2.5L29 10L21 17.5"
      fill="none"
      stroke="#6366f1"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
