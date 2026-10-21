// Trial edit from the real material: my night shots (now) and the stock
// inserts (then), on the same timeline, titles and soundtrack as the
// animated version. Footage lives in public/footage/ (not in Git).
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Caption } from "./Caption";
import { type Lang } from "./captions";
import { NightLook, RetroLook, RewindGlitch } from "./effects";
import { at, HALF, Names, Pill, Shade, span, useText } from "./Essay";
import {
  BLUE,
  clamp,
  CREAM,
  FPS,
  GOLD,
  HEIGHT,
  RED,
  sec,
  WIDTH,
} from "./theme";
import { DURATION, newGain, oldGain, T } from "./timeline";

type Props = { lang: Lang };

type Take = {
  src: string; // file in public/footage, without .mp4
  from?: number; // seconds into the clip
  rate?: number;
  pos?: string; // object-position, to keep the subject in the 9:16 crop
};

const Footage: React.FC<Take> = ({
  src,
  from = 0,
  rate = 1,
  pos = "50% 50%",
}) => (
  <OffthreadVideo
    src={staticFile(`footage/${src}.mp4`)}
    trimBefore={sec(from)}
    playbackRate={rate}
    muted
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: pos,
    }}
  />
);

const Then: React.FC<{ take: Take; seed: string }> = ({ take, seed }) => (
  <RetroLook seed={seed}>
    <Footage {...take} />
  </RetroLook>
);

// The night shots are very dark straight off the phone: lift them a little.
const Now: React.FC<{ take: Take; seed: string }> = ({ take, seed }) => (
  <NightLook seed={seed}>
    <AbsoluteFill style={{ filter: "brightness(1.8) contrast(1.08)" }}>
      <Footage {...take} />
    </AbsoluteFill>
  </NightLook>
);

// A run of shots with hard cuts; times in seconds relative to the scene.
const Shots: React.FC<{
  shots: { from: number; to: number; take: Take; era: "then" | "now" }[];
}> = ({ shots }) => (
  <>
    {shots.map(({ from, to, take, era }, i) => (
      <Sequence key={i} {...span([from, to])}>
        {era === "then" ? (
          <Then take={take} seed={`rc${i}`} />
        ) : (
          <Now take={take} seed={`rc${i}`} />
        )}
      </Sequence>
    ))}
  </>
);

// ---------- scenes ----------

const Hook: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const [s] = T.hook;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          { from: 0, to: 4, era: "now", take: { src: "now-3962", from: 0 } },
          { from: 4, to: 7, era: "now", take: { src: "now-3962", from: 9.3 } },
          { from: 7, to: 10, era: "now", take: { src: "now-3960", from: 1.5 } },
        ]}
      />
      <Shade top={230} height={560} />
      <Caption text={tx("hook1")} {...at(s, 0.6, 4.4)} big top={330} />
      <Caption text={tx("hook2")} {...at(s, 4.8, 9.4)} top={330} size={70} />
    </AbsoluteFill>
  );
};

const ThenScene: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const [s] = T.then;
  const dim = interpolate(
    frame,
    [sec(22.4 - s), sec(23 - s)],
    [0, 0.55],
    clamp,
  );
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          { from: 0, to: 5, era: "then", take: { src: "then-tv", from: 0 } },
          {
            from: 5,
            to: 10,
            era: "then",
            take: { src: "then-family", from: 1, pos: "62% 50%" },
          },
          {
            from: 10,
            to: 15,
            era: "then",
            take: { src: "then-tape", from: 2 },
          },
        ]}
      />
      <AbsoluteFill style={{ background: "#000", opacity: dim }} />
      <Shade top={1150} height={420} />
      <Caption
        text={tx("year")}
        {...at(s, 10.4, 14.7)}
        big
        size={190}
        top={1250}
        color={GOLD}
      />
      <Caption
        text={tx("sameVideo")}
        {...at(s, 15.4, 19.7)}
        top={1250}
        size={70}
      />
      <Caption
        text={tx("thriller")}
        {...at(s, 20.2, 22.6)}
        top={1170}
        size={60}
      />
      <Caption
        text={tx("thrillerSource")}
        {...at(s, 20.6, 22.6)}
        top={1460}
        size={32}
        color="rgba(245,241,232,0.8)"
      />
      <Caption
        text={tx("question")}
        {...at(s, 22.7, 25)}
        big
        size={88}
        top={640}
      />
    </AbsoluteFill>
  );
};

