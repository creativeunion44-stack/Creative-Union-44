import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bodyFont, titleFont } from "./fonts";

export const FPS = 30;
const INTRO = 5 * FPS;
const FINALE = 11 * FPS;
const TRANSITION = 15;

const CORAL = "#F25C6E";
const GOLD = "linear-gradient(180deg, #FFF3B0 0%, #FFD24A 45%, #F2A007 100%)";

type Shot = {
  kind: "photo" | "video";
  src: string;
  seconds: number;
  caption: string;
  // object-position for photos (they are taller than 9:16 and get cropped)
  pos?: string;
};

const SHOTS: Shot[] = [
  { kind: "photo", src: "photos/p1.jpg", seconds: 3.2, caption: "Любопытные глазки", pos: "50% 30%" },
  { kind: "photo", src: "photos/p2.jpg", seconds: 3.2, caption: "Игрушки — дело серьёзное!", pos: "50% 62%" },
  { kind: "video", src: "footage/shop.mp4", seconds: 5, caption: "Привет, мир!" },
  { kind: "photo", src: "photos/p3.jpg", seconds: 3.2, caption: "Первые прогулки", pos: "50% 55%" },
  { kind: "photo", src: "photos/p4.jpg", seconds: 3.2, caption: "Исследователь большого города", pos: "50% 45%" },
  { kind: "video", src: "footage/swing1.mp4", seconds: 2.2, caption: "Вжух — на качелях!" },
  { kind: "photo", src: "photos/p5.jpg", seconds: 3.2, caption: "Маленький гурман", pos: "50% 40%" },
  { kind: "video", src: "footage/lake.mp4", seconds: 4, caption: "Прогулки у озера" },
  { kind: "video", src: "footage/log1.mp4", seconds: 4.5, caption: "Первые приключения" },
  { kind: "photo", src: "photos/p6.jpg", seconds: 3.2, caption: "Всегда начеку!", pos: "50% 50%" },
  { kind: "photo", src: "photos/p7.jpg", seconds: 3.2, caption: "Покоритель вершин", pos: "50% 50%" },
  { kind: "video", src: "footage/hood.mp4", seconds: 5, caption: "Выше и выше!" },
  { kind: "video", src: "footage/log2.mp4", seconds: 5, caption: "Маленький, но смелый" },
  { kind: "photo", src: "photos/p8.jpg", seconds: 3.5, caption: "Самая солнечная улыбка", pos: "50% 50%" },
  { kind: "video", src: "footage/swing2.mp4", seconds: 4.2, caption: "Счастье — это качели!" },
];

const shotFrames = (s: Shot) => Math.round(s.seconds * FPS);
export const TOTAL_FRAMES =
  INTRO + SHOTS.reduce((a, s) => a + shotFrames(s), 0) + FINALE - (SHOTS.length + 1) * TRANSITION;

/* ---------- decorations ---------- */

const CONFETTI_COLORS = ["#F25C6E", "#FFD24A", "#5CC8F2", "#7ED6A5", "#B48CF2", "#FF9F5A"];

