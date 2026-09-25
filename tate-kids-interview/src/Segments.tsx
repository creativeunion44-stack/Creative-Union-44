// Two more pieces of the 3:00 script, built from the screen recordings:
//   HookAndTitle          0:24–0:38  presenter hook over Tate Britain b-roll + title card
//   ChannelEpisodeArtist  0:38–1:15  Tate Kids channel, episode fragment, Kusama insert
// They share the interview's look (purple dots, Montserrat, red pills,
// yellow headings, white rounded frames) and add Kusama-style dot wipes.
import { Audio, Video } from "@remotion/media";
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
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BG_INNER, clamp, DOT_COLORS, DotsBackground } from "./Composition";
import { fontFamily } from "./fonts";

const FPS = 30;
export const DOT_WIPE_FRAMES = 16;
export const sec = (s: number) => Math.round(s * FPS);

export type Crop = { x: number; y: number; w: number; h: number };

type Caption = { from: number; text: string };

export type Clip = {
  src: string;
  srcW: number;
  srcH: number;
  crop: Crop;
  from: number;
  to: number;
  volume?: number;
  // Playback speed (e.g. 0.6 to slow a fast scroll down).
  rate?: number;
  captions?: Caption[];
};

export const clipFrames = (clip: Clip) =>
  sec((clip.to - clip.from) / (clip.rate ?? 1));

// ---------- shared pieces ----------

// Shows `crop` of the source video scaled to cover width x height.
export const CroppedVideo: React.FC<{
  clip: Clip;
  width: number;
  height: number;
  muted?: boolean;
}> = ({ clip, width, height, muted = false }) => {
  const { crop } = clip;
  const scale = Math.max(width / crop.w, height / crop.h);
  const frames = clipFrames(clip);
  const volume = clip.volume ?? 1;

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <Video
        src={staticFile(clip.src)}
        trimBefore={sec(clip.from)}
        trimAfter={sec(clip.to)}
        playbackRate={clip.rate ?? 1}
        muted={muted}
        volume={(f) =>
          interpolate(
            f,
            [0, 3, frames - 6, frames],
            [0, volume, volume, 0],
            clamp,
          )
        }
        style={{
          position: "absolute",
          width: clip.srcW * scale,
          height: clip.srcH * scale,
          maxWidth: "none",
          left: (width - crop.w * scale) / 2 - crop.x * scale,
          top: (height - crop.h * scale) / 2 - crop.y * scale,
        }}
      />
    </div>
  );
};

export const Pill: React.FC<{ children: React.ReactNode; name: string }> = ({
  children,
  name,
}) => (
  <Interactive.Div
    name={name}
    style={{
      display: "inline-block",
      padding: "10px 26px",
      borderRadius: 40,
      background: "#ff3d5a",
      color: "white",
      fontWeight: 800,
      fontSize: 30,
      letterSpacing: 4,
    }}
  >
    {children}
  </Interactive.Div>
);

// Caption on a dark pill, fading in whenever the text changes.
const CaptionBar: React.FC<{ clip: Clip; top: number }> = ({ clip, top }) => {
  const frame = useCurrentFrame();
  const captions = (clip.captions ?? []).map((c) => ({
    start: sec(c.from - clip.from),
    text: c.text,
  }));
  const current = captions.filter((c) => c.start <= frame).pop();
  if (!current) return null;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        key={current.start}
        name="Caption"
        style={{
          maxWidth: 1500,
          padding: "16px 36px",
          borderRadius: 24,
          background: "rgba(20, 7, 38, 0.82)",
          color: "white",
          fontWeight: 600,
          fontSize: 48,
          lineHeight: 1.25,
          textAlign: "center",
          opacity: interpolate(
            frame,
            [current.start, current.start + 5],
            [0, 1],
            clamp,
          ),
          translate: interpolate(
            frame,
            [current.start, current.start + 8],
            ["0px 14px", "0px 0px"],
            { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
          ),
        }}
      >
        {current.text}
      </Interactive.Div>
    </div>
  );
};

