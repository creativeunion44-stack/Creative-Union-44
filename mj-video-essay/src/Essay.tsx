// "Why is it so hard to be as famous as Michael Jackson today?"
// A 90-second vertical video essay told through on-screen titles, built from
// the Unit 13 production plan: hook, then (1983), three reasons on a
// then/now split screen, "who is the star now?", and the closing question.
//
// Sound: calm 1980s-style music over the past, modern uneasy music over
// today (both synthesised from scratch by scripts/make_music.py).
import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  CassetteShot,
  BroadcastHalf,
  CalendarHalf,
  ChartHalf,
  LivingRoomShot,
  RetroTvShot,
} from "./art/past";
import {
  FeedShot,
  NightFaceShot,
  PhoneGridHalf,
  PutDownShot,
  TrackFloodHalf,
  TrendHalf,
} from "./art/now";
import { Caption } from "./Caption";
import { CAPTIONS, type CaptionKey, type Lang, STAR_NAMES } from "./captions";
import { NightLook, RetroLook, RewindGlitch } from "./effects";
import { FOOTAGE, type Shot } from "./footage";
import { BODY, HEADING } from "./fonts";
import {
  BLUE,
  clamp,
  CREAM,
  FPS,
  GOLD,
  HEIGHT,
  INK,
  LIGHT_BLUE,
  RED,
  sec,
  WIDTH,
} from "./theme";
import { DURATION, newGain, oldGain, T } from "./timeline";

type Props = { lang: Lang };

const useText = (lang: Lang) => (key: CaptionKey) => CAPTIONS[key][lang];

// Your footage if it is set in footage.ts, otherwise the illustration.
const ShotOr: React.FC<{ shot: Shot; children: React.ReactNode }> = ({
  shot,
  children,
}) =>
  shot ? (
    <AbsoluteFill>
      <Video
        src={staticFile(shot.src)}
        trimBefore={sec(shot.from ?? 0)}
        muted
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill>{children}</AbsoluteFill>
  );

// Soft dark band behind titles so they read over busy pictures.
const Shade: React.FC<{ top: number; height: number }> = ({ top, height }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top,
      height,
      background:
        "linear-gradient(180deg, transparent, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5) 70%, transparent)",
    }}
  />
);

const span = ([a, b]: number[]) => ({
  from: sec(a),
  durationInFrames: sec(b - a),
});
// caption timing in frames relative to a scene starting at `start` seconds
const at = (start: number, a: number, b: number) => ({
  from: sec(a - start),
  to: sec(b - start),
});

// ---------- 1. Hook (0-10 s) ----------

const Hook: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const [s] = T.hook;
  return (
    <AbsoluteFill>
      <NightLook seed="hook">
        <ShotOr shot={FOOTAGE.hook}>
          <NightFaceShot />
        </ShotOr>
      </NightLook>
      <Shade top={230} height={560} />
      <Caption text={tx("hook1")} {...at(s, 0.6, 4.4)} big top={330} />
      <Caption text={tx("hook2")} {...at(s, 4.8, 9.4)} top={330} size={70} />
    </AbsoluteFill>
  );
};

// ---------- 2. Then: 1983 (10-25 s) ----------

const CrossCut: React.FC<{ len: number; children: React.ReactNode }> = ({
  len,
  children,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, len - 8, len], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Then: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const [s] = T.then;
  const shots = T.thenShots;
  const dim = interpolate(
    frame,
    [sec(22.4 - s), sec(23 - s)],
    [0, 0.55],
    clamp,
  );
  return (
    <AbsoluteFill style={{ background: "#120a05" }}>
      {(
        [
          [shots.tv, <RetroTvShot key="tv" />],
          [shots.room, <LivingRoomShot key="room" />],
          [shots.cassette, <CassetteShot key="cassette" />],
        ] as const
      ).map(([w, art], i) => (
        <Sequence
          key={i}
          from={sec(w[0] - s)}
          durationInFrames={sec(w[1] - w[0]) + (i < 2 ? 8 : 0)}
        >
          <CrossCut len={sec(w[1] - w[0]) + (i < 2 ? 8 : 0)}>
            <RetroLook osd="▶ PLAY" seed={`then${i}`}>
              {art}
            </RetroLook>
          </CrossCut>
        </Sequence>
      ))}
      <AbsoluteFill style={{ background: "#000", opacity: dim }} />
      <Caption
        text={tx("year")}
        {...at(s, 10.4, 14.7)}
        big
        size={300}
        top={1260}
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
        top={1240}
        size={64}
      />
      <Caption
        text={tx("thrillerSource")}
        {...at(s, 20.6, 22.6)}
        top={1440}
        size={32}
        color="rgba(245,241,232,0.8)"
      />
      <Caption text={tx("question")} {...at(s, 22.7, 25)} big top={760} />
    </AbsoluteFill>
  );
};

// ---------- 3. Three reasons on a split screen (25-60 s) ----------

const HALF = HEIGHT / 2;

const Pill: React.FC<{
  text: string;
  color: string;
  top: number;
  textColor?: string;
}> = ({ text, color, top, textColor = INK }) => (
  <div
    style={{
      position: "absolute",
      left: 80,
      top,
      padding: "6px 22px",
      borderRadius: 12,
      background: color,
      color: textColor,
      fontFamily: HEADING,
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: 4,
    }}
  >
    {text}
  </div>
);

const REASON_ART = [
  {
    then: <BroadcastHalf />,
    now: <PhoneGridHalf />,
    thenKey: "r1Then",
    nowKey: "r1Now",
  },
  {
    then: <ChartHalf />,
    now: <TrackFloodHalf />,
    thenKey: "r2Then",
    nowKey: "r2Now",
  },
  {
    then: <CalendarHalf />,
    now: <TrendHalf />,
    thenKey: "r3Then",
    nowKey: "r3Now",
  },
] as const;

