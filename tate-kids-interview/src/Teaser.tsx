// Unit 10 teaser (20–30 s) promoting the Unit 1 audiovisual analysis
// "Tate Kids — Full Breakdown". Re-uses footage, audio and graphics from
// the analysis: presenter hook, channel browse, episode shots, the Kusama
// portrait and the parent interview.
//
// Sound: presenter line -> music bed (intro of Tate's Kusama film) that
// ducks under the parent's soundbites -> music fades before the end card.
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { clamp, DotsBackground } from "./Composition";
import { fontFamily } from "./fonts";
import {
  type Clip,
  CroppedVideo,
  DOT_WIPE_FRAMES,
  DotWipe,
  Frame,
  HOOK,
  KUSAMA_EP_CROP,
  MILDRED,
  MUSIC_SRC,
  Pill,
  PORTRAIT,
  sec,
  TitleScene,
} from "./Segments";

const FPS = 30;

// ---------- clips ----------

const HOOK_LINE: Clip = {
  ...HOOK,
  to: 2.95,
  captions: [
    { from: 0.1, text: "The Tate Britain is probably already on your radar." },
  ],
};

const CHANNEL: Clip = {
  src: "footage/channel-a.mp4",
  srcW: 1880,
  srcH: 734,
  crop: { x: 0, y: 0, w: 1880, h: 734 },
  from: 0,
  to: 3,
};

const QUICK_CUTS: { clip: Clip; word: string; color: string }[] = [
  {
    clip: { ...MILDRED, from: 6.0, to: 7.0 },
    word: "COLLAGE",
    color: "#ff3d5a",
  },
  {
    clip: {
      src: "footage/kusama-episode.mp4",
      srcW: 1174,
      srcH: 618,
      crop: KUSAMA_EP_CROP,
      from: 1.0,
      to: 2.0,
    },
    word: "DOTS",
    color: "#ffd23f",
  },
  {
    clip: {
      src: "footage/kusama-episode.mp4",
      srcW: 1174,
      srcH: 618,
      crop: KUSAMA_EP_CROP,
      from: 18.5,
      to: 19.5,
    },
    word: "COLOUR",
    color: "#3ec7ff",
  },
  {
    clip: { ...CHANNEL, from: 12.0, to: 13.0 },
    word: "CRAFT",
    color: "#ff6fb5",
  },
];

const MOM_SRC = {
  // Original audio, +8 dB static gain so the soundbites sit level with the rest.
  src: "footage/mom-12-20-09-teaser.mp4",
  srcW: 464,
  srcH: 848,
  crop: { x: 0, y: 0, w: 464, h: 848 },
};
const MOM_CLIPS: (Clip & { line: string })[] = [
  { ...MOM_SRC, from: 5.5, to: 6.9, line: "Yes, of course." },
  { ...MOM_SRC, from: 11.2, to: 14.5, line: "It's very useful for children." },
  { ...MOM_SRC, from: 24.45, to: 25.75, line: "So it's good." },
];
const MOM_DISSOLVE = 6;

// ---------- timeline (frames) ----------

const A_END = sec(2.85); // presenter hook
const B1_END = A_END + sec(3); // channel
const B2_END = B1_END + QUICK_CUTS.length * FPS; // four 1 s cuts
const B3_END = B2_END + sec(2.5); // Kusama portrait
const Q_FRAMES = FPS; // "But does it work?"
const MOM_FRAMES =
  MOM_CLIPS.reduce((s, c) => s + sec(c.to - c.from), 0) -
  MOM_DISSOLVE * (MOM_CLIPS.length - 1);
const C_START = B3_END + Q_FRAMES + MOM_FRAMES;
const END_CARD = 100;
export const TEASER_FRAMES = C_START + END_CARD;

// Music: starts after the presenter's line, ducks under the parent,
// and is faded out before Kusama starts speaking in the source film.
const MUSIC_FROM = sec(1.35);
const MUSIC_END = A_END + sec(20.4 - 1.35) - 6;
const MOM_START = B3_END + Q_FRAMES;

