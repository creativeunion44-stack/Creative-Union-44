// Titles are the voice of the essay: white with a soft shadow, a few words
// at a time. "big" lines (questions) use Oswald caps; details use Rubik.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { BODY, HEADING } from "./fonts";
import { clamp, CREAM, SIDE } from "./theme";

const SHADOW = "0 4px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.6)";

export const Caption: React.FC<{
  text: string;
  // frames, relative to the enclosing Sequence
  from: number;
  to: number;
  big?: boolean;
  size?: number;
  top?: number;
  align?: "left" | "center";
  color?: string;
}> = ({
  text,
  from,
  to,
  big = false,
  size,
  top,
  align = "left",
  color = CREAM,
}) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame > to + 1) return null;
  const inP = interpolate(frame, [from, from + 10], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const outP = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const words = text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        left: SIDE,
        right: SIDE,
        top: top ?? 1150,
        textAlign: align,
        fontFamily: big ? HEADING : BODY,
        fontWeight: big ? 700 : 500,
        fontSize: size ?? (big ? 104 : 62),
        lineHeight: big ? 1.05 : 1.25,
        textTransform: big ? "uppercase" : "none",
        color,
        textShadow: SHADOW,
        opacity: outP,
      }}
    >
      {words.map((w, i) => {
        const p = interpolate(
          inP * (words.length + 3) - i,
          [0, 3],
          [0, 1],
          clamp,
        );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              translate: `0px ${(1 - p) * 30}px`,
              filter: `blur(${(1 - p) * 8}px)`,
              whiteSpace: "pre",
            }}
          >
            {w + (i < words.length - 1 ? " " : "")}
          </span>
        );
      })}
    </div>
  );
};