const Reason: React.FC<Props & { index: number }> = ({ lang, index }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const r = T.reasons[index];
  const art = REASON_ART[index];
  const s = r.start;
  const tThen = sec(r.then - s);
  const tNow = sec(r.now - s);
  const len = sec(r.end - s);
  // which half is "lit": the other one dims
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
  const split = interpolate(frame, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WIDTH,
          height: HALF,
          overflow: "hidden",
          opacity: thenLit,
          filter: `saturate(${0.4 + 0.6 * thenLit})`,
          translate: `0px ${(split - 1) * HALF}px`,
        }}
      >
        <RetroLook seed={`r${index}then`}>{art.then}</RetroLook>
        <Shade top={HALF - 400} height={340} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: HALF,
          width: WIDTH,
          height: HALF,
          overflow: "hidden",
          opacity: nowLit,
          filter: `saturate(${0.4 + 0.6 * nowLit})`,
          translate: `0px ${(1 - split) * HALF}px`,
        }}
      >
        <NightLook seed={`r${index}now`}>{art.now}</NightLook>
        <Shade top={HALF - 680 + 20} height={340} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: HALF - 4,
          width: WIDTH,
          height: 8,
          background: CREAM,
          opacity: split,
        }}
      />
      <Pill text={tx("then")} color={GOLD} top={260} />
      <Pill text={tx("now")} color={BLUE} textColor={CREAM} top={HALF + 50} />
      <Caption
        text={tx(art.thenKey)}
        from={tThen}
        to={len}
        top={HALF - 290}
        size={64}
      />
      <Caption
        text={tx(art.nowKey)}
        from={tNow}
        to={len}
        top={HEIGHT - 640}
        size={64}
      />
      {/* reason number between the halves */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: intro,
        }}
      >
        <div
          style={{
            background: INK,
            border: `6px solid ${CREAM}`,
            borderRadius: 30,
            padding: "24px 60px",
            textAlign: "center",
            color: CREAM,
            scale: interpolate(frame, [0, 12], [0.6, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 12 }),
            }),
          }}
        >
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 500,
              fontSize: 44,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            {tx("reason")}
          </div>
          <div
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 170,
              lineHeight: 1,
              color: [GOLD, RED, LIGHT_BLUE][index],
            }}
          >
            {index + 1}
            <span style={{ fontSize: 80, color: CREAM, opacity: 0.6 }}>/3</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 4. Who is the star now? (60-75 s) ----------

const Names: React.FC = () => {
  const frame = useCurrentFrame();
  const len = sec(T.whoNames[1] - T.whoNames[0]);
  // names come faster and faster
  const p = frame / len;
  const idx = Math.floor((p + 0.6 * p * p) * STAR_NAMES.length * 0.62);
  const name = STAR_NAMES[idx % STAR_NAMES.length];
  const size = 90 + random(`n-s-${idx}`) * 80;
  const y = 420 + random(`n-y-${idx}`) * 900;
  const x = (random(`n-x-${idx}`) - 0.5) * 160;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60 + x,
          right: 60 - x,
          top: y,
          textAlign: "center",
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1,
          textTransform: "uppercase",
          color: [CREAM, GOLD, LIGHT_BLUE, "#ff7ad9"][idx % 4],
          textShadow: "0 6px 30px rgba(0,0,0,0.8)",
        }}
      >
        {name}
      </div>
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
      <NightLook seed="who">
        <ShotOr shot={FOOTAGE.feed}>
          <FeedShot speed={30 + frame * 0.12} />
        </ShotOr>
      </NightLook>
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

// ---------- 5. Ending (75-90 s) ----------

const End: React.FC<Props> = ({ lang }) => {
  const tx = useText(lang);
  const frame = useCurrentFrame();
  const [s] = T.end;
  const fade = interpolate(frame, [sec(79 - s), sec(83.5 - s)], [0, 1], clamp);
  const card = interpolate(frame, [sec(83.3 - s), sec(84 - s)], [0, 1], clamp);
  const bounce = Math.abs(Math.sin((frame / FPS) * 3)) * 18;
  return (
    <AbsoluteFill>
      <NightLook seed="end">
        <ShotOr shot={FOOTAGE.putDown}>
          <PutDownShot fade={fade} />
        </ShotOr>
        {FOOTAGE.putDown ? (
          <AbsoluteFill style={{ background: "#000", opacity: fade * 0.85 }} />
        ) : null}
      </NightLook>
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
        size={120}
        top={560}
      />
      <Caption
        text={tx("comments")}
        {...at(s, 85, 90.5)}
        top={1060}
        size={64}
        color={GOLD}
      />
      {frame > sec(85.4 - s) ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 1170 + bounce,
            fontFamily: HEADING,
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
      <Caption
        text={tx("credits")}
        {...at(s, 86, 90.5)}
        top={1400}
        size={28}
        color="rgba(245,241,232,0.6)"
      />
    </AbsoluteFill>
  );
};

// ---------- the film ----------

export const Essay: React.FC<Props> = ({ lang }) => {
  const frame = useCurrentFrame();
  const rewindFrom = sec(T.then[0] - 0.6);
  const rewindLen = sec(1.2);
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
        <Then lang={lang} />
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
          [rewindFrom, rewindFrom + rewindLen],
          [0, 1],
          clamp,
        )}
      />
    </AbsoluteFill>
  );
};

export const EssayCompositions: React.FC = () => (
  <>
    <Composition
      id="MJEssayEN"
      component={Essay}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ lang: "en" as Lang }}
    />
    <Composition
      id="MJEssayRU"
      component={Essay}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ lang: "ru" as Lang }}
    />
  </>
);