const MusicBed: React.FC = () => (
  <Sequence from={A_END} durationInFrames={MUSIC_END - A_END}>
    <Audio
      src={staticFile(MUSIC_SRC)}
      trimBefore={MUSIC_FROM}
      trimAfter={MUSIC_FROM + (MUSIC_END - A_END)}
      volume={(f) => {
        const t = f + A_END;
        return interpolate(
          t,
          [
            A_END,
            A_END + 6,
            MOM_START - 8,
            MOM_START,
            C_START,
            C_START + 10,
            MUSIC_END - 24,
            MUSIC_END,
          ],
          [0, 0.8, 0.8, 0.12, 0.12, 0.7, 0.7, 0],
          clamp,
        );
      }}
    />
  </Sequence>
);

// ---------- scenes ----------

const BigWord: React.FC<{
  children: React.ReactNode;
  start: number;
  color?: string;
  size?: number;
  rotate?: number;
}> = ({ children, start, color = "#ffd23f", size = 110, rotate = -3 }) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Teaser word"
      style={{
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: -1,
        textShadow: "8px 8px 0 #140726",
        rotate: `${rotate}deg`,
        scale: interpolate(frame, [start, start + 8], [0, 1], {
          ...clamp,
          easing: Easing.spring({ damping: 9 }),
        }),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

const HookShot: React.FC = () => {
  const frame = useCurrentFrame();
  const w = 1640;
  const h = Math.round(w * (HOOK.crop.h / HOOK.crop.w));
  const caption = HOOK_LINE.captions?.[0]?.text;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="teaser-hook" />
      <Frame
        width={w}
        height={h}
        style={{
          left: (1920 - w) / 2,
          top: 60,
          scale: interpolate(frame, [0, A_END], [1.04, 1], clamp),
        }}
      >
        <CroppedVideo clip={HOOK_LINE} width={w} height={h} />
      </Frame>
      <div
        style={{
          position: "absolute",
          top: 60 + h + 36,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "14px 34px",
            borderRadius: 24,
            background: "rgba(20, 7, 38, 0.82)",
            color: "white",
            fontWeight: 600,
            fontSize: 50,
            opacity: interpolate(frame, [2, 8], [0, 1], clamp),
          }}
        >
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ChannelShot: React.FC = () => {
  const frame = useCurrentFrame();
  const w = 1340;
  const h = Math.round(w / 2.56);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="teaser-channel" />
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 70,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <BigWord start={4} color="white" size={92} rotate={0}>
          Tate made a channel
        </BigWord>
        <BigWord start={14} size={112} rotate={-3}>
          just for kids.
        </BigWord>
      </div>
      <div
        style={{
          position: "absolute",
          left: 430,
          top: 390,
          width: w,
          height: h,
          perspective: 1600,
        }}
      >
        <Frame
          width={w}
          height={h}
          style={{
            rotate: `y ${interpolate(frame, [0, 90], [-14, -4], clamp)}deg`,
            scale: interpolate(frame, [0, 90], [0.96, 1.02], clamp),
          }}
        >
          <CroppedVideo clip={CHANNEL} width={w} height={h} muted />
        </Frame>
      </div>
    </AbsoluteFill>
  );
};

const QuickCut: React.FC<{ clip: Clip; word: string; color: string }> = ({
  clip,
  word,
  color,
}) => {
  const frame = useCurrentFrame();
  const w = 1560;
  const h = 700;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed={`teaser-${word}`} />
      <Frame
        width={w}
        height={h}
        style={{
          left: (1920 - w) / 2,
          top: 190,
          scale: interpolate(frame, [0, FPS], [1.06, 1], clamp),
        }}
      >
        <CroppedVideo clip={clip} width={w} height={h} muted />
      </Frame>
      <div style={{ position: "absolute", left: 120, top: 80 }}>
        <BigWord start={0} color={color} size={150}>
          {word}
        </BigWord>
      </div>
    </AbsoluteFill>
  );
};

const ArtistShot: React.FC = () => {
  const frame = useCurrentFrame();
  const size = 560;
  const ring = 22;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="teaser-artist" />
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 260,
          width: size,
          height: size,
          scale: interpolate(frame, [0, 12], [0.7, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 12 }),
          }),
        }}
      >
        {new Array(ring).fill(true).map((_, i) => {
          const a = (i / ring) * Math.PI * 2 + frame / 40;
          const r = size / 2 + 44;
          const d = 24 + (i % 3) * 10;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: size / 2 + Math.cos(a) * r - d / 2,
                top: size / 2 + Math.sin(a) * r - d / 2,
                width: d,
                height: d,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#ff3d5a" : "#ffd23f",
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
            outline: "8px solid white",
          }}
        >
          <CroppedVideo
            clip={{ ...PORTRAIT, to: PORTRAIT.from + 2.5 }}
            width={size}
            height={size}
            muted
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1000,
          top: 380,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <BigWord start={4} color="white" size={104} rotate={0}>
          Real artists.
        </BigWord>
        <BigWord start={16} size={104} rotate={-3}>
          Real stories.
        </BigWord>
      </div>
    </AbsoluteFill>
  );
};

