// "1 день на яхте": vertical 9:16 edit for Reels / Shorts / Stories.
// The footage has no speech, so the story is told by on-screen phrases:
// hook title -> quick "phone off" cuts -> two key phrases on the selfies
// -> save/share call to action. Words pop in one by one; key words sit on
// a yellow marker. Every cut gets a punch-in zoom and a short white flash.
//
// Music: public/music.wav, synthesised by scripts/make_music.py at 120 BPM
// (1 beat = 15 frames). Shot lengths are whole beats, so every cut lands
// on the beat; the drops hit on the first line and on "не надо спешить".
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";

const FPS = 30;
const W = 1080;
const H = 1920;
const YELLOW = "#FFE14D";
const BLUE = "#1E6BFF";

// A word wrapped in *stars* is a key word (yellow marker).
type Shot = {
  src: string;
  from: number; // seconds into the source clip
  dur: number; // seconds on screen
  kind: "title" | "line" | "key" | "cta";
  text: string;
  sub?: string;
};

const SHOTS: Shot[] = [
  {
    src: "selfie-b.mp4",
    from: 0.2,
    dur: 3.0,
    kind: "title",
    text: "1 день на *яхте*",
    sub: "который меня перезагрузил",
  },
  { src: "sea.mp4", from: 0.3, dur: 2.0, kind: "line", text: "Телефон — на *беззвучный*" },
  { src: "mast.mp4", from: 0.3, dur: 2.0, kind: "line", text: "Вместо будильника — *ветер*" },
  { src: "sail.mp4", from: 0.5, dur: 2.0, kind: "line", text: "Вместо дедлайнов — *море*" },
  { src: "sea.mp4", from: 6.0, dur: 2.0, kind: "line", text: "Город остался *где-то там*…" },
  { src: "selfie-a.mp4", from: 0.5, dur: 3.0, kind: "key", text: "А я — *здесь* и *сейчас*" },
  { src: "sea.mp4", from: 13.0, dur: 2.0, kind: "line", text: "И никуда *не надо* спешить" },
  {
    src: "selfie-a.mp4",
    from: 5.0,
    dur: 3.5,
    kind: "key",
    text: "Счастье — не место. Это *состояние*",
  },
  {
    src: "selfie-b.mp4",
    from: 2.6,
    dur: 3.0,
    kind: "cta",
    text: "*Сохрани*, чтобы не забыть",
    sub: "и отправь той, кому это нужно",
  },
];

const starts: number[] = [];
let acc = 0;
for (const s of SHOTS) {
  starts.push(acc);
  acc += Math.round(s.dur * FPS);
}
const TOTAL = acc;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const parseWords = (text: string) =>
  text.split(" ").map((w) => ({
    key: w.includes("*"),
    word: w.replace(/\*/g, ""),
  }));

// ---------- pieces ----------

const Footage: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const len = Math.round(shot.dur * FPS);
  // Punch-in at the cut, then a slow drift so nothing is ever static.
  const punch = interpolate(frame, [0, 6], [1.14, 1.04], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const drift = interpolate(frame, [6, len], [0, 0.04], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${punch + drift})` }}>
      <OffthreadVideo
        src={staticFile(`footage/${shot.src}`)}
        startFrom={Math.round(shot.from * FPS)}
        volume={0.12}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4], [0.7, 0], clamp);
  return <AbsoluteFill style={{ background: "white", opacity: o }} />;
};

// Top / bottom gradients keep white text readable on bright sky and sea.
const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)",
    }}
  />
);

const Word: React.FC<{
  word: string;
  keyWord: boolean;
  delay: number;
  size: number;
}> = ({ word, keyWord, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.6 },
  });
  const show = frame >= delay;
  return (
    <span
      style={{
        display: "inline-block",
        margin: `0 ${size * 0.13}px ${size * 0.18}px`,
        opacity: show ? 1 : 0,
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) translateY(${interpolate(s, [0, 1], [30, 0])}px) rotate(${keyWord ? -2 : 0}deg)`,
        padding: keyWord ? `${size * 0.02}px ${size * 0.2}px` : 0,
        background: keyWord ? YELLOW : "transparent",
        color: keyWord ? "#111" : "white",
        borderRadius: size * 0.16,
        boxShadow: keyWord ? "0 10px 30px rgba(0,0,0,0.35)" : "none",
        textShadow: keyWord
          ? "none"
          : "0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.45)",
        WebkitTextStroke: keyWord ? "0" : `${size * 0.035}px rgba(0,0,0,0.6)`,
        paintOrder: "stroke fill",
      }}
    >
      {word}
    </span>
  );
};

