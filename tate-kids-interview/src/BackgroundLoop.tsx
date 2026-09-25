// Standalone purple background with floating, twinkling dots, for layering
// graphics and video on top in an editor. Same palette, gradient and dot
// layout as the films. Every motion completes a whole number of cycles over
// the duration, so the video loops seamlessly when repeated.
import React from "react";
import { AbsoluteFill, Composition, random, useCurrentFrame } from "remotion";
import { BG_INNER, BG_OUTER, DOT_COLORS } from "./Composition";

const FPS = 30;
const LOOP_FRAMES = 30 * FPS;
const SEED = "title";

const BackgroundLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / LOOP_FRAMES; // 0..1 over one loop
  const dots = new Array(46).fill(true).map((_, i) => ({
    x: random(`${SEED}-x-${i}`) * 1920,
    y: random(`${SEED}-y-${i}`) * 1080,
    size: 14 + random(`${SEED}-s-${i}`) ** 2 * 110,
    color: DOT_COLORS[Math.floor(random(`${SEED}-c-${i}`) * DOT_COLORS.length)],
    // whole numbers of cycles per loop keep it seamless
    floatCycles: 2 + Math.floor(random(`${SEED}-v-${i}`) * 4),
    twinkleCycles: 3 + Math.floor(random(`${SEED}-t-${i}`) * 8),
    phase: random(`${SEED}-p-${i}`) * Math.PI * 2,
    twinklePhase: random(`${SEED}-q-${i}`) * Math.PI * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${BG_INNER}, ${BG_OUTER} 75%)`,
        overflow: "hidden",
      }}
    >
      {dots.map((dot, i) => {
        const twinkle =
          0.5 +
          0.5 *
            Math.sin(t * Math.PI * 2 * dot.twinkleCycles + dot.twinklePhase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x - dot.size / 2,
              top:
                dot.y -
                dot.size / 2 +
                Math.sin(t * Math.PI * 2 * dot.floatCycles + dot.phase) * 18,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.color,
              opacity: 0.2 + 0.55 * twinkle,
              scale: 0.9 + 0.12 * twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const BackgroundLoopComposition: React.FC = () => (
  <Composition
    id="PurpleDotsBackground"
    component={BackgroundLoop}
    durationInFrames={LOOP_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
