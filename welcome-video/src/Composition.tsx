import { TransitionSeries, springTiming } from "@remotion/transitions";
import { iris } from "@remotion/transitions/iris";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  cancelRender,
  Composition,
  continueRender,
  delayRender,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Montserrat (SIL OFL) is bundled in public/fonts so rendering works offline.
const fontFamily = "Montserrat";

const fontHandle = delayRender("Loading Montserrat");
Promise.all(
  [
    {
      file: "fonts/Montserrat-latin.woff2",
      unicodeRange:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
    {
      file: "fonts/Montserrat-cyrillic.woff2",
      unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
  ].map(async ({ file, unicodeRange }) => {
    const face = new FontFace(fontFamily, `url(${staticFile(file)})`, {
      weight: "100 900",
      unicodeRange,
    });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

const INTRO = 45;
const GREETING = 60;
const FINALE = 75;
const TRANSITION = 15;

// 45 + 60 + 75 - 2 * 15 = 150 frames = 5 seconds
const DURATION = INTRO + GREETING + FINALE - 2 * TRANSITION;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const MyComposition = () => {
  return (
    <Composition
      id="Welcome"
      component={Welcome}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};

type BackgroundProps = {
  from: string;
  to: string;
  blobA: string;
  blobB: string;
};

const AnimatedBackground: React.FC<BackgroundProps> = ({
  from,
  to,
  blobA,
  blobB,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + t * 12}deg, ${from}, ${to})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: blobA,
          filter: "blur(160px)",
          opacity: 0.7,
          left: 200 + Math.sin(t * 1.3) * 180,
          top: -200 + Math.cos(t * 1.1) * 140,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: blobB,
          filter: "blur(160px)",
          opacity: 0.6,
          right: 100 + Math.cos(t * 1.2) * 200,
          bottom: -250 + Math.sin(t * 1.4) * 160,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${t * 20}px ${t * 10}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AnimatedBackground
        from="#0b0826"
        to="#1c0f4a"
        blobA="#7c3aed"
        blobB="#06b6d4"
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Interactive.Svg
          width={420}
          height={420}
          viewBox="0 0 420 420"
          style={{
            position: "absolute",
            rotate: interpolate(frame, [0, INTRO], ["-90deg", "0deg"], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          <circle
            cx={210}
            cy={210}
            r={190}
            fill="none"
            stroke="white"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 190}
            strokeDashoffset={interpolate(
              frame,
              [0, 30],
              [2 * Math.PI * 190, 0],
              { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) },
            )}
          />
        </Interactive.Svg>
        <Interactive.Div
          name="Monogram"
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 180,
            color: "white",
            letterSpacing: 8,
            opacity: interpolate(frame, [8, 24], [0, 1], clamp),
            scale: interpolate(frame, [8, 30], [0.4, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
          }}
        >
          CU
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Greeting: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["Добро", "пожаловать"];

  return (
    <AbsoluteFill>
      <AnimatedBackground
        from="#1c0f4a"
        to="#4a0f3d"
        blobA="#ec4899"
        blobB="#7c3aed"
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 40,
        }}
      >
        {words.map((word, i) => (
          <Interactive.Div
            key={word}
            name={`Word ${i + 1}`}
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 150,
              color: "white",
              opacity: interpolate(frame, [i * 8, i * 8 + 18], [0, 1], clamp),
              translate: interpolate(
                frame,
                [i * 8, i * 8 + 24],
                ["0px 80px", "0px 0px"],
                { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) },
              ),
              filter: `blur(${interpolate(
                frame,
                [i * 8, i * 8 + 18],
                [16, 0],
                clamp,
              )}px)`,
            }}
          >
            {word}
          </Interactive.Div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AnimatedBackground
        from="#07142e"
        to="#1c0f4a"
        blobA="#06b6d4"
        blobB="#ec4899"
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Interactive.Div
          name="Subtitle"
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 64,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 6,
            opacity: interpolate(frame, [4, 20], [0, 1], clamp),
            translate: interpolate(frame, [4, 24], ["0px -30px", "0px 0px"], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Добро пожаловать в
        </Interactive.Div>
        <Interactive.Div
          name="Title"
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 170,
            lineHeight: 1.1,
            backgroundImage: `linear-gradient(90deg, #ffffff 0%, #67e8f9 ${interpolate(
              frame,
              [20, 60],
              [0, 50],
              clamp,
            )}%, #f0abfc ${interpolate(frame, [20, 60], [30, 80], clamp)}%, #ffffff 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            opacity: interpolate(frame, [12, 30], [0, 1], clamp),
            scale: interpolate(frame, [12, 40], [0.85, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
            letterSpacing: interpolate(frame, [12, 50], [30, 2], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Creative Union!
        </Interactive.Div>
        <Interactive.Div
          name="Underline"
          style={{
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(90deg, #67e8f9, #f0abfc)",
            width: interpolate(frame, [30, 55], [0, 900], {
              ...clamp,
              easing: Easing.bezier(0.65, 0, 0.35, 1),
            }),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Welcome: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={INTRO}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-top-left" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={GREETING}>
        <Greeting />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={iris({ width, height })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION,
        })}
      />
      <TransitionSeries.Sequence durationInFrames={FINALE}>
        <Finale />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
