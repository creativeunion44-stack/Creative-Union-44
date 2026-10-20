// Looks that sit on top of the illustrations: a warm 1980s tape/film look
// for the past and a cold, slightly noisy night look for today.
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { BODY } from "./fonts";

const Grain: React.FC<{ opacity: number; id: string }> = ({ opacity, id }) => {
  const frame = useCurrentFrame();
  const seed = frame % 12;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 540 960"
        preserveAspectRatio="none"
      >
        <filter id={`${id}-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="540" height="960" filter={`url(#${id}-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ strength: number }> = ({ strength }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// Warm 1980s look: gate weave, tape grade, scanlines, grain, a tracking
// band that drifts down, and an on-screen "PLAY" display.
export const RetroLook: React.FC<{
  children: React.ReactNode;
  osd?: string;
  seed?: string;
}> = ({ children, osd, seed = "retro" }) => {
  const frame = useCurrentFrame();
  const weaveX = (random(`${seed}-wx-${Math.floor(frame / 2)}`) - 0.5) * 3;
  const weaveY = (random(`${seed}-wy-${Math.floor(frame / 2)}`) - 0.5) * 3;
  const flicker = 0.96 + random(`${seed}-f-${frame}`) * 0.06;
  const bandY = ((frame * 9) % 2400) - 240;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#120a05" }}>
      <AbsoluteFill
        style={{
          translate: `${weaveX}px ${weaveY}px`,
          scale: 1.01,
          filter: `sepia(0.35) saturate(1.15) contrast(1.05) brightness(${flicker})`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,170,80,0.10), rgba(180,70,30,0.12))",
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandY,
          height: 70,
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), rgba(255,255,255,0.03), transparent)",
          filter: "blur(2px)",
        }}
      />
      <Grain opacity={0.35} id={`${seed}-grain`} />
      <Vignette strength={0.7} />
      {osd ? (
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 120,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.85)",
            textShadow: "3px 0 rgba(255,0,60,0.6), -3px 0 rgba(0,200,255,0.5)",
          }}
        >
          {osd}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Cold night look for today: blue grade, light noise, deep vignette.
export const NightLook: React.FC<{
  children: React.ReactNode;
  seed?: string;
}> = ({ children, seed = "night" }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#05070f" }}>
    <AbsoluteFill style={{ filter: "saturate(0.95) contrast(1.05)" }}>
      {children}
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(40,70,160,0.12), rgba(5,8,20,0.2))",
        mixBlendMode: "soft-light",
      }}
    />
    <Grain opacity={0.18} id={`${seed}-grain`} />
    <Vignette strength={0.75} />
  </AbsoluteFill>
);

// Tape rewind between today and 1983: horizontal tearing, noise, a white
// flash. `progress` runs 0..1 over the transition.
export const RewindGlitch: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const strength = Math.sin(progress * Math.PI);
  if (strength <= 0.01) return null;
  const bars = new Array(14).fill(true).map((_, i) => ({
    y: random(`rw-y-${i}-${frame}`) * 1920,
    h: 10 + random(`rw-h-${i}-${frame}`) * 70,
    x: (random(`rw-x-${i}-${frame}`) - 0.5) * 260 * strength,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: 1080,
            height: b.h,
            background:
              i % 3 === 0 ? "rgba(255,255,255,0.55)" : "rgba(120,160,255,0.25)",
            mixBlendMode: "screen",
            opacity: strength,
          }}
        />
      ))}
      <Grain opacity={0.6 * strength} id="rewind-grain" />
      <AbsoluteFill
        style={{
          background: "white",
          opacity: Math.max(0, 1 - Math.abs(progress - 0.5) * 8) * 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 120,
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 48,
          letterSpacing: 4,
          color: "white",
          opacity: strength,
        }}
      >
        ◀◀ REW
      </div>
    </AbsoluteFill>
  );
};
