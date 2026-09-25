import { Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";
import { BLOCKS, type Block, type Shot } from "./interview";

const FPS = 30;
const TITLE_FRAMES = 5 * FPS;
// Title fades out / first card fades in over this many frames.
const FADE_FRAMES = 10;
// Location change (window -> kitchen): fade to purple and back, 0.33 s.
const LOCATION_FADE_FRAMES = 10;
// Tate sting on the other question changes.
const STING_FRAMES = 8;
// Cross-dissolve inside an answer that skips part of the take.
const DISSOLVE_FRAMES = 8;

// Kusama-inspired palette on a dark purple base (matches the script's
// "coloured dots on a dark purple background" transition title).
export const DOT_COLORS = ["#ff3d5a", "#ffd23f", "#ff6fb5", "#3ec7ff", "#ffffff"];
export const BG_INNER = "#3a1566";
export const BG_OUTER = "#140726";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const shotFrames = (shot: Shot) => Math.round((shot.to - shot.from) * FPS);
const blockFrames = (block: Block) =>
  block.shots.reduce((sum, shot) => sum + shotFrames(shot), 0) -
  DISSOLVE_FRAMES * (block.shots.length - 1);

const DURATION =
  TITLE_FRAMES + BLOCKS.reduce((sum, block) => sum + blockFrames(block), 0);

export const MyComposition = () => {
  return (
    <Composition
      id="ParentInterview"
      component={ParentInterview}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};

export const DotsBackground: React.FC<{
  seed: string;
  intro?: boolean;
  dotsOpacity?: number;
}> = ({ seed, intro = false, dotsOpacity = 1 }) => {
  const frame = useCurrentFrame();
  const dots = new Array(46).fill(true).map((_, i) => ({
    x: random(`${seed}-x-${i}`) * 1920,
    y: random(`${seed}-y-${i}`) * 1080,
    size: 14 + random(`${seed}-s-${i}`) ** 2 * 110,
    color: DOT_COLORS[Math.floor(random(`${seed}-c-${i}`) * DOT_COLORS.length)],
    speed: 0.3 + random(`${seed}-v-${i}`) * 0.7,
    phase: random(`${seed}-p-${i}`) * Math.PI * 2,
    delay: Math.floor(random(`${seed}-d-${i}`) * 40),
  }));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${BG_INNER}, ${BG_OUTER} 75%)`,
        overflow: "hidden",
      }}
    >
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: dot.x - dot.size / 2,
            top:
              dot.y -
              dot.size / 2 +
              Math.sin((frame / FPS) * dot.speed + dot.phase) * 18,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: dot.color,
            opacity: 0.55 * dotsOpacity,
            scale: intro
              ? interpolate(frame, [dot.delay, dot.delay + 14], [0, 1], {
                  ...clamp,
                  easing: Easing.spring({ damping: 10 }),
                })
              : 1,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Location change: a quick fade to the purple dots background and back.
const LocationFade: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [0, 4, LOCATION_FADE_FRAMES - 4, LOCATION_FADE_FRAMES],
          [0, 1, 1, 0],
          clamp,
        ),
      }}
    >
      <DotsBackground seed="location" />
    </AbsoluteFill>
  );
};

// Very short Tate-style sting on a question change: a full-frame colour card
// with a halftone dot pattern and a bold wordmark that pulls in and out of
// focus (a nod to Tate's shifting-focus logo). It cuts in and out on whole
// frames, so nothing underneath shows through.
const STING_COLORS = ["#ff4fa3", "#ffd23f", "#3ec7ff", "#ff3d5a", "#b18cff"];

const TateSting: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: STING_COLORS[index % STING_COLORS.length],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.22) 9px, transparent 10px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `${frame * 6}px 0px`,
        }}
      />
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 210,
          letterSpacing: -6,
          color: "#111111",
          filter: `blur(${interpolate(
            frame,
            [0, 3, STING_FRAMES - 1],
            [16, 0, 10],
            clamp,
          )}px)`,
          scale: interpolate(frame, [0, STING_FRAMES], [0.95, 1.04], clamp),
        }}
      >
        TATE KIDS
      </div>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  // Everything but the plain purple gradient fades out at the end, so the
  // first question card can fade in from the same clean background.
  const fadeOut = interpolate(
    frame,
    [TITLE_FRAMES - FADE_FRAMES, TITLE_FRAMES - 1],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill>
      <DotsBackground seed="title" intro dotsOpacity={fadeOut} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 28,
          fontFamily,
          opacity: fadeOut,
        }}
      >
        <Interactive.Div
          name="Title"
          style={{
            fontWeight: 800,
            fontSize: 140,
            color: "white",
            textShadow: "0 8px 40px rgba(0,0,0,0.45)",
            opacity: interpolate(frame, [12, 30], [0, 1], clamp),
            translate: interpolate(frame, [12, 36], ["0px 60px", "0px 0px"], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Parent Review
        </Interactive.Div>
        <Interactive.Div
          name="Subtitle"
          style={{
            fontWeight: 500,
            fontSize: 52,
            letterSpacing: 4,
            color: "#ffd23f",
            opacity: interpolate(frame, [26, 44], [0, 1], clamp),
            translate: interpolate(frame, [26, 50], ["0px 30px", "0px 0px"], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          A Target Audience Perspective
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ShotVideo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const trimBefore = Math.round(shot.from * FPS);

  return (
    <Video
      src={staticFile(`interview/${shot.clip}.mp4`)}
      trimBefore={trimBefore}
      trimAfter={trimBefore + shotFrames(shot)}
      objectFit="cover"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// Subtitles on the block timeline; each stays until the next one starts.
const blockSubtitles = (block: Block) => {
  let offset = 0;
  return block.shots.flatMap((shot) => {
    const subs = shot.subtitles.map((sub) => ({
      start: offset + Math.round((sub.from - shot.from) * FPS),
      text: sub.text,
    }));
    offset += shotFrames(shot) - DISSOLVE_FRAMES;
    return subs;
  });
};

const BlockView: React.FC<{
  block: Block;
  index: number;
  fadeIn: boolean;
}> = ({ block, index, fadeIn }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = fadeIn
    ? interpolate(frame, [0, FADE_FRAMES], [0, 1], clamp)
    : 1;
  const subtitles = blockSubtitles(block);
  const subtitle = subtitles.filter((s) => s.start <= frame).pop();

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed={block.location} dotsOpacity={enter} />
      <AbsoluteFill style={{ opacity: enter }}>
        <div
          style={{
            position: "absolute",
            left: 170,
            top: 80,
            width: 504,
            height: 920,
            borderRadius: 36,
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            outline: "6px solid rgba(255,255,255,0.9)",
          }}
        >
          <TransitionSeries>
            {block.shots.map((shot, i) => (
              <React.Fragment key={`${shot.clip}-${shot.from}`}>
                {i > 0 ? (
                  <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: DISSOLVE_FRAMES })}
                  />
                ) : null}
                <TransitionSeries.Sequence
                  durationInFrames={shotFrames(shot)}
                  premountFor={fps}
                >
                  <ShotVideo shot={shot} />
                </TransitionSeries.Sequence>
              </React.Fragment>
            ))}
          </TransitionSeries>
        </div>
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 110,
            width: 1040,
            height: 860,
            boxSizing: "border-box",
            padding: "60px 60px 60px 60px",
            borderRadius: 40,
            background: "rgba(20, 7, 38, 0.78)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Interactive.Div
            name="Question counter"
            style={{
              position: "absolute",
              top: 44,
              right: 48,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 2,
              color: "rgba(255, 210, 63, 0.85)",
            }}
          >
            {index + 1}/{BLOCKS.length}
          </Interactive.Div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 28,
              opacity: interpolate(frame, [6, 18], [0, 1], clamp),
              translate: interpolate(frame, [6, 24], ["60px 0px", "0px 0px"], {
                ...clamp,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <Interactive.Div
              name="Question label"
              style={{
                padding: "10px 26px",
                borderRadius: 40,
                background: "#ff3d5a",
                color: "white",
                fontWeight: 800,
                fontSize: 30,
                letterSpacing: 4,
              }}
            >
              QUESTION
            </Interactive.Div>
            <Interactive.Div
              name="Question"
              style={{
                fontWeight: 800,
                fontSize: 60,
                lineHeight: 1.15,
                color: "#ffd23f",
              }}
            >
              {block.question}
            </Interactive.Div>
            <div
              style={{
                width: 120,
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,0.6)",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {subtitle ? (
              <Interactive.Div
                key={subtitle.start}
                name="Answer subtitle"
                style={{
                  fontWeight: 600,
                  fontSize: 54,
                  lineHeight: 1.3,
                  color: "white",
                  textShadow: "0 4px 24px rgba(0,0,0,0.5)",
                  opacity: interpolate(
                    frame,
                    [subtitle.start, subtitle.start + 6],
                    [0, 1],
                    clamp,
                  ),
                  translate: interpolate(
                    frame,
                    [subtitle.start, subtitle.start + 10],
                    ["0px 16px", "0px 0px"],
                    { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
                  ),
                }}
              >
                {subtitle.text}
              </Interactive.Div>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ParentInterview: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TITLE_FRAMES}>
        <TitleCard />
      </TransitionSeries.Sequence>
      {BLOCKS.map((block, i) => {
        const prev = BLOCKS[i - 1];
        return (
          <React.Fragment key={block.id}>
            {prev && prev.location !== block.location ? (
              <TransitionSeries.Overlay durationInFrames={LOCATION_FADE_FRAMES}>
                <LocationFade />
              </TransitionSeries.Overlay>
            ) : null}
            {prev && prev.location === block.location ? (
              <TransitionSeries.Overlay durationInFrames={STING_FRAMES}>
                <TateSting index={i} />
              </TransitionSeries.Overlay>
            ) : null}
            <TransitionSeries.Sequence
              durationInFrames={blockFrames(block)}
              premountFor={fps}
            >
              <BlockView block={block} index={i} fadeIn={i === 0} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};