const REASONS: {
  then: Take;
  now: Take;
  thenKey: "r1Then" | "r2Then" | "r3Then";
  nowKey: "r1Now" | "r2Now" | "r3Now";
}[] = [
  {
    then: { src: "then-family", from: 8, rate: 0.8, pos: "62% 50%" },
    now: { src: "now-3963", from: 0, rate: 0.5 },
    thenKey: "r1Then",
    nowKey: "r1Now",
  },
  {
    then: { src: "then-vinyl", from: 2 },
    now: { src: "now-3962", from: 6, rate: 0.55 },
    thenKey: "r2Then",
    nowKey: "r2Now",
  },
  {
    then: { src: "then-deck", from: 5 },
    now: { src: "now-3960", from: 3, rate: 0.5 },
    thenKey: "r3Then",
    nowKey: "r3Now",
  },
];

const Reason: React.FC<Props & { index: number }> = ({ lang, index }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const r = T.reasons[index];
  const re = REASONS[index];
  const tThen = sec(r.then - r.start);
  const tNow = sec(r.now - r.start);
  const len = sec(r.end - r.start);
  const thenLit = interpolate(
    frame,
    [tThen - 6, tThen + 6, tNow - 6, tNow + 6],
    [0.35, 1, 1, 0.35],
    clamp,
  );
  const nowLit = interpolate(frame, [tNow - 6, tNow + 6], [0.35, 1], clamp);
  const intro = interpolate(
    frame,
    [0, 8, tThen - 6, tThen + 4],
    [0, 1, 1, 0],
    clamp,
  );
  const half = (top: number, lit: number, child: React.ReactNode) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: WIDTH,
        height: HALF,
        overflow: "hidden",
        opacity: lit,
        filter: `saturate(${0.4 + 0.6 * lit})`,
      }}
    >
      {child}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {half(
        0,
        thenLit,
        <>
          <Then take={re.then} seed={`r${index}t`} />
          <Shade top={HALF - 400} height={340} />
        </>,
      )}
      {half(
        HALF,
        nowLit,
        <>
          <Now take={re.now} seed={`r${index}n`} />
          <Shade top={HALF - 660} height={340} />
        </>,
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: HALF - 4,
          width: WIDTH,
          height: 8,
          background: CREAM,
        }}
      />
      <Pill text={tx("then")} color={GOLD} top={260} />
      <Pill text={tx("now")} color={BLUE} textColor={CREAM} top={HALF + 50} />
      <Caption
        text={tx(re.thenKey)}
        from={tThen}
        to={len}
        top={HALF - 290}
        size={64}
      />
      <Caption
        text={tx(re.nowKey)}
        from={tNow}
        to={len}
        top={HEIGHT - 640}
        size={64}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: intro,
        }}
      >
        <div
          style={{
            background: "#15131A",
            border: `6px solid ${CREAM}`,
            borderRadius: 30,
            padding: "24px 60px",
            textAlign: "center",
            color: CREAM,
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Rubik",
              fontWeight: 500,
              fontSize: 44,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            {tx("reason")}
          </div>
          <span style={{ color: [GOLD, RED, "#8FAEF7"][index] }}>
            {index + 1}
          </span>
          <span style={{ fontSize: 70, opacity: 0.6 }}>/3</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Who: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const [s] = T.who;
  const dark = interpolate(
    frame,
    [sec(T.whoNames[0] - s) - 6, sec(T.whoNames[0] - s)],
    [0, 0.55],
    clamp,
  );
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          { from: 0, to: 6.5, era: "now", take: { src: "now-3962", from: 3 } },
          {
            from: 6.5,
            to: 15,
            era: "now",
            take: { src: "now-3963", from: 0, rate: 0.73 },
          },
        ]}
      />
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <Shade top={230} height={560} />
      <Caption text={tx("who")} {...at(s, 60.3, 63.5)} big top={330} />
      <Sequence {...span([T.whoNames[0] - s, T.whoNames[1] - s])}>
        <Names />
      </Sequence>
      <Caption
        text={tx("noAnswer")}
        {...at(s, 71.2, 75)}
        big
        top={820}
        align="center"
      />
    </AbsoluteFill>
  );
};

