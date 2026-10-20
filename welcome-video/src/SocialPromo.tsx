// Vertical (9:16) Creative Union promo for Reels / TikTok / Shorts, ~40 s.
// Silent by design: everything is carried by on-screen text, so it reads
// with the sound off. Text stays inside the platform safe zone (clear of
// the top bar and the caption/buttons area at the bottom and right).
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { fontFamily } from "./fonts";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

const HOOK = 120;
const INTRO = 150;
const SERVICES = 330;
const PROCESS = 270;
const TOGETHER = 180;
const CTA = 240;
const TRANSITION = 15;

// 1290 - 5 * 15 = 1215 frames = 40.5 seconds
const DURATION =
  HOOK + INTRO + SERVICES + PROCESS + TOGETHER + CTA - 5 * TRANSITION;

// Same palette as the purple-dots films
const BG_INNER = "#3a1566";
const BG_OUTER = "#140726";
const RED = "#ff3d5a";
const YELLOW = "#ffd23f";
const PINK = "#ff6fb5";
const BLUE = "#3ec7ff";
const DOT_COLORS = [RED, YELLOW, PINK, BLUE, "#ffffff"];

// Keep text between these lines (Reels/TikTok overlays sit outside them)
const SAFE_TOP = 260;
const SAFE_BOTTOM = 1520;
const SIDE = 90;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const SocialPromoComposition = () => (
  <Composition
    id="SocialPromoVertical"
    component={SocialPromo}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);

