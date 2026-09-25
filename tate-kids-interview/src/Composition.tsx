import { Video } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";
import { BLOCKS, type Block, type Shot } from "./interview";

const FPS = 30;
const TITLE_FRAMES = 5 * FPS;
const STING_FRAMES = 10;

// Kusama-inspired palette on a dark purple base (matches the script's
// "coloured dots on a dark purple background" transition title).
const DOT_COLORS = ["#ff3d5a", "#ffd23f", "#ff6fb5", "#3ec7ff", "#ffffff"];
const BG_INNER = "#3a1566";
const BG_OUTER = "#140726";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const shotFrames = (shot: Shot) => Math.round((shot.to - shot.from) * FPS);
const blockFrames = (block: Block) =>
  block.shots.reduce((sum, shot) => sum + shotFrames(shot), 0);

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

const DotsBackground: React.FC<{ seed: string; intro?: boolean }> = ({
  seed,
  intro = false,
}) => {
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
              Math.sin(frame / FPS * dot.speed + dot.phase) * 18,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: dot.color,
            opacity: 0.55,
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

// Very short Tate-style sting over a cut: a bright colour block with a
// halftone dot pattern and a bold wordmark that pulls in and out of focus
// (a nod to Tate's shifting-focus logo). Fully covers the frame mid-way.
const STING_COLORS = ["#ff4fa3", "#ffd23f", "#3ec7ff", "#ff3d5a", "#b18cff"];

const TateSting: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const color = STING_COLORS[index % STING_COLORS.length];
  const fromLeft = index % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        background: color,
        clipPath: `inset(0 ${interpolate(
          frame,
          [0, 3, STING_FRAMES - 3, STING_FRAMES],
          fromLeft ? [100, 0, 0, 0] : [0, 0, 0, 100],
          { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) },
        )}% 0 ${interpolate(
          frame,
          [0, 3, STING_FRAMES - 3, STING_FRAMES],
          fromLeft ? [0, 0, 0, 100] : [100, 0, 0, 0],
          { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) },
        )}%)`,
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
            [1, 5, STING_FRAMES - 1],
            [18, 0, 12],
            clamp,
          )}px)`,
          scale: interpolate(frame, [0, STING_FRAMES], [0.94, 1.04], clamp),
        }}
      >
        TATE KIDS
      </div>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <DotsBackground seed="title" intro />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 28,
          fontFamily,
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

const ShotView: React.FC<{ shot: Shot; punchIn: boolean }> = ({
  shot,
  punchIn,
}) => {
  const frame = useCurrentFrame();
  const t = shot.from + frame / FPS;
  const subtitle = shot.subtitles.find((s) => t >= s.from && t < s.to);
  const subtitleStart = subtitle
    ? Math.round((subtitle.from - shot.from) * FPS)
    : 0;
  const trimBefore = Math.round(shot.from * FPS);

  return (
    <AbsoluteFill>
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
        <Video
          src={staticFile(`interview/${shot.clip}.mp4`)}
          trimBefore={trimBefore}
          trimAfter={trimBefore + shotFrames(shot)}
          objectFit="cover"
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "50% 30%",
            scale: punchIn ? 1.08 : 1,
          }}
        />
      </div>
      {subtitle ? (
        <Interactive.Div
          name="Answer subtitle"
          style={{
            position: "absolute",
            left: 820,
            width: 920,
            top: 600,
            fontFamily,
            fontWeight: 600,
            fontSize: 54,
            lineHeight: 1.3,
            color: "white",
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            opacity: interpolate(
              frame,
              [subtitleStart, subtitleStart + 6],
              [0, 1],
              clamp,
            ),
            translate: interpolate(
              frame,
              [subtitleStart, subtitleStart + 10],
              ["0px 16px", "0px 0px"],
              { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
            ),
          }}
        >
          {subtitle.text}
        </Interactive.Div>
      ) : null}
    </AbsoluteFill>
  );
};

const BlockView: React.FC<{ block: Block }> = ({ block }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed={block.location} />
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [6, 18], [0, 1], clamp),
          translate: interpolate(frame, [6, 24], ["60px 0px", "0px 0px"], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 760,
            top: 110,
            width: 1040,
            height: 860,
            borderRadius: 40,
            background: "rgba(20, 7, 38, 0.78)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 820,
            top: 170,
            width: 920,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 28,
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
      </AbsoluteFill>
      <Series>
        {block.shots.map((shot, i) => (
          <Series.Sequence
            key={`${shot.clip}-${shot.from}`}
            durationInFrames={shotFrames(shot)}
          >
            <ShotView shot={shot} punchIn={i % 2 === 1} />
          </Series.Sequence>
        ))}
      </Series>
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
      {BLOCKS.map((block, i) => (
        <React.Fragment key={block.id}>
          <TransitionSeries.Overlay durationInFrames={STING_FRAMES}>
            <TateSting index={i} />
          </TransitionSeries.Overlay>
          <TransitionSeries.Sequence
            durationInFrames={blockFrames(block)}
            premountFor={fps}
          >
            <BlockView block={block} />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
  );
};