const QuestionShot: React.FC = () => (
  <AbsoluteFill style={{ fontFamily }}>
    <DotsBackground seed="teaser-question" />
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <Pill name="Question pill">QUESTION</Pill>
      <BigWord start={2} size={140}>
        But does it work?
      </BigWord>
    </AbsoluteFill>
  </AbsoluteFill>
);

// Same layout as the interview: framed vertical video + dark answer card.
const MomShots: React.FC = () => {
  const frame = useCurrentFrame();
  let offset = 0;
  const starts = MOM_CLIPS.map((c) => {
    const s = offset;
    offset += sec(c.to - c.from) - MOM_DISSOLVE;
    return s;
  });
  const index = starts.filter((s) => s <= frame).length - 1;
  const line = MOM_CLIPS[index].line;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="kitchen" />
      <Frame width={504} height={920} style={{ left: 170, top: 80 }}>
        <TransitionSeries>
          {MOM_CLIPS.map((c, i) => (
            <React.Fragment key={c.from}>
              {i > 0 ? (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: MOM_DISSOLVE })}
                />
              ) : null}
              <TransitionSeries.Sequence
                durationInFrames={sec(c.to - c.from)}
                premountFor={FPS}
              >
                <CroppedVideo clip={c} width={504} height={920} />
              </TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
      </Frame>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 110,
          width: 1040,
          height: 860,
          boxSizing: "border-box",
          padding: 60,
          borderRadius: 40,
          background: "rgba(20, 7, 38, 0.78)",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div>
          <Pill name="Section pill">PARENT REVIEW</Pill>
        </div>
        <div style={{ fontWeight: 800, fontSize: 60, color: "#ffd23f" }}>
          Would you recommend Tate&nbsp;Kids?
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            key={index}
            style={{
              fontWeight: 700,
              fontSize: 76,
              lineHeight: 1.2,
              color: "white",
              opacity: interpolate(
                frame,
                [starts[index], starts[index] + 5],
                [0, 1],
                clamp,
              ),
            }}
          >
            “{line}”
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [END_CARD - 12, END_CARD - 1],
          [1, 0],
          clamp,
        ),
      }}
    >
      <TitleScene withMusic={false} />
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily,
            padding: "16px 40px",
            borderRadius: 40,
            background: "#ff3d5a",
            color: "white",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 3,
            boxShadow: "8px 8px 0 #140726",
            scale: interpolate(frame, [30, 40], [0, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 10 }),
            }),
          }}
        >
          ▶ WATCH THE FULL REVIEW
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <MusicBed />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={A_END}>
        <HookShot />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="teaser-1" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={B1_END - A_END}>
        <ChannelShot />
      </TransitionSeries.Sequence>
      {QUICK_CUTS.map((q) => (
        <TransitionSeries.Sequence
          key={q.word}
          durationInFrames={FPS}
          premountFor={FPS}
        >
          <QuickCut clip={q.clip} word={q.word} color={q.color} />
        </TransitionSeries.Sequence>
      ))}
      <TransitionSeries.Sequence
        durationInFrames={B3_END - B2_END}
        premountFor={FPS}
      >
        <ArtistShot />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="teaser-2" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={Q_FRAMES}>
        <QuestionShot />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        durationInFrames={MOM_FRAMES}
        premountFor={FPS}
      >
        <MomShots />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="teaser-3" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={END_CARD}>
        <EndCard />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

export const TeaserComposition: React.FC = () => (
  <Composition
    id="Teaser"
    component={Teaser}
    durationInFrames={TEASER_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