const Phrase: React.FC<{
  text: string;
  size: number;
  startDelay?: number;
  perWord?: number;
}> = ({ text, size, startDelay = 2, perWord = 4 }) => {
  const words = parseWords(text);
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        textTransform: "uppercase",
        textAlign: "center",
        letterSpacing: -1,
      }}
    >
      {words.map((w, i) => (
        <Word
          key={i}
          word={w.word}
          keyWord={w.key}
          delay={startDelay + i * perWord}
          size={size}
        />
      ))}
    </div>
  );
};

const Sub: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 6], [0, 1], clamp);
  const y = interpolate(frame, [delay, delay + 6], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        marginTop: 26,
        alignSelf: "center",
        opacity: o,
        transform: `translateY(${y}px)`,
        fontFamily,
        fontWeight: 800,
        fontSize: 52,
        color: "white",
        textAlign: "center",
        background: "rgba(0,0,0,0.55)",
        padding: "10px 28px",
        borderRadius: 18,
      }}
    >
      {text}
    </div>
  );
};

// Scenery captions sit at 55-78% of the height, clear of the platform UI
// at the bottom; on the selfies all text goes to the top, above the face.
const TextLayer: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  if (shot.kind === "title") {
    const pill = spring({ frame, fps: FPS, config: { damping: 14 } });
    return (
      <AbsoluteFill
        style={{ alignItems: "center", padding: "170px 60px 0" }}
      >
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 40,
            color: "white",
            background: BLUE,
            padding: "12px 30px",
            borderRadius: 999,
            marginBottom: 30,
            letterSpacing: 3,
            transform: `scale(${pill})`,
          }}
        >
          ДОСМОТРИ ДО КОНЦА
        </div>
        <Phrase text={shot.text} size={132} startDelay={4} perWord={5} />
        {shot.sub ? <Sub text={shot.sub} delay={22} /> : null}
      </AbsoluteFill>
    );
  }
  if (shot.kind === "cta") {
    return (
      <AbsoluteFill
        style={{ justifyContent: "flex-start", padding: "250px 60px 0" }}
      >
        <Phrase text={shot.text} size={96} />
        {shot.sub ? <Sub text={shot.sub} delay={24} /> : null}
      </AbsoluteFill>
    );
  }
  // Selfie shots ("key") carry the text above the face.
  const top = shot.kind === "key" ? 250 : 1080;
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-start", padding: `${top}px 60px 0` }}
    >
      <Phrase
        text={shot.text}
        size={shot.kind === "key" ? 104 : 88}
        perWord={shot.kind === "key" ? 5 : 3}
      />
    </AbsoluteFill>
  );
};

// Thin progress bar: shows how little is left, which keeps people watching.
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 10,
          width: `${(frame / (TOTAL - 1)) * 100}%`,
          background: YELLOW,
        }}
      />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((shot, i) => (
      <Sequence
        key={i}
        from={starts[i]}
        durationInFrames={Math.round(shot.dur * FPS)}
      >
        <Footage shot={shot} />
        <Shade />
        <TextLayer shot={shot} />
        {i > 0 ? <Flash /> : null}
      </Sequence>
    ))}
    <Progress />
    <Audio src={staticFile("music.wav")} volume={0.85} />
  </AbsoluteFill>
);

export const ReelComposition: React.FC = () => (
  <Composition
    id="YachtReel"
    component={Reel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={W}
    height={H}
  />
);