const Confetti: React.FC<{ count: number; seed: string; startFrame?: number }> = ({
  count,
  seed,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame() - startFrame;
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const speed = 4 + r("v") * 6;
        const delay = r("d") * 90;
        const y = (frame - delay) * speed - 60;
        if (y < -60) return null;
        const x = r("x") * width + Math.sin((frame + r("p") * 100) / (12 + r("w") * 10)) * 40;
        const w = 14 + r("s") * 14;
        const round = r("shape") > 0.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y % (height + 120),
              width: w,
              height: round ? w : w * 0.45,
              borderRadius: round ? "50%" : 3,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              transform: `rotate(${frame * (4 + r("r") * 8) + r("a") * 360}deg) rotateX(${frame * 9}deg)`,
              opacity: 0.95,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const BALLOON_COLORS = ["#F25C6E", "#FFD24A", "#5CC8F2", "#7ED6A5", "#B48CF2", "#FF9F5A", "#5CC8F2", "#F25C6E"];

const Balloons: React.FC<{ seed: string }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {BALLOON_COLORS.map((color, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 150 + r("s") * 90;
        const speed = 3.5 + r("v") * 3;
        const x = (i / BALLOON_COLORS.length) * width + r("x") * 80 - 40;
        const y = height + 100 + r("d") * 500 - frame * speed;
        const sway = Math.sin((frame + r("p") * 60) / 18) * 10;
        return (
          <svg
            key={i}
            width={size}
            height={size * 2}
            viewBox="0 0 100 200"
            style={{ position: "absolute", left: x, top: y, transform: `rotate(${sway}deg)`, transformOrigin: "50% 0%" }}
          >
            <path d="M50 118 C 44 140, 58 160, 48 200" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" />
            <ellipse cx="50" cy="58" rx="40" ry="50" fill={color} />
            <polygon points="44,114 56,114 50,106" fill={color} />
            <ellipse cx="36" cy="38" rx="9" ry="15" fill="rgba(255,255,255,0.45)" transform="rotate(-20 36 38)" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Sparkles: React.FC<{ seed: string; count: number }> = ({ seed, count }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const tw = Math.max(0, Math.sin((frame + r("p") * 200) / (8 + r("w") * 10)));
        const s = 18 + r("s") * 26;
        return (
          <svg
            key={i}
            width={s}
            height={s}
            viewBox="-10 -10 20 20"
            style={{ position: "absolute", left: r("x") * width, top: r("y") * height, opacity: tw, transform: `scale(${0.5 + tw})` }}
          >
            <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FFF6C8" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Heart: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 29" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path
      d="M16 29 L13.7 26.9 C5.4 19.4 0 14.5 0 8.5 C0 3.6 3.8 0 8.8 0 C11.5 0 14.2 1.3 16 3.4 C17.8 1.3 20.5 0 23.2 0 C28.2 0 32 3.6 32 8.5 C32 14.5 26.6 19.4 18.3 26.9 Z"
      fill={CORAL}
    />
  </svg>
);

const GoldText: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({
  children,
  size,
  style,
}) => (
  <div
    style={{
      fontFamily: titleFont,
      fontSize: size,
      lineHeight: 1,
      background: GOLD,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      filter: "drop-shadow(0 6px 0 #C46A00) drop-shadow(0 14px 24px rgba(120,50,0,0.35))",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- intro ---------- */

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (delay: number, damping = 12) => spring({ frame: frame - delay, fps, config: { damping } });

  const line1 = pop(8);
  const name = pop(20, 9);
  const photo = pop(36, 14);
  const one = pop(58, 8);
  const sub = pop(72);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #FFF1F4 0%, #FFD3DD 45%, #A9DDF5 100%)",
        alignItems: "center",
      }}
    >
      <Sparkles seed="intro-sp" count={26} />
      <Balloons seed="intro-b" />

      <div
        style={{
          position: "absolute",
          top: 190,
          fontFamily: titleFont,
          fontSize: 118,
          color: CORAL,
          textShadow: "0 5px 0 #fff, 0 10px 30px rgba(242,92,110,0.35)",
          transform: `translateY(${(1 - line1) * -80}px)`,
          opacity: line1,
        }}
      >
        С Днём Рождения,
      </div>
      <div
        style={{
          position: "absolute",
          top: 330,
          fontFamily: titleFont,
          fontSize: 230,
          color: "#fff",
          textShadow: `0 8px 0 ${CORAL}, 0 18px 40px rgba(200,40,70,0.45)`,
          transform: `scale(${name})`,
        }}
      >
        Эля!
      </div>

      <div
        style={{
          position: "absolute",
          top: 680,
          width: 600,
          height: 600,
          borderRadius: "50%",
          overflow: "hidden",
          border: "16px solid #fff",
          boxShadow: "0 24px 60px rgba(120,40,70,0.35)",
          transform: `scale(${photo}) rotate(${(1 - photo) * -20}deg)`,
        }}
      >
        <Img
          src={staticFile("photos/p1.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 28%",
            transform: `scale(${1.15 + frame * 0.0012})`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 1010,
          left: 770,
          transform: `scale(${one}) rotate(${(1 - one) * 90 + 8}deg)`,
        }}
      >
        <GoldText size={380}>1</GoldText>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1480,
          fontFamily: titleFont,
          fontSize: 120,
          color: "#fff",
          textShadow: `0 6px 0 ${CORAL}, 0 14px 30px rgba(200,40,70,0.4)`,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 60}px)`,
        }}
      >
        Нам целый годик!
      </div>

      <Confetti count={70} seed="intro-c" startFrame={50} />
    </AbsoluteFill>
  );
};

/* ---------- montage shot ---------- */

const Caption: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 230,
        display: "flex",
        justifyContent: "center",
        opacity: 1 - exit,
        transform: `translateY(${(1 - enter) * 160}px) scale(${0.8 + enter * 0.2})`,
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: "26px 54px 34px",
          borderRadius: 70,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
          fontFamily: titleFont,
          fontSize: 76,
          lineHeight: 1.15,
          color: CORAL,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Heart size={52} />
        <span>{text}</span>
        <Heart size={52} />
      </div>
    </div>
  );
};

const ShotView: React.FC<{ shot: Shot; index: number }> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const dur = shotFrames(shot);
  const zoomIn = index % 2 === 0;
  const p = frame / dur;
  const scale = zoomIn ? 1.04 + p * 0.1 : 1.14 - p * 0.1;
  const drift = (index % 3 === 0 ? -1 : 1) * p * 24;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shot.kind === "photo" ? (
        <Img
          src={staticFile(shot.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: shot.pos,
            transform: `scale(${scale}) translateX(${drift}px)`,
          }}
        />
      ) : (
        <Video
          src={staticFile(shot.src)}
          volume={0.45}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 28px 14px",
          borderRadius: 40,
          background: "rgba(255,255,255,0.88)",
          fontFamily: titleFont,
          fontSize: 54,
          color: CORAL,
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        }}
      >
        Эле 1 годик
      </div>
      <Caption text={shot.caption} durationInFrames={dur} />
    </AbsoluteFill>
  );
};

/* ---------- finale ---------- */

const POEM = [
  "Солнышко наше, Эля,",
  "Тебе сегодня год!",
  "Пусть детство будет светлым",
  "И радость в дом несёт.",
  "Расти здоровым, смелым,",
  "Весёлым, озорным —",
  "Ты самый-самый лучший,",
  "Ты нами так любим!",
];

const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame: frame - 6, fps, config: { damping: 11 } });
  const lineStart = 28;
  const lineGap = 20;
  const loveAt = lineStart + POEM.length * lineGap + 20;
  const love = spring({ frame: frame - loveAt, fps, config: { damping: 9 } });
  const beat = 1 + Math.max(0, Math.sin((frame - loveAt) / 6)) * 0.08 * Math.min(1, love);

  return (
    <AbsoluteFill style={{ alignItems: "center", backgroundColor: "#2a0f2c" }}>
      <Img
        src={staticFile("photos/p8.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(28px) brightness(0.8) saturate(1.2)",
          transform: "scale(1.2)",
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(242,92,110,0.55) 0%, rgba(120,60,180,0.55) 100%)" }}
      />
      <Sparkles seed="fin-sp" count={34} />

      <div
        style={{
          position: "absolute",
          top: 150,
          textAlign: "center",
          fontFamily: titleFont,
          fontSize: 132,
          lineHeight: 1.05,
          color: "#fff",
          textShadow: `0 7px 0 ${CORAL}, 0 16px 40px rgba(0,0,0,0.35)`,
          transform: `scale(${title})`,
        }}
      >
        С Днём Рождения,
        <br />
        малыш!
      </div>

      <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center" }}>
        {POEM.map((line, i) => {
          const t = interpolate(frame, [lineStart + i * lineGap, lineStart + i * lineGap + 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={i}
              style={{
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 60,
                lineHeight: 1.55,
                color: "#fff",
                textShadow: "0 3px 14px rgba(0,0,0,0.45)",
                opacity: t,
                transform: `translateY(${(1 - t) * 30}px)`,
                marginBottom: i % 2 === 1 ? 26 : 0,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1420,
          display: "flex",
          alignItems: "center",
          gap: 30,
          transform: `scale(${love * beat})`,
        }}
      >
        <GoldText size={330}>1</GoldText>
        <div
          style={{
            fontFamily: titleFont,
            fontSize: 92,
            lineHeight: 1.1,
            color: "#fff",
            textShadow: `0 5px 0 ${CORAL}, 0 12px 30px rgba(0,0,0,0.3)`,
          }}
        >
          Мы тебя
          <br />
          очень любим! <Heart size={80} />
        </div>
      </div>

      <Confetti count={90} seed="fin-c" startFrame={loveAt - 10} />
    </AbsoluteFill>
  );
};

/* ---------- main ---------- */

const transitionFor = (i: number) => {
  if (i % 4 === 1) return slide({ direction: "from-right" });
  if (i % 4 === 3) return slide({ direction: "from-bottom" });
  return fade();
};

export const Birthday: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        {SHOTS.map((shot, i) => (
          <React.Fragment key={shot.src}>
            <TransitionSeries.Transition
              presentation={transitionFor(i)}
              timing={linearTiming({ durationInFrames: TRANSITION })}
            />
            <TransitionSeries.Sequence durationInFrames={shotFrames(shot)}>
              <ShotView shot={shot} index={i} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={FINALE + 5}>
          <Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("music.wav")} volume={0.85} />
    </AbsoluteFill>
  );
};