// Kusama-style wipe: polka dots swell until they cover the frame, then
// shrink away to reveal the next scene.
export const DotWipe: React.FC<{ seed: string }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const mid = DOT_WIPE_FRAMES / 2;
  const cols = 9;
  const rows = 5;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {new Array(cols * rows).fill(true).map((_, i) => {
        const cx = (i % cols) * (1920 / (cols - 1));
        const cy = Math.floor(i / cols) * (1080 / (rows - 1));
        const delay = random(`${seed}-${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - 170,
              top: cy - 170,
              width: 340,
              height: 340,
              borderRadius: "50%",
              background:
                i % 3 === 0 ? DOT_COLORS[i % DOT_COLORS.length] : BG_INNER,
              scale: interpolate(
                frame,
                [delay, mid, DOT_WIPE_FRAMES - 4 + delay / 2],
                [0, 1.05, 0],
                { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) },
              ),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// White rounded frame used for every piece of footage (as in the interview).
export const Frame: React.FC<{
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, children, style }) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      borderRadius: 32,
      overflow: "hidden",
      outline: "6px solid rgba(255,255,255,0.92)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- piece 1: hook + title (0:24–0:38) ----------

export const HOOK: Clip = {
  src: "footage/hook.mp4",
  srcW: 1256,
  srcH: 740,
  // Drop the player bar, the burned-in auto captions and the cursor.
  crop: { x: 0, y: 30, w: 1256, h: 595 },
  from: 0.1,
  to: 9.84,
  captions: [
    { from: 0.1, text: "The Tate Britain is probably already on your radar." },
    {
      from: 2.95,
      text: "In this video, we're going to dive into what makes the Tate Britain unique,",
    },
    {
      from: 5.95,
      text: "from its massive amounts of British art to its one-of-a-kind painted coffee shop.",
    },
  ],
};
const TITLE_FRAMES = sec(14) - clipFrames(HOOK);

// Music bed: the instrumental intro of Tate's Kusama film. The title card
// takes its first seconds and the channel section continues from there, so
// the two pieces join without repeating the music.
export const MUSIC_SRC = "footage/kusama-film.mp4";
const MUSIC_START = sec(3);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const frameW = 1560;
  const frameH = Math.round(frameW * (HOOK.crop.h / HOOK.crop.w));

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="hook" />
      <Frame
        width={frameW}
        height={frameH}
        style={{
          left: (1920 - frameW) / 2,
          top: 70,
          scale: interpolate(frame, [0, clipFrames(HOOK)], [1, 1.03], clamp),
        }}
      >
        <CroppedVideo clip={HOOK} width={frameW} height={frameH} />
      </Frame>
      {/* "On your radar": sticker with pulsing rings */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 40,
          rotate: "-4deg",
          scale: interpolate(frame, [4, 14], [0, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 9 }),
          }),
        }}
      >
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 12) % 36) / 36;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: -30 + 0,
                top: -30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "4px solid #ffd23f",
                scale: 1 + t * 2.4,
                opacity: 1 - t,
              }}
            />
          );
        })}
        <Pill name="Location pill">TATE BRITAIN · LONDON</Pill>
      </div>
      <CaptionBar clip={HOOK} top={70 + frameH + 34} />
    </AbsoluteFill>
  );
};

// Pop-art title card in the Tate Kids channel colours (red, purple,
// teal, orange), keeping the purple dots world of the rest of the film.
export const TitleScene: React.FC<{ withMusic?: boolean }> = ({
  withMusic = true,
}) => {
  const frame = useCurrentFrame();
  const pop = (start: number) =>
    interpolate(frame, [start, start + 12], [0, 1], {
      ...clamp,
      easing: Easing.spring({ damping: 11 }),
    });

  return (
    <AbsoluteFill style={{ fontFamily, overflow: "hidden" }}>
      <DotsBackground seed="title-card" />
      {withMusic ? (
        <Audio
          src={staticFile(MUSIC_SRC)}
          trimBefore={MUSIC_START}
          trimAfter={MUSIC_START + TITLE_FRAMES}
          volume={(f) =>
            interpolate(
              f,
              [0, 6, TITLE_FRAMES - 3, TITLE_FRAMES],
              [0, 0.8, 0.8, 0],
              clamp,
            )
          }
        />
      ) : null}
      {[
        { c: "#ff2a3d", x: -180, y: -160, w: 900, h: 520, r: -12, d: 0 },
        { c: "#7b2fa3", x: 1240, y: -120, w: 860, h: 480, r: 14, d: 3 },
        { c: "#1fb5bd", x: 1320, y: 760, w: 760, h: 420, r: -18, d: 6 },
        { c: "#ff9a1f", x: -140, y: 800, w: 820, h: 400, r: 10, d: 9 },
      ].map((s) => (
        <div
          key={s.c}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
            background: s.c,
            rotate: `${s.r}deg`,
            scale: pop(s.d),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 540 - 330,
          width: 660,
          height: 660,
          borderRadius: "50%",
          background: "#ffa21f",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 7px, transparent 8px)",
          backgroundSize: "30px 30px",
          scale: pop(4),
          rotate: `${interpolate(frame, [0, TITLE_FRAMES], [-8, 8])}deg`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Interactive.Div
          name="Title"
          style={{
            fontWeight: 900,
            fontSize: 170,
            lineHeight: 1,
            color: "white",
            letterSpacing: -2,
            textShadow: "10px 10px 0 #140726",
            scale: pop(8),
          }}
        >
          TATE KIDS
        </Interactive.Div>
        <Interactive.Div
          name="Title pill"
          style={{
            padding: "12px 34px",
            borderRadius: 14,
            background: "#ffd23f",
            color: "#140726",
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: 6,
            rotate: "-3deg",
            boxShadow: "8px 8px 0 #140726",
            scale: pop(14),
          }}
        >
          FULL BREAKDOWN
        </Interactive.Div>
        <Interactive.Div
          name="Title subtitle"
          style={{
            marginTop: 26,
            padding: "10px 26px",
            borderRadius: 30,
            background: "rgba(20, 7, 38, 0.85)",
            color: "white",
            fontWeight: 600,
            fontSize: 36,
            opacity: interpolate(frame, [22, 32], [0, 1], clamp),
          }}
        >
          Animation style and media structure of the Tate Kids YouTube channel
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const HookAndTitle: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={clipFrames(HOOK)}>
      <HookScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
      <DotWipe seed="hook-title" />
    </TransitionSeries.Overlay>
    <TransitionSeries.Sequence durationInFrames={TITLE_FRAMES}>
      <TitleScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

// ---------- piece 2: channel, episode, artist (0:38–1:15) ----------

const CHANNEL_CLIPS: (Clip & { sticker: string })[] = [
  {
    src: "footage/channel-a.mp4",
    srcW: 1880,
    srcH: 734,
    crop: { x: 0, y: 0, w: 1880, h: 734 },
    from: 0,
    to: 3,
    sticker: "@TateKids",
  },
  {
    src: "footage/channel-b.mp4",
    srcW: 1888,
    srcH: 866,
    crop: { x: 0, y: 0, w: 1888, h: 737 },
    from: 0.95,
    to: 1.75,
    rate: 0.27,
    sticker: "BECOMING AN ARTIST",
  },
  {
    src: "footage/channel-a.mp4",
    srcW: 1880,
    srcH: 734,
    crop: { x: 0, y: 0, w: 1880, h: 734 },
    from: 8.3,
    to: 11.3,
    sticker: "MEET THE ARTIST",
  },
  {
    src: "footage/channel-a.mp4",
    srcW: 1880,
    srcH: 734,
    crop: { x: 0, y: 0, w: 1880, h: 734 },
    from: 11.4,
    to: 14.4,
    sticker: "EASY ART PROJECTS",
  },
];
const CHANNEL_FRAMES = CHANNEL_CLIPS.reduce((s, c) => s + clipFrames(c), 0);

// The channel recordings are silent; the script asks for background music.

const ChannelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cardW = 1500;
  const cardH = Math.round(cardW / 2.56);
  let offset = 0;
  const starts = CHANNEL_CLIPS.map((c) => {
    const s = offset;
    offset += clipFrames(c);
    return s;
  });
  const index = starts.filter((s) => s <= frame).length - 1;
  const clip = CHANNEL_CLIPS[index];
  const local = frame - starts[index];

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="channel" />
      <Audio
        src={staticFile(MUSIC_SRC)}
        trimBefore={MUSIC_START + TITLE_FRAMES}
        trimAfter={MUSIC_START + TITLE_FRAMES + CHANNEL_FRAMES}
        volume={(f) =>
          interpolate(
            f,
            [0, 3, CHANNEL_FRAMES - 20, CHANNEL_FRAMES],
            [0, 0.8, 0.8, 0],
            clamp,
          )
        }
      />
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 60,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          translate: interpolate(frame, [0, 16], ["-40px 0px", "0px 0px"], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <div>
          <Pill name="Section pill">THE CHANNEL</Pill>
        </div>
        <Interactive.Div
          name="Channel title"
          style={{
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1,
            color: "#ffd23f",
            whiteSpace: "nowrap",
          }}
        >
          Tate Kids on YouTube
        </Interactive.Div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["33K subscribers", "97 videos", "Explore · Make · Play"].map(
            (chip, i) => (
              <div
                key={chip}
                style={{
                  padding: "8px 20px",
                  borderRadius: 30,
                  border: "3px solid rgba(255,255,255,0.8)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 28,
                  whiteSpace: "nowrap",
                  opacity: interpolate(
                    frame,
                    [10 + i * 5, 18 + i * 5],
                    [0, 1],
                    clamp,
                  ),
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 380,
          width: cardW,
          height: cardH,
          perspective: 1600,
        }}
      >
        <Frame
          width={cardW}
          height={cardH}
          style={{
            rotate: `x ${interpolate(frame, [0, 20], [18, 0], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}deg`,
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        >
          {CHANNEL_CLIPS.map((c, i) => (
            <Sequence
              key={i}
              from={starts[i]}
              durationInFrames={clipFrames(c)}
              premountFor={FPS}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  // quick "scroll whip" into each new clip
                  translate: interpolate(
                    frame - starts[i],
                    [0, 6],
                    ["0px 70px", "0px 0px"],
                    {
                      ...clamp,
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                    },
                  ),
                  filter: `blur(${interpolate(frame - starts[i], [0, 6], [10, 0], clamp)}px)`,
                  scale: interpolate(
                    frame - starts[i],
                    [0, clipFrames(c)],
                    [1, 1.04],
                    clamp,
                  ),
                }}
              >
                <CroppedVideo clip={c} width={cardW} height={cardH} muted />
              </div>
            </Sequence>
          ))}
        </Frame>
        <Interactive.Div
          key={index}
          name="Playlist sticker"
          style={{
            position: "absolute",
            right: -40,
            top: -46,
            padding: "14px 30px",
            borderRadius: 12,
            background: "#ffd23f",
            color: "#140726",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 2,
            boxShadow: "8px 8px 0 #140726",
            rotate: `${index % 2 === 0 ? -4 : 3}deg`,
            scale: interpolate(local, [2, 12], [0, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 9 }),
            }),
          }}
        >
          {clip.sticker}
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};

export const MILDRED: Clip = {
  src: "footage/mildred.mp4",
  srcW: 1192,
  srcH: 804,
  // Inside the player, above the burned-in Russian subtitles.
  crop: { x: 13, y: 92, w: 1159, h: 473 },
  from: 5.2,
  to: 14.75,
  captions: [
    { from: 5.2, text: "…there was an art gallery." },
    { from: 8.4, text: "People came from all over the world" },
    { from: 10.6, text: "to look at the paintings and sculptures inside." },
  ],
};
export const KUSAMA_EP_CROP: Crop = { x: 0, y: 6, w: 1174, h: 594 };
const KUSAMA_A: Clip = {
  src: "footage/kusama-episode.mp4",
  srcW: 1174,
  srcH: 618,
  crop: KUSAMA_EP_CROP,
  from: 2.72,
  to: 10.86,
  volume: 0.6,
  captions: [
    { from: 2.72, text: "She would become world famous for her paintings," },
    {
      from: 5.1,
      text: "her sculptures and her extraordinary creative energy.",
    },
    { from: 7.7, text: "She was thousands of miles away from home" },
    { from: 9.1, text: "and she finally felt free." },
  ],
};
const KUSAMA_B: Clip = {
  src: "footage/kusama-episode.mp4",
  srcW: 1174,
  srcH: 618,
  crop: KUSAMA_EP_CROP,
  from: 17.2,
  to: 20.68,
  volume: 0.6,
  captions: [
    {
      from: 17.2,
      text: "Yayoi would sit in the flowerbeds with her sketchbook",
    },
    { from: 19.1, text: "and get lost in her imagination." },
  ],
};
const EP_DISSOLVE = 8;

const EpisodeScene: React.FC<{ clip: Clip; title: string }> = ({
  clip,
  title,
}) => {
  const frame = useCurrentFrame();
  const frameW = 1500;
  const frameH = 612;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="episode" />
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 50,
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: interpolate(frame, [4, 14], [0, 1], clamp),
        }}
      >
        <Pill name="Section pill">THE EPISODE</Pill>
        <Interactive.Div
          name="Episode title"
          style={{ fontWeight: 800, fontSize: 48, color: "#ffd23f" }}
        >
          {title}
        </Interactive.Div>
      </div>
      <Frame
        width={frameW}
        height={frameH}
        style={{
          left: 210,
          top: 145,
          scale: interpolate(frame, [0, clipFrames(clip)], [1, 1.025], clamp),
        }}
      >
        <CroppedVideo clip={clip} width={frameW} height={frameH} />
      </Frame>
      <CaptionBar clip={clip} top={145 + frameH + 40} />
    </AbsoluteFill>
  );
};

export const PORTRAIT: Clip = {
  src: "footage/kusama-film.mp4",
  srcW: 1876,
  srcH: 888,
  // Face only: leaves out the film's own name title and the
  // "Stop recording" tooltip of the screen recorder.
  crop: { x: 905, y: 10, w: 650, h: 650 },
  from: 20.0,
  to: 24.2,
};
const ARTIST_FRAMES = 150;

const ArtistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const size = 600;
  // Fade to the plain purple background at the end, which is exactly
  // how the "Parent Review" title of the interview begins.
  const out = interpolate(
    frame,
    [ARTIST_FRAMES - 14, ARTIST_FRAMES - 1],
    [1, 0],
    clamp,
  );
  const ringDots = 22;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <DotsBackground seed="artist" dotsOpacity={out} />
      <Audio
        src={staticFile(MUSIC_SRC)}
        trimBefore={sec(9)}
        trimAfter={sec(9) + ARTIST_FRAMES}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, ARTIST_FRAMES - 20, ARTIST_FRAMES],
            [0, 0.55, 0.55, 0],
            clamp,
          )
        }
      />
      <AbsoluteFill style={{ opacity: out }}>
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 240,
            width: size,
            height: size,
            scale: interpolate(frame, [0, 14], [0.6, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 12 }),
            }),
          }}
        >
          {new Array(ringDots).fill(true).map((_, i) => {
            const a = (i / ringDots) * Math.PI * 2 + frame / 60;
            const r = size / 2 + 48;
            const d = 26 + (i % 3) * 10;
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
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            <CroppedVideo clip={PORTRAIT} width={size} height={size} muted />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 1000,
            top: 330,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 26,
            opacity: interpolate(frame, [8, 20], [0, 1], clamp),
            translate: interpolate(frame, [8, 26], ["50px 0px", "0px 0px"], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          <Pill name="Section pill">THE ARTIST</Pill>
          <Interactive.Div
            name="Artist name"
            style={{
              fontWeight: 900,
              fontSize: 116,
              lineHeight: 1,
              color: "#ffd23f",
            }}
          >
            Yayoi Kusama
          </Interactive.Div>
          <Interactive.Div
            name="Artist line"
            style={{ fontWeight: 600, fontSize: 44, color: "white" }}
          >
            Japanese artist, born 1929
          </Interactive.Div>
          <Interactive.Div
            name="Episode chip"
            style={{
              marginTop: 10,
              padding: "10px 24px",
              borderRadius: 30,
              border: "3px solid rgba(255,255,255,0.8)",
              color: "white",
              fontWeight: 700,
              fontSize: 32,
            }}
          >
            Yayoi Kusama&apos;s Infinite Dots Universe
          </Interactive.Div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ChannelEpisodeArtist: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={CHANNEL_FRAMES}>
        <ChannelScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="channel-episode" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence
        durationInFrames={clipFrames(MILDRED)}
        premountFor={fps}
      >
        <EpisodeScene clip={MILDRED} title="Mildred the Gallery Cat" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="mildred-kusama" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence
        durationInFrames={clipFrames(KUSAMA_A)}
        premountFor={fps}
      >
        <EpisodeScene
          clip={KUSAMA_A}
          title="Yayoi Kusama's Infinite Dots Universe"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: EP_DISSOLVE })}
      />
      <TransitionSeries.Sequence
        durationInFrames={clipFrames(KUSAMA_B)}
        premountFor={fps}
      >
        <EpisodeScene
          clip={KUSAMA_B}
          title="Yayoi Kusama's Infinite Dots Universe"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={DOT_WIPE_FRAMES}>
        <DotWipe seed="episode-artist" />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence
        durationInFrames={ARTIST_FRAMES}
        premountFor={fps}
      >
        <ArtistScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

const PIECE2_FRAMES =
  CHANNEL_FRAMES +
  clipFrames(MILDRED) +
  clipFrames(KUSAMA_A) +
  clipFrames(KUSAMA_B) -
  EP_DISSOLVE +
  ARTIST_FRAMES;

export const SegmentCompositions: React.FC = () => (
  <>
    <Composition
      id="HookAndTitle"
      component={HookAndTitle}
      durationInFrames={sec(14)}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="ChannelEpisodeArtist"
      component={ChannelEpisodeArtist}
      durationInFrames={PIECE2_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