const End: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const [s] = T.end;
  const card = interpolate(frame, [sec(83.3 - s), sec(84 - s)], [0, 1], clamp);
  const bounce = Math.abs(Math.sin((frame / FPS) * 3)) * 18;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          { from: 0, to: 5, era: "now", take: { src: "now-3960", from: 4 } },
          {
            from: 5,
            to: 8.5,
            era: "now",
            take: { src: "now-3961", from: 0, rate: 0.4 },
          },
        ]}
      />
      <Shade top={230} height={560} />
      <Caption text={tx("niche")} {...at(s, 75.5, 79)} big top={330} />
      <Caption
        text={tx("millions")}
        {...at(s, 79.2, 83.3)}
        top={330}
        size={70}
      />
      <AbsoluteFill style={{ background: "#07060a", opacity: card }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 20,
            height: HEIGHT,
            background: `linear-gradient(180deg, ${GOLD}, ${RED}, ${BLUE})`,
          }}
        />
      </AbsoluteFill>
      <Caption
        text={tx("finalQ")}
        {...at(s, 83.8, 90.5)}
        big
        size={104}
        top={480}
      />
      <Caption
        text={tx("comments")}
        {...at(s, 85, 90.5)}
        top={1120}
        size={64}
        color={GOLD}
      />
      {frame > sec(85.4 - s) ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 1230 + bounce,
            fontFamily: "Oswald",
            fontSize: 110,
            color: GOLD,
            opacity: interpolate(
              frame,
              [sec(85.4 - s), sec(86 - s)],
              [0, 1],
              clamp,
            ),
          }}
        >
          ↓
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const RoughCut: React.FC<Props> = ({ lang }) => {
  const frame = useCurrentFrame();
  const rewindFrom = sec(T.then[0] - 0.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("music/old.mp3")}
        volume={(f) => 0.9 * oldGain(f / FPS)}
      />
      <Audio
        src={staticFile("music/new.mp3")}
        volume={(f) => 0.8 * newGain(f / FPS)}
      />
      <Audio src={staticFile("music/sfx.mp3")} volume={0.9} />
      <Sequence {...span(T.hook)}>
        <Hook lang={lang} />
      </Sequence>
      <Sequence {...span(T.then)}>
        <ThenScene lang={lang} />
      </Sequence>
      {T.reasons.map((r, i) => (
        <Sequence
          key={i}
          from={sec(r.start)}
          durationInFrames={sec(r.end - r.start)}
        >
          <Reason lang={lang} index={i} />
        </Sequence>
      ))}
      <Sequence {...span(T.who)}>
        <Who lang={lang} />
      </Sequence>
      <Sequence {...span(T.end)}>
        <End lang={lang} />
      </Sequence>
      <RewindGlitch
        progress={interpolate(
          frame,
          [rewindFrom, rewindFrom + sec(1.2)],
          [0, 1],
          clamp,
        )}
      />
    </AbsoluteFill>
  );
};

export const RoughCutComposition: React.FC = () => (
  <>
    {(["en", "ru"] as const).map((lang) => (
      <Composition
        key={lang}
        id={`RoughCut${lang.toUpperCase()}`}
        component={RoughCut}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ lang: lang as Lang }}
      />
    ))}
  </>
);