const Dots: React.FC<{ seed: string }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dots = new Array(34).fill(true).map((_, i) => ({
    x: random(`${seed}-x-${i}`) * WIDTH,
    y: random(`${seed}-y-${i}`) * HEIGHT,
    size: 14 + random(`${seed}-s-${i}`) ** 2 * 120,
    color: DOT_COLORS[Math.floor(random(`${seed}-c-${i}`) * DOT_COLORS.length)],
    speed: 0.4 + random(`${seed}-v-${i}`) * 0.8,
    phase: random(`${seed}-p-${i}`) * Math.PI * 2,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 45%, ${BG_INNER}, ${BG_OUTER} 80%)`,
        overflow: "hidden",
      }}
    >
      {dots.map((dot, i) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * dot.speed * 3 + dot.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x - dot.size / 2,
              top:
                dot.y - dot.size / 2 + Math.sin(t * dot.speed + dot.phase) * 24,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: dot.color,
              opacity: 0.15 + 0.4 * twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Fade + rise + unblur entrance starting at `delay` frames
const rise = (frame: number, delay: number, distance = 70) => ({
  opacity: interpolate(frame, [delay, delay + 14], [0, 1], clamp),
  translate: interpolate(
    frame,
    [delay, delay + 22],
    [`0px ${distance}px`, "0px 0px"],
    { ...clamp, easing: easeOut },
  ),
  filter: `blur(${interpolate(frame, [delay, delay + 14], [14, 0], clamp)}px)`,
});

const Safe: React.FC<{
  children: React.ReactNode;
  justify?: React.CSSProperties["justifyContent"];
  gap?: number;
}> = ({ children, justify = "center", gap = 40 }) => (
  <AbsoluteFill
    style={{
      top: SAFE_TOP,
      bottom: HEIGHT - SAFE_BOTTOM,
      left: SIDE,
      right: SIDE,
      width: "auto",
      height: "auto",
      flexDirection: "column",
      justifyContent: justify,
      alignItems: "flex-start",
      gap,
      fontFamily,
      color: "white",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Highlight: React.FC<{
  children: React.ReactNode;
  color: string;
  progress: number;
}> = ({ children, color, progress }) => (
  <span
    style={{
      backgroundImage: `linear-gradient(${color}, ${color})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${progress * 100}% 100%`,
      color: progress > 0.5 ? BG_OUTER : "white",
      padding: "0 18px",
      borderRadius: 14,
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
    }}
  >
    {children}
  </span>
);

// ---------- scenes ----------

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = interpolate(frame, [50, 68], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <AbsoluteFill>
      <Dots seed="hook" />
      <Safe gap={50}>
        <Interactive.Div
          name="Question"
          style={{
            fontSize: 190,
            fontWeight: 900,
            lineHeight: 1,
            ...rise(frame, 0, 120),
          }}
        >
          Есть
          <br />
          идея?
        </Interactive.Div>
        <Interactive.Div
          name="Answer"
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.35,
            ...rise(frame, 34),
          }}
        >
          Не держи её
          <br />
          <Highlight color={YELLOW} progress={mark}>
            в голове.
          </Highlight>
        </Interactive.Div>
      </Safe>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const r = 200;
  const circumference = 2 * Math.PI * r;

  return (
    <AbsoluteFill>
      <Dots seed="intro" />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 70,
          fontFamily,
          color: "white",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 2 * r + 20,
            height: 2 * r + 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg
            width={2 * r + 20}
            height={2 * r + 20}
            style={{
              position: "absolute",
              rotate: interpolate(frame, [0, 40], ["-90deg", "0deg"], {
                ...clamp,
                easing: easeOut,
              }),
            }}
          >
            <circle
              cx={r + 10}
              cy={r + 10}
              r={r}
              fill="none"
              stroke="white"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={interpolate(
                frame,
                [0, 32],
                [circumference, 0],
                { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) },
              )}
            />
          </svg>
          <Interactive.Div
            name="Monogram"
            style={{
              fontSize: 200,
              fontWeight: 800,
              letterSpacing: 8,
              opacity: interpolate(frame, [10, 26], [0, 1], clamp),
              scale: interpolate(frame, [10, 34], [0.4, 1], {
                ...clamp,
                easing: Easing.spring({ damping: 12 }),
                output: "perceptual-scale",
              }),
            }}
          >
            CU
          </Interactive.Div>
        </div>
        <div style={{ textAlign: "center" }}>
          <Interactive.Div
            name="Name"
            style={{
              fontSize: 112,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: interpolate(frame, [36, 80], [24, 1], {
                ...clamp,
                easing: easeOut,
              }),
              ...rise(frame, 36, 40),
            }}
          >
            Creative
            <br />
            Union
          </Interactive.Div>
          <Interactive.Div
            name="Tagline"
            style={{
              marginTop: 30,
              fontSize: 50,
              fontWeight: 500,
              letterSpacing: 4,
              color: "rgba(255,255,255,0.85)",
              ...rise(frame, 62, 30),
            }}
          >
            творческое объединение
          </Interactive.Div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SERVICE_ITEMS = [
  { word: "Снимаем", note: "видео и интервью", color: RED },
  { word: "Монтируем", note: "ролики под любую соцсеть", color: YELLOW },
  { word: "Рисуем", note: "дизайн и графику", color: PINK },
  { word: "Оживляем", note: "анимацией и титрами", color: BLUE },
];

const Services: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Dots seed="services" />
      <Safe gap={46}>
        <Interactive.Div
          name="Heading"
          style={{
            fontSize: 60,
            fontWeight: 600,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 20,
            ...rise(frame, 0, 40),
          }}
        >
          Что мы делаем
        </Interactive.Div>
        {SERVICE_ITEMS.map((item, i) => {
          const delay = 24 + i * 52;
          return (
            <Interactive.Div
              key={item.word}
              name={item.word}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                ...rise(frame, delay, 0),
                translate: interpolate(
                  frame,
                  [delay, delay + 22],
                  ["-120px 0px", "0px 0px"],
                  { ...clamp, easing: easeOut },
                ),
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: item.color,
                  scale: interpolate(frame, [delay + 6, delay + 26], [0, 1], {
                    ...clamp,
                    easing: Easing.spring({ damping: 10 }),
                  }),
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 104,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    color: item.color,
                  }}
                >
                  {item.word}
                </div>
                <div style={{ fontSize: 46, fontWeight: 500, marginTop: 6 }}>
                  {item.note}
                </div>
              </div>
            </Interactive.Div>
          );
        })}
      </Safe>
    </AbsoluteFill>
  );
};

const STEPS = ["Идея", "Сценарий", "Съёмка", "Монтаж", "Публикация"];

const Process: React.FC = () => {
  const frame = useCurrentFrame();
  const stepGap = 190;
  const firstStep = 30;
  const perStep = 38;
  const lineLength = (STEPS.length - 1) * stepGap;
  const drawn = interpolate(
    frame,
    [firstStep, firstStep + (STEPS.length - 1) * perStep],
    [0, lineLength],
    clamp,
  );

  return (
    <AbsoluteFill>
      <Dots seed="process" />
      <Safe justify="flex-start" gap={70}>
        <Interactive.Div
          name="Heading"
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.1,
            ...rise(frame, 0, 50),
          }}
        >
          От идеи —
          <br />
          до готового ролика
        </Interactive.Div>
        <div style={{ position: "relative", height: lineLength + 60 }}>
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 30,
              width: 6,
              height: lineLength,
              borderRadius: 3,
              background: "rgba(255,255,255,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 30,
              width: 6,
              height: drawn,
              borderRadius: 3,
              background: `linear-gradient(${RED}, ${YELLOW}, ${PINK}, ${BLUE})`,
            }}
          />
          {STEPS.map((step, i) => {
            const at = firstStep + i * perStep;
            const lit = interpolate(frame, [at - 4, at + 8], [0, 1], clamp);
            const color = DOT_COLORS[i % DOT_COLORS.length];
            return (
              <Interactive.Div
                key={step}
                name={step}
                style={{
                  position: "absolute",
                  top: i * stepGap,
                  left: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 50,
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: `6px solid ${lit > 0.5 ? color : "rgba(255,255,255,0.3)"}`,
                    background: lit > 0.5 ? color : BG_OUTER,
                    scale: 0.8 + 0.2 * lit,
                  }}
                />
                <div
                  style={{
                    fontSize: 78,
                    fontWeight: 700,
                    opacity: 0.3 + 0.7 * lit,
                    translate: `${interpolate(lit, [0, 1], [-20, 0])}px 0px`,
                  }}
                >
                  {step}
                </div>
              </Interactive.Div>
            );
          })}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

const Together: React.FC = () => {
  const frame = useCurrentFrame();
  const words = [
    { text: "Вместе", color: "white" },
    { text: "—", color: "rgba(255,255,255,0.6)" },
    { text: "сильнее.", color: PINK },
  ];

  return (
    <AbsoluteFill>
      <Dots seed="together" />
      <Safe gap={10}>
        {words.map((word, i) => (
          <Interactive.Div
            key={word.text}
            name={`Word ${i + 1}`}
            style={{
              fontSize: 170,
              fontWeight: 900,
              lineHeight: 1.05,
              color: word.color,
              opacity: interpolate(frame, [i * 14, i * 14 + 12], [0, 1], clamp),
              scale: interpolate(frame, [i * 14, i * 14 + 24], [1.6, 1], {
                ...clamp,
                easing: easeOut,
                output: "perceptual-scale",
              }),
              transformOrigin: "left center",
            }}
          >
            {word.text}
          </Interactive.Div>
        ))}
        <Interactive.Div
          name="Subline"
          style={{
            marginTop: 50,
            fontSize: 58,
            fontWeight: 500,
            lineHeight: 1.35,
            ...rise(frame, 60, 40),
          }}
        >
          Учимся, создаём
          <br />и вдохновляем друг друга
        </Interactive.Div>
      </Safe>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, frame - 60) / 6);

  return (
    <AbsoluteFill>
      <Dots seed="cta" />
      <AbsoluteFill
        style={{
          top: SAFE_TOP,
          bottom: HEIGHT - SAFE_BOTTOM,
          height: "auto",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 60,
          fontFamily,
          color: "white",
          textAlign: "center",
        }}
      >
        <Interactive.Div
          name="Title"
          style={{
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.05,
            ...rise(frame, 0, 60),
          }}
        >
          Присоединяйся
          <br />
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${YELLOW}, ${PINK}, ${BLUE})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            к Creative Union
          </span>
        </Interactive.Div>
        <Interactive.Div
          name="Button"
          style={{
            padding: "34px 80px",
            borderRadius: 999,
            background: RED,
            fontSize: 62,
            fontWeight: 800,
            boxShadow: `0 20px 60px ${RED}88`,
            opacity: interpolate(frame, [30, 44], [0, 1], clamp),
            scale:
              interpolate(frame, [30, 54], [0.5, 1], {
                ...clamp,
                easing: Easing.spring({ damping: 9 }),
              }) * pulse,
          }}
        >
          Подписаться
        </Interactive.Div>
        <Interactive.Div
          name="Direct"
          style={{
            fontSize: 50,
            fontWeight: 500,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.9)",
            ...rise(frame, 56, 30),
          }}
        >
          Есть идея — пиши нам
          <br />в директ
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const timing = linearTiming({ durationInFrames: TRANSITION });

export const SocialPromo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={HOOK}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence durationInFrames={INTRO}>
      <Intro />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-bottom" })}
      timing={timing}
    />
    <TransitionSeries.Sequence durationInFrames={SERVICES}>
      <Services />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={timing}
    />
    <TransitionSeries.Sequence durationInFrames={PROCESS}>
      <Process />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence durationInFrames={TOGETHER}>
      <Together />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={slide({ direction: "from-bottom" })}
      timing={timing}
    />
    <TransitionSeries.Sequence durationInFrames={CTA}>
      <Cta />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
